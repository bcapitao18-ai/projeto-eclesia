import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Modal,
  Divider,
  Avatar,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import api from "../api/axiosConfig";
import FormDespesa from "./FormDespesas";

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

export default function ListaDespesasCategoria({ categoria }) {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    despesaId: null,
  });

  const fetchDespesas = async () => {
    if (!categoria?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/categorias/${categoria.id}/despesas`);
      setDespesas(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDespesas();
  }, [categoria]);

  const handleDelete = async () => {
    try {
      await api.delete(`/despesas/${deleteConfirm.despesaId}`);
      setDeleteConfirm({ open: false, despesaId: null });
      fetchDespesas();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      sx={{
        minWidth: 560,
        maxHeight: "85vh",
        overflowY: "auto",
        p: 4,
        borderRadius: 7,
        background: `
          radial-gradient(circle at 0% 0%, rgba(124,58,237,0.08) 0%, transparent 40%),
          radial-gradient(circle at 100% 0%, rgba(139,92,246,0.08) 0%, transparent 40%),
          linear-gradient(180deg,#ffffff 0%, #faf7ff 100%)
        `,
        boxShadow: "0 70px 200px rgba(88,28,135,0.18)",
        border: "1px solid rgba(139,92,246,0.15)",
        backdropFilter: "blur(30px)",
      }}
    >
      {/* HEADER SURREAL LUXO */}
      <Box mb={4}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              borderRadius: 4,
              background:
                "linear-gradient(135deg,#6d28d9,#7c3aed,#8b5cf6)",
              boxShadow:
                "0 20px 60px rgba(124,58,237,0.45), inset 0 0 20px rgba(255,255,255,0.2)",
              fontSize: 26,
            }}
          >
            💎
          </Avatar>

          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                letterSpacing: "-1px",
                color: "#2e1065",
              }}
            >
              Despesas da Categoria
            </Typography>

            <Typography
              sx={{
                color: "#6b21a8",
                fontWeight: 600,
                mt: 0.5,
                fontSize: 15,
              }}
            >
              {categoria?.nome}
            </Typography>
          </Box>
        </Stack>

        <Divider
          sx={{
            mt: 3,
            opacity: 0.4,
            borderColor: "rgba(139,92,246,0.2)",
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress
            size={50}
            thickness={4}
            sx={{ color: "#7c3aed" }}
          />
        </Box>
      ) : (
        <Stack spacing={3}>
          <AnimatePresence>
            {despesas.map((despesa, index) => (
              <MotionPaper
                key={despesa.id}
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                sx={{
                  p: 3.2,
                  borderRadius: 5,
                  background: "#ffffff",
                  border: "1px solid rgba(139,92,246,0.12)",
                  boxShadow:
                    "0 25px 70px rgba(124,58,237,0.12)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow:
                      "0 35px 90px rgba(124,58,237,0.22)",
                  },
                }}
              >
                {/* BARRA SURREAL ROXA */}
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 6,
                    height: "100%",
                    background:
                      "linear-gradient(180deg,#6d28d9,#7c3aed,#8b5cf6)",
                    boxShadow:
                      "0 0 20px rgba(124,58,237,0.8)",
                  }}
                />

                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: 19,
                        color: "#1e1b4b",
                      }}
                    >
                      {despesa.descricao}
                    </Typography>

                    {despesa.observacao && (
                      <Typography
                        sx={{
                          fontSize: 14,
                          mt: 0.6,
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        {despesa.observacao}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <IconButton
                      onClick={() => {
                        setDespesaSelecionada(despesa);
                        setOpenEditModal(true);
                      }}
                      sx={{
                        background: "#f5f3ff",
                        border: "1px solid rgba(139,92,246,0.25)",
                        boxShadow:
                          "0 10px 30px rgba(124,58,237,0.2)",
                        "&:hover": {
                          transform: "scale(1.12)",
                          background: "#ede9fe",
                        },
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>

                    <IconButton
                      onClick={() =>
                        setDeleteConfirm({
                          open: true,
                          despesaId: despesa.id,
                        })
                      }
                      sx={{
                        background: "#faf5ff",
                        border: "1px solid rgba(124,58,237,0.25)",
                        boxShadow:
                          "0 10px 30px rgba(124,58,237,0.15)",
                        "&:hover": {
                          transform: "scale(1.12)",
                          background: "#f3e8ff",
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1} mt={3} flexWrap="wrap">
                  <Chip
                    label={`Kz ${Number(despesa.valor).toLocaleString(
                      "pt-AO",
                      { minimumFractionDigits: 2 }
                    )}`}
                    sx={{
                      fontWeight: 900,
                      color: "#fff",
                      background:
                        "linear-gradient(135deg,#6d28d9,#8b5cf6)",
                      borderRadius: 2.5,
                      boxShadow:
                        "0 10px 30px rgba(124,58,237,0.4)",
                    }}
                  />

                  <Chip
                    label={dayjs(despesa.data).format("DD/MM/YYYY")}
                    sx={{
                      background: "#f5f3ff",
                      fontWeight: 700,
                      color: "#5b21b6",
                      borderRadius: 2,
                    }}
                  />

                  <Chip
                    label={despesa.tipo}
                    sx={{
                      fontWeight: 800,
                      background: "#ede9fe",
                      color: "#4c1d95",
                      borderRadius: 2,
                    }}
                  />
                </Stack>
              </MotionPaper>
            ))}
          </AnimatePresence>
        </Stack>
      )}

      {/* MODAL EDITAR SURREAL PREMIUM */}
      <AnimatePresence>
        {openEditModal && (
          <Modal
            open
            onClose={() => setOpenEditModal(false)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(12px)",
              background: "rgba(76,29,149,0.15)",
              px: 2,
            }}
          >
            <MotionBox
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              sx={{
                width: "100%",
                maxWidth: 760,
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                borderRadius: 6,
                background: "#ffffff",
                boxShadow:
                  "0 80px 220px rgba(88,28,135,0.5)",
                overflow: "hidden",
                border: "1px solid rgba(139,92,246,0.25)",
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  borderBottom: "1px solid rgba(139,92,246,0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#faf7ff",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 19,
                    color: "#4c1d95",
                  }}
                >
                  Editar Despesa
                </Typography>

                <Button
                  onClick={() => setOpenEditModal(false)}
                  sx={{
                    minWidth: 38,
                    height: 38,
                    borderRadius: 2,
                    fontWeight: 900,
                    color: "#6d28d9",
                  }}
                >
                  ✕
                </Button>
              </Box>

              <Box
                sx={{
                  p: 3,
                  overflowY: "auto",
                  flex: 1,
                  "&::-webkit-scrollbar": { width: 8 },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#c4b5fd",
                    borderRadius: 8,
                  },
                }}
              >
                <FormDespesa
                  despesa={despesaSelecionada}
                  categoriaId={categoria?.id}
                  onSuccess={() => {
                    setOpenEditModal(false);
                    fetchDespesas();
                  }}
                  onCancel={() => setOpenEditModal(false)}
                />
              </Box>
            </MotionBox>
          </Modal>
        )}
      </AnimatePresence>

      {/* DIALOG DELETE PREMIUM */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() =>
          setDeleteConfirm({ open: false, despesaId: null })
        }
        PaperProps={{
          sx: {
            borderRadius: 5,
            boxShadow: "0 40px 120px rgba(88,28,135,0.35)",
            border: "1px solid rgba(139,92,246,0.25)",
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 900, color: "#4c1d95" }}
        >
          Confirmar exclusão
        </DialogTitle>
        <DialogContent sx={{ fontWeight: 500 }}>
          Deseja realmente excluir esta despesa?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeleteConfirm({
                open: false,
                despesaId: null,
              })
            }
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2,
              background:
                "linear-gradient(135deg,#6d28d9,#8b5cf6)",
              boxShadow:
                "0 15px 40px rgba(124,58,237,0.4)",
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </MotionBox>
  );
}