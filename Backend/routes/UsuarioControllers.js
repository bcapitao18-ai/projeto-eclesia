const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt")

const Usuarios = require("../modells/Usuarios")


const NotificacaoLocal = require("../modells/NotificacaoLocal");

const Membros = require("../modells/Membros");
const DadosCristaos = require("../modells/DadosCristaos");

const Cargo = require("../modells/Cargo");

const Contribuicao = require("../modells/Contribuicoes");



const TipoContribuicao = require("../modells/TipoContribuicao");



const Despesa = require("../modells/Despesas");


const CargoMembro = require("../modells/CargoMembro");


const Presencas = require("../modells/Presencas")


const TipoCulto = require("../modells/TipoCulto");


const MembroUser = require("../modells/MembroUser")


const Cultos= require("../modells/Cultos");



const Funcionarios= require("../modells/Funcionarios");


const Salarios= require("../modells/Salarios");


const Subsidios= require("../modells/Subsidios");



const Descontos = require("../modells/Descontos");



const Departamentos = require("../modells/Departamentos");


const DepartamentoMembros = require("../modells/DptMembros");




const Notificacao = require("../modells/Notificacoes");




const DadosAcademicos = require("../modells/DadosAcademicos");

const Diversos = require("../modells/Diversos");



const Atendimento = require("../modells/Atendimento");



const AgendaPastoral = require("../modells/AgendaPastoral");



const Sede  = require("../modells/Sede")
const Filhal = require("../modells/filhal");

const PercentagemSubsidio =  require("../modells/PercentagemSubsidios");
const PercentagemDesconto =  require("../modells/PercentagemDesconto");


const NumeroMembro =  require("../modells/NumMembro");



const DataValidadeCartao =  require("../modells/DataValidadeCartao");




const {fn, col } = require('sequelize');


const dayjs = require("dayjs")



const multer = require('multer');
const path = require('path');



const auth = require("../middlewere/auth");

// Rota protegida
router.get('/teste-auth', auth, (req, res) => {
  // Mostra os dados do usuário logado no terminal
  console.log('Usuário autenticado:', req.usuario);

  return res.json({
    mensagem: 'Middleware funcionando! Usuário autenticado.',
    usuarioLogado: req.usuario
  });
});





// Rota para buscar departamentos filtrados pelo contexto do usuário (Sede/Filhal)
router.get('/departamentos', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Define filtro com base no usuário logado
    let filtro = {};
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    const departamentos = await Departamentos.findAll({
      where: filtro,
      attributes: ['id', 'nome'],
      order: [['nome', 'ASC']], // ordena pelo nome
    });

    return res.status(200).json(departamentos);
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error);
    return res.status(500).json({ message: 'Erro ao buscar departamentos' });
  }
});







// ====================
// Rota para criar usuário
// ====================


// ====================
// Rota para criar usuário
// ====================
// ====================
// Rota para criar usuário
// ====================
router.post("/usuarios", async (req, res) => {
  try {
    const {
      nome,
      senha,
      funcao,
      sedeNome,
      sedeEndereco,
      sedeTelefone,
      sedeEmail,
      filhalNome,
      filhalEndereco,
      filhalTelefone,
      filhalEmail
    } = req.body;

    // ✅ Verifica se a senha foi enviada e tem pelo menos 5 caracteres
    if (!senha || senha.length < 5) {
      return res.status(400).json({
        message: "A senha deve ter pelo menos 5 caracteres."
      });
    }

    // ✅ Verifica se já existe uma senha igual (comparando com todas)
    const usuarios = await Usuarios.findAll({ attributes: ["senha"] });
    for (const u of usuarios) {
      const senhaRepetida = await bcrypt.compare(senha, u.senha);
      if (senhaRepetida) {
        return res.status(400).json({
          message: "Essa senha já está sendo usada por outro usuário. Escolha uma diferente."
        });
      }
    }

    // 🔹 Inicializa IDs como null
    let sedeId = null;
    let filhalId = null;

    // 🔹 Cria a sede (caso tenha sido enviada)
    if (sedeNome) {
      const novaSede = await Sede.create({
        nome: sedeNome,
        endereco: sedeEndereco || null,
        telefone: sedeTelefone || null,
        email: sedeEmail || null,
        status: "pendente", // ✅ Status padrão alterado para 'pendente'
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      sedeId = novaSede.id;
    }

    // 🔹 Cria a filhal (caso tenha sido enviada)
    if (filhalNome) {
      const novaFilhal = await Filhal.create({
        nome: filhalNome,
        endereco: filhalEndereco || null,
        telefone: filhalTelefone || null,
        email: filhalEmail || null,
        status: "pendente", // ✅ Status padrão alterado para 'pendente'
        SedeId: sedeId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      filhalId = novaFilhal.id;
    }

    // 🔹 Criptografa a senha antes de salvar
    const hashedSenha = await bcrypt.hash(senha, 10);

    // 🔹 Cria o usuário associado (sem obrigar sede/filhal)
    const novoUsuario = await Usuarios.create({
      nome,
      senha: hashedSenha,
      funcao: funcao || "admin",
      SedeId: sedeId,
      FilhalId: filhalId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      usuario: novoUsuario,
      sede: sedeId ? { id: sedeId } : null,
      filhal: filhalId ? { id: filhalId } : null
    });

  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({
      message: "Erro ao criar usuário",
      error: error.message
    });
  }
});




// GET /usuarios - lista todos os usuários com filtro hierárquico
router.get("/usuarios", auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    let where = {};

    // Filtro hierárquico
    if (SedeId && !FilhalId) {
      where.SedeId = SedeId;
    } else if (SedeId && FilhalId) {
      where.FilhalId = FilhalId;
    }

    const usuarios = await Usuarios.findAll({
      where,
      attributes: ["id", "nome", "funcao", "MembroId", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Lista de usuários",
      total: usuarios.length,
      usuarios,
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({
      message: "Erro ao buscar usuários",
      error: error.message,
    });
  }
});



const jwt = require('jsonwebtoken');

const JWT_SECRET = 'berna12890i'; // ⚠️ Coloque uma senha mais segura para produção

// Rota de login atualizada
router.post('/login', async (req, res) => {
  const { nome, senha } = req.body;

  if (!nome || !senha) {
    return res.status(400).json({ message: 'Nome e senha são obrigatórios.' });
  }

  try {
    // ---------------------------------------------------------
    // 1️⃣ TENTAR LOGAR COMO USUÁRIO NORMAL
    // ---------------------------------------------------------
    let usuario = await Usuarios.findOne({ where: { nome } });

    if (usuario) {
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
      }

      const payload = {
        id: usuario.id,
        nome: usuario.nome,
        funcao: usuario.funcao,
        SedeId: usuario.SedeId || null,
        FilhalId: usuario.FilhalId || null,
        tipo: "usuario"
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

      return res.status(200).json({
        message: "Login realizado com sucesso!",
        token,
        usuario: payload
      });
    }

    // ---------------------------------------------------------
    // 2️⃣ USUÁRIO NÃO EXISTE → VERIFICAR MembroUser
    // ---------------------------------------------------------
    const membroUser = await MembroUser.findOne({ 
      where: { nome, status: 'aprovado' } // apenas membros aprovados
    });

    if (!membroUser) {
      return res.status(403).json({ message: "Usuário não encontrado ou conta ainda não aprovada." });
    }

    // ---------------------------------------------------------
    // 3️⃣ VALIDAR SENHA DO MembroUser
    // ---------------------------------------------------------
    const senhaValida = await bcrypt.compare(senha, membroUser.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: "Usuário ou senha inválidos." });
    }

    // ---------------------------------------------------------
    // 4️⃣ GERAR TOKEN PARA MEMBRO
    // ---------------------------------------------------------
    const payload = {
      id: membroUser.id,
      nome: membroUser.nome,
      funcao: membroUser.funcao,
      MembroId: membroUser.MembroId || null,
      SedeId: membroUser.SedeId || null,
      FilhalId: membroUser.FilhalId || null,
      tipo: "membro"
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      token,
      usuario: payload
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({
      message: "Erro interno no servidor.",
      error: error.message
    });
  }
});




router.get('/perfil-membros/:id', auth, async (req, res) => {
try {
const membroId = req.params.id;


// Buscar o membro com todos os campos necessários
const membro = await Membros.findOne({
  where: { id: membroId },
  attributes: [
    'id',
    'nome',
    'foto',
    'genero',
    'data_nascimento',
    'estado_civil',
    'bi',
    'telefone',
    'email',
    'endereco_rua',
    'endereco_bairro',
    'endereco_cidade',
    'endereco_provincia',
    'grau_academico',
    'profissao',
    'batizado',
    'data_batismo',
    'ativo'
  ],
});

if (!membro) {
  return res.status(404).json({ message: 'Membro não encontrado.' });
}

// Buscar departamentos do membro
const deptosIds = await DepartamentoMembros.findAll({
  where: { MembroId: membroId },
  attributes: ['DepartamentoId']
});
const departamentoIds = deptosIds.map(d => d.DepartamentoId);
const departamentos = await Departamentos.findAll({
  where: { id: departamentoIds },
  attributes: ['id', 'nome']
});

// Buscar cargos do membro
const cargosIds = await CargoMembro.findAll({
  where: { MembroId: membroId },
  attributes: ['CargoId']
});
const cargoIds = cargosIds.map(c => c.CargoId);
const cargos = await Cargo.findAll({
  where: { id: cargoIds },
  attributes: ['id', 'nome']
});

// Buscar dados acadêmicos
const dadosAcademicos = await DadosAcademicos.findOne({
  where: { MembroId: membroId },
  attributes: ['habilitacoes', 'especialidades', 'estudo_teologico', 'local_formacao']
});

// Buscar dados cristãos
const dadosCristaos = await DadosCristaos.findOne({
  where: { MembroId: membroId },
  attributes: ['consagrado', 'data_consagracao', 'categoria_ministerial']
});

// Buscar dados diversos
const diversos = await Diversos.findOne({
  where: { MembroId: membroId },
  attributes: ['trabalha', 'conta_outrem', 'conta_propria']
});

// Montar a resposta completa
const membroCompleto = {
  ...membro.dataValues,
  foto: membro.foto ? `${req.protocol}://${req.get('host')}${membro.foto}` : null,
  departamentos,
  cargos,
  dadosAcademicos: dadosAcademicos ? dadosAcademicos.dataValues : null,
  dadosCristaos: dadosCristaos ? dadosCristaos.dataValues : null,
  diversos: diversos ? diversos.dataValues : null
};

return res.status(200).json(membroCompleto);


} catch (error) {
console.error('Erro ao buscar membro:', error);
return res.status(500).json({ message: 'Erro interno do servidor.' });
}
});






// Rota para listar membros pastores filtrados pelo contexto do usuário (Sede/Filhal)
router.get('/membros/pastores', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Define filtro pelo contexto do usuário
    let filtroMembro = {};
    if (FilhalId) {
      filtroMembro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtroMembro.SedeId = SedeId;
    }

    // Busca membros que são pastores
    const pastores = await Membros.findAll({
      where: filtroMembro,
      include: [{
        model: DadosCristaos,
        attributes: ['categoria_ministerial'],
        required: true, // garante que só traga membros que têm DadosCristaos
        where: { categoria_ministerial: 'Pastor' }
      }],
      attributes: ['id', 'nome', 'foto', 'telefone', 'email'],
      order: [['nome', 'ASC']]
    });

    return res.status(200).json({ pastores });
  } catch (error) {
    console.error('Erro ao listar pastores:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar pastores.' });
  }
});




// 📘 Rota para listar agendamentos pastorais (com contexto de Sede ou Filhal)
router.get('/tabela-comprimisso', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    console.log("AQUI NÃO TEM PROBLEMA no token:", req.usuario);

    // 🔍 Filtro de contexto
    let filtro = {};
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    // 🧾 Busca dos registros
    const agendamentos = await AgendaPastoral.findAll({
      where: filtro,
      include: [
        {
          model: Membros,
          attributes: ['id', 'nome', 'telefone', 'email'],
        },
      ],
      order: [['data_hora', 'DESC']],
    });

    return res.status(200).json({ agendamentos });
  } catch (error) {
    console.error('❌ Erro ao listar agenda pastoral:', error);
    return res.status(500).json({ message: 'Erro interno ao listar agenda pastoral.' });
  }
});







// 📘 Rota para listar cultos (com contexto de Sede ou Filhal)
router.get("/tabela-cultos", auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    console.log("🔹 Token verificado:", req.usuario);

    // 🔍 Filtro de contexto
    let filtro = {};
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    // ✅ Filtra apenas cultos que tenham responsável
    filtro.responsavel = { [Op.ne]: null };

    // 🧾 Busca dos registros
    const cultos = await Cultos.findAll({
      where: filtro,
      include: [
        {
          model: TipoCulto,
          attributes: ["id", "nome"], // Ex: tipo do culto (oração, louvor, etc)
        },
      ],
      order: [["dataHora", "DESC"]],
    });

    return res.status(200).json({ cultos });
  } catch (error) {
    console.error("❌ Erro ao listar cultos:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao listar cultos." });
  }
});










// 📘 Rota para listar cultos (com contexto de Sede ou Filhal)
router.get('/tabela-cultos', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    console.log("Token válido:", req.usuario);

    // 🔍 Filtro de contexto
    let filtro = {};
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    // 🧾 Busca dos cultos
    const cultos = await Cultos.findAll({
      where: filtro,
      include: [
        {
          model: TipoCulto,
          attributes: ['id', 'nome', 'descricao'],
        },
      ],
      order: [['dataHora', 'DESC']],
    });

    return res.status(200).json({ cultos });
  } catch (error) {
    console.error('❌ Erro ao listar cultos:', error);
    return res.status(500).json({ message: 'Erro interno ao listar cultos.' });
  }
});




// GET /tabela-cultos → lista os tipos de cultos
router.get('/tabela-cultos1', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Filtro hierárquico: Filhal > Sede
    let filtro = { ativo: true };
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    // Busca os tipos de cultos, não os cultos em si
    const tiposCultos = await TipoCulto.findAll({
      where: filtro, // Aqui você pode filtrar pelos parâmetros SedeId e FilhalId
      attributes: ['id', 'nome', 'descricao'], // Trazendo os dados dos tipos de culto
      order: [['nome', 'ASC']], // Ordenar por nome
    });

    // Retorna os tipos de culto encontrados
    res.status(200).json(tiposCultos);
  } catch (error) {
    console.error('Erro ao listar tipos de cultos:', error);
    res.status(500).json({ message: 'Erro ao listar tipos de cultos' });
  }
});




// DELETE /tipocultos/:id → Deleta um tipo de culto pelo ID
router.delete('/tipocultos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;  // Obtém o ID do tipo de culto a ser deletado

    // Tenta excluir o tipo de culto com o ID fornecido
    const tipoCulto = await TipoCulto.destroy({
      where: { id },  // Deleta o tipo de culto com o ID fornecido
    });

    if (tipoCulto === 0) {
      return res.status(404).json({ message: 'Tipo de culto não encontrado' });
    }

    return res.status(200).json({ message: 'Tipo de culto deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar tipo de culto:', error);
    return res.status(500).json({ message: 'Erro ao deletar tipo de culto' });
  }
});



// 📘 Rota para atualizar o status de um culto
router.put('/cultos/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // esperado: programado, realizado, cancelado

    // ✅ Verifica se o status é válido
    const statusValidos = ['programado', 'realizado', 'cancelado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ message: 'Status inválido. Use: programado, realizado ou cancelado.' });
    }

    // 🔍 Busca o culto pelo ID
    const culto = await Cultos.findByPk(id);
    if (!culto) {
      return res.status(404).json({ message: 'Culto não encontrado.' });
    }

    // ✏️ Atualiza o status
    culto.status = status;
    await culto.save();

    return res.status(200).json({ message: 'Status do culto atualizado com sucesso!', culto });
  } catch (error) {
    console.error('❌ Erro ao atualizar status do culto:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar status do culto.' });
  }
});





// ✅ Rota para atualizar o status de um agendamento pastoral
router.put('/agenda-pastoral/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pendente', 'Concluido', 'Cancelado'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido.' });
    }

    const agendamento = await AgendaPastoral.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }

    agendamento.status = status;
    await agendamento.save();

    return res.status(200).json({
      message: 'Status atualizado com sucesso!',
      agendamento,
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar status.' });
  }
});



// 📘 Rota para criar um novo agendamento pastoral
router.post('/agenda-pastoral', auth, async (req, res) => {
  try {
    const {
      MembroId,
      data_hora,
      tipo_cumprimento,
      nome_pessoa,
      responsavel,
      status,
      observacao
    } = req.body;

    // ✅ Validação dos campos obrigatórios
    if (!MembroId || !data_hora || !tipo_cumprimento || !nome_pessoa) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
    }

    // 🔐 Contexto do usuário logado
    const { id: UsuarioId, SedeId, FilhalId } = req.usuario;

    // 🧾 Criação do registro na tabela
    const agenda = await AgendaPastoral.create({
      MembroId,
      UsuarioId,
      data_hora: new Date(data_hora),
      tipo_cumprimento,
      nome_pessoa,
      responsavel,
      status: status || 'Pendente',
      observacao: observacao || '',
      SedeId: SedeId || null,
      FilhalId: FilhalId || null,
    });

    return res.status(201).json({
      message: 'Agendamento pastoral criado com sucesso!',
      agenda,
    });
  } catch (error) {
    console.error('❌ Erro ao criar agendamento pastoral:', error);
    return res.status(500).json({ message: 'Erro interno ao criar agendamento pastoral.' });
  }
});




// Criar atendimento
router.post('/atendimentos', auth, async (req, res) => {
  try {
    const { MembroId, data_hora, observacoes } = req.body;

    if (!MembroId || !data_hora) {
      return res.status(400).json({ message: 'Pastor e data/hora são obrigatórios.' });
    }

    // Criando o atendimento
    const atendimento = await Atendimento.create({
      MembroId: MembroId,          // pastor
      UsuarioId: req.usuario.id,   // usuário logado
      SedeId: req.usuario.SedeId || null,
      FilhalId: req.usuario.FilhalId || null,
      data_hora: new Date(data_hora),
      status: 'Agendado',
      observacoes: observacoes || ''
    });

    return res.status(201).json({ message: 'Atendimento agendado com sucesso!', atendimento });
  } catch (error) {
    console.error('Erro ao criar atendimento:', error);
    return res.status(500).json({ message: 'Erro interno ao agendar atendimento.' });
  }
});




















// Atualizar status do atendimento
router.put('/atendimentos/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Agendado', 'Concluido', 'Cancelado'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido.' });
    }

    const atendimento = await Atendimento.findByPk(id);
    if (!atendimento) {
      return res.status(404).json({ message: 'Atendimento não encontrado.' });
    }

    atendimento.status = status;
    await atendimento.save();

    return res.status(200).json({ message: 'Status atualizado com sucesso!', atendimento });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar status.' });
  }
});










// Listar atendimentos do contexto do usuário (Sede ou Filhal)
router.get('/tabela-atendimentos', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Filtro pelo contexto
    let filtro = {};
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    // Buscar atendimentos
    const atendimentos = await Atendimento.findAll({
      where: filtro,
      include: [
        {
          model: Membros,
          attributes: ['id', 'nome', 'telefone', 'email']
        },
        {
          model: Usuarios,
          attributes: ['id', 'nome', 'funcao']
        }
      ],
      order: [['data_hora', 'DESC']]
    });

    return res.status(200).json({ atendimentos });
  } catch (error) {
    console.error('Erro ao listar atendimentos:', error);
    return res.status(500).json({ message: 'Erro interno ao listar atendimentos.' });
  }
});































// Rota para buscar membros filtrados pelo auth hierárquico (Sede/Filhal)
router.get('/membros', auth, async (req, res) => {
  try {
    console.log(`Usuário logado: ID=${req.usuario.id}, Nome=${req.usuario.nome}`);

    const { SedeId, FilhalId } = req.usuario;

    // Define o filtro inicial com base na hierarquia
    let filtro = {};
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    // Buscar membros filtrados
    const membros = await Membros.findAll({
      where: filtro,
      attributes: [
        'id',
        'nome',
        'foto',
        'genero',
        'data_nascimento',
        'estado_civil',
        'telefone',
        'email',
        'endereco_cidade',
        'profissao',
        'batizado',
        'ativo'
      ],
      order: [['id', 'DESC']],
    });

    // Para cada membro, buscar departamentos e cargos
    const membrosComDepartamentosECargos = await Promise.all(
      membros.map(async (membro) => {
        // --- Departamentos ---
        const deptosIds = await DepartamentoMembros.findAll({
          where: { MembroId: membro.id },
          attributes: ['DepartamentoId']
        });
        const departamentoIds = deptosIds.map(d => d.DepartamentoId);
        const departamentos = await Departamentos.findAll({
          where: { id: departamentoIds },
          attributes: ['id', 'nome']
        });

        // --- Cargos ---
        const cargosIds = await CargoMembro.findAll({
          where: { MembroId: membro.id },
          attributes: ['CargoId']
        });
        const cargoIds = cargosIds.map(c => c.CargoId);
        const cargos = await Cargo.findAll({
          where: { id: cargoIds },
          attributes: ['id', 'nome']
        });

        return {
          ...membro.dataValues,
          foto: membro.foto ? `${req.protocol}://${req.get('host')}${membro.foto}` : null,
          departamentos,
          cargos
        };
      })
    );

    return res.status(200).json(membrosComDepartamentosECargos);
  } catch (error) {
    console.error('Erro ao buscar membros:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});



// Rota para buscar todas as crianças de 0 a 6 anos (com opção de filtrar consagradas/não consagradas)
router.get('/membros/criancas', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;
    const { consagrado } = req.query; // 👈 filtro opcional (true / false)

    // 📆 Faixa etária: 0 a 6 anos
    const hoje = new Date();
    const dataMax = new Date(hoje);
    const dataMin = new Date(hoje);
    dataMin.setFullYear(dataMin.getFullYear() - 6);

    // 🔍 Filtro hierárquico + idade
    const filtro = {
      data_nascimento: { [Op.between]: [dataMin, dataMax] },
    };

    if (FilhalId) filtro.FilhalId = FilhalId;
    else if (SedeId) filtro.SedeId = SedeId;

    // ⚙️ Montar include de DadosCristaos
    let include = [
      {
        model: DadosCristaos,
        attributes: ['consagrado'],
        required: false, // inclui mesmo que não tenha registro
      },
    ];

    // 🧠 Aplicar filtro de consagração se houver query
    if (consagrado === "true" || consagrado === "false") {
      include = [
        {
          model: DadosCristaos,
          attributes: ['consagrado'],
          required: true, // precisa existir registro
          where: {
            consagrado: consagrado === "true" ? 1 : 0,
          },
        },
      ];
    }

    console.log("🔍 Filtro:", { consagrado });
    console.log("🏢 Filtro hierárquico:", { SedeId, FilhalId });
    console.log("📅 Faixa etária:", filtro.data_nascimento);

    // 🔎 Buscar membros que são crianças
    const criancas = await Membros.findAll({
      where: filtro,
      attributes: [
        'id',
        'nome',
        'data_nascimento',
        'genero',
        'foto'
      ],
      include,
      order: [['data_nascimento', 'DESC']],
    });

    // 🔧 Ajustar resposta final
    const resultado = criancas.map((c) => ({
      id: c.id,
      nome: c.nome,
      genero: c.genero,
      data_nascimento: c.data_nascimento,
      foto: c.foto ? `${req.protocol}://${req.get('host')}${c.foto}` : null,
      consagrado: c.DadosCristao ? !!c.DadosCristao.consagrado : false,
    }));

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('❌ Erro ao buscar crianças:', error);
    return res.status(500).json({ message: 'Erro ao buscar crianças.' });
  }
});


// Rota básica: busca todos os membros (sem filtro de Sede/Filial e sem detalhes extras)
router.get('/membros-todos', async (req, res) => {
  try {
    const membros = await Membros.findAll({
      attributes: [
        'id',
        'nome',
        'foto',
        'genero',
        'data_nascimento',
        'estado_civil',
        'telefone',
        'email',
        'endereco_cidade',
        'profissao',
        'batizado',
        'ativo'
      ],
      order: [['id', 'DESC']]
    });

    // Se quiser incluir a URL completa da foto também:
    const membrosComFotoUrl = membros.map(membro => ({
      ...membro.dataValues,
      foto: membro.foto ? `${req.protocol}://${req.get('host')}${membro.foto}` : null,
    }));

    return res.status(200).json(membrosComFotoUrl);
  } catch (error) {
    console.error('Erro ao buscar todos os membros:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});




// Rota para cadastrar um novo cargo com hierarquia (Sede/Filhal)
router.post('/cadastrar-cargos', auth, async (req, res) => {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ message: 'O nome do cargo é obrigatório.' });
  }

  try {
    // Pega os dados do usuário logado (já vem do middleware auth)
    const { SedeId, FilhalId } = req.usuario;

    // Cria o cargo já associado à sede ou filhal do usuário
    const novoCargo = await Cargo.create({
      nome,
      descricao: descricao || null,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null
    });

    return res.status(201).json({
      message: 'Cargo cadastrado com sucesso!',
      cargo: novoCargo,
    });
  } catch (error) {
    console.error('Erro ao cadastrar cargo:', error);
    return res.status(500).json({ message: 'Erro ao cadastrar cargo.' });
  }
});



// Rota para listar cargos filtrados pelo contexto do usuário (Sede/Filhal)
router.get('/cargos', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Define filtro com base na hierarquia
    let filtro = {};
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    const cargos = await Cargo.findAll({
      where: filtro,
      attributes: ['id', 'nome', 'descricao'],
      order: [['nome', 'ASC']],
    });

    return res.status(200).json(cargos);
  } catch (error) {
    console.error('Erro ao listar cargos:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar cargos.' });
  }
});



