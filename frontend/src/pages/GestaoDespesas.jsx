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
  Divider,
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
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.04,
        duration: 0.35,
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
          radial-gradient(circle at 0% 0%, #eef2ff 0%, transparent 35%),
          radial-gradient(circle at 100% 0%, #ecfeff 0%, transparent 35%),
          linear-gradient(180deg,#f8fafc 0%, #eef2f7 100%)
        `,
      }}
    >
      <Box sx={{ maxWidth: 1350, mx: "auto", pt: 6 }}>
        {/* HEADER LUXURY PREMIUM */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3.5, md: 5 },
            mb: 5,
            borderRadius: 5,
            background:
              "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: "1px solid #e2e8f0",
            boxShadow: "0 25px 70px rgba(15,23,42,0.08)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={4}
            alignItems={{ md: "center" }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    background:
                      "linear-gradient(135deg,#6366f1,#8b5cf6,#22c55e)",
                    boxShadow: "0 12px 30px rgba(99,102,241,0.35)",
                  }}
                >
                  <Diamond sx={{ fontSize: 30 }} />
                </Avatar>

                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: "-0.5px",
                      background:
                        "linear-gradient(90deg,#0f172a,#334155)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Gestão de Despesas
                  </Typography>

                  <Typography
                    sx={{ color: "#64748b", fontWeight: 500, mt: 0.5 }}
                  >
                    Painel luxuoso de categorias com análise financeira avançada
                  </Typography>
                </Box>
              </Stack>

              {/* KPIs PREMIUM */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Chip
                  icon={<TrendingUp />}
                  label={`Total Geral: Kz ${totalGeral.toFixed(2)}`}
                  sx={{
                    fontWeight: 800,
                    borderRadius: "999px",
                    background:
                      "linear-gradient(90deg,#6366f1,#818cf8)",
                    color: "#fff",
                    px: 1,
                  }}
                />
                <Chip
                  icon={<Star />}
                  label={`${categorias.length} Categorias`}
                  sx={{
                    fontWeight: 800,
                    borderRadius: "999px",
                    background:
                      "linear-gradient(90deg,#f59e0b,#fbbf24)",
                    color: "#fff",
                  }}
                />
                {topCategoria && (
                  <Chip
                    icon={<Paid />}
                    label={`Top Categoria: ${topCategoria.nome}`}
                    sx={{
                      fontWeight: 800,
                      borderRadius: "999px",
                      background:
                        "linear-gradient(90deg,#22c55e,#4ade80)",
                      color: "#fff",
                    }}
                  />
                )}
              </Stack>
            </Stack>

            <Button
              startIcon={<Add />}
              onClick={() => setOpenModalCategoria(true)}
              sx={{
                borderRadius: "999px",
                px: 3,
                height: 42,
                fontWeight: 800,
                textTransform: "none",
                background:
                  "linear-gradient(135deg,#6366f1,#4f46e5)",
                color: "#fff",
                boxShadow: "0 12px 30px rgba(79,70,229,0.35)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 18px 40px rgba(79,70,229,0.45)",
                },
              }}
            >
              Nova Categoria
            </Button>
          </Stack>
        </Paper>

        {/* GRÁFICO LUXUOSO CLARO */}
        {!loading && categorias.length > 0 && (
          <Paper
            sx={{
              p: 4,
              mb: 5,
              borderRadius: 5,
              background:
                "linear-gradient(135deg,#ffffff,#f8fafc)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 60px rgba(15,23,42,0.06)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "#0f172a", mb: 3 }}
            >
              Análise de Despesas por Categoria
            </Typography>

            <Box sx={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="nome" stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar
                    dataKey="total"
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
            <CircularProgress size={50} thickness={4} />
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
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      borderRadius: 4,
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 30px rgba(15,23,42,0.04)",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
                      },
                    }}
                  >
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
                          sx={{ color: "#64748b", mt: 0.5, fontWeight: 500 }}
                        >
                          {categoria.descricao || "Categoria financeira premium."}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1.5}
                          mt={2}
                          flexWrap="wrap"
                        >
                          <Chip
                            label={`Total: Kz ${Number(
                              categoria.totalDespesas || 0
                            ).toFixed(2)}`}
                            sx={{
                              fontWeight: 800,
                              borderRadius: "999px",
                              background:
                                "linear-gradient(90deg,#eef2ff,#e0e7ff)",
                              color: "#3730a3",
                            }}
                          />
                          <Chip
                            label={`Criada: ${
                              categoria.createdAt
                                ? dayjs(categoria.createdAt).format("DD/MM/YYYY")
                                : "-"
                            }`}
                            variant="outlined"
                            sx={{ fontWeight: 600, borderRadius: "999px" }}
                          />
                        </Stack>

                        <Box mt={2.2}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            mb={0.5}
                          >
                            <Typography
                              sx={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}
                            >
                              Peso no total
                            </Typography>
                            <Typography
                              sx={{ fontSize: 12, fontWeight: 700, color: "#334155" }}
                            >
                              {percent.toFixed(1)}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{
                              height: 8,
                              borderRadius: 6,
                              backgroundColor: "#e2e8f0",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 6,
                                background:
                                  "linear-gradient(90deg,#6366f1,#22c55e)",
                              },
                            }}
                          />
                        </Box>
                      </Box>

                      {/* BOTÕES LUXO COMPACTOS */}
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        justifyContent="flex-end"
                      >
                        <Button
                          size="small"
                          startIcon={<Add />}
                          onClick={() => {
                            setCategoriaParaDespesa(categoria);
                            setOpenModalDespesa(true);
                          }}
                          sx={{
                            height: 34,
                            px: 2,
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: "none",
                            background:
                              "linear-gradient(135deg,#22c55e,#4ade80)",
                            color: "#fff",
                            boxShadow: "0 6px 18px rgba(34,197,94,0.25)",
                          }}
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
                          sx={{
                            height: 34,
                            px: 2,
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: "none",
                            borderColor: "#cbd5f5",
                          }}
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
                          sx={{
                            height: 34,
                            px: 2,
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: "none",
                          }}
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
                          sx={{
                            minWidth: 34,
                            height: 34,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg,#ef4444,#dc2626)",
                            color: "#fff",
                          }}
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

        {/* MODAIS PREMIUM CLAROS */}
    {/* ========================= MODAIS PREMIUM FIXED ========================= */}

{/* MODAL CATEGORIA */}
<Modal
  open={openModalCategoria}
  onClose={() => setOpenModalCategoria(false)}
>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backdropFilter: "blur(6px)",
      px: 2,
    }}
  >
    <Paper
      sx={{
        width: "100%",
        maxWidth: 620,
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: 4,
        p: 0,
        boxShadow: "0 40px 120px rgba(0,0,0,0.25)",
      }}
    >
      {/* HEADER PREMIUM */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Typography sx={{ fontWeight: 900 }}>
          {selectedCategoria ? "Editar Categoria" : "Nova Categoria"}
        </Typography>

        <Button
          onClick={() => setOpenModalCategoria(false)}
          sx={{
            minWidth: 32,
            height: 32,
            borderRadius: 2,
            fontWeight: 900,
          }}
        >
          ✕
        </Button>
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


{/* MODAL DESPESA */}
<Modal
  open={openModalDespesa}
  onClose={() => setOpenModalDespesa(false)}
>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backdropFilter: "blur(6px)",
      px: 2,
    }}
  >
    <Paper
      sx={{
        width: "100%",
        maxWidth: 720,
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: 4,
        p: 0,
        boxShadow: "0 40px 120px rgba(0,0,0,0.25)",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Typography sx={{ fontWeight: 900 }}>
          Nova Despesa
        </Typography>

        <Button
          onClick={() => setOpenModalDespesa(false)}
          sx={{
            minWidth: 32,
            height: 32,
            borderRadius: 2,
            fontWeight: 900,
          }}
        >
          ✕
        </Button>
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


{/* MODAL LISTA */}
<Modal
  open={openModalLista}
  onClose={() => setOpenModalLista(false)}
>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backdropFilter: "blur(6px)",
      px: 2,
    }}
  >
    <Paper
      sx={{
        width: "100%",
        maxWidth: 1000,
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: 4,
        p: 0,
        boxShadow: "0 50px 140px rgba(0,0,0,0.3)",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Typography sx={{ fontWeight: 900 }}>
          Lista de Despesas
        </Typography>

        <Button
          onClick={() => setOpenModalLista(false)}
          sx={{
            minWidth: 32,
            height: 32,
            borderRadius: 2,
            fontWeight: 900,
          }}
        >
          ✕
        </Button>
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


        <Dialog
          open={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, categoriaId: null })}
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
            },
          }}
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
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
            >
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}