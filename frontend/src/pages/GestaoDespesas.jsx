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
  LinearProgress,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { Add, Edit, Delete, Visibility } from "@mui/icons-material";
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

  /* 🧠 FORMATADOR PROFISSIONAL DE MOEDA (KZ) */
  const formatKz = (valor) => {
    const numero = Number(valor || 0);
    return numero.toLocaleString("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

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

  const listItemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.98 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.06,
        duration: 0.6,
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
        background:
          "radial-gradient(circle at 20% 20%, #f0f9ff, #ffffff, #f8fafc)",
        px: { xs: 2, md: 6 },
        py: 6,
      }}
    >
      {/* HEADER */}
      <Stack spacing={3} mb={5}>
        <Paper sx={headerCard}>
          <Typography variant="h4" sx={titleSurreal}>
            Gestão de Despesas
          </Typography>

          <Typography sx={subtitleSurreal}>
            Painel de controlo de despesas!
          </Typography>
        </Paper>

        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Paper sx={kpiCard}>
            <Typography sx={kpiLabel}>TOTAL GERAL</Typography>
            <Typography sx={kpiValueNeon}>
              Kz {formatKz(totalGeral)}
            </Typography>
          </Paper>

          <Paper sx={kpiCard}>
            <Typography sx={kpiLabel}>CATEGORIAS</Typography>
            <Typography sx={kpiValue}>
              {categorias.length}
            </Typography>
          </Paper>

          <Paper sx={kpiCard}>
            <Typography sx={kpiLabel}>TOP CATEGORIA</Typography>
            <Typography sx={kpiValue}>
              {topCategoria?.nome || "—"}
            </Typography>
          </Paper>

          <Box sx={{ flex: 1 }} />

          <Button
            onClick={() => {
              setSelectedCategoria(null);
              setOpenModalCategoria(true);
            }}
            sx={btnNovaCategoria}
          >
            + Nova Categoria
          </Button>
        </Stack>
      </Stack>

      {/* LISTA */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
          <CircularProgress size={50} />
        </Box>
      ) : (
        <Stack spacing={3}>
          {categorias.map((categoria, idx) => {
            const totalCategoria = Number(categoria.totalDespesas || 0);
            const percent = totalGeral
              ? (totalCategoria / totalGeral) * 100
              : 0;

            return (
              <motion.div
                key={categoria.id}
                custom={idx}
                initial="hidden"
                animate="show"
                variants={listItemVariants}
              >
                <Paper sx={cardSurrealUltra}>
                  <Stack spacing={3}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ md: "center" }}
                      spacing={2}
                    >
                      <Box>
                        <Typography sx={nomeCategoria}>
                          {categoria.nome}
                        </Typography>

                        <Typography sx={descricaoCategoria}>
                          {categoria.descricao || "Sem descrição"}
                        </Typography>

                        {/* 🔥 TOTAL FORMATADO PROFISSIONAL */}
                        <Chip
                          label={`Kz ${formatKz(totalCategoria)}`}
                          sx={chipTotalSurreal}
                        />
                      </Box>

                      <Stack direction="row" spacing={1.5} flexWrap="wrap">
                        <Button
                          onClick={() => {
                            setCategoriaParaDespesa(categoria);
                            setOpenModalDespesa(true);
                          }}
                          sx={btnDespesaSurreal}
                        >
                          + Despesa
                        </Button>

                        <Button
                          onClick={() => {
                            setCategoriaParaLista(categoria);
                            setOpenModalLista(true);
                          }}
                          sx={btnGlass}
                          startIcon={<Visibility />}
                        >
                          Ver
                        </Button>

                        <Button
                          onClick={() => {
                            setSelectedCategoria(categoria);
                            setOpenModalCategoria(true);
                          }}
                          sx={btnGlass}
                          startIcon={<Edit />}
                        >
                          Editar
                        </Button>

                        <Button
                          onClick={() =>
                            setDeleteConfirm({
                              open: true,
                              categoriaId: categoria.id,
                            })
                          }
                          sx={btnDeleteSurreal}
                          startIcon={<Delete />}
                        >
                          Excluir
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      sx={barraSurreal}
                    />
                  </Stack>
                </Paper>
              </motion.div>
            );
          })}
        </Stack>
      )}

      {/* MODAIS (FUNCIONALIDADE 100% INTACTA) */}
      <Modal open={openModalCategoria} onClose={() => setOpenModalCategoria(false)}>
        <Box sx={modalWrapper}>
          <Paper sx={modalPaperScroll}>
            <Box sx={modalHeader}>
              <Typography fontWeight={800}>
                {selectedCategoria ? "Editar Categoria" : "Nova Categoria"}
              </Typography>
              <Button onClick={() => setOpenModalCategoria(false)}>Fechar</Button>
            </Box>

            <Box sx={modalBody}>
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

      <Modal open={openModalDespesa} onClose={() => setOpenModalDespesa(false)}>
        <Box sx={modalWrapper}>
          <Paper sx={modalPaperScroll}>
            <Box sx={modalHeader}>
              <Typography fontWeight={800}>
                Nova Despesa
              </Typography>
              <Button onClick={() => setOpenModalDespesa(false)}>Fechar</Button>
            </Box>

            <Box sx={modalBody}>
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

      <Modal open={openModalLista} onClose={() => setOpenModalLista(false)}>
        <Box sx={modalWrapper}>
          <Paper sx={modalPaperXLScroll}>
            <Box sx={modalHeader}>
              <Typography fontWeight={800}>
                Lista de Despesas
              </Typography>
              <Button onClick={() => setOpenModalLista(false)}>Fechar</Button>
            </Box>

            <Box sx={modalBody}>
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
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Esta ação não pode ser desfeita. Deseja excluir esta categoria?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, categoriaId: null })}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ===== ESTILOS ULTRA SURREAIS ===== */
/* ===== ESTILO SURREAL PREMIUM (ZERO GRADIENTES) ===== */