// GET /salarios - relatório agrupado por funcionário e meses (EXECUTIVO)
router.get("/salarios", auth, async (req, res) => {
  try {
    const { startDate, endDate, FuncionarioId } = req.query;
    const { SedeId, FilhalId } = req.usuario;

    let where = {};

    // Filtro por intervalo (mes_ano = YYYY-MM)
    if (startDate && endDate) {
      where.mes_ano = {
        [Op.between]: [
          dayjs(startDate).format("YYYY-MM"),
          dayjs(endDate).format("YYYY-MM"),
        ],
      };
    }

    // Filtro hierárquico
    if (SedeId) {
      where.SedeId = SedeId;
    } else if (FilhalId) {
      where.FilhalId = FilhalId;
    }

    // Filtro por funcionário
    if (FuncionarioId) {
      where.FuncionarioId = FuncionarioId;
    }

    const salarios = await Salarios.findAll({
      where,
      include: [
        {
          model: Funcionarios,
          include: [
            {
              model: Membros,
              attributes: ["id", "nome"],
            },
          ],
        },
      ],
      order: [
        ["FuncionarioId", "ASC"],
        ["mes_ano", "ASC"],
      ],
    });

    // 🔥 AGRUPAMENTO INTELIGENTE (1 FUNCIONÁRIO = 1 LINHA)
    const agrupado = {};

    salarios.forEach((s) => {
      const funcionarioId = s.FuncionarioId;
      const nome = s.Funcionario?.Membro?.nome || "Sem Nome";
      const mes = s.mes_ano;

      if (!agrupado[funcionarioId]) {
        agrupado[funcionarioId] = {
          FuncionarioId: funcionarioId,
          nome,
          meses: {},
          totalGeral: 0,
        };
      }

      const salarioLiquido = Number(s.salario_liquido || 0);

      agrupado[funcionarioId].meses[mes] = {
        salario_base: Number(s.salario_base || 0),
        subsidios: Number(s.total_subsidios || 0),
        liquido: salarioLiquido,
      };

      agrupado[funcionarioId].totalGeral += salarioLiquido;
    });

    // Converter para array
    const resultado = Object.values(agrupado);

    res.json({
      relatorio: resultado,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório executivo:", error);
    res.status(500).json({
      error: "Erro interno ao gerar relatório de salários.",
    });
  }
});




// GET /salarios/lista - LISTA SIMPLES PARA TABELA FRONTEND
router.get("/salarios/lista", auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    let where = {};

    // filtro hierárquico
    if (SedeId) {
      where.SedeId = SedeId;
    } else if (FilhalId) {
      where.FilhalId = FilhalId;
    }

    const salarios = await Salarios.findAll({
      where,
      include: [
        {
          model: Funcionarios,
          include: [
            {
              model: Membros,
              attributes: ["id", "nome"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    // 🔥 FORMATAR PARA FRONTEND (IMPORTANTE)
    const resultado = salarios.map((s) => ({
      id: s.id,
      mes_ano: s.mes_ano,
      salario_base: Number(s.salario_base || 0),
      total_subsidios: Number(s.total_subsidios || 0),
      total_descontos: Number(s.total_descontos || 0),
      salario_liquido: Number(s.salario_liquido || 0),

      Funcionario: {
        id: s.Funcionario?.id,
        Membro: {
          nome: s.Funcionario?.Membro?.nome || "Sem Nome",
        },
      },
    }));

    return res.json({
      salarios: resultado,
    });

  } catch (error) {
    console.error("Erro ao listar salários:", error);
    return res.status(500).json({
      message: "Erro interno ao listar salários.",
    });
  }
});



// 🔹 Listar funcionários ativos com o nome do membro (filtrando por Sede/Filhal)
router.get("/funcionarios", auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    let where = { ativo: true };

    // Filtro hierárquico
    if (SedeId && !FilhalId) {
      where.SedeId = SedeId;
    } else if (SedeId && FilhalId) {
      where.FilhalId = FilhalId;
    }

    const funcionarios = await Funcionarios.findAll({
      where,
      include: [
        {
          model: Membros,
          attributes: ["id", "nome"], // pega só o necessário
        },
      ],
      order: [["id", "ASC"]],
    });

    res.json(funcionarios);
  } catch (err) {
    console.error("Erro ao listar funcionários ativos:", err);
    res.status(500).json({ message: "Erro ao listar funcionários ativos" });
  }
});
  













// 🔹 Listar subsídios ativos (filtrando por Sede/Filial) + percentagem já tratada
router.get("/subsidios", auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    let where = { ativo: 1 };

    // Filtro hierárquico
    if (SedeId && !FilhalId) {
      where.SedeId = SedeId;
    } else if (SedeId && FilhalId) {
      where.FilhalId = FilhalId;
    }

    const subsidios = await Subsidios.findAll({
      where,
      order: [["id", "ASC"]],
      include: [
        {
          model: PercentagemSubsidio,
          // ⚠️ NÃO usamos "as" aqui porque teu retorno já mostrou plural automático
          required: false,
        },
      ],
    });

    // 🔥 FORMATAR RESULTADO (AQUI ESTÁ A CORREÇÃO PRINCIPAL)
    const subsidiosFormatados = subsidios.map((s) => {
      const percentagem =
        s.PercentagemSubsidios?.[0]?.percentagem || 0;

      return {
        id: s.id,
        nome: s.nome,
        valor: s.valor,
        percentagem, // 👈 já pronto pro frontend
        ativo: s.ativo,
        SedeId: s.SedeId,
        FilhalId: s.FilhalId,
      };
    });

    // 🔍 DEBUG LIMPO
    console.log("========== SUBSIDIOS FORMATADOS ==========");
    subsidiosFormatados.forEach((s) => {
      console.log(
        `ID: ${s.id} | ${s.nome} | ${s.percentagem}%`
      );
    });
    console.log("==========================================");

    return res.json(subsidiosFormatados);

  } catch (error) {
    console.error("Erro ao listar subsídios:", error);
    return res.status(500).json({
      message: "Erro interno ao listar subsídios.",
    });
  }
});


router.put("/subsidios/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, percentagem, ativo } = req.body;

    console.log("✏️ UPDATE SUBSIDIO:", req.body);

    // 🔹 Buscar subsídio
    const subsidio = await Subsidios.findByPk(id);

    if (!subsidio) {
      return res.status(404).json({
        message: "Subsídio não encontrado.",
      });
    }

    // 🔹 Atualizar dados base
    await subsidio.update({
      nome: nome ?? subsidio.nome,
      ativo: ativo !== undefined ? ativo : subsidio.ativo,
    });

    // 🔥 Buscar percentagem associada
    const percent = await PercentagemSubsidio.findOne({
      where: { SubsidioId: id },
    });

    if (percent) {
      await percent.update({
        percentagem:
          percentagem !== undefined
            ? percentagem
            : percent.percentagem,
      });
    } else {
      // segurança caso não exista
      await PercentagemSubsidio.create({
        percentagem: percentagem || 0,
        SubsidioId: id,
      });
    }

    return res.json({
      message: "✅ Subsídio atualizado com sucesso!",
      subsidio,
    });

  } catch (error) {
    console.error("❌ Erro ao atualizar subsídio:", error);

    return res.status(500).json({
      message: "Erro interno ao atualizar subsídio.",
    });
  }
});

router.delete("/subsidios/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ DELETE SUBSIDIO ID:", id);

    // 🔹 Buscar subsídio
    const subsidio = await Subsidios.findByPk(id);

    if (!subsidio) {
      return res.status(404).json({
        message: "Subsídio não encontrado.",
      });
    }

    // 🔥 Apagar percentagem primeiro (FK safe)
    await PercentagemSubsidio.destroy({
      where: { SubsidioId: id },
    });

    // 🔹 Apagar subsídio
    await subsidio.destroy();

    return res.json({
      message: "🗑️ Subsídio eliminado com sucesso!",
    });

  } catch (error) {
    console.error("❌ Erro ao eliminar subsídio:", error);

    return res.status(500).json({
      message: "Erro interno ao eliminar subsídio.",
    });
  }
});













router.get("/descontos", auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    let where = { ativo: true };

    if (SedeId && !FilhalId) {
      where.SedeId = SedeId;
    } else if (SedeId && FilhalId) {
      where.FilhalId = FilhalId;
    }

    const descontosRaw = await Descontos.findAll({
      where,
      order: [["id", "ASC"]],
      include: [
        {
          model: PercentagemDesconto,
          required: false,
        },
      ],
    });

    const descontos = descontosRaw.map((d) => {
      const percentagem =
        d.PercentagemDescontos?.[0]?.percentagem || 0;

      return {
        id: d.id,
        nome: d.nome,
        descricao: d.descricao,
        percentagem,
        ativo: d.ativo,
        SedeId: d.SedeId,
        FilhalId: d.FilhalId,
      };
    });

    return res.json(descontos);

  } catch (error) {
    console.error("Erro ao listar descontos:", error);
    return res.status(500).json({
      message: "Erro interno ao listar descontos.",
    });
  }
});


router.post("/salarios", auth, async (req, res) => {
  try {
    const {
      FuncionarioId,
      mes_ano,
      subsidiosAplicados = [],
      descontosAplicados = []
    } = req.body;

    const funcionario = await Funcionarios.findByPk(FuncionarioId, {
      include: [{ model: Membros, as: "Membro" }]
    });

    if (!funcionario) {
      return res.status(404).json({ message: "Funcionário não encontrado." });
    }

    const salario_base = parseFloat(funcionario.salario_base || 0);

    // =========================
    // 🔥 SUBSÍDIOS
    // =========================
    let total_subsidios = 0;

    for (const id of subsidiosAplicados) {
      const percent = await PercentagemSubsidio.findOne({
        where: { SubsidioId: id }
      });

      if (percent) {
        total_subsidios += salario_base * (percent.percentagem / 100);
      }
    }

    // =========================
    // 🔥 DESCONTOS
    // =========================
    let total_descontos = 0;

    const descMap = {}; // 🔥 importante para dízimo

    for (const id of descontosAplicados) {
      const percent = await PercentagemDesconto.findOne({
        where: { DescontoId: id }
      });

      if (percent) {
        const valor = salario_base * (percent.percentagem / 100);
        total_descontos += valor;

        // 🔥 guardamos para usar no dízimo
        descMap[id] = percent.percentagem;
      }
    }

    // =========================
    // 🔥 DÍZIMO AUTOMÁTICO
    // =========================
    console.log("📦 descontosAplicados:", descontosAplicados);

    const tipoDizimo = await TipoContribuicao.findOne({
      where: { nome: "Dízimos" }
    });

    for (const idDesconto of descontosAplicados) {
      const desconto = await Descontos.findByPk(idDesconto);

      // 👉 Pode usar nome OU ID (mais seguro usar nome)
      if (desconto?.nome === "Retenção de Dízimos") {

        const percent = descMap[idDesconto] || 0;
        const valorDizimo = salario_base * (percent / 100);

        console.log("🔥 DÍZIMO DETECTADO:", valorDizimo);

        if (valorDizimo > 0) {
          await Contribuicao.create({
            valor: valorDizimo,
            data: new Date(),
            descricao: `Dízimo automático do salário de ${funcionario?.Membro?.nome}`,
            MembroId: funcionario.Membro?.id || null,
            TipoContribuicaoId: tipoDizimo?.id || null,
            SedeId: req.usuario.SedeId || null,
            FilhalId: req.usuario.FilhalId || null,
          });
        }
      }
    }

    // =========================
    // SALÁRIO FINAL
    // =========================
    const salario_liquido =
      salario_base + total_subsidios - total_descontos;

    const { SedeId, FilhalId } = req.usuario;

    const salario = await Salarios.create({
      mes_ano,
      salario_base,
      total_subsidios,
      total_descontos,
      salario_liquido,
      FuncionarioId,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null
    });

    // =========================
    // 🔥 DESPESA AUTOMÁTICA
    // =========================
    const nomeMembro = funcionario?.Membro?.nome || "Colaborador";

    await Despesa.create({
      descricao: `Salário de ${nomeMembro} — ${salario_liquido.toFixed(2)} Kz`,
      valor: salario_liquido,
      data: new Date(),
      categoria: "Salário",
      tipo: "Fixa",
      observacao: `Mês ${mes_ano}`,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null
    });

    return res.status(201).json({
      message: "✅ Salário gerado com sucesso + dízimo automático!",
      salario
    });

  } catch (error) {
    console.error("❌ Erro ao gerar salário:", error);
    return res.status(500).json({
      message: "Erro interno ao gerar salário."
    });
  }
});





router.get("/salarios/:id/detalhado", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const salario = await Salarios.findByPk(id, {
      include: [
        {
          model: Funcionarios,
          include: [{ model: Membros, as: "Membro" }]
        }
      ]
    });

    if (!salario) {
      return res.status(404).json({ message: "Salário não encontrado." });
    }

    // 🔥 SUBSÍDIOS COM PERCENTAGEM CORRIGIDA
    const subsidiosRaw = await Subsidios.findAll({
      where: { ativo: 1 },
      include: [
        {
          model: PercentagemSubsidio,
          required: false
        }
      ]
    });

    const subsidios = subsidiosRaw.map((s) => {
      const percentagem =
        s.PercentagemSubsidios?.[0]?.percentagem || 0;

      return {
        id: s.id,
        nome: s.nome,
        valor: s.valor,
        percentagem,
        ativo: s.ativo
      };
    });

    // 🔥 DESCONTOS
    const descontos = await Descontos.findAll({
      where: { ativo: 1 }
    });

    // 🔍 DEBUG
    console.log("===== DETALHADO =====");
    subsidios.forEach((s) => {
      console.log(`Subsidio ${s.nome} → ${s.percentagem}%`);
    });
    console.log("=====================");

    return res.json({
      salario,
      subsidiosDisponiveis: subsidios,
      descontosDisponiveis: descontos
    });

  } catch (error) {
    console.error("Erro ao buscar salário detalhado:", error);
    res.status(500).json({
      message: "Erro interno ao buscar dados do salário."
    });
  }
});



























router.put("/salarios/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      FuncionarioId,
      mes_ano,
      subsidiosAplicados = [],
      descontosAplicados = []
    } = req.body;

    const salario = await Salarios.findByPk(id);

    if (!salario) {
      return res.status(404).json({ message: "Salário não encontrado." });
    }

    const funcionario = await Funcionarios.findByPk(FuncionarioId, {
      include: [{ model: Membros, as: "Membro" }]
    });

    if (!funcionario) {
      return res.status(404).json({ message: "Funcionário não encontrado." });
    }

    const salario_base = Number(funcionario.salario_base || 0);

    // =========================
    // SUBSÍDIOS
    // =========================
    const percentagensSubs = await PercentagemSubsidio.findAll({
      where: { SubsidioId: subsidiosAplicados }
    });

    const subMap = {};
    percentagensSubs.forEach((p) => {
      subMap[p.SubsidioId] = Number(p.percentagem || 0);
    });

    let total_subsidios = 0;

    subsidiosAplicados.forEach((id) => {
      const percent = subMap[id] || 0;
      total_subsidios += (salario_base * percent) / 100;
    });

    // =========================
    // DESCONTOS
    // =========================
    const percentagensDesc = await PercentagemDesconto.findAll({
      where: { DescontoId: descontosAplicados }
    });

    const descMap = {};
    percentagensDesc.forEach((p) => {
      descMap[p.DescontoId] = Number(p.percentagem || 0);
    });

    let total_descontos = 0;

    descontosAplicados.forEach((id) => {
      const percent = descMap[id] || 0;
      total_descontos += (salario_base * percent) / 100;
    });

    // =========================
    // 🔥 DÍZIMOS AUTOMÁTICOS (NOVO)
    // =========================

    const tipoDizimo = await TipoContribuicao.findOne({
      where: { nome: "Dízimos" }
    });

    console.log("📦 descontosAplicados:", descontosAplicados);

  for (const idDesconto of descontosAplicados) {
  const desconto = await Descontos.findByPk(idDesconto);

  if (desconto?.id === 4) {

    const percent = descMap[idDesconto] || 0;
    const valorDizimo = (salario_base * percent) / 100;

    console.log("🔥 DÍZIMO DETECTADO:", valorDizimo);

    await Contribuicao.create({
      valor: valorDizimo,
      data: new Date(),
      descricao: `Dízimo automático do salário de ${funcionario?.Membro?.nome}`,
      MembroId: funcionario.Membro.id,
      TipoContribuicaoId: tipoDizimo?.id || null,
      SedeId: req.usuario.SedeId || null,
      FilhalId: req.usuario.FilhalId || null,
    });
  }
}

    // =========================
    // SALÁRIO FINAL
    // =========================
    const salario_liquido =
      salario_base + total_subsidios - total_descontos;

    await salario.update({
      FuncionarioId,
      mes_ano,
      salario_base,
      total_subsidios,
      total_descontos,
      salario_liquido
    });

    return res.json({
      message: "✅ Salário atualizado com sucesso + dízimo automático!",
      salario
    });

  } catch (error) {
    console.error("Erro ao atualizar salário:", error);
    return res.status(500).json({
      message: "Erro interno ao atualizar salário."
    });
  }
});














router.delete("/salarios/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const salario = await Salarios.findByPk(id);

    if (!salario) {
      return res.status(404).json({ message: "Salário não encontrado." });
    }

    await salario.destroy();

    res.json({ message: "🗑 Salário eliminado com sucesso!" });

  } catch (error) {
    console.error("Erro ao eliminar salário:", error);
    res.status(500).json({ message: "Erro interno ao eliminar salário." });
  }
});


















  

router.post("/subsidios", auth, async (req, res) => {
  try {
    const { nome, percentagem, ativo } = req.body;

    console.log(req.body);

    // 🔹 Validação
    if (!nome || percentagem === undefined) {
      return res.status(400).json({
        message: "Preencha todos os campos obrigatórios (Nome e Percentagem).",
      });
    }

    // 🔹 Pegar hierarquia do usuário logado
    const { SedeId, FilhalId } = req.usuario;

    // 🔹 Criar o Subsídio (SEM valor)
    const novoSubsidio = await Subsidios.create({
      nome,
      ativo: ativo !== undefined ? ativo : true,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null,
    });

    // 🔹 Criar a Percentagem associada ao Subsídio
    const novaPercentagem = await PercentagemSubsidio.create({
      percentagem,
      SubsidioId: novoSubsidio.id,
    });

    return res.status(201).json({
      message: "✅ Subsídio com percentagem cadastrado com sucesso!",
      subsidio: novoSubsidio,
      percentagem: novaPercentagem,
    });

  } catch (error) {
    console.error("Erro ao cadastrar subsídio:", error);

    return res.status(500).json({
      message: "❌ Erro interno ao cadastrar subsídio.",
    });
  }
});

















// 🔹 Rota para "eliminar" funcionário (SOFT DELETE - desativa)
router.delete("/funcionarios/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 Buscar funcionário
    const funcionario = await Funcionarios.findByPk(id);

    if (!funcionario) {
      return res.status(404).json({
        message: "Funcionário não encontrado.",
      });
    }

    // 🔹 Contexto organizacional (segurança multi-sede/filial)
    const { SedeId, FilhalId } = req.usuario;

    if (
      (SedeId && funcionario.SedeId !== SedeId) ||
      (FilhalId && funcionario.FilhalId !== FilhalId)
    ) {
      return res.status(403).json({
        message:
          "Você não tem permissão para eliminar este funcionário.",
      });
    }

    // 🔥 SOFT DELETE (mantém histórico)
    await funcionario.update({
      ativo: false,
    });

    return res.status(200).json({
      message: "🗑️ Funcionário desativado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao eliminar funcionário:", error);
    return res.status(500).json({
      message: "❌ Erro interno ao eliminar funcionário.",
    });
  }
});



// 🔹 Rota para atualizar funcionário (AUTO ATUALIZA O CARGO PELO MEMBRO)
router.put("/funcionarios/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { salario_base, ativo, MembroId } = req.body;

    // 🔹 Buscar funcionário existente
    const funcionario = await Funcionarios.findByPk(id);

    if (!funcionario) {
      return res.status(404).json({
        message: "Funcionário não encontrado.",
      });
    }

    // 🔹 Se veio MembroId, validar o membro
    let novoMembroId = funcionario.MembroId;
    if (MembroId) {
      const membro = await Membros.findByPk(MembroId);
      if (!membro) {
        return res.status(404).json({
          message: "Membro informado não foi encontrado.",
        });
      }

      // 🔹 Verificar duplicação (outro funcionário com mesmo membro)
      const funcionarioDuplicado = await Funcionarios.findOne({
        where: { MembroId },
      });

      if (funcionarioDuplicado && funcionarioDuplicado.id !== Number(id)) {
        return res.status(400).json({
          message: "Este membro já está cadastrado como funcionário.",
        });
      }

      novoMembroId = MembroId;
    }

    // 🔥 BUSCAR AUTOMATICAMENTE O CARGO MAIS RECENTE DO MEMBRO
    const cargoMembro = await CargoMembro.findOne({
      where: { MembroId: novoMembroId },
      order: [["createdAt", "DESC"]],
    });

    if (!cargoMembro) {
      return res.status(400).json({
        message:
          "O membro selecionado não possui cargo associado. Associe um cargo antes de atualizar o funcionário.",
      });
    }

    const CargoId = cargoMembro.CargoId;

    // 🔹 Verificar se o cargo ainda existe (segurança)
    const cargo = await Cargo.findByPk(CargoId);
    if (!cargo) {
      return res.status(404).json({
        message: "Cargo associado ao membro não foi encontrado.",
      });
    }

    // 🔹 Atualizar dados (com cargo automático)
    await funcionario.update({
      salario_base:
        salario_base !== undefined
          ? salario_base
          : funcionario.salario_base,
      ativo: ativo !== undefined ? ativo : funcionario.ativo,
      MembroId: novoMembroId,
      CargoId, // 🔥 sempre sincroniza com CargoMembros
    });

    return res.status(200).json({
      message: "✅ Funcionário atualizado com sucesso!",
      funcionario,
    });
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    return res.status(500).json({
      message: "❌ Erro interno ao atualizar funcionário.",
    });
  }
});



