import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogContent,
  Stack,
  Chip,
} from '@mui/material';
import dayjs from 'dayjs';
import api from '../../api/axiosConfig';
import ListaDespesasCategorias from '../../components/ListaDespesasCategorias';

export default function RelatorioDespesas() {

  const [periodo, setPeriodo] = useState('todos');
  const [tipo, setTipo] = useState('');
  const [loading, setLoading] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [total, setTotal] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  const [dataInicial, setDataInicial] = useState(
    dayjs().startOf('month').format('YYYY-MM-DD')
  );
  const [dataFinal, setDataFinal] = useState(
    dayjs().format('YYYY-MM-DD')
  );

  const calcularPeriodo = (p) => {
    const agora = dayjs();
    let inicio;

    if (p === 'todos') return { start: undefined, end: undefined };

    if (p === 'personalizado') {
      return { start: dataInicial, end: dataFinal };
    }

    switch (p) {
      case 'hoje': inicio = agora.startOf('day'); break;
      case 'semana': inicio = agora.startOf('week'); break;
      case 'mes': inicio = agora.startOf('month'); break;
      case 'trimestre': inicio = agora.subtract(3, 'month'); break;
      case 'semestre': inicio = agora.subtract(6, 'month'); break;
      case 'ano': inicio = agora.startOf('year'); break;
      default: inicio = agora.startOf('month');
    }

    return {
      start: inicio.format('YYYY-MM-DD'),
      end: agora.format('YYYY-MM-DD'),
    };
  };

  const buscarRelatorio = async () => {
    setLoading(true);
    try {
      const { start, end } = calcularPeriodo(periodo);

      const params =
        periodo === 'todos'
          ? { tipo: tipo || undefined }
          : { startDate: start, endDate: end, tipo: tipo || undefined };

      const res = await api.get('/relatorio/despesas', { params });

      const data = res.data || [];

      const filtradas = data.filter(
        (c) => parseFloat(c.totalDespesas || 0) > 0
      );

      setCategorias(filtradas);

      const soma = filtradas.reduce(
        (acc, c) => acc + parseFloat(c.totalDespesas || 0),
        0
      );

      setTotal(soma);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarRelatorio();
  }, []);

  const temDados = useMemo(() => categorias.length > 0, [categorias]);

  const cardStyle = {
    backdropFilter: 'blur(14px)',
    background: 'rgba(255,255,255,0.75)',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
    borderRadius: 4,
    p: 2.5,
  };

  const MoneyChip = ({ value }) => (
    <Chip
      label={`${value.toLocaleString()} Kz`}
      sx={{
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: '#fff',
        fontWeight: 800
      }}
    />
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eef2ff, #fff1f2, #fee2e2)',
      p: { xs: 2, md: 4 }
    }}>

      {/* HEADER */}
      <Typography variant="h4" fontWeight={900} mb={3}>
        Relatório de Despesas
      </Typography>

      {/* FILTROS + BOTÃO */}
      <Stack direction="row" spacing={2} mb={4} flexWrap="wrap" alignItems="center">

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Período</InputLabel>
          <Select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="hoje">Hoje</MenuItem>
            <MenuItem value="semana">Semana</MenuItem>
            <MenuItem value="mes">Mês</MenuItem>
            <MenuItem value="trimestre">Trimestre</MenuItem>
            <MenuItem value="semestre">Semestre</MenuItem>
            <MenuItem value="ano">Ano</MenuItem>
            <MenuItem value="personalizado">Personalizado</MenuItem>
          </Select>
        </FormControl>

        {periodo === 'personalizado' && (
          <>
            <TextField
              type="date"
              label="Data Inicial"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="Data Final"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </>
        )}

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Tipo</InputLabel>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Fixa">Fixa</MenuItem>
            <MenuItem value="Variável">Variável</MenuItem>
          </Select>
        </FormControl>

        {/* BOTÃO MOVIDO */}
        <Button
          variant="contained"
          onClick={buscarRelatorio}
          sx={{ height: 56 }}
        >
          Gerar Relatório
        </Button>

      </Stack>

      {/* TOTAL GERAL (NÃO FULL WIDTH) */}
      <Box mb={4}>
        <Paper sx={{
          ...cardStyle,
          width: { xs: '100%', sm: 300 },
          background: 'linear-gradient(135deg,#dc2626,#ef4444)',
          color: '#fff'
        }}>
          <Typography fontSize={12}>TOTAL GERAL</Typography>
          <Typography fontSize={30} fontWeight={900}>
            {total.toLocaleString()} Kz
          </Typography>
        </Paper>
      </Box>

      {/* TABELA */}
      {loading ? (
        <CircularProgress />
      ) : !temDados ? (
        <Typography>Nenhuma despesa encontrada</Typography>
      ) : (
        <TableContainer component={Paper} sx={cardStyle}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Categoria</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Qtd</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {categorias.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.nome}</TableCell>
                  <TableCell>{cat.descricao}</TableCell>
                  <TableCell align="center">
                    {cat.quantidadeDespesas || 0}
                  </TableCell>
                  <TableCell align="right">
                    <MoneyChip value={parseFloat(cat.totalDespesas || 0)} />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={() => {
                        setCategoriaSelecionada(cat);
                        setOpenModal(true);
                      }}
                    >
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* MODAL */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="lg"
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography fontWeight={900}>
            {categoriaSelecionada?.nome}
          </Typography>
          <Button onClick={() => setOpenModal(false)}>Fechar</Button>
        </Box>

        <DialogContent>
          <ListaDespesasCategorias
            categoria={categoriaSelecionada}
            onClose={() => setOpenModal(false)}
          />
        </DialogContent>
      </Dialog>

    </Box>
  );
}