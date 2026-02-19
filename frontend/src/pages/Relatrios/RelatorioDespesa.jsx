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
  Card,
  CardContent,
  Divider,
  TextField,
} from '@mui/material';
import { FilterAlt, Summarize, PictureAsPdf } from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import api from '../../api/axiosConfig';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function RelatorioDespesas() {
  const [periodo, setPeriodo] = useState('mes');
  const [tipo, setTipo] = useState('');
  const [loading, setLoading] = useState(false);
  const [despesas, setDespesas] = useState([]);
  const [total, setTotal] = useState(0);

  // NOVOS ESTADOS PARA PERSONALIZAR
  const [dataInicial, setDataInicial] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [dataFinal, setDataFinal] = useState(dayjs().format('YYYY-MM-DD'));

  const calcularPeriodo = (p) => {
    const agora = dayjs();
    let inicio;

    // SE FOR PERSONALIZADO, USA AS DATAS MANUAIS
    if (p === 'personalizado') {
      return {
        start: dataInicial,
        end: dataFinal,
      };
    }

    switch (p) {
      case 'hoje': inicio = agora.startOf('day'); break;
      case 'semana': inicio = agora.startOf('week'); break;
      case 'mes': inicio = agora.startOf('month'); break;
      case 'trimestre': inicio = agora.subtract(3, 'month').startOf('day'); break;
      case 'semestre': inicio = agora.subtract(6, 'month').startOf('day'); break;
      case 'ano': inicio = agora.startOf('year'); break;
      default: inicio = agora.startOf('month');
    }

    return { start: inicio.format('YYYY-MM-DD'), end: agora.format('YYYY-MM-DD') };
  };

  const buscarRelatorio = async () => {
    setLoading(true);
    try {
      const { start, end } = calcularPeriodo(periodo);

      const res = await api.get('/relatorio/despesas', {
        params: {
          startDate: start,
          endDate: end,
          tipo: tipo || undefined,
        },
      });

      setDespesas(res.data);
      const soma = res.data.reduce((acc, d) => acc + parseFloat(d.valor), 0);
      setTotal(soma);
    } catch (err) {
      console.error('Erro ao buscar relatório de despesas:', err);
    } finally {
      setLoading(false);
    }
  };

  const dadosPizza = useMemo(() => {
    const mapa = {};
    despesas.forEach((d) => {
      const t = d.tipo || 'Outros';
      mapa[t] = (mapa[t] || 0) + parseFloat(d.valor);
    });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [despesas]);

  const cores = ['#f44336', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Despesas', 14, 18);
    doc.setFontSize(12);
    doc.text(`Total gasto: Kz ${total.toFixed(2)}`, 14, 28);

    const rows = despesas.map((d) => [
      dayjs(d.data).format('DD/MM/YYYY'),
      d.descricao,
      d.tipo,
      parseFloat(d.valor).toFixed(2),
      d.categoria || '-',
    ]);

    autoTable(doc, {
      head: [['Data', 'Descrição', 'Tipo', 'Valor (Kz)', 'Categoria']],
      body: rows,
      startY: 36,
      styles: { fontSize: 10 },
    });

    doc.save('relatorio-despesas.pdf');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2, md: 6 },
        background: 'linear-gradient(135deg,#f44336 0%, #9c27b0 100%)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ width: '100%', maxWidth: 1100 }}
      >
        <Card elevation={8} sx={{ borderRadius: 4, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          <Box
            sx={{
              p: 4,
              background: 'linear-gradient(90deg, rgba(244,67,54,1) 0%, rgba(156,39,176,1) 100%)',
            }}
          >
            <Typography variant="h4" fontWeight="bold" color="white" textAlign="center">
              <Summarize sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} />
              Relatório de Despesas
            </Typography>
          </Box>

          <CardContent>
            {/* Filtros */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mb: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Período</InputLabel>
                <Select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                >
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="semana">Semana</MenuItem>
                  <MenuItem value="mes">Mês</MenuItem>
                  <MenuItem value="trimestre">Trimestre</MenuItem>
                  <MenuItem value="semestre">Semestre</MenuItem>
                  <MenuItem value="ano">Ano</MenuItem>
                  <MenuItem value="personalizado">
                    Personalizar (Escolher datas)
                  </MenuItem>
                </Select>
              </FormControl>

              {/* CAMPOS DE DATA APENAS QUANDO FOR PERSONALIZADO */}
              {periodo === 'personalizado' && (
                <>
                  <TextField
                    label="Data Inicial"
                    type="date"
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 180 }}
                  />

                  <TextField
                    label="Data Final"
                    type="date"
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 180 }}
                  />
                </>
              )}

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Tipo de Despesa</InputLabel>
                <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="Fixa">Fixa</MenuItem>
                  <MenuItem value="Variável">Variável</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<FilterAlt />}
                onClick={buscarRelatorio}
                sx={{
                  background: 'linear-gradient(90deg,#f44336,#9c27b0)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.2,
                  borderRadius: 3,
                  '&:hover': { background: 'linear-gradient(90deg,#e53935,#8e24aa)' },
                }}
              >
                Gerar Relatório
              </Button>

              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={exportarPDF}
                disabled={!despesas.length}
                sx={{
                  borderColor: '#f44336',
                  color: '#f44336',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.2,
                  borderRadius: 3,
                  '&:hover': {
                    background: 'rgba(244,67,54,0.1)',
                    borderColor: '#e53935',
                  },
                }}
              >
                Exportar PDF
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Typography
                  variant="h6"
                  mb={2}
                  sx={{ textAlign: 'center', fontWeight: 'bold' }}
                >
                  Total gasto:{' '}
                  <Box component="span" sx={{ color: '#f44336' }}>
                    Kz {total.toFixed(2)}
                  </Box>
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    mb: 4,
                  }}
                >
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell align="right">Valor (Kz)</TableCell>
                        <TableCell>Categoria</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {despesas.map((d) => (
                        <TableRow
                          key={d.id}
                          hover
                          sx={{
                            '&:nth-of-type(even)': { backgroundColor: '#fafafa' },
                          }}
                        >
                          <TableCell>{dayjs(d.data).format('DD/MM/YYYY')}</TableCell>
                          <TableCell>{d.descricao}</TableCell>
                          <TableCell>{d.tipo}</TableCell>
                          <TableCell align="right">
                            {parseFloat(d.valor).toFixed(2)}
                          </TableCell>
                          <TableCell>{d.categoria || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {dadosPizza.length > 0 && (
                  <Box sx={{ height: 350 }}>
                    <Typography
                      variant="h6"
                      textAlign="center"
                      mb={2}
                      fontWeight="bold"
                    >
                      Distribuição por Tipo de Despesa
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosPizza}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label
                        >
                          {dadosPizza.map((_, i) => (
                            <Cell key={i} fill={cores[i % cores.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}