// 🔹 Rota para cadastrar novo funcionário (AUTO CAPTURA O CARGO DO MEMBRO)
router.post("/funcionarios", auth, async (req, res) => {
  try {
    const { salario_base, ativo, MembroId } = req.body;

    // 🔹 Validação básica
    if (!MembroId || !salario_base) {
      return res.status(400).json({
        message: "Preencha os campos obrigatórios (Membro e Salário Base).",
      });
    }

    // 🔹 Verificar se o Membro existe
    const membro = await Membros.findByPk(MembroId);
    if (!membro) {
      return res.status(404).json({
        message: "Membro não encontrado.",
      });
    }

    // 🔥 BUSCAR AUTOMATICAMENTE O CARGO DO MEMBRO NA TABELA CargoMembros
    const cargoMembro = await CargoMembro.findOne({
      where: { MembroId },
      order: [["createdAt", "DESC"]], // pega o cargo mais recente (caso tenha histórico)
    });

    if (!cargoMembro) {
      return res.status(400).json({
        message:
          "Este membro não possui cargo associado. Associe um cargo antes de cadastrá-lo como funcionário.",
      });
    }

    const CargoId = cargoMembro.CargoId;

    // 🔹 Verificar se o Cargo ainda existe (segurança extra)
    const cargo = await Cargo.findByPk(CargoId);
    if (!cargo) {
      return res.status(404).json({
        message: "Cargo associado ao membro não foi encontrado.",
      });
    }

    // 🔹 Verificar se já existe funcionário para este membro (evita duplicação)
    const funcionarioExistente = await Funcionarios.findOne({
      where: { MembroId },
    });

    if (funcionarioExistente) {
      return res.status(400).json({
        message: "Este membro já está cadastrado como funcionário.",
      });
    }

    // 🔹 Contexto organizacional (Sede / Filial)
    const { SedeId, FilhalId } = req.usuario;

    // 🔥 Criar funcionário com Cargo automático
    const novoFuncionario = await Funcionarios.create({
      salario_base,
      ativo: ativo ?? true,
      MembroId,
      CargoId, // agora vem automaticamente do CargoMembros
      SedeId: SedeId || null,
      FilhalId: FilhalId || null,
    });

    return res.status(201).json({
      message: "✅ Funcionário cadastrado com sucesso!",
      funcionario: novoFuncionario,
    });
  } catch (error) {
    console.error("Erro ao cadastrar funcionário:", error);
    return res.status(500).json({
      message: "❌ Erro interno ao cadastrar funcionário.",
    });
  }
});


// 🔹 LISTAR FUNCIONÁRIOS (com membro e cargo)
router.get("/lista-funcionarios", auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    const funcionarios = await Funcionarios.findAll({
      where: {
        ...(SedeId && { SedeId }),
        ...(FilhalId && { FilhalId }),
      },
      include: [
        {
          model: Membros,
          attributes: ["id", "nome"],
        },
        {
          model: Cargo,
          attributes: ["id", "nome"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(funcionarios);
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);
    res.status(500).json({
      message: "Erro ao listar funcionários.",
    });
  }
});






// 🔹 Rota para cadastrar novo desconto (COM PERCENTAGEM)
router.post("/descontos", auth, async (req, res) => {
  try {
    const { nome, percentagem, descricao, ativo } = req.body;

    console.log("📥 DESCONTO BODY:", req.body);

    // 🔹 Validação correta
    if (!nome || percentagem === undefined) {
      return res.status(400).json({
        message: "Preencha todos os campos obrigatórios (Nome e Percentagem).",
      });
    }

    const { SedeId, FilhalId } = req.usuario;

    // 🔹 Criar desconto base
    const novoDesconto = await Descontos.create({
      nome,
      descricao: descricao || null,
      ativo: ativo !== undefined ? ativo : true,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null,
    });

    // 🔥 Criar percentagem ligada ao desconto
    const novaPercentagem = await PercentagemDesconto.create({
      percentagem,
      DescontoId: novoDesconto.id,
    });

    console.log("========== DESCONTO CRIADO ==========");
    console.log(`ID: ${novoDesconto.id} | ${nome} | ${percentagem}%`);
    console.log("=====================================");

    return res.status(201).json({
      message: "✅ Desconto com percentagem cadastrado com sucesso!",
      desconto: novoDesconto,
      percentagem: novaPercentagem,
    });

  } catch (error) {
    console.error("❌ Erro ao cadastrar desconto:", error);
    return res.status(500).json({
      message: "Erro interno ao cadastrar desconto.",
    });
  }
});




router.put("/descontos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, percentagem, descricao, ativo } = req.body;

    console.log("✏️ UPDATE DESCONTO:", req.body);

    // 🔹 Buscar desconto
    const desconto = await Descontos.findByPk(id);

    if (!desconto) {
      return res.status(404).json({
        message: "Desconto não encontrado.",
      });
    }

    // 🔹 Atualizar dados base
    await desconto.update({
      nome: nome ?? desconto.nome,
      descricao: descricao ?? desconto.descricao,
      ativo: ativo !== undefined ? ativo : desconto.ativo,
    });

    // 🔥 Buscar percentagem ligada
    const percent = await PercentagemDesconto.findOne({
      where: { DescontoId: id },
    });

    if (percent) {
      await percent.update({
        percentagem:
          percentagem !== undefined
            ? percentagem
            : percent.percentagem,
      });
    } else {
      // caso não exista (segurança)
      await PercentagemDesconto.create({
        percentagem: percentagem || 0,
        DescontoId: id,
      });
    }

    return res.json({
      message: "✅ Desconto atualizado com sucesso!",
      desconto,
    });

  } catch (error) {
    console.error("❌ Erro ao atualizar desconto:", error);
    return res.status(500).json({
      message: "Erro interno ao atualizar desconto.",
    });
  }
});


router.delete("/descontos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ DELETE DESCONTO ID:", id);

    // 🔹 Buscar desconto
    const desconto = await Descontos.findByPk(id);

    if (!desconto) {
      return res.status(404).json({
        message: "Desconto não encontrado.",
      });
    }

    // 🔥 Apagar percentagem primeiro (FK safe)
    await PercentagemDesconto.destroy({
      where: { DescontoId: id },
    });

    // 🔹 Apagar desconto
    await desconto.destroy();

    return res.json({
      message: "🗑️ Desconto eliminado com sucesso!",
    });

  } catch (error) {
    console.error("❌ Erro ao eliminar desconto:", error);
    return res.status(500).json({
      message: "Erro interno ao eliminar desconto.",
    });
  }
});









// Lista de cargos filtrada por hierarquia (Sede/Filhal)
router.get('/lista/cargos', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Filtro hierárquico
    let filtroHierarquia = {};
    if (FilhalId) {
      filtroHierarquia.FilhalId = FilhalId;
    } else if (SedeId) {
      filtroHierarquia.SedeId = SedeId;
    }

    // Busca todos os cargos filtrados e inclui suas associações com CargoMembro
    const cargos = await Cargo.findAll({
      where: filtroHierarquia,
      include: [
        {
          model: CargoMembro,
          attributes: ['createdAt'],
        },
      ],
      order: [['nome', 'ASC']],
    });

    // Enriquecer os cargos com totalMembros e ultimoAtribuido
    const cargosEnriquecidos = cargos.map(cargo => {
      const totalMembros = cargo.CargoMembros.length;

      const ultimoAtribuido = cargo.CargoMembros.length > 0
        ? cargo.CargoMembros.reduce((maisRecente, atual) => {
            return new Date(atual.createdAt) > new Date(maisRecente.createdAt)
              ? atual
              : maisRecente;
          }).createdAt
        : null;

      return {
        id: cargo.id,
        nome: cargo.nome,
        descricao: cargo.descricao,
        totalMembros,
        ultimoAtribuido,
      };
    });

    return res.status(200).json(cargosEnriquecidos);
  } catch (error) {
    console.error('Erro ao listar cargos:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar cargos.' });
  }
});



// ==========================
// ATUALIZAR CARGO (PUT)
// ==========================
router.put('/cargos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    const { SedeId, FilhalId } = req.usuario;

    // Filtro hierárquico para segurança
    let filtroHierarquia = {};
    if (FilhalId) {
      filtroHierarquia.FilhalId = FilhalId;
    } else if (SedeId) {
      filtroHierarquia.SedeId = SedeId;
    }

    const cargo = await Cargo.findOne({
      where: { id, ...filtroHierarquia },
    });

    if (!cargo) {
      return res.status(404).json({ message: 'Cargo não encontrado' });
    }

    await cargo.update({ nome, descricao });

    return res.status(200).json({ message: 'Cargo atualizado com sucesso', cargo });
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar cargo' });
  }
});


// ==========================
// DELETAR CARGO (DELETE)
// ==========================
router.delete('/cargos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { SedeId, FilhalId } = req.usuario;

    // Filtro hierárquico
    let filtroHierarquia = {};
    if (FilhalId) {
      filtroHierarquia.FilhalId = FilhalId;
    } else if (SedeId) {
      filtroHierarquia.SedeId = SedeId;
    }

    const cargo = await Cargo.findOne({
      where: { id, ...filtroHierarquia },
    });

    if (!cargo) {
      return res.status(404).json({ message: 'Cargo não encontrado' });
    }

    await cargo.destroy();

    return res.status(200).json({ message: 'Cargo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cargo:', error);
    return res.status(500).json({ message: 'Erro interno ao excluir cargo' });
  }
});












router.post('/membros-cargos', async (req, res) => {
  const { membroId, cargoId } = req.body;

  if (!membroId || !cargoId) {
    return res.status(400).json({ message: 'membroId e cargoId são obrigatórios.' });
  }

  try {
    // Verifica se membro existe
    const membro = await Membros.findByPk(membroId);
    if (!membro) {
      return res.status(404).json({ message: 'Membro não encontrado.' });
    }

    // Verifica se cargo existe
    const cargo = await Cargo.findByPk(cargoId);
    if (!cargo) {
      return res.status(404).json({ message: 'Cargo não encontrado.' });
    }

    // Atualiza o cargo do membro
    membro.CargoMembroId = cargoId;
    await membro.save();

    return res.status(200).json({ message: 'Cargo atribuído ao membro com sucesso.' });
  } catch (error) {
    console.error('Erro ao atribuir cargo ao membro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;












// Limpar valores vazios que causam erro de validação
const limparCamposVazios = (obj) => {
  const result = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== '') {
      result[key] = value;
    }
  });
  return result;
};




// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/fotos'); // pasta onde vai salvar as fotos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });















// Rota para atualizar membro com foto, departamentos e tabelas relacionadas
router.put('/membros/:id', auth, upload.single('foto'), async (req, res) => {
  try {
    const membroId = req.params.id;
    const {
      nome, genero, data_nascimento, estado_civil, bi, telefone, email,
      endereco_rua, endereco_bairro, endereco_cidade, endereco_provincia,
      grau_academico, profissao, batizado, data_batismo, ativo, CargosIds,
      DepartamentosIds,
      habilitacoes, especialidades, estudo_teologico, local_formacao,
      consagrado, data_consagracao, categoria_ministerial,
      trabalha, conta_outrem, conta_propria,

      // Novo: Usuário vinculado
      MembroIdUsuario
    } = req.body;

    const membro = await Membros.findByPk(membroId);
    if (!membro) return res.status(404).json({ message: 'Membro não encontrado.' });

    const parseDate = (dateStr) => (!dateStr || dateStr === '' || dateStr === 'Invalid date') ? null : dateStr;
    const parseIds = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      return input.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    };
    const cargosArray = parseIds(CargosIds);
    const departamentosArray = parseIds(DepartamentosIds);

    if (!nome || !genero) return res.status(400).json({ message: 'Nome e gênero são obrigatórios.' });

    const fotoCaminho = req.file ? `/uploads/fotos/${req.file.filename}` : membro.foto;

    // Monta objeto apenas com campos enviados e válidos
    const dadosAtualizar = {
      nome,
      foto: fotoCaminho,
      genero,
      data_nascimento: parseDate(data_nascimento),
      estado_civil,
      bi: bi && bi.trim() !== '' ? bi.trim() : membro.bi,
      telefone,
      ativo: ativo !== undefined ? (ativo === true || ativo === 'true') : membro.ativo,
      batizado: batizado !== undefined ? (batizado === true || batizado === 'true') : membro.batizado,
    };

    if (email !== undefined && email.trim() !== '') dadosAtualizar.email = email;
    if (endereco_rua !== undefined) dadosAtualizar.endereco_rua = endereco_rua;
    if (endereco_bairro !== undefined) dadosAtualizar.endereco_bairro = endereco_bairro;
    if (endereco_cidade !== undefined) dadosAtualizar.endereco_cidade = endereco_cidade;
    if (endereco_provincia !== undefined) dadosAtualizar.endereco_provincia = endereco_provincia;
    if (grau_academico !== undefined) dadosAtualizar.grau_academico = grau_academico;
    if (profissao !== undefined) dadosAtualizar.profissao = profissao;
    if (data_batismo !== undefined) dadosAtualizar.data_batismo = parseDate(data_batismo);

    await membro.update(dadosAtualizar);

    // Atualiza o MembroId do usuário vinculado (se enviado)
    if (MembroIdUsuario) {
      await Usuarios.update(
        { MembroId: membro.id },
        { where: { id: MembroIdUsuario } }
      );
    }

    // Atualiza cargos
    if (CargosIds) {
      await CargoMembro.destroy({ where: { MembroId: membroId } });
      if (cargosArray.length > 0) {
        const registrosCargo = cargosArray.map(cargoId => ({ MembroId: membroId, CargoId: cargoId }));
        await CargoMembro.bulkCreate(registrosCargo);
      }
    }

    // Atualiza departamentos
    if (DepartamentosIds) {
      await DepartamentoMembros.destroy({ where: { MembroId: membroId } });
      if (departamentosArray.length > 0) {
        const registrosDepartamentos = departamentosArray.map(depId => ({
          MembroId: membroId,
          DepartamentoId: depId,
          ativo: true,
          data_entrada: new Date(),
        }));
        await DepartamentoMembros.bulkCreate(registrosDepartamentos);
      }
    }

    // Atualiza dados acadêmicos
    const dadosAcademicos = await DadosAcademicos.findOne({ where: { MembroId: membroId } });
    if (dadosAcademicos) {
      await dadosAcademicos.update({
        habilitacoes: habilitacoes !== undefined ? habilitacoes : dadosAcademicos.habilitacoes,
        especialidades: especialidades !== undefined ? especialidades : dadosAcademicos.especialidades,
        estudo_teologico: estudo_teologico !== undefined ? estudo_teologico : dadosAcademicos.estudo_teologico,
        local_formacao: local_formacao !== undefined ? local_formacao : dadosAcademicos.local_formacao,
      });
    }

    // Atualiza dados cristãos
    const dadosCristaos = await DadosCristaos.findOne({ where: { MembroId: membroId } });
    if (dadosCristaos) {
      await dadosCristaos.update({
        consagrado: consagrado !== undefined ? (consagrado === true || consagrado === 'true') : dadosCristaos.consagrado,
        data_consagracao: data_consagracao !== undefined ? parseDate(data_consagracao) : dadosCristaos.data_consagracao,
        categoria_ministerial: categoria_ministerial !== undefined ? categoria_ministerial : dadosCristaos.categoria_ministerial,
      });
    }

    // Atualiza diversos
    const diversos = await Diversos.findOne({ where: { MembroId: membroId } });
    if (diversos) {
      await diversos.update({
        trabalha: trabalha !== undefined ? (trabalha === true || trabalha === 'true') : diversos.trabalha,
        conta_outrem: conta_outrem !== undefined ? (conta_outrem === true || conta_outrem === 'true') : diversos.conta_outrem,
        conta_propria: conta_propria !== undefined ? (conta_propria === true || conta_propria === 'true') : diversos.conta_propria,
      });
    }

    return res.status(200).json({ message: 'Membro atualizado com sucesso!', membro });

  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});






























// 🔹 Rota: Listar aniversariantes por mês
router.get("/aniversarios/mes/:mes", auth, async (req, res) => {
  try {
    const { mes } = req.params;
    const { SedeId, FilhalId } = req.usuario;

    // 🧭 Validação simples do mês
    const numeroMes = parseInt(mes, 10);
    if (isNaN(numeroMes) || numeroMes < 1 || numeroMes > 12) {
      return res.status(400).json({ message: "Mês inválido. Use 1 a 12." });
    }

    // 🔎 Filtro de contexto hierárquico
    let filtro = { ativo: true };
    if (FilhalId) filtro.FilhalId = FilhalId;
    else if (SedeId) filtro.SedeId = SedeId;

    // 🔹 Busca os membros ativos
    const membros = await Membros.findAll({
      where: filtro,
      attributes: ["id", "nome", "foto", "data_nascimento"],
      order: [["nome", "ASC"]],
    });

    // 🔹 Filtra somente os que fazem aniversário no mês escolhido
    const aniversariantesDoMes = membros.filter((membro) => {
      if (!membro.data_nascimento) return false;
      const data = new Date(membro.data_nascimento);
      return data.getMonth() + 1 === numeroMes;
    });

    // 🔹 Adiciona a URL completa da foto
    const membrosComFoto = aniversariantesDoMes.map((m) => ({
      ...m.dataValues,
      foto: m.foto ? `${req.protocol}://${req.get("host")}${m.foto}` : null,
    }));

    return res.status(200).json({
      mes: numeroMes,
      total: membrosComFoto.length,
      aniversariantes: membrosComFoto,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar aniversariantes do mês:", error);
    res.status(500).json({ message: "Erro interno ao buscar aniversariantes." });
  }
});









router.get('/completos-membros/:id', auth, async (req, res) => {
  try {
    const membroId = req.params.id;

    // 1️⃣ Buscar o membro principal
    const membro = await Membros.findByPk(membroId);
    if (!membro) {
      return res.status(404).json({ message: 'Membro não encontrado.' });
    }

    // 2️⃣ Buscar os dados acadêmicos (1:1)
    const dadosAcademicos = await DadosAcademicos.findOne({ where: { MembroId: membroId } });

    // 3️⃣ Buscar os dados cristãos (1:1)
    const dadosCristaos = await DadosCristaos.findOne({ where: { MembroId: membroId } });

    // 4️⃣ Buscar os dados diversos (1:1)
    const diversos = await Diversos.findOne({ where: { MembroId: membroId } });

    // 5️⃣ Buscar os cargos (N:N)
    const cargoMembros = await CargoMembro.findAll({ where: { MembroId: membroId } });
    const cargos = await Promise.all(
      cargoMembros.map(async (cm) => await Cargo.findByPk(cm.CargoId))
    );

    // 6️⃣ Buscar os departamentos (N:N)
    const departamentoMembros = await DepartamentoMembros.findAll({ where: { MembroId: membroId } });
    const departamentos = await Promise.all(
      departamentoMembros.map(async (dm) => await Departamentos.findByPk(dm.DepartamentoId))
    );

    // 7️⃣ Preparar o caminho completo da foto
    let fotoUrl = null;
    if (membro.foto) {
      // Ajusta o caminho absoluto, garantindo que a imagem possa ser acessada pelo cliente
      fotoUrl = `${req.protocol}://${req.get('host')}${membro.foto.startsWith('/') ? membro.foto : '/' + membro.foto}`;
    }

    // 8️⃣ Montar o objeto final
    const membroCompleto = {
      ...membro.toJSON(),
      foto: fotoUrl, // inclui a foto com URL acessível
      dadosAcademicos: dadosAcademicos || null,
      dadosCristaos: dadosCristaos || null,
      diversos: diversos || null,
      cargos: cargos.filter(Boolean),
      departamentos: departamentos.filter(Boolean),
    };

    console.log('✅ Membro completo retornado:', membroCompleto);

    res.status(200).json(membroCompleto);
  } catch (error) {
    console.error('❌ Erro ao buscar membro completo:', error);
    res.status(500).json({ message: 'Erro interno ao buscar dados completos do membro.' });
  }
});












// Rota para cadastrar membros com foto, departamentos e tabelas relacionadas
router.post('/membros', auth, upload.single('foto'), async (req, res) => {
  try {
    const {
      nome, genero, data_nascimento, estado_civil, bi, telefone, email,
      endereco_rua, endereco_bairro, endereco_cidade, endereco_provincia,
      grau_academico, profissao, batizado, data_batismo, ativo, CargosIds,
      DepartamentosIds,

      // Dados Acadêmicos
      habilitacoes, especialidades, estudo_teologico, local_formacao,

      // Dados Cristãos
      consagrado, data_consagracao, categoria_ministerial,

      // Diversos
      trabalha, conta_outrem, conta_propria,

      // Novo: Usuário vinculado
      MembroIdUsuario // Esse é o id do usuário selecionado no dropdown
    } = req.body;

    // === Conversão segura de IDs para números e filtragem de NaN ===
    const cargosArray = Array.isArray(CargosIds)
      ? CargosIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      : CargosIds
      ? [parseInt(CargosIds, 10)].filter((id) => !isNaN(id))
      : [];

    const departamentosArray = Array.isArray(DepartamentosIds)
      ? DepartamentosIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      : DepartamentosIds
      ? [parseInt(DepartamentosIds, 10)].filter((id) => !isNaN(id))
      : [];

    // Validação obrigatória
    if (!nome || !genero || cargosArray.length === 0) {
      return res.status(400).json({
        message: 'Nome, gênero e pelo menos um cargo são obrigatórios.'
      });
    }

    const fotoCaminho = req.file ? `/uploads/fotos/${req.file.filename}` : null;

    // Cadastro do membro
    const dados = limparCamposVazios({
      nome,
      foto: fotoCaminho,
      genero,
      data_nascimento,
      estado_civil,
      bi,
      telefone,
      email,
      endereco_rua,
      endereco_bairro,
      endereco_cidade,
      endereco_provincia,
      grau_academico,
      profissao,
      batizado: batizado === true || batizado === 'true',
      data_batismo,
      ativo: ativo === false || ativo === 'false' ? false : true,
      SedeId: req.usuario.SedeId || null,
      FilhalId: req.usuario.FilhalId || null
    });

    const novoMembro = await Membros.create(dados);

   
// ===== GERAR NÚMERO DE MEMBRO (POR IGREJA) =====

const ultimoNumero = await NumeroMembro.findOne({
  where: {
    SedeId: req.usuario.SedeId || null,
    FilhalId: req.usuario.FilhalId || null
  },
  order: [['numero', 'DESC']]
});

let proximoNumero = 0;

if (ultimoNumero) {
  proximoNumero = parseInt(ultimoNumero.numero, 10) + 1;
}

const numeroFormatado = String(proximoNumero).padStart(4, '0');

await NumeroMembro.create({
  numero: numeroFormatado,
  usado: true,
  MembroId: novoMembro.id,
  SedeId: req.usuario.SedeId || null,
  FilhalId: req.usuario.FilhalId || null
});

    // Atualiza o MembroId do usuário vinculado (se enviado)
    if (MembroIdUsuario) {
      await Usuarios.update(
        { MembroId: novoMembro.id },
        { where: { id: MembroIdUsuario } }
      );
    }

    // Cadastro dos cargos
    if (cargosArray.length > 0) {
      const registrosCargo = cargosArray.map((cargoId) => ({
        MembroId: novoMembro.id,
        CargoId: cargoId,
      }));
      await CargoMembro.bulkCreate(registrosCargo);
    }

    // Cadastro dos departamentos
    if (departamentosArray.length > 0) {
      const registrosDepartamentos = departamentosArray.map((depId) => ({
        MembroId: novoMembro.id,
        DepartamentoId: depId,
        ativo: true,
        data_entrada: new Date(),
      }));
      await DepartamentoMembros.bulkCreate(registrosDepartamentos);
    }

    // Dados Acadêmicos
    await DadosAcademicos.create({
      habilitacoes: habilitacoes || null,
      especialidades: especialidades || null,
      estudo_teologico: estudo_teologico || null,
      local_formacao: local_formacao || null,
      MembroId: novoMembro.id
    });

    // Dados Cristãos
    await DadosCristaos.create({
      consagrado: consagrado === true || consagrado === 'true',
      data_consagracao: data_consagracao || null,
      categoria_ministerial: categoria_ministerial || null,
      MembroId: novoMembro.id
    });

    // Diversos / Trabalho
    await Diversos.create({
      trabalha: trabalha === true || trabalha === 'true',
      conta_outrem: conta_outrem === true || conta_outrem === 'true',
      conta_propria: conta_propria === true || conta_propria === 'true',
      MembroId: novoMembro.id
    });

    return res.status(201).json({
      message: 'Membro cadastrado com sucesso!',
      membro: novoMembro
    });
  } catch (error) {
    console.error('Erro ao cadastrar membro, cargos, departamentos ou tabelas relacionadas:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});











// Rota para buscar dados específicos para cartões
router.post('/dados-cartao', auth, async (req, res) => {
  try {
    const { membrosIds } = req.body;

    if (!membrosIds || !Array.isArray(membrosIds)) {
      return res.status(400).json({ message: 'IDs inválidos.' });
    }

    const membros = await Membros.findAll({
      where: { id: membrosIds },
      attributes: [
        'id',
        'nome',
        'foto',
        'data_batismo',
        'SedeId',
        'FilhalId'
      ],
      include: [
        {
          model: NumeroMembro,
          attributes: ['numero']
        }
      ]
    });

    const resultado = await Promise.all(
      membros.map(async (membro) => {

        // =========================
        // 🔥 CARGOS
        // =========================
        const cargosIds = await CargoMembro.findAll({
          where: { MembroId: membro.id },
          attributes: ['CargoId']
        });

        const cargos = await Cargo.findAll({
          where: { id: cargosIds.map(c => c.CargoId) },
          attributes: ['nome']
        });

        // =========================
        // 🔥 DEPARTAMENTOS
        // =========================
        const deptosIds = await DepartamentoMembros.findAll({
          where: { MembroId: membro.id },
          attributes: ['DepartamentoId']
        });

        const departamentos = await Departamentos.findAll({
          where: { id: deptosIds.map(d => d.DepartamentoId) },
          attributes: ['nome']
        });

        // =========================
        // 🔥 CONFIG VALIDADE
        // =========================
        const configValidade = await DataValidadeCartao.findOne({
          where: {
            SedeId: membro.SedeId,
            FilhalId: membro.FilhalId
          }
        });

        const anos = Number(configValidade?.validade_cartao_ano) > 0
          ? Number(configValidade.validade_cartao_ano)
          : 1;

        // =========================
        // 🔥 DATA EMISSÃO
        // =========================
        const dataEmissao = new Date();

        // =========================
        // 🔥 DATA VALIDADE
        // =========================
        const dataValidade = new Date();
        dataValidade.setFullYear(dataValidade.getFullYear() + anos);

        // =========================
        // 🔥 RETORNO FINAL
        // =========================
        return {
          id: membro.id,
          nome: membro.nome,

          foto: membro.foto
            ? `${req.protocol}://${req.get('host')}${membro.foto}`
            : null,

          data_batismo: membro.data_batismo,

          // ✅ CORREÇÃO AQUI
          numero_membro: membro.NumberMembros?.[0]?.numero || '----',

          cargos: cargos.map(c => c.nome).join(', '),
          departamentos: departamentos.map(d => d.nome).join(', '),

          data_emissao: dataEmissao.toISOString().split('T')[0],
          data_validade: dataValidade.toISOString().split('T')[0],
          validade_cartao_ano: anos
        };
      })
    );

    return res.json(resultado);

  } catch (err) {
    console.error('❌ ERRO /dados-cartao:', err);
    return res.status(500).json({ message: 'Erro ao buscar dados do cartão.' });
  }
});















































router.post('/atribuir-cargos', async (req, res) => {
  const { membroId, cargoId } = req.body;

  // Verificações básicas
  if (!membroId || !cargoId) {
    return res.status(400).json({ message: 'IDs de membro e cargo são obrigatórios.' });
  }

  try {
    const novoRegistro = await CargoMembro.create({
      MembroId: membroId,
      CargoId: cargoId,
    });

    return res.status(201).json({
      message: 'Cargo atribuído com sucesso.',
      cargoMembro: novoRegistro,
    });
  } catch (error) {
    console.error('Erro ao atribuir cargo ao membro:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});







const Sequelize = require("sequelize")


// Rota - Listar tipos de contribuição filtrados pelo usuário logado (Sede/Filhal)
router.get('/lista/tipos-contribuicao', auth, async (req, res) => {
  try {
    console.log(`Usuário logado: ID=${req.usuario.id}, Nome=${req.usuario.nome}`);

    const { SedeId, FilhalId } = req.usuario;

    // Define o filtro inicial com base na hierarquia
    let filtro = {};
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    // Buscar tipos de contribuição filtrados
    const tipos = await TipoContribuicao.findAll({
      where: filtro,
      attributes: ['id', 'nome', 'ativo', 'createdAt'],
    });

    // Para cada tipo, buscamos os dados financeiros agregados, filtrados pelo mesmo contexto
    const tiposComTotais = await Promise.all(
      tipos.map(async (tipo) => {
        const resultado = await Contribuicao.findOne({
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalContribuicoes'],
            [Sequelize.fn('SUM', Sequelize.col('valor')), 'receitaTotal'],
            [Sequelize.fn('AVG', Sequelize.col('valor')), 'receitaMedia'],
            [Sequelize.fn('MAX', Sequelize.col('valor')), 'maiorContribuicao'],
          ],
          where: {
            TipoContribuicaoId: tipo.id,
            ...(FilhalId && { FilhalId }),
            ...(!FilhalId && SedeId && { SedeId })
          },
          raw: true,
        });

        return {
          ...tipo.toJSON(),
          totalContribuicoes: parseInt(resultado.totalContribuicoes, 10) || 0,
          receitaTotal: parseFloat(resultado.receitaTotal) || 0,
          receitaMedia: parseFloat(resultado.receitaMedia) || 0,
          maiorContribuicao: parseFloat(resultado.maiorContribuicao) || 0,
        };
      })
    );

    res.status(200).json(tiposComTotais);
  } catch (error) {
    console.error('Erro ao listar tipos de contribuição:', error);
    res.status(500).json({ message: 'Erro ao buscar tipos de contribuição' });
  }
});






// Rota - Criar novo tipo de contribuição com dados do auth (Sede/Filhal)
router.post('/tipos-contribuicao', auth, async (req, res) => {
  const { nome, ativo = true } = req.body;

  if (!nome) {
    return res.status(400).json({ message: 'O nome do tipo de contribuição é obrigatório.' });
  }

  try {
    // Pega os dados do usuário logado (via middleware auth)
    const { SedeId, FilhalId } = req.usuario;

    // Cria o tipo de contribuição já associado ao contexto do usuário
    const tipo = await TipoContribuicao.create({
      nome,
      ativo,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null
    });

    return res.status(201).json({
      message: 'Tipo de contribuição criado com sucesso!',
      tipo
    });
  } catch (error) {
    console.error('Erro ao criar tipo de contribuição:', error);

    // Verifica se foi erro de nome duplicado
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Já existe um tipo de contribuição com esse nome.' });
    }

    return res.status(500).json({ message: 'Erro ao criar tipo de contribuição.' });
  }
});







// Rota 3 - Editar tipo de contribuição
router.put('/tipos-contribuicao/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, ativo } = req.body;

  try {
    const tipo = await TipoContribuicao.findByPk(id);
    if (!tipo) return res.status(404).json({ message: 'Tipo não encontrado' });

    await tipo.update({ nome, ativo });
    res.status(200).json(tipo);
  } catch (error) {
    console.error('Erro ao atualizar tipo:', error);
    res.status(500).json({ message: 'Erro ao atualizar tipo' });
  }
});


// Rota 4 - Excluir tipo de contribuição
router.delete('/tipos-contribuicao/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tipo = await TipoContribuicao.findByPk(id);
    if (!tipo) return res.status(404).json({ message: 'Tipo não encontrado' });

    await tipo.destroy();
    res.status(200).json({ message: 'Tipo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tipo:', error);
    res.status(500).json({ message: 'Erro ao excluir tipo' });
  }
});



// Rota - Lançar nova contribuição com dados do auth (Sede/Filial)
router.post('/contribuicoes', auth, async (req, res) => {
  try {
    const { valor, data, descricao, MembroId, TipoContribuicaoId, CultoId } = req.body;

    // Validação básica
    if (!valor || !data || !TipoContribuicaoId) {
      return res.status(400).json({
        message: 'Valor, data e tipo de contribuição são obrigatórios.'
      });
    }

    // Pega os dados do usuário logado (via middleware auth)
    const { SedeId, FilhalId } = req.usuario;

    // Cria a contribuição já associada ao contexto correto
    const contribuicao = await Contribuicao.create({
      valor: parseFloat(valor),               // garante que é numérico
      data: new Date(data),                   // normaliza a data
      descricao: descricao?.trim() || null,   // opcional
      MembroId: MembroId || null,             // opcional
      TipoContribuicaoId,                     // obrigatório
      CultoId: CultoId || null,               // opcional
      SedeId: SedeId || null,
      FilhalId: FilhalId || null
    });

    return res.status(201).json({
      message: 'Contribuição lançada com sucesso!',
      contribuicao
    });

  } catch (error) {
    console.error('Erro ao lançar contribuição:', error);
    return res.status(500).json({
      message: 'Erro ao lançar contribuição.',
      error: error.message
    });
  }
});


const { Op } = require('sequelize');

// Rota - Listar contribuições filtradas (COMPATÍVEL COM FRONTEND)
router.get('/lista/contribuicoes', auth, async (req, res) => {
  const { startDate, endDate, tipoId, membroId } = req.query;

  try {
    const where = {};

    // -----------------------------
    // 📅 FILTRO POR DATA
    // -----------------------------
    if (startDate && endDate) {
      where.data = {
        [Op.between]: [
          new Date(`${startDate}T00:00:00`),
          new Date(`${endDate}T23:59:59`)
        ]
      };
    }

    // -----------------------------
    // 🎯 FILTRO POR TIPO
    // -----------------------------
    if (tipoId && tipoId !== '') {
      where.TipoContribuicaoId = Number(tipoId);
    }

    // -----------------------------
    // 👤 FILTRO POR MEMBRO
    // -----------------------------
    if (membroId && membroId !== '' && membroId !== 'undefined' && membroId !== 'null') {
      where.MembroId = Number(membroId);
    }

    // -----------------------------
    // 🔐 FILTRO HIERÁRQUICO
    // -----------------------------
    const { SedeId, FilialId, FilhalId } = req.usuario;
    const filial = FilialId || FilhalId;

    if (filial) {
      where.FilhalId = filial;
    } else if (SedeId) {
      where.SedeId = SedeId;
    }

    // -----------------------------
    // 📥 BUSCAR CONTRIBUIÇÕES
    // -----------------------------
    const contribuicoesDB = await Contribuicao.findAll({
      where,
      order: [['data', 'DESC']],
      raw: true
    });

    if (!contribuicoesDB || contribuicoesDB.length === 0) {
      return res.status(200).json([]);
    }

    // -----------------------------
    // 📦 IDS ÚNICOS
    // -----------------------------
    const membrosIds = [
      ...new Set(
        contribuicoesDB
          .map(c => c.MembroId)
          .filter(id => id !== null)
      )
    ];

    const tiposIds = [
      ...new Set(
        contribuicoesDB
          .map(c => c.TipoContribuicaoId)
          .filter(id => id !== null)
      )
    ];

    // -----------------------------
    // 👥 BUSCA MANUAL DOS MEMBROS (AGORA COM FOTO)
    // -----------------------------
    const membros = membrosIds.length > 0
      ? await Membros.findAll({
          where: { id: membrosIds },
          attributes: ['id', 'nome', 'foto'], // 🔥 ADICIONADO FOTO
          raw: true
        })
      : [];

    // -----------------------------
    // 🏷️ BUSCA MANUAL DOS TIPOS
    // -----------------------------
    const tipos = tiposIds.length > 0
      ? await TipoContribuicao.findAll({
          where: { id: tiposIds },
          attributes: ['id', 'nome'],
          raw: true
        })
      : [];

    // -----------------------------
    // 🧠 MAPAS RÁPIDOS (AGORA COM FOTO)
    // -----------------------------
    const membrosMap = {};
    membros.forEach(m => {
      membrosMap[m.id] = {
        nome: m.nome,
        foto: m.foto
          ? `${req.protocol}://${req.get('host')}${m.foto}`
          : null
      };
    });

    const tiposMap = {};
    tipos.forEach(t => {
      tiposMap[t.id] = t.nome;
    });

    // -----------------------------
    // 🔥 RESULTADO FINAL
    // -----------------------------
    const contribuicoes = contribuicoesDB.map(c => {
      return {
        ...c,
        valor: Number(c.valor),
        TipoContribuicao: {
          id: c.TipoContribuicaoId,
          nome: tiposMap[c.TipoContribuicaoId] || 'Sem Tipo'
        },
        Membro: {
          id: c.MembroId,
          nome: c.MembroId
            ? (membrosMap[c.MembroId]?.nome || 'Sem Membro')
            : 'Sem Membro',
          foto: c.MembroId
            ? (membrosMap[c.MembroId]?.foto || null)
            : null
        }
      };
    });

    return res.status(200).json(contribuicoes);

  } catch (error) {
    console.error('Erro ao buscar contribuições:', error);
    return res.status(500).json({
      message: 'Erro ao buscar contribuições',
      error: error.message
    });
  }
});


const {literal } = require('sequelize');

// Relatório financeiro filtrado por usuário (Sede/Filhal)
router.get('/financeiro', auth, async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const { SedeId, FilhalId } = req.usuario;

    // Filtro hierárquico
    const filtroHierarquia = FilhalId ? { FilhalId } : { SedeId };

    // Filtros de período
    const wherePeriodoContribuicao = { ...filtroHierarquia };
    const wherePeriodoDespesa = { ...filtroHierarquia };

    if (startDate && endDate) {
      wherePeriodoContribuicao.data = { [Op.between]: [startDate, endDate] };
      wherePeriodoDespesa.data = { [Op.between]: [startDate, endDate] };
    }

    // Totais gerais
    const totalArrecadado =
      (await Contribuicao.sum('valor', { where: wherePeriodoContribuicao })) || 0;
    const totalGasto =
      (await Despesa.sum('valor', { where: wherePeriodoDespesa })) || 0;
    const saldo = totalArrecadado - totalGasto;

    // ---- AGRUPAMENTO POR DIA ----
    // Contribuições agrupadas
    const entradasPorDia = await Contribuicao.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('data'), '%Y-%m-%d'), 'data'],
        [fn('SUM', col('valor')), 'entrada'],
      ],
      where: wherePeriodoContribuicao,
      group: [literal("DATE_FORMAT(data, '%Y-%m-%d')")],
      raw: true,
    });

    // Despesas agrupadas
    const saidasPorDia = await Despesa.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('data'), '%Y-%m-%d'), 'data'],
        [fn('SUM', col('valor')), 'saida'],
      ],
      where: wherePeriodoDespesa,
      group: [literal("DATE_FORMAT(data, '%Y-%m-%d')")],
      raw: true,
    });

    // Combinar as duas listas
    const mapa = {};

    entradasPorDia.forEach(e => {
      const dia = e.data;
      mapa[dia] = mapa[dia] || { data: dia, entrada: 0, saida: 0 };
      mapa[dia].entrada = parseFloat(e.entrada);
    });

    saidasPorDia.forEach(s => {
      const dia = s.data;
      mapa[dia] = mapa[dia] || { data: dia, entrada: 0, saida: 0 };
      mapa[dia].saida = parseFloat(s.saida);
    });

    const grafico = Object.values(mapa).sort((a, b) => a.data.localeCompare(b.data));

    return res.status(200).json({
      totalArrecadado,
      totalGasto,
      saldo,
      grafico,
    });
  } catch (error) {
    console.error('Erro ao gerar relatório financeiro:', error);
    return res.status(500).json({ message: 'Erro ao gerar relatório financeiro' });
  }
});






