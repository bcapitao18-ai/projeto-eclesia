import React, { useEffect, useState } from "react";
import axios from "../../api/axiosConfig";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Modal,
  Button,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import { Edit, Delete, Add, Church, Diamond } from "@mui/icons-material";
import { motion } from "framer-motion";

// Importando componente
import FormCultos from "../../components/FormTipoCulto";

const TiposCultos = () => {
  const [tiposCultos, setTiposCultos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTipoCulto, setSelectedTipoCulto] = useState(null);
  const [error, setError] = useState(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [tipoToDelete, setTipoToDelete] = useState(null);

  useEffect(() => {
    const fetchTiposCultos = async () => {
      try {
        const response = await axios.get("/tabela-cultos1");
        setTiposCultos(response.data || []);
      } catch (error) {
        console.error("Erro ao buscar tipos de cultos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTiposCultos();
  }, []);

  const handleEdit = (tipo) => {
    setSelectedTipoCulto(tipo);
    setOpenModal(true);
  };

  const handleDelete = async () => {
    if (!tipoToDelete) return;
    try {
      await axios.delete(`/tipocultos/${tipoToDelete.id}`);
      setTiposCultos((prev) =>
        prev.filter((t) => t.id !== tipoToDelete.id)
      );
      setError(null);
      setOpenConfirmDelete(false);
    } catch (error) {
      setError("Erro ao excluir o tipo de culto.");
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTipoCulto(null);
  };

  const handleConfirmDelete = (tipo) => {
    setTipoToDelete(tipo);
    setOpenConfirmDelete(true);
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDelete(false);
    setTipoToDelete(null);
  };

  const handleNewTipoCultoAdded = (newTipoCulto) => {
    setTiposCultos((prev) => {
      const exists = prev.find((t) => t.id === newTipoCulto.id);
      return exists
        ? prev.map((t) =>
            t.id === newTipoCulto.id ? newTipoCulto : t
          )
        : [newTipoCulto, ...prev];
    });
    setOpenModal(false);
    setSelectedTipoCulto(null);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.06,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 5 },
        py: 6,
        background: `
          radial-gradient(circle at 0% 0%, #eef2ff 0%, transparent 40%),
          radial-gradient(circle at 100% 0%, #f5f3ff 0%, transparent 40%),
          linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)
        `,
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        {/* HEADER LUXUOSO */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 5,
            borderRadius: 5,
            background:
              "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: "1px solid #e2e8f0",
            boxShadow: "0 25px 70px rgba(15,23,42,0.08)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={3}
            alignItems={{ md: "center" }}
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
                  boxShadow: "0 15px 40px rgba(99,102,241,0.35)",
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
                  Tipos de Cultos
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontWeight: 500,
                    mt: 0.5,
                  }}
                >
                  Gestão elegante dos tipos de cultos da igreja
                </Typography>
              </Box>
            </Stack>

            <Button
              startIcon={<Add />}
              onClick={() => setOpenModal(true)}
              sx={{
                borderRadius: "999px",
                px: 3.5,
                height: 44,
                fontWeight: 800,
                textTransform: "none",
                background:
                  "linear-gradient(135deg,#6366f1,#4f46e5)",
                color: "#fff",
                boxShadow: "0 15px 35px rgba(79,70,229,0.35)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow:
                    "0 20px 45px rgba(79,70,229,0.45)",
                  background:
                    "linear-gradient(135deg,#4f46e5,#4338ca)",
                },
              }}
            >
              Criar Novo Tipo de Culto
            </Button>
          </Stack>

          <Stack direction="row" spacing={1.5} mt={3} flexWrap="wrap">
            <Chip
              icon={<Church />}
              label={`${tiposCultos.length} Tipos cadastrados`}
              sx={{
                fontWeight: 700,
                borderRadius: "999px",
                background:
                  "linear-gradient(90deg,#e0e7ff,#c7d2fe)",
                color: "#3730a3",
              }}
            />
          </Stack>
        </Paper>

        {/* LOADING */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              pt: 10,
            }}
          >
            <CircularProgress size={50} thickness={4} />
          </Box>
        ) : (
          <Stack spacing={3}>
            {tiposCultos.length === 0 ? (
              <Paper
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#334155" }}
                >
                  Nenhum tipo de culto disponível
                </Typography>
              </Paper>
            ) : (
              tiposCultos.map((tipo, index) => (
                <motion.div
                  key={tipo.id}
                  custom={index}
                  initial="hidden"
                  animate="show"
                  variants={cardVariants}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      borderRadius: 4,
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      boxShadow:
                        "0 10px 35px rgba(15,23,42,0.05)",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow:
                          "0 25px 60px rgba(15,23,42,0.10)",
                      },
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      spacing={2}
                      alignItems={{ md: "center" }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 900,
                            color: "#0f172a",
                          }}
                        >
                          {tipo.nome}
                        </Typography>

                        <Divider
                          sx={{
                            width: 60,
                            my: 1.2,
                            borderColor: "#6366f1",
                            borderWidth: "2px",
                            borderRadius: 2,
                          }}
                        />

                        <Typography
                          sx={{
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          {tipo.descricao ||
                            "Sem descrição disponível para este tipo de culto."}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <IconButton
                          onClick={() => handleEdit(tipo)}
                          sx={{
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg,#c7d2fe,#a5b4fc)",
                            },
                          }}
                        >
                          <Edit sx={{ color: "#4338ca" }} />
                        </IconButton>

                        <IconButton
                          onClick={() =>
                            handleConfirmDelete(tipo)
                          }
                          sx={{
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg,#fee2e2,#fecaca)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg,#fecaca,#fca5a5)",
                            },
                          }}
                        >
                          <Delete sx={{ color: "#dc2626" }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Paper>
                </motion.div>
              ))
            )}
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        )}

        {/* MODAL PREMIUM */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "95%",
              maxWidth: 650,
              bgcolor: "#ffffff",
              borderRadius: 4,
              boxShadow:
                "0 40px 100px rgba(0,0,0,0.2)",
              p: 4,
              maxHeight: "90vh",
              overflowY: "auto",
              border: "1px solid #e2e8f0",
            }}
          >
            <FormCultos
              tipoCulto={selectedTipoCulto}
              onSuccess={handleNewTipoCultoAdded}
              onCancel={handleCloseModal}
            />
          </Box>
        </Modal>

        {/* CONFIRMAR EXCLUSÃO */}
        <Dialog
          open={openConfirmDelete}
          onClose={handleCloseConfirmDelete}
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.2)",
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 900 }}>
            Confirmar exclusão
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Essa ação não pode ser desfeita.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseConfirmDelete}
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default TiposCultos;