const headerCard = {
  p: 4,
  borderRadius: 5,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow: "0 25px 70px rgba(0,0,0,0.05)",
};

const titleSurreal = {
  fontWeight: 900,
  color: "#020617",
  letterSpacing: -0.5,
};

const subtitleSurreal = {
  color: "#64748b",
  fontWeight: 500,
};

const kpiCard = {
  p: 3,
  borderRadius: 4,
  background: "#ffffff",
  border: "1px solid #eef2f7",
  boxShadow: "0 15px 40px rgba(0,0,0,0.04)",
  minWidth: 180,
  transition: "all 0.25s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.06)",
  },
};

const kpiLabel = {
  fontSize: 12,
  color: "#94a3b8",
  fontWeight: 800,
  letterSpacing: 1.2,
};

const kpiValue = {
  fontSize: 26,
  fontWeight: 900,
  color: "#020617",
  mt: 1,
};

/* TOTAL GERAL SURREAL (SEM GRADIENTE) */
const kpiValueNeon = {
  fontSize: 28,
  fontWeight: 900,
  color: "#020617",
  mt: 1,
  textShadow: "0 4px 20px rgba(2,6,23,0.15)",
  letterSpacing: -0.5,
};

const cardSurrealUltra = {
  p: 4,
  borderRadius: 6,
  background: "#ffffff",
  border: "1px solid #eef2f7",
  boxShadow: "0 30px 80px rgba(2,6,23,0.06)",
  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 45px 120px rgba(2,6,23,0.08)",
    border: "1px solid #e2e8f0",
  },
};

const nomeCategoria = {
  fontSize: 22,
  fontWeight: 900,
  color: "#020617",
  letterSpacing: -0.3,
};

const descricaoCategoria = {
  fontSize: 14,
  color: "#64748b",
  mt: 0.5,
  mb: 1.5,
  fontWeight: 500,
};

/* 🔥 TOTAL DA CATEGORIA SURREAL (SEM GRADIENTE) */
const chipTotalSurreal = {
  fontWeight: 900,
  fontSize: 15,
  borderRadius: "999px",
  px: 2.2,
  py: 1,
  background: "#020617",
  color: "#ffffff",
  boxShadow: "0 12px 35px rgba(2,6,23,0.25)",
  letterSpacing: 0.3,
  border: "1px solid rgba(255,255,255,0.08)",
};

/* BARRA PREMIUM SEM GRADIENTE */
const barraSurreal = {
  height: 12,
  borderRadius: 999,
  backgroundColor: "#eef2f7",
  "& .MuiLinearProgress-bar": {
    borderRadius: 999,
    backgroundColor: "#020617",
    boxShadow: "0 4px 20px rgba(2,6,23,0.2)",
  },
};

const btnNovaCategoria = {
  height: 50,
  px: 4,
  borderRadius: "999px",
  fontWeight: 900,
  background: "#020617",
  color: "#fff",
  boxShadow: "0 10px 30px rgba(2,6,23,0.25)",
  "&:hover": {
    background: "#000000",
    transform: "translateY(-1px)",
  },
};

const btnDespesaSurreal = {
  borderRadius: "999px",
  px: 3,
  fontWeight: 800,
  background: "#16a34a",
  color: "#fff",
  boxShadow: "0 10px 25px rgba(22,163,74,0.35)",
  "&:hover": {
    background: "#15803d",
    transform: "translateY(-1px)",
  },
};

const btnGlass = {
  borderRadius: "999px",
  px: 2.5,
  fontWeight: 700,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  color: "#020617",
  "&:hover": {
    background: "#f8fafc",
  },
};

const btnDeleteSurreal = {
  borderRadius: "999px",
  px: 2.5,
  fontWeight: 800,
  background: "#ef4444",
  color: "#fff",
  boxShadow: "0 10px 25px rgba(239,68,68,0.35)",
  "&:hover": {
    background: "#dc2626",
  },
};

/* MODAL (já estava correto — mantive) */
const modalWrapper = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  p: 2,
};

const modalPaperScroll = {
  width: "100%",
  maxWidth: 720,
  maxHeight: "90vh",
  borderRadius: 5,
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 40px 120px rgba(2,6,23,0.15)",
};

const modalPaperXLScroll = {
  width: "100%",
  maxWidth: 1100,
  maxHeight: "90vh",
  borderRadius: 5,
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 40px 120px rgba(2,6,23,0.15)",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 18,
  borderBottom: "1px solid #eef2f7",
  position: "sticky",
  top: 0,
  background: "#ffffff",
  zIndex: 2,
};

const modalBody = {
  p: 3,
  overflowY: "auto",
};