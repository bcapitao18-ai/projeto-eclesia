const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt")

const Usuarios = require("../modells/Usuarios")

const Membros = require("../modells/Membros");


const Cargo = require("../modells/Cargo");

const Contribuicao = require("../modells/Contribuicoes");



const TipoContribuicao = require("../modells/TipoContribuicao");



const Despesas = require("../modells/Despesas");



const Categorias = require("../modells/Categorias");



const CategoriaDespesas = require("../modells/CategoriaDespesa");


const CargoMembro = require("../modells/CargoMembro");


const { Op, sequelize} = require('sequelize');



const { Sequelize} = require('sequelize');





const auth = require("../middlewere/auth");


// GET /lista/despesas - listar despesas filtradas pelo usuário logado
router.get('/lista/despesas', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Define o filtro inicial com base na hierarquia
    let filtro = {};
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    // Buscar despesas filtradas
    const despesas = await Despesas.findAll({
      where: filtro,
      order: [['createdAt', 'DESC']], // mais recentes primeiro
    });

    res.status(200).json(despesas);
  } catch (error) {
    console.error('Erro ao listar despesas:', error);
    res.status(500).json({ message: 'Erro ao buscar despesas' });
  }
});

// POST /despesas - cadastrar despesa e vincular à categoria
router.post('/despesas', auth, async (req, res) => {
  try {
    const {
      descricao,
      valor,
      data,
      tipo,
      observacao,
      categoriaId
    } = req.body;

    if (!descricao || !valor || !data || !tipo) {
      return res.status(400).json({
        message: 'Campos obrigatórios não preenchidos.'
      });
    }

    const { SedeId, FilhalId } = req.usuario;

    // 1️⃣ Criar a despesa
    const novaDespesa = await Despesas.create({
      descricao,
      valor,
      data,
      tipo,
      observacao: observacao || null,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null
    });

    // 2️⃣ Vincular à categoria (tabela intermediária)
    if (categoriaId) {
      await CategoriaDespesas.create({
        DespesaId: novaDespesa.id,
        CategoriumId: categoriaId // nome EXATO da tua coluna no banco
      });
    }

    return res.status(201).json({
      message: 'Despesa cadastrada e vinculada à categoria com sucesso!',
      despesa: novaDespesa
    });

  } catch (error) {
    console.error('Erro ao cadastrar despesa:', error);
    return res.status(500).json({
      message: 'Erro interno ao cadastrar despesa.'
    });
  }
});




// GET /categorias/:id/despesas - listar despesas de uma categoria
router.get('/categorias/:id/despesas', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { SedeId, FilhalId } = req.usuario;

    const despesas = await Despesas.findAll({
      include: [
        {
          model: CategoriaDespesas,
          where: { CategoriumId: id }, // 🔥 tua coluna real do banco
          attributes: []
        }
      ],
      where: {
        SedeId: SedeId || null,
        FilhalId: FilhalId || null
      },
      order: [['data', 'DESC']]
    });

    return res.status(200).json({
      message: 'Despesas da categoria',
      data: despesas
    });

  } catch (error) {
    console.error('Erro ao buscar despesas da categoria:', error);
    return res.status(500).json({
      message: 'Erro interno ao buscar despesas da categoria.'
    });
  }
});



// PUT /categorias/:id - atualizar categoria
router.put('/categorias/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativa } = req.body;

    // Validação básica
    if (!nome) {
      return res.status(400).json({
        message: 'O nome da categoria é obrigatório.'
      });
    }

    const { SedeId, FilhalId } = req.usuario;

    // Buscar categoria garantindo isolamento por sede/filial
    const categoria = await Categorias.findOne({
      where: {
        id,
        SedeId: SedeId || null,
        FilhalId: FilhalId || null
      }
    });

    if (!categoria) {
      return res.status(404).json({
        message: 'Categoria não encontrada.'
      });
    }

    // Verificar duplicidade de nome na mesma sede/filial (exceto ela mesma)
    const categoriaDuplicada = await Categorias.findOne({
      where: {
        nome,
        SedeId: SedeId || null,
        FilhalId: FilhalId || null
      }
    });

    if (categoriaDuplicada && categoriaDuplicada.id !== categoria.id) {
      return res.status(400).json({
        message: 'Já existe outra categoria com esse nome.'
      });
    }

    // Atualizar dados
    categoria.nome = nome;
    categoria.descricao = descricao || null;

    // só atualiza ativa se vier no payload
    if (typeof ativa !== 'undefined') {
      categoria.ativa = ativa;
    }

    await categoria.save();

    return res.json({
      message: 'Categoria atualizada com sucesso!',
      categoria
    });

  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return res.status(500).json({
      message: 'Erro interno ao atualizar categoria.'
    });
  }
});


