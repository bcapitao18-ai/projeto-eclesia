// src/pages/Relatorios/RelatorioFinanceiroGeral.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Chip,
  Stack,
} from '@mui/material';
import {
  FilterAlt,
  PictureAsPdf,
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  AutoGraph,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../../api/axiosConfig';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function RelatorioFinanceiroGeral() {
  const [periodo, setPeriodo] = useState('mes');
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    totalArrecadado: 0,
    totalGasto: 0,
    saldo: 0,
  });

  const [dataInicial, setDataInicial] = useState(
    dayjs().startOf('month').format('YYYY-MM-DD')
  );
  const [dataFinal, setDataFinal] = useState(
    dayjs().format('YYYY-MM-DD')
  );

  const calcularPeriodo = (p) => {
    const agora = dayjs();
    let inicio;

    if (p === 'personalizado') {
      return { start: dataInicial, end: dataFinal };
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

    return {
      start: inicio.format('YYYY-MM-DD'),
      end: agora.format('YYYY-MM-DD'),
    };
  };

  const buscarRelatorio = async () => {
    setLoading(true);
    try {
      const { start, end } = calcularPeriodo(periodo);
      const res = await api.get('/financeiro', {
        params: { startDate: start, endDate: end },
      });

      setDados({
        totalArrecadado: res.data.totalArrecadado || 0,
        totalGasto: res.data.totalGasto || 0,
        saldo: res.data.saldo || 0,
      });
    } catch (err) {
      console.error('Erro ao buscar relatório financeiro', err);
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const { start, end } = calcularPeriodo(periodo);

    doc.setFontSize(18);
    doc.text('Relatório Financeiro Surreal Premium', 14, 20);
    doc.setFontSize(12);
    doc.text(`Período: ${start} até ${end}`, 14, 30);

    autoTable(doc, {
      head: [['Descrição', 'Valor (Kz)']],
      body: [
        ['Total Arrecadado', dados.totalArrecadado.toFixed(2)],
        ['Total Gasto', dados.totalGasto.toFixed(2)],
        ['Saldo', dados.saldo.toFixed(2)],
      ],
      startY: 40,
    });

    doc.save('relatorio-financeiro-surreal.pdf');
  };

  const dadosGrafico = [
    {
      nome: 'Financeiro',
      Contribuicao: dados.totalArrecadado,
      Despesas: dados.totalGasto,
      Saldo: dados.saldo,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, rgba(0,102,255,0.08), transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(139,92,246,0.08), transparent 40%),
          radial-gradient(circle at 50% 0%, rgba(0,0,0,0.04), transparent 50%),
          #ffffff
        `,
        px: { xs: 2, sm: 3, md: 6 },
        py: { xs: 3, md: 6 },
      }}
    >
      {/* HEADER HOLOGRÁFICO */}
      <MotionBox
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        textAlign="center"
        mb={6}
      >
        <Stack spacing={2} alignItems="center">
          <Typography
            sx={{
              fontSize: { xs: 30, sm: 42, md: 64 },
              fontWeight: 900,
              letterSpacing: 2,
              background:
                'linear-gradient(90deg,#000,#2563eb,#7c3aed,#000)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            RELATÓRIO FINANCEIRO GERAL
          </Typography>

          <Chip
            icon={<AutoGraph />}
            label="Dashboard Financeiro Ultra Premium"
            sx={{
              fontWeight: 800,
              px: 2,
              py: 2,
              borderRadius: 50,
              backdropFilter: 'blur(10px)',
              background: 'rgba(255,255,255,0.8)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            }}
          />
        </Stack>
      </MotionBox>

      {/* CARD PRINCIPAL GLASS */}
      <MotionCard
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        sx={{
          borderRadius: { xs: 4, md: 6 },
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 60px 160px rgba(0,0,0,0.12)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          {/* FILTROS SURREAIS RESPONSIVOS */}
          <Grid container spacing={2} mb={5}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Período</InputLabel>
                <Select
                  value={periodo}
                  label="Período"
                  onChange={(e) => setPeriodo(e.target.value)}
                  sx={{
                    borderRadius: 3,
                    background: '#ffffff',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  }}
                >
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="semana">Semana</MenuItem>
                  <MenuItem value="mes">Mês</MenuItem>
                  <MenuItem value="trimestre">Trimestre</MenuItem>
                  <MenuItem value="semestre">Semestre</MenuItem>
                  <MenuItem value="ano">Ano</MenuItem>
                  <MenuItem value="personalizado">Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {periodo === 'personalizado' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Data Inicial"
                    type="date"
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Data Final"
                    type="date"
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                startIcon={<FilterAlt />}
                onClick={buscarRelatorio}
                sx={{
                  height: 56,
                  borderRadius: 4,
                  fontWeight: 900,
                  background:
                    'linear-gradient(135deg,#000,#1e3a8a)',
                  color: '#fff',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  transition: '0.4s',
                  '&:hover': {
                    transform: 'translateY(-3px) scale(1.02)',
                  },
                }}
              >
                GERAR RELATÓRIO
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                startIcon={<PictureAsPdf />}
                onClick={exportarPDF}
                sx={{
                  height: 56,
                  borderRadius: 4,
                  fontWeight: 900,
                  border: '2px solid #000',
                  color: '#000',
                  '&:hover': {
                    background: '#000',
                    color: '#fff',
                  },
                }}
              >
                EXPORTAR PDF
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 5 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={80} />
            </Box>
          ) : (
            <>
              {/* CARDS SURREAIS COM GLOW */}
              <Grid container spacing={3}>
                {[
                  {
                    title: 'Contribuição Total',
                    value: dados.totalArrecadado,
                    icon: <TrendingUp sx={{ fontSize: 40 }} />,
                    gradient: 'linear-gradient(135deg,#ecfdf5,#ffffff)',
                  },
                  {
                    title: 'Despesas Totais',
                    value: dados.totalGasto,
                    icon: <TrendingDown sx={{ fontSize: 40 }} />,
                    gradient: 'linear-gradient(135deg,#fff1f2,#ffffff)',
                  },
                  {
                    title: 'Saldo Atual',
                    value: dados.saldo,
                    icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />,
                    gradient: 'linear-gradient(135deg,#eef2ff,#ffffff)',
                  },
                ].map((item, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <MotionCard
                      whileHover={{ scale: 1.05, y: -10 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      sx={{
                        borderRadius: 6,
                        p: 4,
                        background: item.gradient,
                        boxShadow: '0 30px 80px rgba(0,0,0,0.12)',
                        height: '100%',
                        backdropFilter: 'blur(20px)',
                      }}
                    >
                      {item.icon}
                      <Typography fontWeight={800} mt={2}>
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: 28, md: 42 },
                          fontWeight: 900,
                          mt: 1,
                        }}
                      >
                        Kz {item.value.toFixed(2)}
                      </Typography>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>

              {/* GRÁFICO SURREAL */}
              <Box
                sx={{
                  mt: 7,
                  p: { xs: 2, md: 5 },
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(25px)',
                  boxShadow: '0 40px 120px rgba(0,0,0,0.1)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 20, md: 28 },
                    fontWeight: 900,
                    textAlign: 'center',
                    mb: 4,
                  }}
                >
                  Análise Financeira Inteligente
                </Typography>

                <Box sx={{ width: '100%', height: { xs: 280, md: 420 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGrafico}>
                      <CartesianGrid strokeDasharray="4 4" opacity={0.15} />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Contribuicao" fill="#10b981" radius={[12,12,0,0]} />
                      <Bar dataKey="Despesas" fill="#ef4444" radius={[12,12,0,0]} />
                      <Bar dataKey="Saldo" fill="#2563eb" radius={[12,12,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </MotionCard>
    </Box>
  );
}