// RELATÓRIO DE CONTRIBUIÇÕES - ESTILO SURREAL PREMIUM (ALINHADO COM A TUA PÁGINA)
// ATUALIZADO: FOTO + CHIPS + MESES FIXOS (SEM REMOVER NADA)

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
  Autocomplete,
  Stack,
  Chip,
  Avatar,
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

  const cores = ['#020617', '#334155', '#64748b', '#94a3b8', '#cbd5f5', '#e2e8f0'];

  const { months, tableRows } = useMemo(() => {
    if (!startDate || !endDate) return { months: [], tableRows: [] };

    const monthsArr = buildMonthsArray(startDate, endDate);
    const mapa = {};

    function ensureMemberEntry(memberKey, memberName, foto) {
      if (!mapa[memberKey]) {
        mapa[memberKey] = {
          memberId: memberKey === 'SEM' ? null : memberKey,
          nome: memberName || (memberKey === 'SEM' ? 'Sem Membro' : 'Desconhecido'),
          foto: foto || null,
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
      const foto = membro ? membro.foto || membro.fotoUrl || null : null;

      ensureMemberEntry(memberKey, memberName, foto);

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
      theme: 'grid',
      margin: { left: 20, right: 20 },
    });

    doc.save('relatorio.pdf');
  };

  return (
    <Box sx={pageWrapper}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <Paper sx={headerCard}>
          <Typography variant="h4" sx={titleSurreal}>
            Relatório de Contribuições
          </Typography>
          <Typography sx={subtitleSurreal}>
            Análise detalhada por membro e por mês
          </Typography>
        </Paper>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 3, mb: 4 }}>
          <Paper sx={kpiCard}>
            <Typography sx={kpiLabel}>TOTAL ARRECADADO</Typography>
            <Typography sx={kpiValueNeon}>{formatCurrency(total)}</Typography>
          </Paper>

          <Paper sx={kpiCard}>
            <Typography sx={kpiLabel}>REGISTROS</Typography>
            <Typography sx={kpiValue}>{contribuicoes.length}</Typography>
          </Paper>
        </Stack>

        <Paper sx={cardSurreal}>
          <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="center">
            <TextField
              label="Data Inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 170 }}
            />

            <TextField
              label="Data Final"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 170 }}
            />

            <FormControl sx={{ minWidth: 220 }}>
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

            <Autocomplete
              options={membros}
              getOptionLabel={(m) => m?.nome || ''}
              value={membros.find((m) => m.id === membroId) || null}
              onChange={(e, value) => setMembroId(value ? value.id : '')}
              sx={{ minWidth: 260 }}
              renderInput={(params) => (
                <TextField {...params} label="Membro" placeholder="Pesquisar membro..." />
              )}
            />

            <Button startIcon={<FilterAlt />} onClick={buscarRelatorio} sx={btnPrimary}>
              Gerar Relatório
            </Button>

            <Button
              startIcon={<PictureAsPdf />}
              onClick={exportarPDF}
              disabled={!tableRows.length}
              sx={btnGlass}
            >
              Exportar PDF
            </Button>
          </Stack>
        </Paper>

        <Paper sx={cardSurreal}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress size={45} />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...tableHead, position: 'sticky', left: 0, zIndex: 3 }}>
                      Membro
                    </TableCell>

                    {months.map((m) => (
                      <TableCell key={m} align="center" sx={tableHead}>
                        {monthLabelFromKey(m)}
                      </TableCell>
                    ))}

                    <TableCell align="right" sx={tableHead}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tableRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2 + months.length} align="center">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    tableRows.map((r) => (
                      <TableRow key={r.memberId || r.nome} hover>
                        <TableCell sx={{ position: 'sticky', left: 0, background: '#fff' }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              src={r.foto || '/avatar.png'}
                              alt={r.nome}
                              sx={{ width: 48, height: 48 }}
                            />
                            <Box>
                              <Typography fontWeight={800}>{r.nome}</Typography>
                              <Chip
                                label={formatCurrency(r.total)}
                                sx={{
                                  mt: 1,
                                  fontWeight: 900,
                                  borderRadius: '999px',
                                  background: r.total > 0 ? '#16a34a' : '#dc2626',
                                  color: '#fff',
                                }}
                              />
                            </Box>
                          </Stack>
                        </TableCell>

                        {months.map((m) => (
                          <TableCell key={m} align="right">
                            <Chip
                              label={formatCurrency(r.months[m] || 0)}
                              sx={{
                                fontWeight: 800,
                                background: '#020617',
                                color: '#ffffff',
                                borderRadius: '999px',
                              }}
                            />
                          </TableCell>
                        ))}

                        <TableCell align="right">
                          <Typography fontWeight={900}>
                            {formatCurrency(r.total)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
}

/* ESTILOS ORIGINAIS MANTIDOS */
const pageWrapper = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at 20% 20%, #f0f9ff, #ffffff, #f8fafc)',
  px: { xs: 2, md: 6 },
  py: 6,
};

const headerCard = {
  p: 4,
  borderRadius: 5,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 25px 70px rgba(0,0,0,0.05)',
};

const titleSurreal = {
  fontWeight: 900,
  color: '#020617',
};

const subtitleSurreal = {
  color: '#64748b',
  fontWeight: 500,
  mt: 1,
};

const kpiCard = {
  p: 3,
  borderRadius: 4,
  background: '#ffffff',
  border: '1px solid #eef2f7',
};

const kpiLabel = {
  fontSize: 12,
  color: '#94a3b8',
  fontWeight: 800,
};

const kpiValue = {
  fontSize: 26,
  fontWeight: 900,
  color: '#020617',
};

const kpiValueNeon = {
  fontSize: 28,
  fontWeight: 900,
  color: '#020617',
};

const cardSurreal = {
  p: 4,
  borderRadius: 5,
  background: '#ffffff',
  border: '1px solid #eef2f7',
  mb: 4,
};

const btnPrimary = {
  borderRadius: '999px',
  px: 4,
  fontWeight: 900,
  background: '#020617',
  color: '#fff',
};

const btnGlass = {
  borderRadius: '999px',
  px: 3,
  fontWeight: 700,
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  color: '#020617',
};

const tableHead = {
  fontWeight: 900,
  color: '#020617',
  background: '#f8fafc',
};