// src/pages/RelatorioPresencasPremium.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Button, CircularProgress, Table, TableBody, TableCell, TableHead,
  TableRow, Avatar, Stack, Chip, Paper, TableContainer,
  TextField
} from '@mui/material';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import api from '../../api/axiosConfig';
import { PictureAsPdf, TrendingUp } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RelatorioPresencasPremium() {

  const [tiposCulto, setTiposCulto] = useState([]);
  const [selectedTipoCulto, setSelectedTipoCulto] = useState('');
  const [periodo, setPeriodo] = useState('todos');
  const [loading, setLoading] = useState(false);

  const [dataInicial, setDataInicial] = useState(
    dayjs().startOf('month').format('YYYY-MM-DD')
  );

  const [dataFinal, setDataFinal] = useState(
    dayjs().format('YYYY-MM-DD')
  );

  const [totais, setTotais] = useState({
    homens: 0,
    mulheres: 0,
    criancas: 0,
    adultos: 0
  });

  const [contribuicoes, setContribuicoes] = useState([]);

  useEffect(() => {
    api.get('/lista/tipos-culto').then(res => setTiposCulto(res.data));
  }, []);

  const calcularPeriodo = (p) => {
    const agora = dayjs();
    let inicio;

    if (p === 'todos') {
      return {
        start: null,
        end: null
      };
    }

    if (p === 'personalizado') {
      return {
        start: dataInicial,
        end: dataFinal
      };
    }

    switch (p) {
      case 'hoje':
        inicio = agora.startOf('day');
        break;
      case 'semana':
        inicio = agora.startOf('week');
        break;
      case 'mes':
        inicio = agora.startOf('month');
        break;
      case 'trimestre':
        inicio = agora.subtract(3, 'month').startOf('day');
        break;
      case 'semestre':
        inicio = agora.subtract(6, 'month').startOf('day');
        break;
      case 'ano':
        inicio = agora.startOf('year');
        break;
      default:
        inicio = null;
    }

    return {
      start: inicio ? inicio.format('YYYY-MM-DD') : null,
      end: agora.format('YYYY-MM-DD')
    };
  };

  const gerarRelatorio = async () => {
    if (!selectedTipoCulto) return;

    setLoading(true);

    const { start, end } = calcularPeriodo(periodo);

    const res = await api.get('/lista/presencas', {
      params: {
        tipoCultoId: selectedTipoCulto,
        startDate: start,
        endDate: end
      }
    });

    setTotais(res.data.totais);
    setContribuicoes(res.data.contribuicoes || []);

    setLoading(false);
  };

  const totaisLimpos = useMemo(() => {
    const { adultos, ...resto } = totais;
    return resto;
  }, [totais]);

  const totaisPorTipo = useMemo(() => {
    const map = {};

    contribuicoes.forEach(c => {
      const tipo = c.TipoContribuicao?.nome || 'Outro';
      map[tipo] = (map[tipo] || 0) + Number(c.valor || 0);
    });

    return Object.entries(map).map(([tipo, valor]) => ({
      tipo,
      valor
    }));
  }, [contribuicoes]);

  // ✅ NOVO TOTAL GERAL
  const totalGeralContribuicoes = useMemo(() => {
    return contribuicoes.reduce((total, c) => {
      return total + Number(c.valor || 0);
    }, 0);
  }, [contribuicoes]);

  const dadosPizza = useMemo(() => [
    { name: 'Homens', value: totais.homens },
    { name: 'Mulheres', value: totais.mulheres },
    { name: 'Crianças', value: totais.criancas }
  ], [totais]);

  const cores = ['#6366f1', '#ec4899', '#22c55e'];

  const exportarPDF = () => {
    const doc = new jsPDF();

    const dadosFiltrados = Object.entries(totaisLimpos).map(([k, v]) => [
      k.toUpperCase(),
      v
    ]);

    autoTable(doc, {
      head: [['Categoria', 'Valor']],
      body: dadosFiltrados
    });

    doc.save('relatorio.pdf');
  };

  const cardStyle = {
    backdropFilter: 'blur(14px)',
    background: 'rgba(255,255,255,0.75)',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
    borderRadius: 4,
    p: 2.5,
    flex: 1,
    minWidth: 0
  };

  const MoneyChip = ({ value }) => (
    <Chip
      label={`${value} Kz`}
      sx={{
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        color: '#fff',
        fontWeight: 800,
        boxShadow: '0 6px 16px rgba(34,197,94,0.35)'
      }}
    />
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eef2ff, #f0fdfa, #fef3c7)',
      p: { xs: 2, md: 4 }
    }}>

      {/* HEADER */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        mb={3}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Relatório de cultos
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={gerarRelatorio}
            startIcon={<TrendingUp />}
          >
            Gerar Relatório
          </Button>

          <Button
            variant="outlined"
            onClick={exportarPDF}
            startIcon={<PictureAsPdf />}
          >
            Exportar
          </Button>
        </Stack>
      </Stack>

      {/* FILTROS */}
      <Stack direction="row" spacing={2} mb={4} flexWrap="wrap">

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Tipo de Culto</InputLabel>
          <Select value={selectedTipoCulto} onChange={(e) => setSelectedTipoCulto(e.target.value)}>
            {tiposCulto.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
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
      </Stack>

      {loading && <CircularProgress />}

      {!loading && (
        <>
          {/* KPI CARDS */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" mb={3}>
            {Object.entries(totaisLimpos).map(([k, v]) => (
              <Box key={k} sx={cardStyle}>
                <Typography fontSize={12} color="text.secondary">
                  {k.toUpperCase()}
                </Typography>
                <Typography fontSize={28} fontWeight={900}>
                  {v}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* CONTRIBUTIONS */}
          <Typography fontWeight={800} mb={1}>
            Contribuições por Tipo
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" mb={4}>

            {/* ✅ TOTAL GERAL */}
            <Paper sx={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: '#fff'
            }}>
              <Typography fontSize={12} sx={{ opacity: 0.9 }}>
                TOTAL GERAL
              </Typography>
              <Typography fontSize={26} fontWeight={900}>
                {totalGeralContribuicoes} Kz
              </Typography>
            </Paper>

            {totaisPorTipo.map((t) => (
              <Paper key={t.tipo} sx={cardStyle}>
                <Typography fontSize={12}>{t.tipo}</Typography>
                <MoneyChip value={t.valor} />
              </Paper>
            ))}

          </Stack>

          {/* GRID */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>

            <Paper sx={cardStyle}>
              <Typography fontWeight={700}>Distribuição</Typography>

              <Box height={320}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={dadosPizza} dataKey="value" outerRadius={110} innerRadius={60}>
                      {dadosPizza.map((_, i) => (
                        <Cell key={i} fill={cores[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>

            <Paper sx={{ ...cardStyle, flex: 2 }}>
              <Typography fontWeight={700}>Contribuições Recentes</Typography>

              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Membro</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Valor</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {contribuicoes.map(c => (
                      <TableRow key={c.id}>
                        <TableCell>{dayjs(c.data).format('DD/MM/YYYY')}</TableCell>
                        <TableCell>{c.Membro?.nome}</TableCell>
                        <TableCell>{c.TipoContribuicao?.nome}</TableCell>
                        <TableCell><MoneyChip value={c.valor} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

          </Stack>
        </>
      )}
    </Box>
  );
}