// 📌 Relatório por Membro – filtrado por hierarquia (Sede/Filhal)
router.get('/relatorios/membro', auth, async (req, res) => {
  const { membroId, startDate, endDate } = req.query;

  if (!membroId) {
    return res.status(400).json({ message: 'membroId é obrigatório' });
  }

  try {
    const { SedeId, FilhalId } = req.usuario;

    // 🔎 Filtro hierárquico
    let filtroHierarquia = {};
    if (FilhalId) {
      filtroHierarquia.FilhalId = FilhalId;
    } else if (SedeId) {
      filtroHierarquia.SedeId = SedeId;
    }

    // 🔎 Filtro de membro e período
    let where = { MembroId: membroId, ...filtroHierarquia };
    if (startDate && endDate) {
      where.data = { [Op.between]: [startDate, endDate] };
    }

    // 📌 Lista completa para exibir na tabela
    const contribuicoes = await Contribuicao.findAll({
      where,
      include: [
        { model: TipoContribuicao, attributes: ['nome'] },
        { model: Membros, attributes: ['nome'] }
      ],
      order: [['data', 'DESC']],
    });

    // 📌 Totais
    const totalContribuido = contribuicoes.reduce(
      (acc, c) => acc + parseFloat(c.valor),
      0
    );
    const quantidade = contribuicoes.length;

    // 📌 Resumo agrupado por tipo de contribuição
    const resumoPorTipo = await Contribuicao.findAll({
      where,
      attributes: [
        'TipoContribuicaoId',
        [fn('SUM', col('Contribuicao.valor')), 'totalTipo'],
        [fn('COUNT', col('Contribuicao.id')), 'quantidadeTipo'],
      ],
      include: [{ model: TipoContribuicao, attributes: ['nome'] }],
      group: ['Contribuicao.TipoContribuicaoId', 'TipoContribuicao.id'],
    });

    return res.status(200).json({
      totalContribuido,
      quantidade,
      resumoPorTipo,
      contribuicoes
    });

  } catch (error) {
    console.error('Erro ao gerar relatório por membro:', error);
    return res.status(500).json({ message: 'Erro ao gerar relatório por membro' });
  }
});







// GET /rota/lista/cultos - retorna cultos ativos filtrados pelo auth hierárquico
router.get('/rota/lista/cultos', auth, async (req, res) => {
  try {
    console.log(`Usuário logado: ID=${req.usuario.id}, Nome=${req.usuario.nome}`);

    const { SedeId, FilhalId } = req.usuario;

    // 🔎 Filtro hierárquico: Filhal > Sede
    let filtro = { ativo: 1 };
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    // Buscar cultos ativos respeitando a hierarquia
    const cultos = await Cultos.findAll({
      where: filtro,
      attributes: ['id', 'dataHora', 'local', 'responsavel', 'observacoes'], // 🔥 removido "nome"
      include: [
        {
          model: TipoCulto,
          attributes: ['id', 'nome'], // nome vem do TipoCulto
        },
      ],
      order: [['dataHora', 'ASC']],
    });

    // Formatar dados para o front-end
    const cultosFormatados = cultos.map((c) => ({
      id: c.id,
      dataHora: dayjs(c.dataHora).format('YYYY-MM-DD HH:mm:ss'),
      local: c.local,
      responsavel: c.responsavel,
      observacoes: c.observacoes,
      tipoCulto: c.TipoCulto ? c.TipoCulto.nome : null, // 👈 Nome do culto vem daqui
    }));

    return res.status(200).json(cultosFormatados);
  } catch (error) {
    console.error('Erro ao buscar cultos:', error);
    return res.status(500).json({ message: 'Erro ao buscar cultos' });
  }
});




// POST /cadastrar/cultos - cadastrar um novo culto
router.post('/cadastrar/cultos', auth, async (req, res) => {
  try {
    const { nome, dataHora, local, responsavel, observacoes, ativo = 1 } = req.body;
    const { SedeId, FilhalId } = req.usuario;

    // Validação básica
    if (!nome || !dataHora) {
      return res.status(400).json({ message: 'Campos obrigatórios: nome e dataHora.' });
    }

    // Criação do culto já associado ao contexto do usuário
    const novoCulto = await Cultos.create({
      nome,
      dataHora,
      local: local || null,
      responsavel: responsavel || null,
      observacoes: observacoes || null,
      ativo,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null
    });

    return res.status(201).json({
      message: 'Culto cadastrado com sucesso!',
      culto: novoCulto
    });
  } catch (error) {
    console.error('Erro ao cadastrar culto:', error);
    return res.status(500).json({ message: 'Erro ao cadastrar culto.' });
  }
});


















// ====================
// ROTA: Buscar todas as Sedes
// ====================
router.get("/sedes", async (req, res) => {
  try {
    const sedes = await Sede.findAll({
      order: [["nome", "ASC"]],
    });
    res.status(200).json(sedes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar Sedes", error });
  }
});

// ====================
// ROTA: Buscar todas as Filhais
// ====================
router.get("/filhais", async (req, res) => {
  try {
    const filhais = await Filhal.findAll({
      include: [
        {
          model: Sede,
          attributes: ["id", "nome"], // traz a sede a que pertence
        },
      ],
      order: [["nome", "ASC"]],
    });
    res.status(200).json(filhais);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar Filhais", error });
  }
});





// Rota - Listar todos os tipos de culto filtrados pelo auth hierárquico
router.get('/lista/tipos-culto', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // 🔎 Filtro hierárquico: Filhal > Sede
    let filtro = { ativo: 1 }; // apenas tipos ativos
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    const tiposCulto = await TipoCulto.findAll({
      where: filtro,
      attributes: ['id', 'nome', 'descricao', 'createdAt'],
      order: [['nome', 'ASC']]
    });

    res.status(200).json(tiposCulto);
  } catch (error) {
    console.error('Erro ao buscar tipos de culto:', error);
    res.status(500).json({ message: 'Erro ao buscar tipos de culto' });
  }
});









// ✅ Rota para criar um novo culto
router.post('/programa-cultos', auth, async (req, res) => {
  try {
    const { TipoCultoId, dataHora, local, responsavel, observacoes } = req.body;
    const { SedeId, FilhalId } = req.usuario;

    if (!TipoCultoId || !dataHora) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
    }

    const novoCulto = await Cultos.create({
      TipoCultoId,
      dataHora,
      local,
      responsavel,
      observacoes,
      status: 'programado',
      ativo: 1,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null,
    });

    return res.status(201).json({
      message: 'Culto criado com sucesso!',
      culto: novoCulto,
    });
  } catch (error) {
    console.error('Erro ao criar culto:', error);
    return res.status(500).json({ message: 'Erro interno ao criar culto.' });
  }
});





// GET /cultos/resumo-mensal → resumo de cultos por mês
router.get('/cultos/resumo-mensal', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Filtro hierárquico
    let filtro = { ativo: true };
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    // Busca cultos
    const cultos = await Cultos.findAll({
      where: filtro,
      attributes: ['id', 'dataHora', 'status'],
      order: [['dataHora', 'ASC']],
    });

    // Agrupa por mês
    const resumoPorMes = {};

    cultos.forEach((c) => {
      const data = new Date(c.dataHora);
      const mes = data.toLocaleString('pt-BR', { month: 'long' }); // exemplo: "janeiro"
      const ano = data.getFullYear();
      const chave = `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${ano}`; // "Janeiro 2025"

      if (!resumoPorMes[chave]) {
        resumoPorMes[chave] = {
          mes: chave,
          total: 0,
          programados: 0,
          realizados: 0,
          cancelados: 0,
        };
      }

      resumoPorMes[chave].total++;

      if (c.status === 'programado') resumoPorMes[chave].programados++;
      if (c.status === 'realizado') resumoPorMes[chave].realizados++;
      if (c.status === 'cancelado') resumoPorMes[chave].cancelados++;
    });

    // Converte em array e ordena por data
    const resultado = Object.values(resumoPorMes).sort((a, b) => {
      const getDate = (mesStr) => {
        const [mesNome, ano] = mesStr.split(' ');
        const meses = [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        return new Date(ano, meses.indexOf(mesNome.toLowerCase()));
      };
      return getDate(a.mes) - getDate(b.mes);
    });

    res.status(200).json({ resumo: resultado });
  } catch (error) {
    console.error('Erro ao gerar resumo mensal:', error);
    res.status(500).json({ message: 'Erro ao gerar resumo mensal' });
  }
});


// Rota - Criar novo tipo de culto
router.post('/tipocultos', auth, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    const { SedeId, FilhalId } = req.usuario; // dados do usuário logado

    // Validação simples
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
    }

    // Criação do novo tipo de culto
    const novoTipoCulto = await TipoCulto.create({
      nome: nome.trim(),
      descricao: descricao || '',
      ativo: ativo !== undefined ? ativo : 1, // default 1
      SedeId: SedeId || null,
      FilhalId: FilhalId || null,
    });

    res.status(201).json({
      message: "Tipo de culto criado com sucesso!",
      tipoCulto: novoTipoCulto,
    });
  } catch (error) {
    console.error('Erro ao criar tipo de culto:', error);
    res.status(500).json({ message: 'Erro ao criar tipo de culto' });
  }
});



// Rota - Atualizar tipo de culto existente
router.put('/tipocultos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo } = req.body;
    const { SedeId, FilhalId } = req.usuario; // dados do usuário logado

    // Busca o tipo de culto pelo ID
    const tipoCulto = await TipoCulto.findByPk(id);

    if (!tipoCulto) {
      return res.status(404).json({ message: 'Tipo de culto não encontrado.' });
    }

    // Atualiza apenas os campos enviados
    tipoCulto.nome = nome !== undefined ? nome.trim() : tipoCulto.nome;
    tipoCulto.descricao = descricao !== undefined ? descricao : tipoCulto.descricao;
    tipoCulto.ativo = ativo !== undefined ? ativo : tipoCulto.ativo;
    tipoCulto.SedeId = SedeId || tipoCulto.SedeId;
    tipoCulto.FilhalId = FilhalId || tipoCulto.FilhalId;

    // Salva as alterações no banco
    await tipoCulto.save();

    res.status(200).json({
      message: 'Tipo de culto atualizado com sucesso!',
      tipoCulto,
    });
  } catch (error) {
    console.error('Erro ao atualizar tipo de culto:', error);
    res.status(500).json({ message: 'Erro ao atualizar tipo de culto.' });
  }
});



