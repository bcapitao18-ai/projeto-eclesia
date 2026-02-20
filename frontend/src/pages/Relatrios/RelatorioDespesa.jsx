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
  Divider,
  TextField,
  Dialog,
  DialogContent,
  Stack,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import api from '../../api/axiosConfig';
import ListaDespesasCategorias from '../../components/ListaDespesasCategorias';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

export default function RelatorioDespesas() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [periodo, setPeriodo] = useState('mes');
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

    if (p === 'personalizado') {
      return {
        start: dataInicial,
        end: dataFinal,
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
        inicio = agora.startOf('month');
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

      const res = await api.get('/relatorio/despesas', {
        params: {
          startDate: start,
          endDate: end,
          tipo: tipo || undefined,
        },
      });

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
      console.error('Erro ao buscar relatório:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarRelatorio();
  }, []);

  const temDados = useMemo(() => categorias.length > 0, [categorias]);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      sx={{
        minHeight: '100vh',
        px: { xs: 1.5, sm: 2, md: 6 },
        py: { xs: 3, md: 6 },
        display: 'flex',
        justifyContent: 'center',
        background: `
          radial-gradient(circle at 0% 0%, rgba(239,68,68,0.12) 0%, transparent 40%),
          radial-gradient(circle at 100% 0%, rgba(220,38,38,0.12) 0%, transparent 40%),
          linear-gradient(180deg,#ffffff 0%, #fff5f5 100%)
        `,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1250 }}>
        {/* HEADER */}
        <Box mb={4}>
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={2}
            alignItems={isMobile ? 'flex-start' : 'center'}
          >
            <Avatar
              sx={{
                width: { xs: 55, md: 70 },
                height: { xs: 55, md: 70 },
                borderRadius: 4,
                fontSize: { xs: 24, md: 30 },
                background:
                  'linear-gradient(135deg,#7f1d1d,#dc2626,#ef4444)',
              }}
            >
              💎
            </Avatar>

            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  color: '#7f1d1d',
                  fontSize: { xs: 26, sm: 32, md: 42 },
                }}
              >
                Relatório de Despesas
              </Typography>

              <Typography
                sx={{
                  color: '#b91c1c',
                  fontWeight: 600,
                  fontSize: { xs: 14, md: 16 },
                }}
              >
                Análise financeira por categoria
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mt: 3, opacity: 0.4 }} />
        </Box>

        {/* CARD PRINCIPAL */}
        <MotionPaper
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: { xs: 4, md: 7 },
            background: '#ffffff',
            boxShadow: '0 40px 120px rgba(220,38,38,0.12)',
            border: '1px solid rgba(239,68,68,0.18)',
          }}
        >
          {/* FILTROS RESPONSIVOS */}
          <Stack
            direction={isMobile ? 'column' : 'row'}
            flexWrap="wrap"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            mb={4}
          >
            <FormControl sx={{ minWidth: 180, width: isMobile ? '100%' : 'auto' }}>
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
                <MenuItem value="personalizado">Personalizar</MenuItem>
              </Select>
            </FormControl>

            {periodo === 'personalizado' && (
              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={2}
                sx={{ width: isMobile ? '100%' : 'auto' }}
              >
                <TextField
                  fullWidth
                  label="Data Inicial"
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Data Final"
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            )}

            <FormControl sx={{ minWidth: 200, width: isMobile ? '100%' : 'auto' }}>
              <InputLabel>Tipo de Despesa</InputLabel>
              <Select
                value={tipo}
                label="Tipo de Despesa"
                onChange={(e) => setTipo(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="Fixa">Fixa</MenuItem>
                <MenuItem value="Variável">Variável</MenuItem>
              </Select>
            </FormControl>

            <Button
              fullWidth={isMobile}
              onClick={buscarRelatorio}
              sx={{
                px: 5,
                py: 1.4,
                borderRadius: 3,
                fontWeight: 900,
                color: '#fff',
                background:
                  'linear-gradient(135deg,#7f1d1d,#dc2626,#ef4444)',
              }}
            >
              Gerar Relatório
            </Button>
          </Stack>

          {/* TOTAL */}
          <Box textAlign="center" mb={4}>
            <Chip
              label={`Total no período: Kz ${total.toFixed(2)}`}
              sx={{
                fontWeight: 900,
                fontSize: { xs: 14, md: 17 },
                px: 3,
                py: 2,
                color: '#fff',
                borderRadius: 3,
                background:
                  'linear-gradient(135deg,#7f1d1d,#dc2626,#ef4444)',
              }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={50} sx={{ color: '#dc2626' }} />
            </Box>
          ) : !temDados ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#7f1d1d' }}>
                Nenhuma despesa encontrada
              </Typography>
            </Box>
          ) : (
            <>
              {/* MOBILE = CARDS (SEM TABELA) */}
              {isMobile ? (
                <Stack spacing={2}>
                  <AnimatePresence>
                    {categorias.map((cat, index) => (
                      <MotionCard
                        key={cat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        sx={{
                          borderRadius: 4,
                          border: '1px solid rgba(239,68,68,0.2)',
                          boxShadow: '0 20px 60px rgba(220,38,38,0.12)',
                        }}
                      >
                        <CardContent>
                          {/* CATEGORIA */}
                          <Typography
                            sx={{
                              fontWeight: 900,
                              fontSize: 18,
                              color: '#7f1d1d',
                              mb: 1,
                            }}
                          >
                            {cat.nome}
                          </Typography>

                          {/* BOTÃO LOGO ABAIXO DO NOME (COMO PEDISTE) */}
                          <Button
                            fullWidth
                            onClick={() => {
                              setCategoriaSelecionada(cat);
                              setOpenModal(true);
                            }}
                            sx={{
                              mb: 2,
                              fontWeight: 800,
                              borderRadius: 3,
                              color: '#fff',
                              background:
                                'linear-gradient(135deg,#7f1d1d,#dc2626,#ef4444)',
                            }}
                          >
                            Ver Despesas
                          </Button>

                          {/* DESCRIÇÃO */}
                          <Typography
                            sx={{ fontSize: 13, color: '#6b7280', mb: 1 }}
                          >
                            {cat.descricao || 'Sem descrição'}
                          </Typography>

                          {/* DADOS ORGANIZADOS PARA MOBILE */}
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            mt={1}
                          >
                            <Box>
                              <Typography
                                sx={{ fontSize: 12, color: '#9ca3af' }}
                              >
                                Quantidade
                              </Typography>
                              <Typography sx={{ fontWeight: 800 }}>
                                {cat.quantidadeDespesas || 0}
                              </Typography>
                            </Box>

                            <Box textAlign="right">
                              <Typography
                                sx={{ fontSize: 12, color: '#9ca3af' }}
                              >
                                Total (Kz)
                              </Typography>
                              <Typography
                                sx={{
                                  fontWeight: 900,
                                  color: '#b91c1c',
                                  fontSize: 16,
                                }}
                              >
                                {parseFloat(cat.totalDespesas || 0).toFixed(2)}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </MotionCard>
                    ))}
                  </AnimatePresence>
                </Stack>
              ) : (
                /* DESKTOP = TABELA NORMAL (INALTERADA) */
                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: 5,
                    border: '1px solid rgba(239,68,68,0.15)',
                    overflowX: 'auto',
                  }}
                >
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ background: '#fff1f2' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Categoria</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Descrição</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 900 }}>
                          Qtd Despesas
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900 }}>
                          Total (Kz)
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 900 }}>
                          Ações
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {categorias.map((cat) => (
                        <TableRow key={cat.id} hover>
                          <TableCell sx={{ fontWeight: 800, color: '#7f1d1d' }}>
                            {cat.nome}
                          </TableCell>
                          <TableCell>
                            {cat.descricao || '-'}
                          </TableCell>
                          <TableCell align="center">
                            {cat.quantidadeDespesas || 0}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 900, color: '#b91c1c' }}>
                            {parseFloat(cat.totalDespesas || 0).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              onClick={() => {
                                setCategoriaSelecionada(cat);
                                setOpenModal(true);
                              }}
                              sx={{
                                fontWeight: 800,
                                borderRadius: 3,
                                color: '#b91c1c',
                                border: '1px solid rgba(220,38,38,0.4)',
                                background: '#fff1f2',
                              }}
                            >
                              Ver Despesas
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </MotionPaper>

     {/* MODAL COM AÇÃO DE FECHAR (RESPONSIVO E PREMIUM) */}
<Dialog
  open={openModal}
  onClose={() => setOpenModal(false)}
  maxWidth="lg"
  fullWidth
  fullScreen={isMobile}
  PaperProps={{
    sx: {
      borderRadius: { xs: 0, md: 4 },
      overflow: 'hidden',
    },
  }}
>
  {/* HEADER DO MODAL COM BOTÃO FECHAR */}
  <Box
    sx={{
      px: { xs: 2, md: 3 },
      py: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background:
        'linear-gradient(135deg,#fff1f2,#ffe4e6)',
      borderBottom: '1px solid rgba(239,68,68,0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}
  >
    <Typography
      sx={{
        fontWeight: 900,
        fontSize: { xs: 16, md: 20 },
        color: '#7f1d1d',
        pr: 2,
      }}
    >
      Despesas da Categoria: {categoriaSelecionada?.nome || ''}
    </Typography>

    <Button
      onClick={() => setOpenModal(false)}
      sx={{
        fontWeight: 900,
        borderRadius: 2,
        minWidth: '40px',
        height: '40px',
        color: '#b91c1c',
        background: '#fff',
        border: '1px solid rgba(220,38,38,0.3)',
        '&:hover': {
          background: '#ffe4e6',
          transform: 'scale(1.05)',
        },
      }}
    >
      ✕
    </Button>
  </Box>

  {/* CONTEÚDO COM SCROLL INTERNO */}
  <DialogContent
    sx={{
      p: { xs: 2, md: 3 },
      overflowY: 'auto',
      maxHeight: { xs: '100vh', md: '80vh' },
      background: '#ffffff',
    }}
  >
    <ListaDespesasCategorias
      categoria={categoriaSelecionada}
      onClose={() => setOpenModal(false)}
    />
  </DialogContent>
</Dialog>
      </Box>
    </MotionBox>
  );
}