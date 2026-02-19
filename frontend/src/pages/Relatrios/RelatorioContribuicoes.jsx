// NOVA VERSÃO COM PESQUISA IGUAL AO FORM DE FUNCIONÁRIOS (AUTOCOMPLETE) + RESTO INTACTO

import React, { useEffect, useState, useMemo } from 'react';
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
  Autocomplete, // 🔥 ADICIONADO
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

const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

function formatCurrency(val) {
  const num = Number(val) || 0;
  const parts = num.toFixed(2).split('.');
  const intPart = parts[0];
  const decPart = parts[1];
  const withThousand = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Kz ${withThousand},${decPart}`;
}

function monthKey(d) {
  return dayjs(d).format('YYYY-MM');
}

function monthLabelFromKey(k) {
  if (!k) return '';
  const parts = k.split('-');
  const m = parseInt(parts[1], 10);
  return MONTHS_PT[m - 1] || '';
}

function buildMonthsArray(start, end) {
  const arr = [];
  let cur = dayjs(start).startOf('month');
  const last = dayjs(end).endOf('month');
  while (cur.isBefore(last) || cur.isSame(last, 'month')) {
    arr.push(cur.format('YYYY-MM'));
    cur = cur.add(1, 'month');
  }
  return arr;
}

export default function RelatorioContribuicoes() {
  const [tipos, setTipos] = useState([]);
  const [membros, setMembros] = useState([]);
  const [tipoId, setTipoId] = useState('');
  const [membroId, setMembroId] = useState('');

  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [contribuicoes, setContribuicoes] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [resTipos, resMembros] = await Promise.all([
          api.get('/lista/tipos-contribuicao'),
          api.get('/membros'),
        ]);
        setTipos(resTipos.data || []);
        setMembros(resMembros.data || []);
      } catch (err) {
        console.error('Erro ao carregar filtros', err);
      }
    })();
  }, []);

  const buscarRelatorio = async () => {
    if (!startDate || !endDate) return alert('Selecione as datas');
    if (dayjs(startDate).isAfter(dayjs(endDate))) return alert('Data inicial maior que a final');

    setLoading(true);
    try {
      const res = await api.get('/lista/contribuicoes', {
        params: {
          startDate,
          endDate,
          tipoId: tipoId || undefined,
          membroId: membroId || undefined,
        },
      });

      const data = res.data || [];
      setContribuicoes(data);
      setTotal(data.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0));
    } catch (err) {
      console.error('Erro ao buscar relatório', err);
    } finally {
      setLoading(false);
    }
  };

  const dadosPizza = useMemo(() => {
    const mapa = {};
    contribuicoes.forEach((c) => {
      const tipo = c.TipoContribuicao?.nome || 'Outros';
      mapa[tipo] = (mapa[tipo] || 0) + (parseFloat(c.valor) || 0);
    });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [contribuicoes]);

  const cores = ['#6b78ff', '#9c27b0', '#ff9800', '#4caf50', '#f44336', '#2196f3'];

  const { months, tableRows } = useMemo(() => {
    if (!startDate || !endDate) return { months: [], tableRows: [] };

    const monthsArr = buildMonthsArray(startDate, endDate);
    const mapa = {};

    function ensureMemberEntry(memberKey, memberName) {
      if (!mapa[memberKey]) {
        mapa[memberKey] = {
          memberId: memberKey === 'SEM' ? null : memberKey,
          nome: memberName || (memberKey === 'SEM' ? 'Sem Membro' : 'Desconhecido'),
          months: {},
          total: 0,
        };
        monthsArr.forEach((m) => (mapa[memberKey].months[m] = 0));
      }
    }

    contribuicoes.forEach((c) => {
      const mKey = monthKey(
        c.data || c.createdAt || c.created_at || c.data_contribuicao || new Date()
      );
      if (!monthsArr.includes(mKey)) return;

      const membro = c.Membro && c.Membro.id ? c.Membro : null;
      const memberKey = membro ? String(membro.id) : 'SEM';
      const memberName = membro ? membro.nome : null;
      ensureMemberEntry(memberKey, memberName);

      const valor = parseFloat(c.valor) || 0;
      mapa[memberKey].months[mKey] += valor;
      mapa[memberKey].total += valor;
    });

    return {
      months: monthsArr,
      tableRows: Object.values(mapa).sort((a, b) =>
        a.nome.localeCompare(b.nome)
      ),
    };
  }, [contribuicoes, startDate, endDate]);

  const exportarPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a4');
    doc.setFontSize(14);
    doc.text('Relatório de Contribuições por Membro / Mês', 40, 40);
    doc.text(
      `Período: ${dayjs(startDate).format('DD/MM/YYYY')} - ${dayjs(endDate).format('DD/MM/YYYY')}`,
      40,
      60
    );
    doc.text(`Total Geral: ${formatCurrency(total)}`, 40, 80);

    const head = [['Membro', ...months.map((m) => monthLabelFromKey(m)), 'Total (Kz)']];
    const body = tableRows.map((r) => [
      r.nome,
      ...months.map((m) => (r.months[m] || 0).toFixed(2)),
      r.total.toFixed(2),
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 100,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [107, 120, 255] },
      theme: 'grid',
      margin: { left: 20, right: 20 },
    });

    doc.save('relatorio.pdf');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 1.5, md: 6 },
        background: 'linear-gradient(135deg,#6b78ff 0%, #9c27b0 100%)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ width: '100%', maxWidth: 1200 }}
      >
        <Card elevation={10} sx={{ borderRadius: 4, overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
          <Box sx={{ p: 3, background: 'linear-gradient(90deg,#2196f3,#9c27b0)' }}>
            <Typography variant="h4" fontWeight="bold" color="white" textAlign="center">
              <Summarize sx={{ fontSize: 38, mr: 1 }} /> Relatório de Contribuições
            </Typography>
          </Box>

          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4, justifyContent: 'center' }}>
              <TextField
                label="Data Inicial"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
              />

              <TextField
                label="Data Final"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
              />

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Tipo de Contribuição</InputLabel>
                <Select
                  value={tipoId}
                  label="Tipo de Contribuição"
                  onChange={(e) => setTipoId(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {tipos.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 🔥 AGORA IGUAL AO FORM DE FUNCIONÁRIOS */}
              <Autocomplete
                options={membros}
                getOptionLabel={(m) => m?.nome || ''}
                value={membros.find((m) => m.id === membroId) || null}
                onChange={(e, value) => setMembroId(value ? value.id : '')}
                sx={{ minWidth: 240 }}
                renderInput={(params) => (
                  <TextField {...params} label="Membro" placeholder="Pesquisar membro..." />
                )}
              />

              <Button
                variant="contained"
                startIcon={<FilterAlt />}
                onClick={buscarRelatorio}
                sx={{
                  background: 'linear-gradient(90deg,#6b78ff,#9c27b0)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.2,
                  borderRadius: 3,
                }}
              >
                Gerar
              </Button>

              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={exportarPDF}
                disabled={!tableRows.length}
                sx={{ borderColor: '#6b78ff', color: '#6b78ff', fontWeight: 'bold' }}
              >
                PDF
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Typography textAlign="center" fontWeight="bold" mb={2}>
                  Total arrecadado:{' '}
                  <Box component="span" sx={{ color: '#6b78ff' }}>
                    {formatCurrency(total)}
                  </Box>
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    mb: 4,
                    overflowX: 'auto',
                    maxHeight: 500,
                    overflowY: 'auto',
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><b>Membro</b></TableCell>
                        {months.map((m) => (
                          <TableCell key={m} align="center">
                            <Box
                              sx={{
                                px: 1,
                                py: 0.5,
                                background: '#eef2ff',
                                borderRadius: 2,
                                fontWeight: '600',
                              }}
                            >
                              {monthLabelFromKey(m)}
                            </Box>
                          </TableCell>
                        ))}
                        <TableCell align="right"><b>Total</b></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {tableRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2 + months.length} align="center">
                            Nenhum registro
                          </TableCell>
                        </TableRow>
                      ) : (
                        tableRows.map((r) => (
                          <TableRow key={r.memberId || r.nome} hover>
                            <TableCell>
                              <b>{r.nome}</b>
                              <br />
                              <small style={{ color: '#666' }}>
                                {formatCurrency(r.total)}
                              </small>
                            </TableCell>

                            {months.map((m) => (
                              <TableCell key={m} align="right">
                                <Box
                                  sx={{
                                    px: 1.2,
                                    py: 0.5,
                                    background: r.months[m] > 0 ? '#eef7ff' : 'transparent',
                                    borderRadius: 1.5,
                                  }}
                                >
                                  {formatCurrency(r.months[m] || 0)}
                                </Box>
                              </TableCell>
                            ))}

                            <TableCell align="right">
                              <b>{formatCurrency(r.total)}</b>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {dadosPizza.length > 0 && (
                  <Box sx={{ height: 350 }}>
                    <Typography textAlign="center" fontWeight="bold" mb={2}>
                      Distribuição por Tipo
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={dadosPizza} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
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