// Rota - Listar cultos com nome do tipo (limitando os últimos 20)
router.get('/buscar-cultos', async (req, res) => {
  try {
    const cultos = await Cultos.findAll({
      include: [
        {
          model: TipoCulto,
          attributes: ['id', 'nome']
        }
      ],
      order: [['dataHora', 'DESC']],
      limit: 20 // pega apenas os 20 mais recentes
    });

    res.json(cultos);
  } catch (error) {
    console.error('Erro ao buscar cultos:', error);
    res.status(500).json({ message: 'Erro ao buscar cultos' });
  }
});
























// POST /detalhes-cultos → cadastra culto + contribuições (agregadas/individuais) + presenças
router.post('/detalhes-cultos', auth, async (req, res) => {
  const { dataHora, tipoCultoId, contribuicoes, homens, mulheres, criancas } = req.body;

  // pega a hierarquia direto do usuário logado
  const { SedeId, FilhalId } = req.usuario;

  const transaction = await Cultos.sequelize.transaction();

  try {
    // 1. Criar o culto
    const culto = await Cultos.create(
      {
        dataHora,
        TipoCultoId: tipoCultoId,
        SedeId: SedeId || null,
        FilhalId: FilhalId || null,
      },
      { transaction }
    );

    // 2. Criar contribuições
    if (Array.isArray(contribuicoes) && contribuicoes.length > 0) {
      // contribuicoes pode conter tanto agregadas quanto individuais
      // formato esperado:
      // [{ tipoId: 1, valor: 5000 }, { tipoId: 2, valor: 10000, membroId: 7 }]
      const contribs = contribuicoes.map(c => ({
        valor: parseFloat(c.valor) || 0,
        data: new Date(dataHora),
        TipoContribuicaoId: c.tipoId,
        CultoId: culto.id,
        MembroId: c.membroId || null,     // se vier, fica individual
        SedeId: SedeId || null,
        FilhalId: FilhalId || null,
      }));

      await Contribuicao.bulkCreate(contribs, { transaction });
    }

    // 3. Criar presença vinculada ao culto
    const total = (parseInt(homens) || 0) + (parseInt(mulheres) || 0) + (parseInt(criancas) || 0);
    await Presencas.create(
      {
        total,
        homens: parseInt(homens) || 0,
        mulheres: parseInt(mulheres) || 0,
        criancas: parseInt(criancas) || 0,
        adultos: (parseInt(homens) || 0) + (parseInt(mulheres) || 0),
        CultoId: culto.id,
        SedeId: SedeId || null,
        FilhalId: FilhalId || null,
      },
      { transaction }
    );

    // Confirma tudo
    await transaction.commit();

    res.status(201).json({ message: 'Culto registrado com sucesso!', cultoId: culto.id });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao registrar culto:', error);
    res.status(500).json({ error: 'Erro ao registrar culto.' });
  }
});


// DELETE contribuição individual
router.delete('/detalhes-cultos/:cultoId/contribuicao', auth, async (req, res) => {
  const { cultoId } = req.params;
  const { tipoId, membroId } = req.body;

  try {
    await Contribuicao.destroy({
      where: {
        CultoId: cultoId,
        TipoContribuicaoId: tipoId,
        MembroId: membroId
      }
    });

    res.json({ message: "Contribuição removida com sucesso." });
  } catch (error) {
    console.error("Erro ao remover contribuição:", error);
    res.status(500).json({ error: "Erro ao remover contribuição." });
  }
});






router.get('/detalhes-cultos1', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    let filtro = {};
    if (FilhalId) filtro.FilhalId = FilhalId;
    else if (SedeId) filtro.SedeId = SedeId;

    const cultos = await Cultos.findAll({
      where: filtro,
      attributes: [
        'id',
        'dataHora',
        'local',
        'responsavel',
        'status',
        [col('TipoCulto.nome'), 'tipoCulto'],
        // soma das presenças
        [fn('COALESCE', fn('SUM', col('Presencas.homens')), 0), 'homens'],
        [fn('COALESCE', fn('SUM', col('Presencas.mulheres')), 0), 'mulheres'],
        [fn('COALESCE', fn('SUM', col('Presencas.criancas')), 0), 'criancas'],
        [fn('COALESCE', fn('SUM', col('Presencas.adultos')), 0), 'adultos'],
        [fn('COALESCE', fn('SUM', col('Presencas.total')), 0), 'totalPresencas'],
        // soma das contribuições
        [fn('COALESCE', fn('SUM', col('Contribuicaos.valor')), 0), 'totalContribuicoes']
      ],
      include: [
        {
          model: TipoCulto,
          attributes: [], // já usamos o col() acima
        },
        {
          model: Presencas,
          attributes: [], // já agregamos
        },
        {
          model: Contribuicao,
          attributes: [], // já agregamos
        }
      ],
      group: ['Cultos.id', 'TipoCulto.id'],
      order: [['dataHora', 'DESC']],
      raw: true, // retorna os dados já “achatados”
    });

    // monta resposta final
    const cultosDetalhados = cultos.map(culto => ({
      id: culto.id,
      dataHora: culto.dataHora,
      local: culto.local,
      responsavel: culto.responsavel,
      status: culto.status,
      tipoCulto: culto.tipoCulto || '—',
      presencas: {
        homens: parseInt(culto.homens),
        mulheres: parseInt(culto.mulheres),
        criancas: parseInt(culto.criancas),
        adultos: parseInt(culto.adultos),
        total: parseInt(culto.totalPresencas),
      },
      totalContribuicoes: parseFloat(culto.totalContribuicoes),
    }));

    return res.status(200).json({ cultos: cultosDetalhados });
  } catch (error) {
    console.error('❌ Erro ao listar cultos detalhados:', error);
    return res.status(500).json({ message: 'Erro interno ao listar cultos.' });
  }
});








// PUT /detalhes-cultos/:id → atualiza culto + contribuições + presenças
router.put('/detalhes-cultos/:id', auth, async (req, res) => {
  const cultoId = req.params.id;
  const { dataHora, tipoCultoId, contribuicoes, homens, mulheres, criancas } = req.body;
  const { SedeId, FilhalId } = req.usuario;

  const transaction = await Cultos.sequelize.transaction();

  try {
    // 1. Atualiza os dados do culto
    await Cultos.update(
      {
        dataHora,
        TipoCultoId: tipoCultoId,
        SedeId: SedeId || null,
        FilhalId: FilhalId || null,
      },
      { where: { id: cultoId }, transaction }
    );

    // 2. Remove contribuições antigas e recria
    await Contribuicao.destroy({ where: { CultoId: cultoId }, transaction });

    if (Array.isArray(contribuicoes) && contribuicoes.length > 0) {
      const novasContribuicoes = contribuicoes.map(c => ({
        valor: parseFloat(c.valor) || 0,
        data: new Date(dataHora),
        TipoContribuicaoId: c.tipoId,
        CultoId: cultoId,
        MembroId: c.membroId || null,
        SedeId: SedeId || null,
        FilhalId: FilhalId || null,
      }));

      await Contribuicao.bulkCreate(novasContribuicoes, { transaction });
    }

    // 3. Atualiza presença
    const total = (parseInt(homens) || 0) + (parseInt(mulheres) || 0) + (parseInt(criancas) || 0);

    await Presencas.update(
      {
        total,
        homens: parseInt(homens) || 0,
        mulheres: parseInt(mulheres) || 0,
        criancas: parseInt(criancas) || 0,
        adultos: (parseInt(homens) || 0) + (parseInt(mulheres) || 0),
        SedeId: SedeId || null,
        FilhalId: FilhalId || null,
      },
      { where: { CultoId: cultoId }, transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: 'Culto atualizado com sucesso!' });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao atualizar culto:', error);
    res.status(500).json({ error: 'Erro ao atualizar culto.' });
  }
});





// DELETE /detalhes-cultos/:id → deleta culto + contribuições + presenças
router.delete('/detalhes-cultos/:id', auth, async (req, res) => {
  const cultoId = req.params.id;
  const transaction = await Cultos.sequelize.transaction();

  try {
    // 1. Exclui contribuições vinculadas
    await Contribuicao.destroy({ where: { CultoId: cultoId }, transaction });

    // 2. Exclui presença vinculada
    await Presencas.destroy({ where: { CultoId: cultoId }, transaction });

    // 3. Exclui o culto
    await Cultos.destroy({ where: { id: cultoId }, transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Culto e dados associados deletados com sucesso!' });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao deletar culto:', error);
    res.status(500).json({ error: 'Erro ao deletar culto.' });
  }
});























// GET /detalhes-cultos/:id → retorna culto com presenças e contribuições
router.get("/detalhes-cultos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Busca o culto básico
    const culto = await Cultos.findByPk(id);
    if (!culto) {
      return res.status(404).json({ error: "Culto não encontrado" });
    }

    // Busca a presença associada
    const presenca = await Presencas.findOne({ where: { CultoId: id } });

    // Busca as contribuições associadas
    const contribuicoes = await Contribuicao.findAll({ where: { CultoId: id } });

    // Busca tipos e membros para mapear manualmente
    const tipos = await TipoContribuicao.findAll();
    const membros = await Membros.findAll();

    // Simula o mesmo comportamento do include, mas com map manual
    const contribuicoesCompletas = contribuicoes.map((c) => {
      const tipo = tipos.find((t) => t.id === c.TipoContribuicaoId);
      const membro = membros.find((m) => m.id === c.MembroId);

      return {
        ...c.toJSON(),
        tipo: tipo ? { id: tipo.id, nome: tipo.nome } : null,
        membro: membro ? { id: membro.id, nome: membro.nome } : null,
      };
    });

    // Monta a resposta (formato idêntico ao que você pediu)
    const response = {
      id: culto.id,
      dataHora: culto.dataHora,
      tipoCultoId: culto.TipoCultoId,
      homens: presenca?.homens || 0,
      mulheres: presenca?.mulheres || 0,
      criancas: presenca?.criancas || 0,
      contribuicoes: contribuicoesCompletas.map((c) => ({
        tipoId: c.tipo?.id,
        tipoNome: c.tipo?.nome,
        membroId: c.membro?.id || null,
        membroNome: c.membro?.nome || null,
        valor: c.valor,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar culto:", error);
    res.status(500).json({ error: "Erro ao buscar culto." });
  }
});







router.get('/lista/presencas', async (req, res) => {
  try {
    const { tipoCultoId, startDate: startQuery, endDate: endQuery } = req.query;

    if (!tipoCultoId) {
      return res.status(400).json({ message: 'tipoCultoId é obrigatório' });
    }

    const startDate = startQuery ? dayjs(startQuery).startOf('day') : null;
    const endDate = endQuery ? dayjs(endQuery).endOf('day') : dayjs().endOf('day');

    // 🔹 Filtrar cultos pelo tipo e intervalo de datas
    let whereCultos = { TipoCultoId: tipoCultoId };
    if (startDate) {
      whereCultos.dataHora = { [Op.between]: [startDate.toDate(), endDate.toDate()] };
    }

    const cultos = await Cultos.findAll({
      where: whereCultos,
      include: [{ model: TipoCulto, attributes: ['id', 'nome'] }],
      order: [['dataHora', 'ASC']],
    });

    const cultoIds = cultos.map(c => c.id);

    const presencas = await Presencas.findAll({
      where: { CultoId: { [Op.in]: cultoIds } },
      include: [{ model: Cultos, attributes: ['id', 'dataHora', 'TipoCultoId'], include: [{ model: TipoCulto, attributes: ['nome'] }] }],
      order: [['createdAt', 'ASC']],
    });

    const totais = {
      totalPresentes: presencas.reduce((acc, p) => acc + (p.total || 0), 0),
      homens: presencas.reduce((acc, p) => acc + (p.homens || 0), 0),
      mulheres: presencas.reduce((acc, p) => acc + (p.mulheres || 0), 0),
      adultos: presencas.reduce((acc, p) => acc + (p.adultos || 0), 0),
      criancas: presencas.reduce((acc, p) => acc + (p.criancas || 0), 0),
    };

    const contribuicoes = await Contribuicao.findAll({
      where: { CultoId: { [Op.in]: cultoIds } },
      include: [
        { model: TipoContribuicao, attributes: ['id', 'nome'] },
        { model: Membros, attributes: ['id', 'nome'], required: false },
      ],
      order: [['data', 'ASC']],
    });

    // 🔹 Totais por tipo de contribuição
    const totaisContribuicoes = {};
    let totalGeralContribuicoes = 0; // ← Novo: total geral

    contribuicoes.forEach(c => {
      const tipo = c.TipoContribuicao.nome;
      const valor = parseFloat(c.valor);
      if (!totaisContribuicoes[tipo]) totaisContribuicoes[tipo] = 0;
      totaisContribuicoes[tipo] += valor;
      totalGeralContribuicoes += valor; // ← soma ao total geral
    });

    // 🔹 Nome do tipo de culto
    const tipoCultoNome = cultos.length > 0 ? cultos[0].TipoCulto.nome : '';

    res.status(200).json({
      tipoCultoNome,
      cultos,
      presencas,
      totais,
      contribuicoes,
      totaisContribuicoes,
      totalGeralContribuicoes, // ← Adicionado no retorno
    });

  } catch (error) {
    console.error('Erro ao buscar presenças e contribuições:', error);
    res.status(500).json({ message: 'Erro ao buscar presenças e contribuições' });
  }
});


































// 🔹 Rota que retorna estatísticas gerais do dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    const inicioMes = dayjs().startOf('month').toDate();
    const fimMes = dayjs().endOf('month').toDate();
    const hoje = dayjs().startOf("day").toDate();

    const filtroHierarquia = {};
    if (FilhalId) filtroHierarquia.FilhalId = FilhalId;
    else if (SedeId) filtroHierarquia.SedeId = SedeId;

    // -----------------------------
    // 1️⃣ TOTAL DE MEMBROS
    // -----------------------------
    const totalAtivos = await Membros.count({ where: { ...filtroHierarquia, ativo: 1 } });
    const totalInativos = await Membros.count({ where: { ...filtroHierarquia, ativo: 0 } });
    const totalMembros = totalAtivos + totalInativos;

    // -----------------------------
    // 2️⃣ NOVOS MEMBROS NO MÊS
    // -----------------------------
    const novosMembrosMes = await Membros.count({
      where: { ...filtroHierarquia, createdAt: { [Op.between]: [inicioMes, fimMes] } },
    });

    // -----------------------------
    // 3️⃣ TOTAL DE CONTRIBUIÇÕES (MÊS)
    // -----------------------------
    const totalContribuicoesMes = (await Contribuicao.sum("valor", {
      where: { ...filtroHierarquia },
    })) || 0;

    // -----------------------------
    // 4️⃣ DESPESAS
    // -----------------------------
    const totalDespesasMes = (await Despesa.sum("valor", {
  where: { ...filtroHierarquia }
})) || 0;

    const saldoFinanceiro = totalContribuicoesMes - totalDespesasMes;

    // -----------------------------
    // 5️⃣ PRÓXIMOS CULTOS
    // -----------------------------
    const proximosCultos = await Cultos.findAll({
      where: { ...filtroHierarquia, dataHora: { [Op.gte]: hoje } },
      include: [{ model: TipoCulto, attributes: ["nome"], required: false }],
      order: [["dataHora", "ASC"]],
    });

    const nomesCultos = proximosCultos.map(c => c.TipoCulto ? c.TipoCulto.nome : "Tipo não definido");

    // -----------------------------
    // 6️⃣ ESTATÍSTICAS DE MEMBROS
    // -----------------------------
    const membrosData = await Membros.findAll({ 
      where: filtroHierarquia, 
      attributes: ['id','genero','data_nascimento','estado_civil','batizado'] 
    });

    const faixasEtarias = { '0-17':0, '18-30':0, '31-50':0, '51+':0 };
    const distribuicaoGenero = { homens:0, mulheres:0 };
    const estadoCivil = {};
    const situacaoBatismo = { batizados:0, naoBatizados:0 };

    const hojeAno = dayjs().year();

    membrosData.forEach(m => {
      if (m.data_nascimento) {
        const idade = hojeAno - dayjs(m.data_nascimento).year();
        if (idade <= 17) faixasEtarias['0-17']++;
        else if (idade <= 30) faixasEtarias['18-30']++;
        else if (idade <= 50) faixasEtarias['31-50']++;
        else faixasEtarias['51+']++;
      }
      if (m.genero === 'Masculino') distribuicaoGenero.homens++;
      else if (m.genero === 'Feminino') distribuicaoGenero.mulheres++;
      if (m.estado_civil) estadoCivil[m.estado_civil] = (estadoCivil[m.estado_civil] || 0) + 1;
      if (m.batizado) situacaoBatismo.batizados++;
      else situacaoBatismo.naoBatizados++;
    });

    // -----------------------------
    // 7️⃣ PRESENÇAS FUTURAS
    // -----------------------------
    const presencasFuturas = await Presencas.findAll({
      where: { CultoId: { [Op.in]: proximosCultos.map(c => c.id) } }
    });

    // -----------------------------
    // 8️⃣ ALERTAS / EVENTOS COM BAIXA PRESENÇA OU CONTRIBUIÇÃO
    // -----------------------------
    const PRESENCA_MINIMA = 50;      // limite mínimo de presença
    const CONTRIBUICAO_MINIMA = 100; // limite mínimo de contribuição

    const alertasEventos = [];
    for (const culto of proximosCultos) {
      const presenca = presencasFuturas.find(p => p.CultoId === culto.id);
      const totalPresenca = presenca ? presenca.total : 0;

      const totalContribuicaoCulto = await Contribuicao.sum("valor", {
        where: { ...filtroHierarquia, CultoId: culto.id },
      }) || 0;

      if (totalPresenca < PRESENCA_MINIMA || totalContribuicaoCulto < CONTRIBUICAO_MINIMA) {
        alertasEventos.push({
          id: culto.id,
          tipo: culto.TipoCulto ? culto.TipoCulto.nome : "Tipo não definido",
          data: culto.dataHora,
          presenca: totalPresenca,
          contribuicao: totalContribuicaoCulto
        });
      }
    }

    // -----------------------------
    // 9️⃣ EVENTOS PASSADOS
    // -----------------------------
    const eventosPassados = await Cultos.findAll({
      where: { ...filtroHierarquia, dataHora: { [Op.lt]: hoje } },
      include: [{ model: Presencas }],
      order: [["dataHora", "DESC"]],
    });

    // -----------------------------
    // 🔹 RESPOSTA FINAL
    // -----------------------------
    return res.status(200).json({
      membros: {
        total: totalMembros,
        ativos: { total: totalAtivos, cor: "verde" },
        inativos: { total: totalInativos, cor: "cinza" },
        distribuicaoGenero,
        faixasEtarias,
        estadoCivil,
        situacaoBatismo
      },
      novosMembrosMes,
      financeiro: {
        totalContribuicoesMes,
        despesasMes: totalDespesasMes,
        saldoFinanceiro
      },
      proximosEventos: {
        quantidade: proximosCultos.length,
        nomes: nomesCultos,
        presencas: presencasFuturas,
        alertas: alertasEventos
      },
      eventosPassados: eventosPassados.map(c => ({
        id: c.id,
        tipo: c.TipoCulto ? c.TipoCulto.nome : "Tipo não definido",
        data: c.dataHora,
        presencas: c.Presencas
      })),
      periodo: { inicio: inicioMes, fim: fimMes },
    });

  } catch (error) {
    console.error("Erro ao gerar dados do dashboard:", error);
    res.status(500).json({ message: "Erro ao gerar dados do dashboard" });
  }
});








// 🔹 Rota que retorna dados completos (passados e futuros) para gráficos do dashboard
router.get('/graficos', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;
    const hoje = dayjs().startOf("day").toDate();

    // 🔹 Filtro hierárquico
    const filtroHierarquia = {};
    if (FilhalId) filtroHierarquia.FilhalId = FilhalId;
    else if (SedeId) filtroHierarquia.SedeId = SedeId;

    // --------------------------------------------------------
    // 1️⃣ Membros ativos vs inativos
    // --------------------------------------------------------
    const totalAtivos = await Membros.count({ where: { ...filtroHierarquia, ativo: 1 } });
    const totalInativos = await Membros.count({ where: { ...filtroHierarquia, ativo: 0 } });

    // --------------------------------------------------------
    // 2️⃣ Distribuição por gênero, faixa etária e batismo
    // --------------------------------------------------------
    const membrosData = await Membros.findAll({
      where: filtroHierarquia,
      attributes: ['genero', 'data_nascimento', 'batizado']
    });

    const distribuicaoGenero = { homens: 0, mulheres: 0 };
    const faixasEtarias = { '0-17': 0, '18-30': 0, '31-50': 0, '51+': 0 };
    const situacaoBatismo = { batizados: 0, naoBatizados: 0 };
    const anoAtual = dayjs().year();

    membrosData.forEach(m => {
      // Gênero
      if (m.genero === 'Masculino') distribuicaoGenero.homens++;
      else if (m.genero === 'Feminino') distribuicaoGenero.mulheres++;

      // Faixa etária
      if (m.data_nascimento) {
        const idade = anoAtual - dayjs(m.data_nascimento).year();
        if (idade <= 17) faixasEtarias['0-17']++;
        else if (idade <= 30) faixasEtarias['18-30']++;
        else if (idade <= 50) faixasEtarias['31-50']++;
        else faixasEtarias['51+']++;
      }

      // Batismo
      if (m.batizado === true || m.batizado === 1) situacaoBatismo.batizados++;
      else situacaoBatismo.naoBatizados++;
    });

    // --------------------------------------------------------
    // 3️⃣ Contribuições vs Despesas do mês atual
    // --------------------------------------------------------
    const inicioMes = dayjs().startOf('month').toDate();
    const fimMes = dayjs().endOf('month').toDate();

    const totalContribuicoesMes = await Contribuicao.sum('valor', {
      where: { ...filtroHierarquia }
    }) || 0;

    const totalDespesasMes = await Despesa.sum('valor', {
      where: { ...filtroHierarquia }
    }) || 0;

    // --------------------------------------------------------
    // 4️⃣ Cultos FUTUROS e suas presenças/contribuições
    // --------------------------------------------------------
    const cultosFuturos = await Cultos.findAll({
      where: { ...filtroHierarquia, dataHora: { [Op.gte]: hoje } },
      include: [{ model: TipoCulto, attributes: ['nome'], required: false }],
      order: [['dataHora', 'ASC']]
    });

    const presencasFuturas = await Presencas.findAll({
      where: { CultoId: { [Op.in]: cultosFuturos.map(c => c.id) } }
    });

    const dadosCultosFuturos = [];

    for (const culto of cultosFuturos) {
      const tipo = culto.TipoCulto ? culto.TipoCulto.nome : 'Não definido';
      const presenca = presencasFuturas.find(p => p.CultoId === culto.id);
      const totalPresenca = presenca ? presenca.total : 0;

      const totalContribuicao = await Contribuicao.sum('valor', {
        where: { ...filtroHierarquia, CultoId: culto.id }
      }) || 0;

      dadosCultosFuturos.push({
        tipoCulto: tipo,
        data: culto.dataHora,
        totalPresenca,
        totalContribuicao
      });
    }

    // --------------------------------------------------------
    // 5️⃣ Cultos PASSADOS e suas presenças/contribuições
    // --------------------------------------------------------
    const cultosPassados = await Cultos.findAll({
      where: { ...filtroHierarquia, dataHora: { [Op.lt]: hoje } },
      include: [{ model: TipoCulto, attributes: ['nome'], required: false }],
      order: [['dataHora', 'DESC']]
    });

    const presencasPassadas = await Presencas.findAll({
      where: { CultoId: { [Op.in]: cultosPassados.map(c => c.id) } }
    });

    const dadosCultosPassados = [];

    for (const culto of cultosPassados) {
      const tipo = culto.TipoCulto ? culto.TipoCulto.nome : 'Não definido';
      const presenca = presencasPassadas.find(p => p.CultoId === culto.id);
      const totalPresenca = presenca ? presenca.total : 0;

      const totalContribuicao = await Contribuicao.sum('valor', {
        where: { ...filtroHierarquia, CultoId: culto.id }
      }) || 0;

      dadosCultosPassados.push({
        tipoCulto: tipo,
        data: culto.dataHora,
        totalPresenca,
        totalContribuicao
      });
    }

    // --------------------------------------------------------
    // 🔹 Resposta final
    // --------------------------------------------------------
    res.status(200).json({
      membrosAtivosInativos: { ativos: totalAtivos, inativos: totalInativos },
      distribuicaoGenero,
      faixasEtarias,
      situacaoBatismo,
      financeiro: { contribMes: totalContribuicoesMes, despMes: totalDespesasMes },
      cultos: {
        futuros: dadosCultosFuturos,
        passados: dadosCultosPassados
      }
    });

  } catch (error) {
    console.error('Erro ao gerar dados para gráficos:', error);
    res.status(500).json({ message: 'Erro ao gerar dados para gráficos' });
  }
});



