// GET /categorias/despesas - listar categorias com total de despesas
router.get('/categorias/despesas', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    const categorias = await Categorias.findAll({
      where: {
        ativa: 1,
        SedeId: SedeId || null,
        FilhalId: FilhalId || null
      },
      include: [
        {
          model: CategoriaDespesas,
          attributes: [],
          include: [
            {
              model: Despesas,
              attributes: []
            }
          ]
        }
      ],
      attributes: [
        'id',
        'nome',
        'descricao',
        [
          Sequelize.fn(
            'COALESCE',
            Sequelize.fn(
              'SUM',
              Sequelize.col('CategoriaDespesas->Despesa.valor')
            ),
            0
          ),
          'totalDespesas'
        ]
      ],
      group: ['Categoria.id'], // ✅ CORREÇÃO PRINCIPAL
      order: [['nome', 'ASC']],
      subQuery: false
    });

    return res.status(200).json({
      message: 'Categorias com total de despesas',
      data: categorias
    });

  } catch (error) {
    console.error('Erro ao buscar totais por categoria:', error);
    return res.status(500).json({
      message: 'Erro interno ao buscar categorias com totais.'
    });
  }
});




// DELETE /categorias/:id - remover categoria
router.delete('/categorias/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { SedeId, FilhalId } = req.usuario;

    // 🔎 Verificar se a categoria existe e pertence à sede/filial do usuário
    const categoria = await Categorias.findOne({
      where: {
        id
      }
    });

    if (!categoria) {
      return res.status(404).json({
        message: 'Categoria não encontrada ou sem permissão para excluir.'
      });
    }

    // 🗑️ Excluir categoria
    await categoria.destroy();

    return res.status(200).json({
      message: 'Categoria excluída com sucesso.'
    });

  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return res.status(500).json({
      message: 'Erro interno ao excluir categoria.'
    });
  }
});



// POST /categorias - cadastrar nova categoria/natureza
router.post('/categorias', auth, async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    // Validação básica
    if (!nome) {
      return res.status(400).json({
        message: 'O nome da categoria é obrigatório.'
      });
    }

    // Dados do usuário logado (multi-sede)
    const { SedeId, FilhalId } = req.usuario;

    // Verificar se já existe categoria com mesmo nome na mesma sede/filial
    const categoriaExistente = await Categorias.findOne({
      where: {
        nome,
        SedeId: SedeId || null,
        FilhalId: FilhalId || null
      }
    });

    if (categoriaExistente) {
      return res.status(400).json({
        message: 'Já existe uma categoria com esse nome.'
      });
    }

    // Criar categoria
    const novaCategoria = await Categorias.create({
      nome,
      descricao: descricao || null,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null,
      ativa: true
    });

    return res.status(201).json({
      message: 'Categoria criada com sucesso!',
      categoria: novaCategoria
    });

  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return res.status(500).json({
      message: 'Erro interno ao criar categoria.'
    });
  }
});
 



// GET /lista/tipos-despesa - listar tipos de despesa com totais filtrados pelo usuário logado
router.get('/lista/tipos-despesa', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Buscar todos os tipos de despesa
    const tipos = await Despesas.findAll({
      attributes: ['id', 'descricao', 'tipo', 'createdAt'], // ajustar campos conforme tabela de tipos
      group: ['id', 'descricao', 'tipo', 'createdAt'], // garantir que não haja duplicidade
    });

    // Calcular totais para cada tipo considerando o contexto hierárquico
    const tiposComTotais = await Promise.all(
      tipos.map(async (tipo) => {
        const despesas = await Despesas.findAll({
          where: {
            TipoDespesaId: tipo.id,
            ...(SedeId && { SedeId }),
            ...(!SedeId && FilhalId && { FilhalId })
          },
          attributes: ['valor'],
        });

        const valores = despesas.map(d => parseFloat(d.valor));
        const valorTotal = valores.reduce((acc, v) => acc + v, 0);
        const valorMedio = valores.length ? valorTotal / valores.length : 0;
        const maiorDespesa = valores.length ? Math.max(...valores) : 0;

        return {
          ...tipo.toJSON(),
          totalDespesas: despesas.length,
          valorTotal,
          valorMedio,
          maiorDespesa
        };
      })
    );

    res.status(200).json(tiposComTotais);
  } catch (error) {
    console.error('Erro ao listar tipos de despesa:', error);
    res.status(500).json({ message: 'Erro ao buscar tipos de despesa' });
  }
});



