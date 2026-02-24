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
  Grid,
  TextField,
} from '@mui/material';
import { FilterAlt, PictureAsPdf } from '@mui/icons-material';
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

  const formatKz = (valor) => {
    const numero = Number(valor || 0);
    return numero.toLocaleString('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const { start, end } = calcularPeriodo(periodo);

    doc.setFontSize(16);
    doc.text('Relatório Financeiro Geral', 14, 20);
    doc.setFontSize(12);
    doc.text(`Período: ${start} até ${end}`, 14, 30);

    autoTable(doc, {
      head: [['Descrição', 'Valor (Kz)']],
      body: [
        ['Total Arrecadado', formatKz(dados.totalArrecadado)],
        ['Total Gasto', formatKz(dados.totalGasto)],
        ['Saldo', formatKz(dados.saldo)],
      ],
      startY: 40,
    });

    doc.save('relatorio-financeiro.pdf');
  };

  const dadosGrafico = [
    {
      nome: 'Financeiro',
      Contribuicao: dados.totalArrecadado,
      Despesas: dados.totalGasto,
      Saldo: dados.saldo,
    },
  ];

  const cardStyle = (color, glow) => ({
    height: '100%',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${color}20`,
    boxShadow: `0 8px 30px ${glow}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 12px 40px ${glow}`,
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        background: `
          radial-gradient(circle at 20% 20%, rgba(37,99,235,0.07), transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(22,163,74,0.06), transparent 40%),
          #f4f6f9
        `,
      }}
    >
      <Typography
        variant="h4"
        fontWeight={800}
        mb={3}
        sx={{ letterSpacing: 1 }}
      >
        Relatório Financeiro
      </Typography>

      {/* FILTROS */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 4,
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Período</InputLabel>
                <Select
                  value={periodo}
                  label="Período"
                  onChange={(e) => setPeriodo(e.target.value)}
                >
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="semana">Semana</MenuItem>
                  <MenuItem value="mes">Mês</MenuItem>
                  <MenuItem value="trimestre">Trimestre</MenuItem>
                  <MenuItem value="semestre">Semestre</MenuItem>
                  <MenuItem value="ano">Ano</MenuItem>
                  <MenuItem value="personalizado">Personalizado - Escolha voce mesmo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {periodo === 'personalizado' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
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
                    size="small"
                    label="Data Final"
                    type="date"
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6} md={2}>
              <Button fullWidth variant="contained" onClick={buscarRelatorio}>
                Gerar
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button fullWidth variant="outlined" onClick={exportarPDF}>
                PDF
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* CARDS */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={cardStyle('#2563eb', 'rgba(37,99,235,0.15)')}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contribuição Total
                  </Typography>
                  <Typography variant="h5" fontWeight={700} mt={1}>
                    Kz {formatKz(dados.totalArrecadado)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={cardStyle('#dc2626', 'rgba(220,38,38,0.15)')}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Despesas Totais
                  </Typography>
                  <Typography variant="h5" fontWeight={700} mt={1}>
                    Kz {formatKz(dados.totalGasto)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={cardStyle('#16a34a', 'rgba(22,163,74,0.15)')}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Saldo Atual
                  </Typography>
                  <Typography variant="h5" fontWeight={700} mt={1}>
                    Kz {formatKz(dados.saldo)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* GRÁFICO */}
          <Card
            sx={{
              mt: 5,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(15px)',
              boxShadow: '0 15px 50px rgba(0,0,0,0.06)',
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Análise Financeira
              </Typography>

              <Box height={{ xs: 300, md: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Kz ${formatKz(value)}`} />
                    <Legend />
                    <Bar dataKey="Contribuicao" fill="#2563eb" radius={[8,8,0,0]} />
                    <Bar dataKey="Despesas" fill="#dc2626" radius={[8,8,0,0]} />
                    <Bar dataKey="Saldo" fill="#16a34a" radius={[8,8,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}