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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        minWidth: 540,
        maxHeight: "85vh",
        overflowY: "auto",
        p: 4,
        borderRadius: 5,
        background:
          "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* HEADER */}
      <Box mb={4}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            letterSpacing: "-1px",
            color: "#0f172a",
          }}
        >
          Despesas
        </Typography>

        <Typography
          sx={{
            color: "#64748b",
            fontWeight: 500,
            mt: 1,
          }}
        >
          Categoria:{" "}
          <span style={{ color: "#111827", fontWeight: 700 }}>
            {categoria?.nome}
          </span>
        </Typography>

        <Divider sx={{ mt: 3, opacity: 0.5 }} />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : (
        <Stack spacing={3}>
          <AnimatePresence>
            {despesas.map((despesa, index) => (
              <MotionPaper
                key={despesa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                }}
                whileHover={{
                  scale: 1.02,
                  y: -4,
                }}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: "#ffffff",
                  border: "1px solid #eef2f7",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.05)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* BARRA PREMIUM */}
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 5,
                    height: "100%",
                    background:
                      "linear-gradient(180deg,#6366f1,#8b5cf6)",
                  }}
                />

                <Box
                  display="flex"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 18,
                        color: "#111827",
                      }}
                    >
                      {despesa.descricao}
                    </Typography>

                    {despesa.observacao && (
                      <Typography
                        sx={{
                          fontSize: 14,
                          mt: 0.5,
                          color: "#6b7280",
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
                        background:
                          "linear-gradient(135deg,#eef2ff,#e0e7ff)",
                        "&:hover": {
                          scale: 1.1,
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
                        background:
                          "linear-gradient(135deg,#fff1f2,#ffe4e6)",
                        "&:hover": {
                          scale: 1.1,
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>

                {/* CHIPS PREMIUM */}
                <Stack
                  direction="row"
                  spacing={1}
                  mt={3}
                  flexWrap="wrap"
                >
                  <Chip
                    label={`Kz ${Number(
                      despesa.valor
                    ).toLocaleString("pt-AO", {
                      minimumFractionDigits: 2,
                    })}`}
                    sx={{
                      fontWeight: 800,
                      background:
                        "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      color: "#fff",
                      borderRadius: 2,
                    }}
                  />

                  <Chip
                    label={dayjs(despesa.data).format(
                      "DD/MM/YYYY"
                    )}
                    sx={{
                      background: "#f1f5f9",
                      fontWeight: 600,
                    }}
                  />

                  <Chip
                    label={despesa.tipo}
                    sx={{
                      fontWeight: 700,
                      background:
                        despesa.tipo === "Fixa"
                          ? "#dcfce7"
                          : "#fef3c7",
                    }}
                  />
                </Stack>
              </MotionPaper>
            ))}
          </AnimatePresence>
        </Stack>
      )}

      {/* MODAL ULTRA PREMIUM */}
      <AnimatePresence>
        {openEditModal && (
          <Modal open onClose={() => setOpenEditModal(false)}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              sx={{
                p: 4,
                borderRadius: 5,
                m: "auto",
                mt: "4%",
                width: "95%",
                maxWidth: 650,
                background:
                  "linear-gradient(145deg,#ffffff,#f8fafc)",
                boxShadow:
                  "0 40px 100px rgba(0,0,0,0.2)",
              }}
            >
              <FormDespesa
                despesa={despesaSelecionada}
                categoriaId={categoria?.id}
                onSuccess={() => {
                  setOpenEditModal(false);
                  fetchDespesas();
                }}
                onCancel={() =>
                  setOpenEditModal(false)
                }
              />
            </MotionBox>
          </Modal>
        )}
      </AnimatePresence>

      {/* DELETE DIALOG */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() =>
          setDeleteConfirm({ open: false, despesaId: null })
        }
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Confirmar exclusão
        </DialogTitle>
        <DialogContent>
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
          >
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </MotionBox>
  );
}