// GET /relatorio/despesas - relatório por CATEGORIA (com período)
router.get('/relatorio/despesas', auth, async (req, res) => {
  try {
    const { startDate, endDate, tipo } = req.query;
    const { SedeId, FilhalId } = req.usuario;

    console.log('📅 Filtros recebidos:', { startDate, endDate, tipo });
    console.log('🏢 Usuário logado:', { SedeId, FilhalId });

    // 🔥 Filtro de despesas (IMPORTANTE)
    let whereDespesas = {};

    // 📆 FILTRO DE PERÍODO (MANTIDO COMO PEDISTE)
    if (startDate && endDate) {
      const inicio = new Date(`${startDate}T00:00:00`);
      const fim = new Date(`${endDate}T23:59:59`);
      whereDespesas.data = { [Op.between]: [inicio, fim] };
    }

    // 🧾 Filtro por tipo (Fixa / Variável)
    if (tipo) {
      whereDespesas.tipo = tipo;
    }

    // 🏛️ Filtro hierárquico
    if (FilhalId) {
      whereDespesas.FilhalId = FilhalId;
    } else if (SedeId) {
      whereDespesas.SedeId = SedeId;
    }

    const categorias = await Categorias.findAll({
      where: {
        ativa: 1,
        SedeId: SedeId || null,
        FilhalId: FilhalId || null,
      },
      include: [
        {
          model: CategoriaDespesas,
          attributes: [],
          include: [
            {
              model: Despesas,
              attributes: [],
              where: whereDespesas, // 🔥 FILTRO POR PERÍODO AQUI
              required: false, // MUITO IMPORTANTE (mostra categorias sem despesas)
            },
          ],
          required: false,
        },
      ],
      attributes: [
        'id',
        'nome',
        'descricao',
        [
          Sequelize.fn(
            'COALESCE',
            Sequelize.fn(
              'SUM',
              Sequelize.col('CategoriaDespesas->Despesa.valor')
            ),
            0
          ),
          'totalDespesas',
        ],
        [
          Sequelize.fn(
            'COUNT',
            Sequelize.col('CategoriaDespesas->Despesa.id')
          ),
          'quantidadeDespesas',
        ],
      ],
      group: ['Categoria.id'],
      order: [[Sequelize.literal('totalDespesas'), 'DESC']],
      subQuery: false,
    });

    console.log(`✅ ${categorias.length} categorias no relatório.`);
    return res.status(200).json(categorias);
  } catch (error) {
    console.error('❌ Erro ao gerar relatório por categoria:', error);
    return res.status(500).json({
      message: 'Erro ao gerar relatório de despesas por categoria.',
    });
  }
});




// PUT /despesas/:id
router.put('/despesas/:id', async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data, categoria, tipo, observacao } = req.body;

  try {
    const despesa = await Despesas.findByPk(id);

    if (!despesa) {
      return res.status(404).json({ message: 'Despesa não encontrada.' });
    }

    await despesa.update({
      descricao,
      valor,
      data,
      categoria,
      tipo,
      observacao,
    });

    res.status(200).json({ message: 'Despesa atualizada com sucesso.', despesa });
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ message: 'Erro ao atualizar despesa.' });
  }
});



// DELETE /despesas/:id
router.delete('/despesas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const despesa = await Despesas.findByPk(id);

    if (!despesa) {
      return res.status(404).json({ message: 'Despesa não encontrada.' });
    }

    await despesa.destroy();
    res.status(200).json({ message: 'Despesa excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    res.status(500).json({ message: 'Erro ao excluir despesa.' });
  }
});





// GET /despesas/totais - totais de despesas filtrados pelo usuário logado
router.get('/despesas/totais', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Filtro hierárquico
    let filtro = {};
    if (SedeId) {
      filtro.SedeId = SedeId;
    } else if (FilhalId) {
      filtro.FilhalId = FilhalId;
    }

    // Total geral
    const totalGeral = await Despesas.sum('valor', { where: filtro }) || 0;

    // Total por tipo
    const totalPorTipo = await Despesas.findAll({
      attributes: [
        'tipo',
        [Despesas.sequelize.fn('SUM', Despesas.sequelize.col('valor')), 'total']
      ],
      where: filtro,
      group: ['tipo'],
      raw: true
    });

    // Total por categoria
    const totalPorCategoria = await Despesas.findAll({
      attributes: [
        'categoria',
        [Despesas.sequelize.fn('SUM', Despesas.sequelize.col('valor')), 'total']
      ],
      where: filtro,
      group: ['categoria'],
      raw: true
    });

    res.status(200).json({
      totalGeral,
      totalPorTipo,
      totalPorCategoria,
    });
  } catch (error) {
    console.error('Erro ao calcular totais de despesas:', error);
    res.status(500).json({ message: 'Erro ao calcular totais.' });
  }
});




module.exports = router;