// Rota para buscar todas as sedes com suas filhais e quantidade de membros (usando map)
router.get('/sedes-com-filhais', async (req, res) => {
  try {
    // Busca todas as sedes com suas filhais
    const sedes = await Sede.findAll({
      include: [
        {
          model: Filhal,
          attributes: ['id', 'nome', 'endereco', 'telefone', 'email', 'status']
        }
      ],
      order: [
        ['nome', 'ASC'],
        [Filhal, 'nome', 'ASC']
      ]
    });

    // Para cada sede e filhal, buscamos a quantidade de membros
    const sedesComMembros = await Promise.all(
      sedes.map(async (sede) => {
        // Contar membros da sede
        const membrosSede = await Membros.count({ where: { SedeId: sede.id } });

        // Para cada filhal, contar membros
        const filhaisComMembros = await Promise.all(
          sede.Filhals.map(async (filhal) => {
            const membrosFilhal = await Membros.count({ where: { FilhalId: filhal.id } });
            return {
              ...filhal.dataValues,
              quantidadeMembros: membrosFilhal
            };
          })
        );

        return {
          ...sede.dataValues,
          quantidadeMembros: membrosSede,
          Filhals: filhaisComMembros
        };
      })
    );

    res.status(200).json(sedesComMembros);
  } catch (error) {
    console.error('Erro ao buscar sedes com filhais:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});




// POST /membros/cadastrar-pendente
router.post('/membros/cadastrar-pendente', async (req, res) => {
  try {
    const { nome, senha, SedeId, FilhalId } = req.body;

    if (!nome || !senha || !SedeId) {
      return res.status(400).json({ message: "Nome, senha e sede são obrigatórios." });
    }

    // Verificar se a senha já existe em outro membro
    const todosMembros = await MembroUser.findAll();
    for (const membro of todosMembros) {
      const senhaIgual = await bcrypt.compare(senha, membro.senha);
      if (senhaIgual) {
        return res.status(400).json({ message: "Essa senha já está em uso por outro membro." });
      }
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar membro pendente
    const novoMembro = await MembroUser.create({
      nome,
      senha: hashedPassword,
      funcao: 'membro',
      status: 'pendente',
      SedeId,
      FilhalId: FilhalId || null, // pode ser nulo
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({ message: "Membro cadastrado com sucesso e está pendente de aprovação." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao cadastrar membro." });
  }
});





// Rota para criar uma nova Sede
router.post('/sedes', async (req, res) => {
  try {
    const { nome, endereco, telefone, email, status } = req.body;

    // Validação básica
    if (!nome) {
      return res.status(400).json({ message: 'O nome da Sede é obrigatório.' });
    }

    // Criar a sede
    const novaSede = await Sede.create({
      nome,
      endereco: endereco || null,
      telefone: telefone || null,
      email: email || null,
      status: status || 'pendente'
    });

    return res.status(201).json(novaSede);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao criar nova Sede.' });
  }
});










/**
 * PATCH /sedes/:id/status       -> Atualiza status de uma Sede
 * PATCH /filhais/:id/status     -> Atualiza status de uma Filhal
 */
router.patch('/:tipo/:id/status', async (req, res) => {
  const { tipo, id } = req.params;
  const { status } = req.body;

  if (!['sedes', 'filhais'].includes(tipo)) {
    return res.status(400).json({ message: 'Tipo inválido. Deve ser sedes ou filhais.' });
  }

  if (!['ativo', 'pendente', 'bloqueado'].includes(status)) {
    return res.status(400).json({ message: 'Status inválido.' });
  }

  try {
    let registro;
    if (tipo === 'sedes') {
      registro = await Sede.findByPk(id);
    } else if (tipo === 'filhais') {
      registro = await Filhal.findByPk(id);
    }

    if (!registro) {
      return res.status(404).json({ message: `${tipo.slice(0, -1)} não encontrado.` });
    }

    registro.status = status;
    await registro.save();

    res.json({ message: 'Status atualizado com sucesso.', status: registro.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar status.', error: err.message });
  }
});










// Rota para verificar status da sede e filhal do usuário logado
router.get('/usuario/status', auth, async (req, res) => {
  try {
    const { id, SedeId, FilhalId } = req.usuario;

    // Buscar a sede e filhal pelo ID do usuário
    const sede = SedeId ? await Sede.findByPk(SedeId) : null;
    const filhal = FilhalId ? await Filhal.findByPk(FilhalId) : null;

    // Verificar status da sede
    if (sede && sede.status !== 'ativo') {
      return res.status(403).json({ message: `A sede (${sede.nome}) não está ativa.` });
    }

    // Verificar status da filhal
    if (filhal && filhal.status !== 'ativo') {
      return res.status(403).json({ message: `A filhal (${filhal.nome}) não está ativa.` });
    }

    return res.status(200).json({
      message: 'Usuário autorizado',
      usuario: {
        id,
        SedeId,
        FilhalId,
        funcao: req.usuario.funcao,
        nome: req.usuario.nome
      }
    });

  } catch (err) {
    console.error('Erro ao verificar status do usuário:', err);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});




// ==========================
// EDITAR DEPARTAMENTO (PUT)
// ==========================
router.put("/departamentos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const departamento = await Departamentos.findByPk(id);
    if (!departamento) {
      return res.status(404).json({ message: "Departamento não encontrado" });
    }

    await departamento.update(dados);

    return res.status(200).json({
      message: "Departamento atualizado com sucesso",
      departamento,
    });
  } catch (error) {
    console.error("❌ Erro ao editar departamento:", error);
    return res.status(500).json({ message: "Erro ao editar departamento" });
  }
});

// ==========================
// DELETAR DEPARTAMENTO (DELETE)
// ==========================
router.delete("/departamentos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const departamento = await Departamentos.findByPk(id);
    if (!departamento) {
      return res.status(404).json({ message: "Departamento não encontrado" });
    }

    await departamento.destroy();

    return res.status(200).json({ message: "Departamento excluído com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao excluir departamento:", error);
    return res.status(500).json({ message: "Erro ao excluir departamento" });
  }
});






// GET - Listar departamentos filtrados por Sede/Filhal com contagem de membros
router.get('/departamentos-membros', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Filtro hierárquico
    let filtro = { ativo: 1 };
    if (FilhalId) {
      filtro.FilhalId = FilhalId;
    } else if (SedeId) {
      filtro.SedeId = SedeId;
    }

    // Buscar departamentos
    const departamentos = await Departamentos.findAll({
      where: filtro,
      attributes: ['id', 'nome', 'descricao', 'data_criacao', 'ativo', 'local', 'numero_membros', 'createdAt'],
      order: [['nome', 'ASC']]
    });

    // Para cada departamento, contar membros ativos
    const departamentosComMembros = await Promise.all(
      departamentos.map(async (dep) => {
        const countMembros = await DepartamentoMembros.count({
          where: { DepartamentoId: dep.id, ativo: 1 },
          include: [{
            model: Membros,
            required: true
          }]
        });
        return {
          ...dep.toJSON(),
          totalMembros: countMembros
        };
      })
    );

    res.status(200).json(departamentosComMembros);
  } catch (error) {
    console.error('Erro ao listar departamentos:', error);
    res.status(500).json({ message: 'Erro ao listar departamentos' });
  }
});




// POST - Criar novo departamento
router.post('/departamentos', auth, async (req, res) => {
  try {
    const { nome, descricao, data_criacao, ativo, local } = req.body;
    const { SedeId, FilhalId } = req.usuario;

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
    }

    const novoDepartamento = await Departamentos.create({
      nome: nome.trim(),
      descricao: descricao || '',
      data_criacao: data_criacao || new Date(),
      ativo: ativo !== undefined ? ativo : 1,
      local: local || '',
      numero_membros: 0,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null,
    });

    res.status(201).json({
      message: 'Departamento criado com sucesso!',
      departamento: novoDepartamento
    });
  } catch (error) {
    console.error('Erro ao criar departamento:', error);
    res.status(500).json({ message: 'Erro ao criar departamento' });
  }
});


// GET - Dados do usuário logado (COM MEMBRO + FOTO + CARGOS)
router.get('/meu-perfil', auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Buscar usuário com relações básicas
    const usuario = await Usuarios.findOne({
      where: { id: usuarioId },
      attributes: [
        'id',
        'nome',
        'funcao',
        'SedeId',
        'FilhalId',
        'MembroId',
        'createdAt',
        'updatedAt'
      ],
      include: [
        { model: Sede, attributes: ['id', 'nome'], required: false },
        { model: Filhal, attributes: ['id', 'nome'], required: false },
      ]
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    let membro = null;

    // 🔥 SE O USUÁRIO ESTIVER VINCULADO A UM MEMBRO
    if (usuario.MembroId) {
      const membroData = await Membros.findOne({
        where: { id: usuario.MembroId },
        attributes: [
          'id',
          'nome',
          'foto',
          'genero',
          'telefone',
          'email'
        ],
      });

      if (membroData) {
        // 🔥 BUSCAR CARGOS DO MEMBRO
        const cargosIds = await CargoMembro.findAll({
          where: { MembroId: membroData.id },
          attributes: ['CargoId']
        });

        const cargoIds = cargosIds.map(c => c.CargoId);

        const cargos = await Cargo.findAll({
          where: { id: cargoIds },
          attributes: ['id', 'nome']
        });

        membro = {
          ...membroData.dataValues,

          // 🔥 FOTO COMPLETA (igual tua outra rota)
          foto: membroData.foto
            ? `${req.protocol}://${req.get('host')}${membroData.foto}`
            : null,

          cargos
        };
      }
    }

    // 🔥 RESPOSTA FINAL UNIFICADA
    const response = {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        funcao: usuario.funcao,
        Sede: usuario.Sede,
        Filhal: usuario.Filhal,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,

        // 🔥 vínculo com membro (NOVO)
        membro
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return res.status(500).json({ message: 'Erro ao buscar perfil do usuário.' });
  }
});


// POST - Criar novo usuário
router.post('/novo-usuarios', auth, async (req, res) => {
  try {
    const { nome, senha, funcao } = req.body;

    // Validação básica
    if (!nome || !senha || !funcao) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Não permitir criação de super_admin via frontend
    if (funcao === 'super_admin') {
      return res.status(403).json({ message: 'Não é permitido criar usuário com função super_admin.' });
    }

    const { SedeId, FilhalId } = req.usuario; // pegar do usuário logado

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar usuário
    const novoUsuario = await Usuarios.create({
      nome,
      senha: hashedPassword,
      funcao,
      SedeId: SedeId || null,
      FilhalId: FilhalId || null,
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        funcao: novoUsuario.funcao,
        SedeId: novoUsuario.SedeId,
        FilhalId: novoUsuario.FilhalId,
      },
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário.' });
  }
});




// PUT - Atualizar perfil do usuário logado
router.put('/meu-perfil', auth, async (req, res) => {
  try {
    const { nome, senha, funcao } = req.body;

    // Buscar usuário logado
    const usuario = await Usuarios.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Atualiza campos, se enviados
    if (nome) usuario.nome = nome;
    if (senha) {
      const hashedPassword = await bcrypt.hash(senha, 10);
      usuario.senha = hashedPassword;
    }

    // Não permitir que usuário comum altere função
    if (funcao && req.usuario.funcao !== 'usuario') {
      // Impede alterar para super_admin
      if (funcao === 'super_admin') {
        return res.status(403).json({ message: 'Não é permitido definir função super_admin.' });
      }
      usuario.funcao = funcao;
    }

    // Mantém SedeId e FilhalId atuais
    usuario.SedeId = usuario.SedeId;
    usuario.FilhalId = usuario.FilhalId;

    await usuario.save();

    res.json({
      message: 'Perfil atualizado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        funcao: usuario.funcao,
        SedeId: usuario.SedeId,
        FilhalId: usuario.FilhalId,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
});





// GET - Listar usuários da mesma Sede e Filhal
router.get('/gestao-usuarios', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    if (!SedeId && !FilhalId) {
      return res.status(400).json({ message: 'Usuário não está associado a nenhuma Sede ou Filhal.' });
    }

    // Buscar usuários da mesma Sede e Filhal
    const usuarios = await Usuarios.findAll({
      where: {
        ...(SedeId && { SedeId }),
        ...(FilhalId && { FilhalId }),
      },
      attributes: ['id', 'nome', 'funcao', 'SedeId', 'FilhalId', 'createdAt', 'updatedAt'],
      order: [['nome', 'ASC']],
    });

    res.json({ usuarios });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});




// PUT - Atualizar função do usuário
router.put('/usuarios/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { funcao } = req.body;

    // Validação
    if (!funcao) {
      return res.status(400).json({ message: 'A função é obrigatória.' });
    }

    // Não permitir super_admin via frontend
    if (funcao === 'super_admin') {
      return res.status(403).json({ message: 'Não é permitido atribuir a função super_admin.' });
    }

    // Buscar usuário pelo ID
    const usuario = await Usuarios.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Só permitir alteração se o usuário logado pertence à mesma Sede e Filhal
    const { SedeId, FilhalId } = req.usuario;
    if (usuario.SedeId !== SedeId || usuario.FilhalId !== FilhalId) {
      return res.status(403).json({ message: 'Não autorizado a alterar função deste usuário.' });
    }

    // Atualizar função
    usuario.funcao = funcao;
    await usuario.save();

    res.status(200).json({
      message: 'Função do usuário atualizada com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        funcao: usuario.funcao,
        SedeId: usuario.SedeId,
        FilhalId: usuario.FilhalId,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar função do usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar função do usuário.' });
  }
});


// DELETE - Remover usuário
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuarios.findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

    await usuario.destroy();

    res.status(200).json({ message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro ao deletar usuário.' });
  }
});






























// Remova o 'auth' para permitir acesso de visitantes
router.get('/verificar-super-admin', async (req, res) => {
  try {
    // Procurar qualquer usuário cuja função seja 'super_admin'
    const superAdmin = await Usuarios.findOne({ where: { funcao: 'super_admin' } });

    if (superAdmin) {
      return res.status(200).json({ existe: true });
    } else {
      return res.status(200).json({ existe: false });
    }
  } catch (error) {
    console.error('Erro ao verificar super_admin:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});












// GET /usuarios/:tipo/:id
// tipo = "sede" ou "filhal"
router.get('/:tipo/:id', auth, async (req, res) => {
  try {
    const { tipo, id } = req.params;

    if (!['sede', 'filhal'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo inválido. Use "sede" ou "filhal".' });
    }

    let usuarios;

    if (tipo === 'sede') {
      // pega usuários diretamente da sede
      usuarios = await Usuarios.findAll({
        where: { SedeId: id, FilhalId: null }, // só usuários da sede
        attributes: ['id', 'nome', 'email', 'funcao', 'status', 'createdAt']
      });
    } else if (tipo === 'filhal') {
      usuarios = await Usuarios.findAll({
        where: { FilhalId: id },
        attributes: ['id', 'nome', 'email', 'funcao', 'status', 'createdAt']
      });
    }

    if (!usuarios || usuarios.length === 0) {
      return res.json({ message: `Nenhum usuário encontrado para esta ${tipo}.`, usuarios: [] });
    }

    return res.json({ usuarios });
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    return res.status(500).json({ message: 'Erro ao buscar usuários.', error: err.message });
  }
});






// POST /filhais - cadastrar nova filhal (opcional) e usuário
router.post('/filhais', async (req, res) => {
  try {
    const {
      nome,
      endereco,
      telefone,
      email,
      status,
      SedeId,
      usuarioNome,
      usuarioSenha,
      usuarioFuncao
    } = req.body;

    // Agora só valida dados obrigatórios do usuário e sede
    if (!SedeId || !usuarioNome || !usuarioSenha) {
      return res.status(400).json({ message: 'Sede, nome e senha do usuário são obrigatórios.' });
    }

    // Verifica se a sede existe
    const sede = await Sede.findByPk(SedeId);
    if (!sede) {
      return res.status(404).json({ message: 'Sede não encontrada.' });
    }

    let filhal = null;

    // Só cria filial se o nome foi informado
    if (nome && nome.trim() !== '') {
      filhal = await Filhal.create({
        nome,
        endereco,
        telefone,
        email,
        status: status || 'pendente',
        SedeId
      });
    }

    // Hash da senha do usuário
    const hashSenha = await bcrypt.hash(usuarioSenha, 10);

    // Cria o usuário vinculado à sede e, se existir, à filial
    const usuario = await Usuarios.create({
      nome: usuarioNome,
      senha: hashSenha,
      funcao: usuarioFuncao || 'admin',
      SedeId,
      FilhalId: filhal ? filhal.id : null
    });

    // Retorna o que foi criado
    return res.status(201).json({
      message: filhal
        ? 'Filial e usuário criados com sucesso!'
        : 'Usuário criado com sucesso (sem filial).',
      filhal,
      usuario
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao cadastrar filial e usuário.' });
  }
});


/**
 * PATCH /sedes/:id/status       -> Atualiza status de uma Sede
 * PATCH /filhais/:id/status     -> Atualiza status de uma Filhal
 */
router.patch('/:tipo/:id/status', async (req, res) => {
  const { tipo, id } = req.params;
  const { status } = req.body;

  if (!['sedes', 'filhais'].includes(tipo)) {
    return res.status(400).json({ message: 'Tipo inválido. Deve ser sedes ou filhais.' });
  }

  if (!['ativo', 'pendente', 'bloqueado'].includes(status)) {
    return res.status(400).json({ message: 'Status inválido.' });
  }

  try {
    let registro;
    if (tipo === 'sedes') {
      registro = await Sede.findByPk(id);
    } else if (tipo === 'filhais') {
      registro = await Filhal.findByPk(id);
    }

    if (!registro) {
      return res.status(404).json({ message: `${tipo.slice(0, -1)} não encontrado.` });
    }

    registro.status = status;
    await registro.save();

    res.json({ message: 'Status atualizado com sucesso.', status: registro.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar status.', error: err.message });
  }
});



router.post('/admin/config-validade-cartao', auth, async (req, res) => {
  try {

 
    const { SedeId, FilhalId, validade_cartao_ano } = req.body;

    console.log(req.body);

    if (!validade_cartao_ano) {
      return res.status(400).json({ message: 'Validade obrigatória.' });
    }

    if (!SedeId && !FilhalId) {
      return res.status(400).json({ message: 'Informe Sede ou Filial.' });
    }

    // 🔥 procura se já existe config
    const where = {};

    if (SedeId) where.SedeId = SedeId;
    if (FilhalId) where.FilhalId = FilhalId;

    const existe = await DataValidadeCartao.findOne({ where });

    if (existe) {
      await DataValidadeCartao.update(
        { validade_cartao_ano },
        { where }
      );

      return res.json({
        message: 'Configuração atualizada com sucesso.'
      });
    }

    // 🔥 cria nova config (SEM calcular datas)
    await DataValidadeCartao.create({
      SedeId: SedeId || null,
      FilhalId: FilhalId || null,
      validade_cartao_ano
    });

    return res.json({
      message: 'Configuração criada com sucesso.'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao configurar validade.' });
  }
});


router.delete("/sedes/:id/com-filhais", async (req, res) => {
  const sedeId = req.params.id;

  try {
    // Buscar todas as filhals da sede
    const filhals = await Filhal.findAll({ where: { SedeId: sedeId } });
    const filhalIds = filhals.map(f => f.id);

    // 1. Se houver filhals, deletar dados associados às filhals
    if (filhalIds.length > 0) {
      // Buscar Cultos das filhals para deletar presencas
      const cultosFilhals = await Cultos.findAll({ where: { FilhalId: { [Op.in]: filhalIds } } });
      const cultoIdsFilhals = cultosFilhals.map(c => c.id);

      await Promise.all([
        Usuarios.destroy({ where: { FilhalId: { [Op.in]: filhalIds } } }),
        Membros.destroy({ where: { FilhalId: { [Op.in]: filhalIds } } }),
        Cargo.destroy({ where: { FilhalId: { [Op.in]: filhalIds } } }),
        Contribuicao.destroy({ where: { FilhalId: { [Op.in]: filhalIds } } }),
        TipoContribuicao.destroy({ where: { FilhalId: { [Op.in]: filhalIds } } }),
        Despesa.destroy({ where: { FilhalId: { [Op.in]: filhalIds } } }),
        Cultos.destroy({ where: { FilhalId: { [Op.in]: filhalIds } } }),
        Presencas.destroy({ where: { CultoId: { [Op.in]: cultoIdsFilhals } } }),
        TipoCulto.destroy({ where: { FilhalId: { [Op.in]: filhalIds } } }),
        Departamentos.destroy({ where: { FilhalId: { [Op.in]: filhalIds } } }),
      ]);

      // Tabelas intermediárias que não possuem FilhalId
      const membrosFilhal = await Membros.findAll({ where: { FilhalId: { [Op.in]: filhalIds } } });
      const membroIdsFilhal = membrosFilhal.map(m => m.id);

      if (membroIdsFilhal.length > 0) {
        await Promise.all([
          CargoMembro.destroy({ where: { MembroId: { [Op.in]: membroIdsFilhal } } }),
          DepartamentoMembros.destroy({ where: { MembroId: { [Op.in]: membroIdsFilhal } } }),
          DadosAcademicos.destroy({ where: { MembroId: { [Op.in]: membroIdsFilhal } } }),
          DadosCristaos.destroy({ where: { MembroId: { [Op.in]: membroIdsFilhal } } }),
          Diversos.destroy({ where: { MembroId: { [Op.in]: membroIdsFilhal } } }),
        ]);
      }

      // Deletar as filhals
      await Filhal.destroy({ where: { SedeId: sedeId } });
    }

    // 2. Deletar dados associados apenas à sede
    const cultosSede = await Cultos.findAll({ where: { SedeId: sedeId } });
    const cultoIdsSede = cultosSede.map(c => c.id);

    await Promise.all([
      Usuarios.destroy({ where: { SedeId: sedeId } }),
      Membros.destroy({ where: { SedeId: sedeId } }),
      Cargo.destroy({ where: { SedeId: sedeId } }),
      Contribuicao.destroy({ where: { SedeId: sedeId } }),
      TipoContribuicao.destroy({ where: { SedeId: sedeId } }),
      Despesa.destroy({ where: { SedeId: sedeId } }),
      Cultos.destroy({ where: { SedeId: sedeId } }),
      Presencas.destroy({ where: { CultoId: { [Op.in]: cultoIdsSede } } }),
      TipoCulto.destroy({ where: { SedeId: sedeId } }),
      Departamentos.destroy({ where: { SedeId: sedeId } }),
    ]);

    const membrosSede = await Membros.findAll({ where: { SedeId: sedeId } });
    const membroIdsSede = membrosSede.map(m => m.id);

    if (membroIdsSede.length > 0) {
      await Promise.all([
        CargoMembro.destroy({ where: { MembroId: { [Op.in]: membroIdsSede } } }),
        DepartamentoMembros.destroy({ where: { MembroId: { [Op.in]: membroIdsSede } } }),
        DadosAcademicos.destroy({ where: { MembroId: { [Op.in]: membroIdsSede } } }),
        DadosCristaos.destroy({ where: { MembroId: { [Op.in]: membroIdsSede } } }),
        Diversos.destroy({ where: { MembroId: { [Op.in]: membroIdsSede } } }),
      ]);
    }

    // 3. Deletar a sede
    await Sede.destroy({ where: { id: sedeId } });

    res.status(200).json({ message: "Sede e todos os dados associados deletados com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar a sede." });
  }
});








router.delete("/filhal/:id", async (req, res) => {
  const filhalId = req.params.id;

  try {
    const cultosFilhal = await Cultos.findAll({ where: { FilhalId: filhalId } });
    const cultoIdsFilhal = cultosFilhal.map(c => c.id);

    await Promise.all([
      Usuarios.destroy({ where: { FilhalId: filhalId } }),
      Membros.destroy({ where: { FilhalId: filhalId } }),
      Cargo.destroy({ where: { FilhalId: filhalId } }),
      Contribuicao.destroy({ where: { FilhalId: filhalId } }),
      TipoContribuicao.destroy({ where: { FilhalId: filhalId } }),
      Despesa.destroy({ where: { FilhalId: filhalId } }),
      Cultos.destroy({ where: { FilhalId: filhalId } } ),
      Presencas.destroy({ where: { CultoId: { [Op.in]: cultoIdsFilhal } } }),
      TipoCulto.destroy({ where: { FilhalId: filhalId } }),
      Departamentos.destroy({ where: { FilhalId: filhalId } }),
    ]);

    const membrosFilhal = await Membros.findAll({ where: { FilhalId: filhalId } });
    const membroIds = membrosFilhal.map(m => m.id);

    if (membroIds.length > 0) {
      await Promise.all([
        CargoMembro.destroy({ where: { MembroId: { [Op.in]: membroIds } } }),
        DepartamentoMembros.destroy({ where: { MembroId: { [Op.in]: membroIds } } }),
        DadosAcademicos.destroy({ where: { MembroId: { [Op.in]: membroIds } } }),
        DadosCristaos.destroy({ where: { MembroId: { [Op.in]: membroIds } } }),
        Diversos.destroy({ where: { MembroId: { [Op.in]: membroIds } } }),
      ]);
    }

    await Filhal.destroy({ where: { id: filhalId } });

    res.status(200).json({ message: "Filhal e todos os dados associados deletados com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar a filhal." });
  }
});




































// ====================================================
// ROTA → LISTAR MEMBROS E DROPDOWNS DE FILTROS
// ====================================================
router.get("/membros-filtros", auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // ==========================
    // FILTRO HIERÁRQUICO BASE
    // ==========================
    let filtro = { ativo: 1 };
    if (FilhalId) filtro.FilhalId = FilhalId;
    else if (SedeId) filtro.SedeId = SedeId;

    // ==========================
    // BUSCA MEMBROS
    // ==========================
    const membros = await Membros.findAll({
      where: filtro,
      attributes: [
        "id",
        "nome",
        "foto",
        "genero",
        "data_nascimento",
        "estado_civil",
        "telefone",
        "email",
        "endereco_cidade",
        "profissao",
        "batizado",
        "ativo",
        "SedeId",
        "FilhalId",
      ],
      order: [["id", "DESC"]],
    });

    // ==========================
    // AJUSTE: CALCULA IDADE + FOTO
    // ==========================
    const membrosComFotoUrl = membros.map((membro) => {
      let idade = null;
      if (membro.data_nascimento) {
        const hoje = new Date();
        const nascimento = new Date(membro.data_nascimento);
        idade = hoje.getFullYear() - nascimento.getFullYear();
        const m = hoje.getMonth() - nascimento.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
      }

      return {
        ...membro.dataValues,
        idade,
        batizadoStatus: membro.batizado ? "Sim" : "Não",
        foto: membro.foto
          ? `${req.protocol}://${req.get("host")}${membro.foto}`
          : null,
      };
    });

    // ==========================
    // FUNÇÃO UTILITÁRIA
    // ==========================
    const contarPor = (campo) => {
      const contagem = {};
      membros.forEach((m) => {
        let valor = m[campo];
        if (campo === "batizado") valor = m.batizado ? "Sim" : "Não";
        if (valor) contagem[valor] = (contagem[valor] || 0) + 1;
      });
      return Object.entries(contagem).map(
        ([valor, qtd]) => `${valor} (${qtd} membros)`
      );
    };

    // ==========================
    // FILTROS BÁSICOS
    // ==========================
    const generos = contarPor("genero");
    const estadosCivis = contarPor("estado_civil");
    const profissoes = contarPor("profissao");

    // Faixas etárias
    const idades = ["0-18", "19-30", "31-50", "51+"].map((faixa) => {
      let qtd = 0;
      membrosComFotoUrl.forEach((m) => {
        if (m.idade !== null) {
          const idade = m.idade;
          const corresponde =
            (faixa === "0-18" && idade <= 18) ||
            (faixa === "19-30" && idade >= 19 && idade <= 30) ||
            (faixa === "31-50" && idade >= 31 && idade <= 50) ||
            (faixa === "51+" && idade >= 51);
          if (corresponde) qtd++;
        }
      });
      return `${faixa} (${qtd} membros)`;
    });

    // Batizados
    const batizados = ["Sim", "Não"].map((status) => {
      const qtd = membrosComFotoUrl.filter(
        (m) => m.batizadoStatus === status
      ).length;
      return `${status} (${qtd} membros)`;
    });

    // ==========================
    // BLOCO → CARGOS
    // ==========================
    const whereCargo = {};
    if (FilhalId) whereCargo.FilhalId = FilhalId;
    else if (SedeId) whereCargo.SedeId = SedeId;

    const cargos = await Cargo.findAll({
      where: whereCargo,
      include: [{ model: CargoMembro, attributes: ["id", "MembroId"] }],
      attributes: ["id", "nome"],
    });

    const cargosFormatados = cargos.map((cargo) => {
      const qtd = cargo.CargoMembros ? cargo.CargoMembros.length : 0;
      return `${cargo.nome} (${qtd} membros)`;
    });

    // ==========================
    // BLOCO → DEPARTAMENTOS
    // ==========================
    const whereDepartamento = {};
    if (FilhalId) whereDepartamento.FilhalId = FilhalId;
    else if (SedeId) whereDepartamento.SedeId = SedeId;

    const departamentos = await Departamentos.findAll({
      where: whereDepartamento,
      include: [
        { model: DepartamentoMembros, attributes: ["id", "MembroId"] },
      ],
      attributes: ["id", "nome"],
    });

    const departamentosFormatados = departamentos.map((dep) => {
      const qtd = dep.DepartamentoMembros ? dep.DepartamentoMembros.length : 0;
      return `${dep.nome} (${qtd} membros)`;
    });

    // ==========================
    // BLOCO → CATEGORIAS MINISTERIAIS (CORRIGIDO)
    // ==========================
    const categoriasMinisteriais = await DadosCristaos.findAll({
      where: {
        categoria_ministerial: { [Op.ne]: null },
      },
      include: [
        {
          model: Membros,
          attributes: ["id", "FilhalId", "SedeId"],
          where: FilhalId
            ? { FilhalId }
            : { SedeId },
        },
      ],
      attributes: ["categoria_ministerial", "MembroId"],
    });

    const contagemCategorias = {};
    categoriasMinisteriais.forEach((dado) => {
      const cat = dado.categoria_ministerial;
      if (cat) contagemCategorias[cat] = (contagemCategorias[cat] || 0) + 1;
    });

    const categoriasFormatadas = Object.entries(contagemCategorias).map(
      ([valor, qtd]) => `${valor} (${qtd} membros)`
    );

    // ==========================
    // BLOCO → HABILITAÇÕES (CORRIGIDO)
    // ==========================
    const habilitacoes = await DadosAcademicos.findAll({
      where: {
        habilitacoes: { [Op.ne]: null },
      },
      include: [
        {
          model: Membros,
          attributes: ["id", "FilhalId", "SedeId"],
          where: FilhalId
            ? { FilhalId }
            : { SedeId },
        },
      ],
      attributes: ["habilitacoes", "MembroId"],
    });

    const contagemHabilitacoes = {};
    habilitacoes.forEach((dado) => {
      const hab = dado.habilitacoes;
      if (hab) contagemHabilitacoes[hab] = (contagemHabilitacoes[hab] || 0) + 1;
    });

    const habilitacoesFormatadas = Object.entries(contagemHabilitacoes).map(
      ([valor, qtd]) => `${valor} (${qtd} membros)`
    );

    // ==========================
    // RETORNO FINAL
    // ==========================
    return res.status(200).json({
      membros: membrosComFotoUrl,
      filtros: {
        generos,
        estadosCivis,
        profissoes,
        idades,
        batizados,
        cargos: cargosFormatados,
        departamentos: departamentosFormatados,
        categoriasMinisteriais: categoriasFormatadas,
        habilitacoes: habilitacoesFormatadas,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar membros e filtros:", error);
    return res.status(500).json({
      message: "Erro interno do servidor.",
      error: error.message,
    });
  }
});
































// ==========================================================
// ROTA → GERAR RELATÓRIO DE MEMBROS (com múltiplos filtros)
// ==========================================================
router.post("/membros-relatorio", auth, async (req, res) => {
  try {
    const {
      generos = [],
      estadosCivis = [],
      profissoes = [],
      idades = [],
      batizados = [],
      cargos = [],
      departamentos = [],
      categoriasMinisteriais = [], // ✅ filtro de categorias ministeriais
      habilitacoes = [], // ✅ novo filtro de habilitações
    } = req.body;

    const { SedeId, FilhalId } = req.usuario;

    // =============================
    // FILTRO BASE (HIERARQUIA)
    // =============================
    let where = { ativo: 1 };
    if (FilhalId) where.FilhalId = FilhalId;
    else if (SedeId) where.SedeId = SedeId;

    // =============================
    // FILTROS BÁSICOS
    // =============================
    if (generos.length > 0) where.genero = generos;
    if (estadosCivis.length > 0) where.estado_civil = estadosCivis;
    if (profissoes.length > 0) where.profissao = profissoes;

    // =============================
    // BUSCA MEMBROS + RELAÇÕES
    // =============================
    let membros = await Membros.findAll({
      where,
      include: [
        {
          model: CargoMembro,
          include: [{ model: Cargo, attributes: ["id", "nome"] }],
          attributes: ["id", "CargoId"],
        },
        {
          model: DepartamentoMembros,
          include: [{ model: Departamentos, attributes: ["id", "nome"] }],
          attributes: ["id", "DepartamentoId"],
        },
        {
          model: DadosCristaos,
          attributes: ["id", "categoria_ministerial"], // 🔹 categorias ministeriais
          required: false,
        },
        {
          model: DadosAcademicos,
          attributes: ["id", "habilitacoes"], // 🔹 habilitações
          required: false,
        },
      ],
      attributes: [
        "id",
        "nome",
        "foto",
        "genero",
        "data_nascimento",
        "estado_civil",
        "telefone",
        "email",
        "endereco_cidade",
        "profissao",
        "batizado",
        "ativo",
        "SedeId",
        "FilhalId",
      ],
      order: [["id", "DESC"]],
    });

    // =============================
    // FILTROS COMPLEMENTARES
    // =============================

    // 🔸 Filtro por cargos
    if (cargos.length > 0) {
      membros = membros.filter((m) => {
        if (!m.CargoMembros || m.CargoMembros.length === 0) return false;
        const nomesCargos = m.CargoMembros.map((cm) => cm.Cargo?.nome).filter(Boolean);
        return nomesCargos.some((nome) => cargos.includes(nome));
      });
    }

    // 🔸 Filtro por departamentos
    if (departamentos.length > 0) {
      membros = membros.filter((m) => {
        if (!m.DepartamentoMembros || m.DepartamentoMembros.length === 0) return false;
        const nomesDepartamentos = m.DepartamentoMembros.map((dm) => dm.Departamento?.nome).filter(Boolean);
        return nomesDepartamentos.some((nome) => departamentos.includes(nome));
      });
    }

    // 🔸 Filtro por categorias ministeriais
    if (categoriasMinisteriais.length > 0) {
      membros = membros.filter((m) => {
        const categorias = Array.isArray(m.DadosCristaos)
          ? m.DadosCristaos.map((d) => d.categoria_ministerial).filter(Boolean)
          : [m.DadosCristaos?.categoria_ministerial].filter(Boolean);

        return categorias.some((cat) => categoriasMinisteriais.includes(cat));
      });
    }

    // 🔸 Filtro por habilitações
    if (habilitacoes.length > 0) {
      membros = membros.filter((m) => {
        const habs = Array.isArray(m.DadosAcademicos)
          ? m.DadosAcademicos.map((d) => d.habilitacoes).filter(Boolean)
          : [m.DadosAcademicos?.habilitacoes].filter(Boolean);

        return habs.some((h) => habilitacoes.includes(h));
      });
    }

    // 🔸 Filtros por idade e batizado
    membros = membros.filter((m) => {
      let atende = true;

      // Faixa etária
      if (idades.length > 0 && m.data_nascimento) {
        const hoje = new Date();
        const nascimento = new Date(m.data_nascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;

        const faixa =
          idade <= 18
            ? "0-18"
            : idade <= 30
            ? "19-30"
            : idade <= 50
            ? "31-50"
            : "51+";

        if (!idades.includes(faixa)) atende = false;
      }

      // Batizado
      if (batizados.length > 0) {
        const status = m.batizado ? "Sim" : "Não";
        if (!batizados.includes(status)) atende = false;
      }

      return atende;
    });

    // =============================
    // MONTA RESPOSTA FINAL
    // =============================
    const membrosComFotoUrl = membros.map((membro) => {
      // Calcula idade
      let idade = null;
      if (membro.data_nascimento) {
        const hoje = new Date();
        const nascimento = new Date(membro.data_nascimento);
        idade = hoje.getFullYear() - nascimento.getFullYear();
        const m = hoje.getMonth() - nascimento.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
      }

      const cargosMembro =
        membro.CargoMembros?.map((cm) => cm.Cargo?.nome).filter(Boolean) || [];

      const departamentosMembro =
        membro.DepartamentoMembros?.map((dm) => dm.Departamento?.nome).filter(Boolean) || [];

      const categoriaMinisterial = Array.isArray(membro.DadosCristaos)
        ? membro.DadosCristaos.map((d) => d.categoria_ministerial).filter(Boolean).join(", ")
        : membro.DadosCristaos?.categoria_ministerial || "—";

      const habilitacoesMembro = Array.isArray(membro.DadosAcademicos)
        ? membro.DadosAcademicos.map((d) => d.habilitacoes).filter(Boolean).join(", ")
        : membro.DadosAcademicos?.habilitacoes || "—";

      return {
        ...membro.dataValues,
        idade,
        batizadoStatus: membro.batizado ? "Sim" : "Não",
        cargos: cargosMembro.length > 0 ? cargosMembro.join(", ") : "—",
        departamentos: departamentosMembro.length > 0 ? departamentosMembro.join(", ") : "—",
        categoriaMinisterial,
        habilitacoes: habilitacoesMembro,
        foto: membro.foto
          ? `${req.protocol}://${req.get("host")}${membro.foto}`
          : null,
      };
    });

    return res.status(200).json(membrosComFotoUrl);
  } catch (error) {
    console.error("Erro ao gerar relatório de membros:", error);
    return res.status(500).json({
      message: "Erro interno do servidor.",
      error: error.message,
    });
  }
});








router.get('/membros/:membroId/historico', auth, async (req, res) => {
  const { membroId } = req.params;

  if (!membroId) {
    return res.status(400).json({ message: 'membroId é obrigatório' });
  }

  try {
    const { SedeId, FilhalId } = req.usuario;

    // Filtro hierárquico do usuário
    let filtroHierarquia = {};
    if (FilhalId) filtroHierarquia.FilhalId = FilhalId;
    else if (SedeId) filtroHierarquia.SedeId = SedeId;

    // Buscar todas as contribuições do membro
    const contribuicoes = await Contribuicao.findAll({
      where: { MembroId: membroId, ...filtroHierarquia },
      include: [{ model: TipoContribuicao, attributes: ['nome'] }],
      order: [['data', 'ASC']],
    });

    // ==========================
    // CALCULA STATUS DO MEMBRO
    // ==========================
    let status = 'Novo';
    if (contribuicoes.length > 0) {
      const ultimaContribuicao = new Date(contribuicoes[contribuicoes.length - 1].data);
      const hoje = new Date();
      const diffMeses = (hoje.getFullYear() - ultimaContribuicao.getFullYear()) * 12
                       + (hoje.getMonth() - ultimaContribuicao.getMonth());
      if (diffMeses <= 3) status = 'Regular';
      else status = 'Irregular';
    }

    // ==========================
    // AGRUPAR CONTRIBUIÇÕES POR ANO / MÊS / TIPO
    // ==========================
    const historicoPorMes = {}; // { '2025-10': { total: 9000, tipos: { 'Dízimos': 9000 } } }
    let totalGeral = 0;

    contribuicoes.forEach(c => {
      const data = new Date(c.data);
      const anoMes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      const tipo = c.TipoContribuicao.nome;
      const valor = parseFloat(c.valor);

      totalGeral += valor;

      if (!historicoPorMes[anoMes]) historicoPorMes[anoMes] = { total: 0, tipos: {} };
      historicoPorMes[anoMes].total += valor;

      if (!historicoPorMes[anoMes].tipos[tipo]) historicoPorMes[anoMes].tipos[tipo] = 0;
      historicoPorMes[anoMes].tipos[tipo] += valor;
    });

    // ==========================
    // CONSTRUIR RESUMO POR ANO/MÊS
    // ==========================
    const resumoPorMes = Object.entries(historicoPorMes)
      .sort(([mesA], [mesB]) => new Date(mesA + '-01') - new Date(mesB + '-01'))
      .map(([anoMes, dados]) => ({
        mes: anoMes,
        totalMensal: dados.total,
        tipos: Object.entries(dados.tipos).map(([tipo, valor]) => ({
          tipo,
          total: valor,
          percentual: ((valor / dados.total) * 100).toFixed(2) + '%'
        }))
      }));

    // ==========================
    // RESUMO GERAL POR TIPO
    // ==========================
    const totalPorTipo = {};
    contribuicoes.forEach(c => {
      const tipo = c.TipoContribuicao.nome;
      if (!totalPorTipo[tipo]) totalPorTipo[tipo] = 0;
      totalPorTipo[tipo] += parseFloat(c.valor);
    });

    const resumoPorTipoGeral = Object.entries(totalPorTipo).map(([tipo, valor]) => ({
      tipo,
      total: valor,
      percentual: totalGeral > 0 ? ((valor / totalGeral) * 100).toFixed(2) + '%' : '0%'
    }));

    // ==========================
    // RETORNO
    // ==========================
    return res.status(200).json({
      status,
      totalGeral,
      quantidadeContribuicoes: contribuicoes.length,
      resumoPorTipoGeral,
      historicoPorMes: resumoPorMes // mesmo que vazio, será []
    });

  } catch (error) {
    console.error('Erro ao buscar histórico do membro:', error);
    return res.status(500).json({ message: 'Erro ao buscar histórico do membro' });
  }
});


















const fs = require('fs');



// Rota para deletar um membro e todos os seus dados relacionados
router.delete('/membros/:id', auth, async (req, res) => {
  try {
    const membroId = req.params.id;

    const membro = await Membros.findByPk(membroId);
    if (!membro) return res.status(404).json({ message: 'Membro não encontrado.' });

    // Remove foto do servidor se existir
    if (membro.foto) {
      const fotoPath = path.join(__dirname, '..', membro.foto);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }

    // Remove cargos relacionados
    await CargoMembro.destroy({ where: { MembroId: membroId } });

    // Remove departamentos relacionados
    await DepartamentoMembros.destroy({ where: { MembroId: membroId } });

    // Remove dados acadêmicos
    await DadosAcademicos.destroy({ where: { MembroId: membroId } });

    // Remove dados cristãos
    await DadosCristaos.destroy({ where: { MembroId: membroId } });

    // Remove diversos
    await Diversos.destroy({ where: { MembroId: membroId } });

    // Finalmente remove o membro
    await membro.destroy();

    return res.status(200).json({ message: 'Membro e todos os seus dados foram removidos com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar membro:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});




























router.get("/eventos", auth, async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diasAntes = 7;

    const notificacoesGeradas = [];
    const notificacoesRemovidas = [];

    const { SedeId, FilhalId } = req.usuario; // ✅ Pegando da autenticação
    console.log("🏢 Usuário logado:", { SedeId, FilhalId });

    // ---------------------------
    // 🔹 Processar Atendimentos
    // ---------------------------
    const atendimentos = await Atendimento.findAll({
      where: { status: "Agendado" },
      include: { model: Membros, attributes: ["id", "nome", "foto"] },
    });

    for (const atendimento of atendimentos) {
      const dataAtendimento = new Date(atendimento.data_hora);
      dataAtendimento.setHours(0, 0, 0, 0);

      const diffDias = Math.round((dataAtendimento - hoje) / (1000 * 60 * 60 * 24));

      let msg = null;
      const nomePastor = `Pastor ${atendimento.Membro?.nome || "membro"}`;

      if (diffDias === 0) {
        msg = `🚨 ALERTA: Hoje o ${nomePastor} tem atendimento marcado!`;
      } else if (diffDias > 0 && diffDias <= diasAntes) {
        msg = `⚠️ Lembrete: Atendimento do ${nomePastor} em ${diffDias} dia(s).`;
      }

      let notif = await Notificacao.findOne({
        where: { AtendimentoId: atendimento.id, tipo: "atendimento" },
      });

      if (diffDias < 0) {
        if (notif) {
          await notif.destroy();
          notificacoesRemovidas.push(`Atendimento: ${atendimento.id}`);
        }
        continue;
      }

      if (!msg) continue;

      const observacao = atendimento.observacoes || "";

      if (notif) {
        notif.set({ mensagem: msg, data_enviada: new Date(), Descricao: observacao });
        await notif.save({ fields: ["mensagem", "data_enviada", "Descricao"] });
      } else {
        notif = await Notificacao.create({
          tipo: "atendimento",
          MembroId: atendimento.MembroId,
          AtendimentoId: atendimento.id,
          mensagem: msg,
          data_enviada: new Date(),
          Descricao: observacao,
        });

        // ✅ Cria vínculo na NotificacaoLocal
        await NotificacaoLocal.create({
          NotificacaoId: notif.id,
          SedeId: SedeId || null,
          FilhalId: FilhalId || null,
        });
      }

      const notifCompleta = await Notificacao.findByPk(notif.id, {
        include: { model: Membros, attributes: ["id", "nome", "foto"] },
      });

      notificacoesGeradas.push(notifCompleta);
    }

    // ---------------------------
    // 🔹 Processar Agendamentos Pastorais
    // ---------------------------
    const agendamentos = await AgendaPastoral.findAll({ where: { status: "Pendente" } });

    for (const agendamento of agendamentos) {
      const dataAgendamento = new Date(agendamento.data_hora);
      dataAgendamento.setHours(0, 0, 0, 0);

      const diffDias = Math.round((dataAgendamento - hoje) / (1000 * 60 * 60 * 24));

      let msg = null;
      const nomePastor = `Pastor ${agendamento.responsavel || "responsável"}`;

      if (diffDias === 0) {
        msg = `🚨 ALERTA: Hoje o ${nomePastor} tem agendamento pastoral!`;
      } else if (diffDias > 0 && diffDias <= diasAntes) {
        msg = `⚠️ Lembrete: Agendamento pastoral do ${nomePastor} em ${diffDias} dia(s).`;
      }

      let notif = await Notificacao.findOne({
        where: { AgendaPastoralId: agendamento.id, tipo: "agendamento_pastoral" },
      });

      if (diffDias < 0) {
        if (notif) {
          await notif.destroy();
          notificacoesRemovidas.push(`Agendamento: ${agendamento.id}`);
        }
        continue;
      }

      if (!msg) continue;

      const observacao = `Tipo: ${agendamento.tipo_cumprimento || ""} | Nome: ${agendamento.nome_pessoa || ""} | Responsável: ${agendamento.responsavel || ""} | Observação: ${agendamento.observacao || ""}`;

      if (notif) {
        notif.set({ mensagem: msg, data_enviada: new Date(), Descricao: observacao });
        await notif.save({ fields: ["mensagem", "data_enviada", "Descricao"] });
      } else {
        notif = await Notificacao.create({
          tipo: "agendamento_pastoral",
          MembroId: agendamento.MembroId,
          AgendaPastoralId: agendamento.id,
          mensagem: msg,
          data_enviada: new Date(),
          Descricao: observacao,
        });

        // ✅ Cria vínculo na NotificacaoLocal
        await NotificacaoLocal.create({
          NotificacaoId: notif.id,
          SedeId: SedeId || null,
          FilhalId: FilhalId || null,
        });
      }

      const notifCompleta = await Notificacao.findByPk(notif.id, {
        include: [
          { model: Membros, attributes: ["id", "nome", "foto"] },
          { model: AgendaPastoral },
        ],
      });

      notificacoesGeradas.push(notifCompleta);
    }

    // ---------------------------
    // 🔹 Processar Cultos
    // ---------------------------
    const cultos = await Cultos.findAll({
      where: { status: "programado", ativo: 1 },
    });

    const cultosComTipo = await Promise.all(
      cultos.map(async (culto) => {
        const tipoCulto = await TipoCulto.findByPk(culto.TipoCultoId);
        return { ...culto.toJSON(), TipoCulto: tipoCulto };
      })
    );

    for (const culto of cultosComTipo) {
      const dataCulto = new Date(culto.dataHora);
      dataCulto.setHours(0, 0, 0, 0);

      const diffDias = Math.round((dataCulto - hoje) / (1000 * 60 * 60 * 24));

      let msg = null;

      if (!culto.responsavel || !culto.observacoes || !culto.local) {
        console.log(`Culto ${culto.id} não possui informações suficientes. A notificação não será criada.`);
        continue;
      }

      if (diffDias === 0) {
        msg = `🚨 ALERTA: Hoje o culto será realizado!`;
      } else if (diffDias > 0 && diffDias <= diasAntes) {
        msg = `⚠️ Lembrete: Culto programado para ${diffDias} dia(s).`;
      }

      let notif = await Notificacao.findOne({
        where: { CultoId: culto.id, tipo: "culto" },
      });

      if (diffDias < 0) {
        if (notif) {
          await notif.destroy();
          notificacoesRemovidas.push(`Culto: ${culto.id}`);
        }
        continue;
      }

      if (!msg) continue;

      const tipoCultoDescricao = culto.TipoCulto ? culto.TipoCulto.nome : "Tipo de culto não informado";
      const observacao = `Responsável: ${culto.responsavel} | Local: ${culto.local} | Observações: ${culto.observacoes} | Tipo de culto: ${tipoCultoDescricao}`;

      if (notif) {
        notif.set({ mensagem: msg, data_enviada: new Date(), Descricao: observacao });
        await notif.save({ fields: ["mensagem", "data_enviada", "Descricao"] });
      } else {
        notif = await Notificacao.create({
          tipo: "culto",
          CultoId: culto.id,
          mensagem: msg,
          data_enviada: new Date(),
          Descricao: observacao,
        });

        // ✅ Cria vínculo na NotificacaoLocal
        await NotificacaoLocal.create({
          NotificacaoId: notif.id,
          SedeId: SedeId || null,
          FilhalId: FilhalId || null,
        });
      }

      const notifCompleta = await Notificacao.findByPk(notif.id, {
        include: [
          { model: Cultos, attributes: ["id", "dataHora", "local", "responsavel", "observacoes"] },
        ],
      });

      notificacoesGeradas.push(notifCompleta);
    }

    // ✅ Retorna notificações relevantes
    console.log(notificacoesGeradas);
    res.json(notificacoesGeradas);
  } catch (error) {
    console.error("❌ Erro ao processar notificações de eventos:", error);
    res.status(500).json({ message: "Erro interno ao processar notificações." });
  }
});




















// 🔹 Rota para listar notificações do usuário logado (filtradas por Sede e/ou Filhal)
router.get("/notificacoes", auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario; // ✅ Pegando do token (usuário logado)
    console.log("🏢 Usuário logado:", { SedeId, FilhalId });

    if (!SedeId && !FilhalId) {
      return res.status(400).json({ message: "Usuário não está vinculado a uma sede ou filial." });
    }

    // 🔍 Filtro correto para NotificacaoLocal (SUPORTA SEDE E FILIAL AO MESMO TEMPO)
    const notificacoesLocais = await NotificacaoLocal.findAll({
      where: {
        [Op.or]: [
          FilhalId ? { FilhalId } : null,
          SedeId ? { SedeId } : null
        ].filter(Boolean)
      },
      attributes: ["NotificacaoId"],
    });

    const idsNotificacoes = notificacoesLocais.map((n) => n.NotificacaoId);

    if (idsNotificacoes.length === 0) {
      console.log("⚠️ Nenhuma notificação encontrada para esta unidade.");
      return res.json([]);
    }

    // 🔹 Busca as notificações correspondentes, EXCETO aniversários
    const notificacoes = await Notificacao.findAll({
      where: { 
        id: idsNotificacoes,
        tipo: { [Op.ne]: "aniversario" }   // ⛔ Exclui notificações de aniversário
      },
      order: [["data_enviada", "DESC"]],
      include: [
        { model: Membros, attributes: ["id", "nome", "foto"] },
        { model: Atendimento, attributes: ["id", "data_hora"] },
        { model: AgendaPastoral, attributes: ["id", "data_hora", "responsavel"] },
        { model: Cultos, attributes: ["id", "dataHora", "local", "responsavel", "observacoes"] },
      ],
    });

    console.log(`✅ ${notificacoes.length} notificações encontradas (SEM aniversários).`);
    res.json(notificacoes);

  } catch (error) {
    console.error("❌ Erro ao buscar notificações:", error);
    res.status(500).json({ message: "Erro interno ao buscar notificações." });
  }
});









// 🔹 Gera notificações de aniversários (com sede e filhal do usuário logado)
router.get("/aniversarios", auth, async (req, res) => {
  try {
    const hoje = new Date();
    const diasAntes = 7;
    const diasDepois = 3;

    const { SedeId, FilhalId } = req.usuario; // ✅ pegamos do token JWT (usuário logado)
    console.log("🏢 Usuário logado:", { SedeId, FilhalId });

    const membros = await Membros.findAll({
      where: { ativo: true },
      attributes: ["id", "nome", "foto", "data_nascimento"],
    });

    const notificacoesGeradas = [];
    const notificacoesRemovidas = [];

    for (const membro of membros) {
      if (!membro.data_nascimento) continue;

      const dataNasc = new Date(membro.data_nascimento);
      const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const anivEsteAno = new Date(hoje.getFullYear(), dataNasc.getMonth(), dataNasc.getDate());
      const diffDias = Math.floor((anivEsteAno - hojeSemHora) / (1000 * 60 * 60 * 24));

      const inicioAno = new Date(hoje.getFullYear(), 0, 1);
      const notificacaoExistente = await Notificacao.findOne({
        where: {
          MembroId: membro.id,
          tipo: "aniversario",
          data_enviada: { [Op.gte]: inicioAno },
        },
      });

      // 🔸 Remove notificações antigas (mais de 3 dias após)
      if (diffDias < -diasDepois) {
        if (notificacaoExistente) {
          await notificacaoExistente.destroy();
          notificacoesRemovidas.push(membro.nome);
        }
        continue;
      }

      // 🔸 Define a mensagem conforme o tempo
      let msg = null;
      if (diffDias === 0) {
        msg = `🎉 Hoje é o aniversário de ${membro.nome}! 🥳`;
      } else if (diffDias > 0 && diffDias <= diasAntes) {
        msg = `🎂 Faltam ${diffDias} dia(s) para o aniversário de ${membro.nome}!`;
      } else if (diffDias < 0 && Math.abs(diffDias) <= diasDepois) {
        msg = `🍰 O aniversário de ${membro.nome} foi há ${Math.abs(diffDias)} dia(s)!`;
      }

      if (!msg) continue;

      let novaNotif = null;

      if (notificacaoExistente) {
        notificacaoExistente.mensagem = msg;
        notificacaoExistente.data_enviada = new Date();
        await notificacaoExistente.save();
        novaNotif = notificacaoExistente;
      } else {
        novaNotif = await Notificacao.create({
          MembroId: membro.id,
          tipo: "aniversario",
          mensagem: msg,
          data_enviada: new Date(),
        });

        // ✅ Cria o vínculo em NotificacaoLocal com base no usuário logado
        await NotificacaoLocal.create({
          NotificacaoId: novaNotif.id,
          SedeId: SedeId || null,
          FilhalId: FilhalId || null,
        });
      }

      notificacoesGeradas.push(novaNotif);
    }

    // --------------------------------------------------------------------
    // 🔥 **AQUI ENTRA O FILTRO ESSENCIAL**
    // Pega SOMENTE notificações vinculadas à sede/filhal do usuário logado
    // --------------------------------------------------------------------
    const filtroLocal = {
      [Op.or]: [],
    };

    if (SedeId) {
      filtroLocal[Op.or].push({ SedeId });
    }

    if (FilhalId) {
      filtroLocal[Op.or].push({ FilhalId });
    }

    // Se o usuário não tiver sede nem filhal → NÃO retorna nada
    if (filtroLocal[Op.or].length === 0) {
      return res.json({
        message: "Usuário sem sede/filhal, nenhuma notificação disponível.",
        criadasOuAtualizadas: notificacoesGeradas.length,
        removidas: notificacoesRemovidas,
        todasNotificacoes: [],
      });
    }

    const todasNotificacoes = await Notificacao.findAll({
      where: {
        tipo: "aniversario",
        createdAt: { [Op.gte]: new Date(hoje.getFullYear(), 0, 1) },
      },
      include: [
        {
          model: NotificacaoLocal,
          where: filtroLocal, // 🔥 FILTRO FINAL APLICADO AQUI
          attributes: ["SedeId", "FilhalId"],
        },
        {
          model: Membros,
          attributes: ["id", "nome", "foto", "data_nascimento"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const notificacoesComFoto = todasNotificacoes.map((notif) => ({
      ...notif.dataValues,
      Membro: notif.Membro
        ? {
            ...notif.Membro.dataValues,
            foto: notif.Membro.foto
              ? `${req.protocol}://${req.get("host")}${notif.Membro.foto}`
              : null,
          }
        : null,
    }));

    console.log("✅ Notificações criadas/atualizadas:", notificacoesGeradas.length);
    console.log("🗑️ Notificações removidas:", notificacoesRemovidas.length);

    res.json({
      message: "Notificações de aniversário verificadas, atualizadas e limpas.",
      criadasOuAtualizadas: notificacoesGeradas.length,
      removidas: notificacoesRemovidas,
      todasNotificacoes: notificacoesComFoto,
    });

  } catch (error) {
    console.error("❌ Erro ao verificar aniversários:", error);
    res.status(500).json({ message: "Erro interno ao verificar aniversários." });
  }
});



// 🔹 Rota para contar notificações filtradas por Sede ou Filhal do usuário logado
router.get("/contador", auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario; // ✅ Pega os dados do usuário autenticado
    console.log("🏢 Usuário logado:", { SedeId, FilhalId });

    if (!SedeId && !FilhalId) {
      return res.status(400).json({ message: "Usuário não está vinculado a uma sede ou filial." });
    }

    // 🔍 Monta o filtro correto: se tiver Filhal, usa FilhalId; senão, usa SedeId
    const filtroLocal = {};
    if (FilhalId) filtroLocal.FilhalId = FilhalId;
    else if (SedeId) filtroLocal.SedeId = SedeId;

    // 🔹 Busca apenas os IDs de notificações vinculados à sede ou filial
    const notificacoesLocais = await NotificacaoLocal.findAll({
      where: filtroLocal,
      attributes: ["NotificacaoId"],
    });

    const idsNotificacoes = notificacoesLocais.map((n) => n.NotificacaoId);

    // 🔸 Caso não haja notificações locais vinculadas
    if (idsNotificacoes.length === 0) {
      return res.json({ total: 0 });
    }

    // 🔹 Conta apenas as notificações que pertencem à sede/filial do usuário
    const total = await Notificacao.count({
      where: { id: idsNotificacoes },
    });

    console.log(`📊 Total de notificações (filtradas): ${total}`);
    res.json({ total });
  } catch (error) {
    console.error("❌ Erro ao contar notificações:", error);
    res.status(500).json({ message: "Erro interno ao contar notificações." });
  }
});



// GET /gestao-membrosuser
router.get('/gestao-membrosuser', auth, async (req, res) => {
  try {
    const { SedeId, FilhalId } = req.usuario;

    // Montar filtro hierárquico
    let filtro = {};
    if (FilhalId) {
      filtro.FilhalId = FilhalId; // prioridade: Filhal
    } else if (SedeId) {
      filtro.SedeId = SedeId;     // se não tiver Filhal, filtra pela Sede
    }

    const membros = await MembroUser.findAll({
      where: filtro,
      order: [['createdAt', 'DESC']],
    });

    res.json({ usuarios: membros });
  } catch (err) {
    console.error('❌ Erro ao buscar membros:', err);
    res.status(500).json({ message: "Erro ao buscar membros." });
  }
});




// PUT /membros/:id/aprovar
router.put('/membroUser/:id/aprovar', async (req, res) => {
  try {
    const { id } = req.params;

    const membro = await MembroUser.findByPk(id);
    if (!membro) return res.status(404).json({ message: "Membro não encontrado." });

    membro.status = 'aprovado';
    await membro.save();

    res.json({ message: `Membro ${membro.nome} aprovado com sucesso!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao aprovar membro." });
  }
});


// DELETE /membros/:id
router.delete('/membroUser/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const membro = await MembroUser.findByPk(id);
    if (!membro) return res.status(404).json({ message: "Membro não encontrado." });

    await membro.destroy();

    res.json({ message: `Membro ${membro.nome} deletado com sucesso!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao deletar membro." });
  }
});








// GET /meu-membro
router.get('/meu-membro', auth, (req, res) => {
  try {
    if (!req.usuario) {
      return res.status(404).json({ message: "Usuário não encontrado no token." });
    }

    // Retorna apenas o nome (ou qualquer outro campo de req.usuario)
    res.json({ nome: req.usuario.nome });
  } catch (err) {
    console.error('❌ Erro ao buscar dados do MembroUser logado:', err);
    res.status(500).json({ message: "Erro ao buscar dados do usuário." });
  }
});




// GET /meu-membro-detalhado
router.get('/meu-membro-detalhado', auth, async (req, res) => {
  try {
    if (!req.usuario) {
      return res.status(404).json({ message: "Usuário não encontrado no token." });
    }

    const { id, funcao } = req.usuario;

    if (funcao === 'membro') {
      // Buscar na tabela MembroUsers
      const membroUser = await MembroUser.findByPk(id);

      if (!membroUser || !membroUser.MembroId) {
        return res.json({ existe: false, nome: membroUser?.nome || '' });
      }

      // Buscar dados do Membro
      const membro = await Membros.findByPk(membroUser.MembroId);

      if (!membro) return res.status(404).json({ message: "Membro não encontrado." });

      // --- Dados relacionados ---
      const [dadosAcademicos, dadosCristaos, diversos] = await Promise.all([
        DadosAcademicos.findAll({ where: { MembroId: membro.id } }),
        DadosCristaos.findAll({ where: { MembroId: membro.id } }),
        Diversos.findAll({ where: { MembroId: membro.id } }),
      ]);

      // --- Departamentos ---
      const deptosIds = await DepartamentoMembros.findAll({
        where: { MembroId: membro.id },
        attributes: ['DepartamentoId']
      });
      const departamentoIds = deptosIds.map(d => d.DepartamentoId);
      const departamentos = await Departamentos.findAll({
        where: { id: departamentoIds },
        attributes: ['id', 'nome']
      });

      // --- Cargos ---
      const cargosIds = await CargoMembro.findAll({
        where: { MembroId: membro.id },
        attributes: ['CargoId']
      });
      const cargoIds = cargosIds.map(c => c.CargoId);
      const cargos = await Cargo.findAll({
        where: { id: cargoIds },
        attributes: ['id', 'nome']
      });

      // --- Foto do membro ---
      const fotoUrl = membro.foto ? `${req.protocol}://${req.get('host')}/${membro.foto}` : null;

      // Retornar todos os dados
      return res.json({
        existe: true,
        membro: {
          ...membro.dataValues,
          foto: fotoUrl,
          dadosAcademicos,
          dadosCristaos,
          diversos,
          departamentos,
          cargos
        }
      });

    } else {
      // Usuário comum
      const usuario = await Usuarios.findByPk(id);
      if (!usuario) return res.status(404).json({ message: "Usuário não encontrado." });
      return res.json({ existe: true, usuario });
    }

  } catch (err) {
    console.error('Erro ao buscar dados do membro logado:', err);
    res.status(500).json({ message: "Erro interno." });
  }
});





// Rota para cadastrar membros com foto, departamentos e tabelas relacionadas
router.post('/membros2', auth, upload.single('foto'), async (req, res) => {
  try {
    const {
      nome, genero, data_nascimento, estado_civil, bi, telefone, email,
      endereco_rua, endereco_bairro, endereco_cidade, endereco_provincia,
      grau_academico, profissao, batizado, data_batismo, ativo, CargosIds,
      DepartamentosIds,

      // Dados Acadêmicos
      habilitacoes, especialidades, estudo_teologico, local_formacao,

      // Dados Cristãos
      consagrado, data_consagracao, categoria_ministerial,

      // Diversos
      trabalha, conta_outrem, conta_propria
    } = req.body;

    // === Conversão segura de IDs para números e filtragem de NaN ===
    const cargosArray = Array.isArray(CargosIds)
      ? CargosIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      : CargosIds
      ? [parseInt(CargosIds, 10)].filter((id) => !isNaN(id))
      : [];

    const departamentosArray = Array.isArray(DepartamentosIds)
      ? DepartamentosIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      : DepartamentosIds
      ? [parseInt(DepartamentosIds, 10)].filter((id) => !isNaN(id))
      : [];

    // Validação obrigatória
    if (!nome || !genero || cargosArray.length === 0) {
      return res.status(400).json({
        message: 'Nome, gênero e pelo menos um cargo são obrigatórios.'
      });
    }

    const fotoCaminho = req.file ? `/uploads/fotos/${req.file.filename}` : null;

    // Cadastro do membro
    const dados = limparCamposVazios({
      nome,
      foto: fotoCaminho,
      genero,
      data_nascimento,
      estado_civil,
      bi,
      telefone,
      email,
      endereco_rua,
      endereco_bairro,
      endereco_cidade,
      endereco_provincia,
      grau_academico,
      profissao,
      batizado: batizado === true || batizado === 'true',
      data_batismo,
      ativo: ativo === false || ativo === 'false' ? false : true,
      SedeId: req.usuario.SedeId || null,
      FilhalId: req.usuario.FilhalId || null
    });

    const novoMembro = await Membros.create(dados);

    // Atualiza automaticamente o MembroId do usuário logado
    if (req.usuario && req.usuario.funcao === 'membro') {
      await MembroUser.update(
        { MembroId: novoMembro.id },
        { where: { id: req.usuario.id } }
      );
    }

    // Cadastro dos cargos
    if (cargosArray.length > 0) {
      const registrosCargo = cargosArray.map((cargoId) => ({
        MembroId: novoMembro.id,
        CargoId: cargoId,
      }));
      await CargoMembro.bulkCreate(registrosCargo);
    }

    // Cadastro dos departamentos
    if (departamentosArray.length > 0) {
      const registrosDepartamentos = departamentosArray.map((depId) => ({
        MembroId: novoMembro.id,
        DepartamentoId: depId,
        ativo: true,
        data_entrada: new Date(),
      }));
      await DepartamentoMembros.bulkCreate(registrosDepartamentos);
    }

    // Dados Acadêmicos
    await DadosAcademicos.create({
      habilitacoes: habilitacoes || null,
      especialidades: especialidades || null,
      estudo_teologico: estudo_teologico || null,
      local_formacao: local_formacao || null,
      MembroId: novoMembro.id
    });

    // Dados Cristãos
    await DadosCristaos.create({
      consagrado: consagrado === true || consagrado === 'true',
      data_consagracao: data_consagracao || null,
      categoria_ministerial: categoria_ministerial || null,
      MembroId: novoMembro.id
    });

    // Diversos / Trabalho
    await Diversos.create({
      trabalha: trabalha === true || trabalha === 'true',
      conta_outrem: conta_outrem === true || conta_outrem === 'true',
      conta_propria: conta_propria === true || conta_propria === 'true',
      MembroId: novoMembro.id
    });

    return res.status(201).json({
      message: 'Membro cadastrado com sucesso!',
      membro: novoMembro
    });

  } catch (error) {
    console.error('Erro ao cadastrar membro, cargos, departamentos ou tabelas relacionadas:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});
 

// GET /perfil/membro
router.get('/perfil/do/membro', auth, async (req, res) => {
  try {
    if (!req.usuario) {
      return res.status(404).json({ message: "Usuário não encontrado no token." });
    }

    const { id, funcao } = req.usuario;

    if (funcao !== 'membro') {
      return res.status(403).json({ message: "Apenas membros podem acessar o perfil." });
    }

    // 1) Buscar membroUser
    const membroUser = await MembroUser.findByPk(id);
    if (!membroUser || !membroUser.MembroId) {
      return res.status(404).json({ message: "Você ainda não possui um cadastro de membro vinculado." });
    }

    // 2) Buscar o membro
    const membro = await Membros.findByPk(membroUser.MembroId);
    if (!membro) {
      return res.status(404).json({ message: "Membro não encontrado." });
    }

    const fotoUrl = membro.foto ? `${req.protocol}://${req.get('host')}/${membro.foto}` : null;

    // ---------------------------------------------
    // 🔥 3) Buscar contribuições do membro
    // ---------------------------------------------
    const anoAtual = new Date().getFullYear();

    const contribuicoes = await Contribuicao.findAll({
      where: {
        MembroId: membro.id,
        data: {
          [Op.gte]: new Date(`${anoAtual}-01-01`),
          [Op.lte]: new Date(`${anoAtual}-12-31`)
        }
      },
      include: [
        { model: TipoContribuicao, attributes: ['id', 'nome'] }
      ],
      order: [['data', 'ASC']]
    });

    // ---------------------------------------------
    // 🔥 4) Resumo de desempenho
    // ---------------------------------------------
    const totalAno = contribuicoes.reduce((sum, c) => sum + Number(c.valor), 0);

    const totalContribuicoes = contribuicoes.length;

    const maiorContribuicao = contribuicoes.length > 0
      ? Math.max(...contribuicoes.map(c => Number(c.valor)))
      : 0;

    // média mensal = total dividido pelos meses que já passaram
    const mesAtual = new Date().getMonth() + 1;
    const mediaMensal = mesAtual > 0 ? (totalAno / mesAtual) : 0;

    // ---------------------------------------------
    // 🔥 5) Meses que NÃO contribuiu
    // ---------------------------------------------
    const mesesContribuidos = new Set(
      contribuicoes.map(c => new Date(c.data).getMonth() + 1)
    );

    const mesesNaoContribuiu = [];
    for (let m = 1; m <= 12; m++) {
      if (!mesesContribuidos.has(m)) mesesNaoContribuiu.push(m);
    }

    // ---------------------------------------------
    // 🔥 6) Alertas inteligentes
    // ---------------------------------------------
    const alertas = [];

    // 3 meses sem contribuir
    if (contribuicoes.length > 0) {
      const ultima = new Date(contribuicoes[contribuicoes.length - 1].data);
      const hoje = new Date();
      const diffMeses = (hoje.getFullYear() - ultima.getFullYear()) * 12 + (hoje.getMonth() - ultima.getMonth());
      if (diffMeses >= 3) {
        alertas.push("Você está há 3 meses ou mais sem contribuir.");
      }
    }

    // nenhuma contribuição no ano
    if (totalContribuicoes === 0) {
      alertas.push("Você ainda não realizou nenhuma contribuição este ano.");
    }

    // contribuições muito baixas (regra simples)
    if (totalAno > 0 && mediaMensal < 1000) {
      alertas.push("Suas contribuições mensais estão abaixo do esperado.");
    }

    // ---------------------------------------------
    // 🔥 7) 4 Indicadores adicionais
    // ---------------------------------------------

    // Tipo de contribuição mais frequente
    let tipoMaisFrequente = null;
    if (contribuicoes.length > 0) {
      const contador = {};
      for (const c of contribuicoes) {
        const nome = c.TipoContribuicao ? c.TipoContribuicao.nome : "Desconhecido";
        contador[nome] = (contador[nome] || 0) + 1;
      }
      tipoMaisFrequente = Object.entries(contador).sort((a, b) => b[1] - a[1])[0][0];
    }

    // Mês com maior total (mês mais generoso)
    const totalPorMes = {};
    contribuicoes.forEach(c => {
      const mes = new Date(c.data).getMonth() + 1;
      totalPorMes[mes] = (totalPorMes[mes] || 0) + Number(c.valor);
    });

    const mesMaisGeneroso =
      Object.keys(totalPorMes).length > 0
        ? Number(
            Object.entries(totalPorMes).sort((a, b) => b[1] - a[1])[0][0]
          )
        : null;

    // ---------------------------------------------
    // 🔥 8) Resposta final
    // ---------------------------------------------
    return res.json({
      perfil: {
        id: membro.id,
        nome: membro.nome,
        telefone: membro.telefone,
        genero: membro.genero,
        estado_civil: membro.estado_civil,
        foto: fotoUrl
      },
      desempenho: {
        totalAno,
        totalContribuicoes,
        maiorContribuicao,
        mediaMensal
      },
      mesesNaoContribuiu,
      alertas,
      indicadores: {
        quantidadeAno: totalContribuicoes,
        tipoMaisFrequente,
        mesMaisGeneroso,
        mesesComContribuicao: [...mesesContribuidos]
      }
    });

  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    res.status(500).json({ message: "Erro interno." });
  }
});
 

module.exports = router;
