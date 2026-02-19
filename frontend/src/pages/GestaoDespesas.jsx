import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Stack,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  LinearProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Paid,
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  Star,
  Diamond,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import dayjs from "dayjs";
import api from "../api/axiosConfig";
import FormCategorias from "../components/FormCategorias";
import FormDespesa from "../components/FormDespesas";
import ListaDespesasCategorias from "../components/ListaDespesasCategorias";

export default function ListaCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openModalCategoria, setOpenModalCategoria] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const [openModalDespesa, setOpenModalDespesa] = useState(false);
  const [categoriaParaDespesa, setCategoriaParaDespesa] = useState(null);

  const [openModalLista, setOpenModalLista] = useState(false);
  const [categoriaParaLista, setCategoriaParaLista] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    categoriaId: null,
  });

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categorias/despesas");
      setCategorias(res.data.data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const totalGeral = useMemo(() => {
    return categorias.reduce(
      (acc, cat) => acc + Number(cat.totalDespesas || 0),
      0
    );
  }, [categorias]);

  const topCategoria = useMemo(() => {
    if (!categorias.length) return null;
    return [...categorias].sort(
      (a, b) => (b.totalDespesas || 0) - (a.totalDespesas || 0)
    )[0];
  }, [categorias]);

  const chartData = useMemo(() => {
    return categorias.map((c) => ({
      nome: c.nome,
      total: Number(c.totalDespesas || 0),
    }));
  }, [categorias]);

  const listItemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/categorias/${deleteConfirm.categoriaId}`);
      setDeleteConfirm({ open: false, categoriaId: null });
      fetchCategorias();
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 10,
        px: { xs: 2, md: 5 },
        background: `
          radial-gradient(circle at 0% 0%, #eef2ff 0%, transparent 40%),
          radial-gradient(circle at 100% 0%, #f0f9ff 0%, transparent 40%),
          linear-gradient(180deg,#f8fafc 0%, #eef2f7 100%)
        `,
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto", pt: 6 }}>
        {/* HEADER PREMIUM SURREAL */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            mb: 5,
            borderRadius: 6,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid #e2e8f0",
            boxShadow: "0 40px 120px rgba(15,23,42,0.12)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={4}
            alignItems={{ md: "center" }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: 4,
                    background:
                      "linear-gradient(135deg,#6366f1,#8b5cf6,#22c55e)",
                    boxShadow: "0 20px 60px rgba(99,102,241,0.4)",
                  }}
                >
                  <Diamond sx={{ fontSize: 34 }} />
                </Avatar>

                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: "-1px",
                      background:
                        "linear-gradient(90deg,#0f172a,#334155,#6366f1)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Gestão de Despesas
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      fontWeight: 600,
                      mt: 1,
                    }}
                  >
                    Painel financeiro premium com análise inteligente
                  </Typography>
                </Box>
              </Stack>

              {/* KPIs (MESMA LÓGICA PRESERVADA) */}
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  icon={<TrendingUp />}
                  label={`Total Geral: Kz ${totalGeral.toFixed(2)}`}
                  sx={kpiPrimary}
                />
                <Chip
                  icon={<Star />}
                  label={`${categorias.length} Categorias`}
                  sx={kpiGold}
                />
                {topCategoria && (
                  <Chip
                    icon={<Paid />}
                    label={`Top Categoria: ${topCategoria.nome}`}
                    sx={kpiSuccess}
                  />
                )}
              </Stack>
            </Stack>

            {/* BOTÃO ORIGINAL (LÓGICA INTACTA) */}
            <Button
              startIcon={<Add />}
              onClick={() => setOpenModalCategoria(true)}
              sx={mainButton}
            >
              Nova Categoria
            </Button>
          </Stack>
        </Paper>

        {/* GRÁFICO (LÓGICA ORIGINAL) */}
        {!loading && categorias.length > 0 && (
          <Paper sx={chartPaper}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 900, color: "#0f172a", mb: 3 }}
            >
              Análise de Despesas por Categoria
            </Typography>

            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="nome" stroke="#64748b" />
                  <Tooltip />
                  <Bar
                    dataKey="total"
                    fill="#6366f1"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
            <CircularProgress size={55} />
          </Box>
        ) : (
          <Stack spacing={3}>
            {categorias.map((categoria, idx) => {
              const percent = totalGeral
                ? ((categoria.totalDespesas || 0) / totalGeral) * 100
                : 0;

              return (
                <motion.div
                  key={categoria.id}
                  custom={idx}
                  initial="hidden"
                  animate="show"
                  variants={listItemVariants}
                >
                  <Paper sx={cardPremium}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      spacing={3}
                      alignItems={{ md: "center" }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 900, color: "#0f172a" }}
                        >
                          {categoria.nome}
                        </Typography>

                        <Typography
                          sx={{
                            color: "#64748b",
                            mt: 0.5,
                            fontWeight: 500,
                          }}
                        >
                          {categoria.descricao ||
                            "Categoria financeira premium."}
                        </Typography>

                        {/* PROGRESS (MESMA LÓGICA) */}
                        <Box mt={2.5}>
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={progressStyle}
                          />
                        </Box>
                      </Box>

                      {/* TODOS OS BOTÕES ORIGINAIS PRESERVADOS */}
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                          size="small"
                          startIcon={<Add />}
                          onClick={() => {
                            setCategoriaParaDespesa(categoria);
                            setOpenModalDespesa(true);
                          }}
                          sx={btnSuccess}
                        >
                          Despesa
                        </Button>

                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => {
                            setCategoriaParaLista(categoria);
                            setOpenModalLista(true);
                          }}
                          variant="outlined"
                          sx={btnOutline}
                        >
                          Ver
                        </Button>

                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => {
                            setSelectedCategoria(categoria);
                            setOpenModalCategoria(true);
                          }}
                          variant="outlined"
                          sx={btnOutline}
                        >
                          Editar
                        </Button>

                        <Button
                          size="small"
                          onClick={() =>
                            setDeleteConfirm({
                              open: true,
                              categoriaId: categoria.id,
                            })
                          }
                          sx={btnDelete}
                        >
                          <Delete fontSize="small" />
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                </motion.div>
              );
            })}
          </Stack>
        )}

        {/* MODAL CATEGORIA (100% ORIGINAL) */}
        <Modal
          open={openModalCategoria}
          onClose={() => setOpenModalCategoria(false)}
        >
          <Box sx={modalWrapper}>
            <Paper sx={modalPaper}>
              <Box sx={modalHeader}>
                <Typography sx={{ fontWeight: 900 }}>
                  {selectedCategoria ? "Editar Categoria" : "Nova Categoria"}
                </Typography>
                <Button onClick={() => setOpenModalCategoria(false)}>✕</Button>
              </Box>

              <Box sx={{ p: 3 }}>
                <FormCategorias
                  categoria={selectedCategoria}
                  onSuccess={() => {
                    setOpenModalCategoria(false);
                    fetchCategorias();
                  }}
                  onCancel={() => setOpenModalCategoria(false)}
                />
              </Box>
            </Paper>
          </Box>
        </Modal>

        {/* MODAL DESPESA (CRÍTICO - PRESERVADO) */}
        <Modal
          open={openModalDespesa}
          onClose={() => setOpenModalDespesa(false)}
        >
          <Box sx={modalWrapper}>
            <Paper sx={modalPaperLarge}>
              <Box sx={modalHeader}>
                <Typography sx={{ fontWeight: 900 }}>
                  Nova Despesa
                </Typography>
                <Button onClick={() => setOpenModalDespesa(false)}>✕</Button>
              </Box>

              <Box sx={{ p: 3 }}>
                <FormDespesa
                  categoriaId={categoriaParaDespesa?.id}
                  onSuccess={() => {
                    setOpenModalDespesa(false);
                    fetchCategorias();
                  }}
                  onCancel={() => setOpenModalDespesa(false)}
                />
              </Box>
            </Paper>
          </Box>
        </Modal>

        {/* MODAL LISTA (PRESERVADO) */}
        <Modal
          open={openModalLista}
          onClose={() => setOpenModalLista(false)}
        >
          <Box sx={modalWrapper}>
            <Paper sx={modalPaperXL}>
              <Box sx={modalHeader}>
                <Typography sx={{ fontWeight: 900 }}>
                  Lista de Despesas
                </Typography>
                <Button onClick={() => setOpenModalLista(false)}>✕</Button>
              </Box>

              <Box sx={{ p: 3 }}>
                <ListaDespesasCategorias
                  categoria={categoriaParaLista}
                  onClose={() => setOpenModalLista(false)}
                />
              </Box>
            </Paper>
          </Box>
        </Modal>

        {/* DIALOG DELETE (MESMA LÓGICA) */}
        <Dialog
          open={deleteConfirm.open}
          onClose={() =>
            setDeleteConfirm({ open: false, categoriaId: null })
          }
        >
          <DialogTitle sx={{ fontWeight: 900 }}>
            Confirmar Exclusão
          </DialogTitle>
          <DialogContent>
            Esta ação não pode ser desfeita. Deseja excluir esta categoria?
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setDeleteConfirm({ open: false, categoriaId: null })
              }
            >
              Cancelar
            </Button>
            <Button color="error" variant="contained" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

/* ===== STYLES ULTRA PREMIUM ===== */
const mainButton = {
  borderRadius: "999px",
  px: 4,
  height: 48,
  fontWeight: 900,
  textTransform: "none",
  background: "linear-gradient(135deg,#6366f1,#4f46e5)",
  color: "#fff",
  boxShadow: "0 20px 60px rgba(79,70,229,0.4)",
};

const chartPaper = {
  p: 4,
  mb: 5,
  borderRadius: 5,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 20px 60px rgba(15,23,42,0.06)",
};

const cardPremium = {
  p: { xs: 3, md: 4 },
  borderRadius: 4,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 40px rgba(15,23,42,0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 25px 70px rgba(15,23,42,0.1)",
  },
};

const progressStyle = {
  height: 8,
  borderRadius: 6,
  backgroundColor: "#e2e8f0",
  "& .MuiLinearProgress-bar": {
    borderRadius: 6,
    background: "linear-gradient(90deg,#6366f1,#22c55e)",
  },
};

const btnSuccess = {
  height: 34,
  px: 2,
  borderRadius: 2,
  fontWeight: 700,
  textTransform: "none",
  background: "linear-gradient(135deg,#22c55e,#4ade80)",
  color: "#fff",
};

const btnOutline = {
  height: 34,
  px: 2,
  borderRadius: 2,
  fontWeight: 700,
  textTransform: "none",
};

const btnDelete = {
  minWidth: 34,
  height: 34,
  borderRadius: 2,
  background: "linear-gradient(135deg,#ef4444,#dc2626)",
  color: "#fff",
};

const kpiPrimary = {
  fontWeight: 800,
  borderRadius: "999px",
  background: "linear-gradient(90deg,#6366f1,#818cf8)",
  color: "#fff",
};

const kpiGold = {
  fontWeight: 800,
  borderRadius: "999px",
  background: "linear-gradient(90deg,#f59e0b,#fbbf24)",
  color: "#fff",
};

const kpiSuccess = {
  fontWeight: 800,
  borderRadius: "999px",
  background: "linear-gradient(90deg,#22c55e,#4ade80)",
  color: "#fff",
};

const modalWrapper = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  backdropFilter: "blur(6px)",
  px: 2,
};

const modalPaper = {
  width: "100%",
  maxWidth: 620,
  borderRadius: 4,
};

const modalPaperLarge = {
  width: "100%",
  maxWidth: 720,
  borderRadius: 4,
};

const modalPaperXL = {
  width: "100%",
  maxWidth: 1000,
  borderRadius: 4,
};

const modalHeader = {
  px: 3,
  py: 2,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #e2e8f0",
};