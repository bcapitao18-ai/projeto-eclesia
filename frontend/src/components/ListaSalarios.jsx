import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Stack,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  Button,
  Backdrop,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  MonetizationOn,
  CalendarMonth,
  Edit,
  Delete,
  WarningAmber,
} from "@mui/icons-material";
import api from "../api/axiosConfig";
import FormSalario from "./FormSalarios";

export default function ListaSalarios() {
  const [salarios, setSalarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [salarioSelecionado, setSalarioSelecionado] = useState(null);

  // NOVO: Modal surreal de confirmação
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [salarioParaEliminar, setSalarioParaEliminar] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchSalarios = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/salarios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSalarios(res.data.salarios || []);
    } catch (error) {
      console.error("Erro ao buscar salários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalarios();
  }, []);

  const handleEditar = (salario) => {
    setSalarioSelecionado(salario);
    setOpenModal(true);
  };

  // ABRE MODAL SURREAL (em vez de alert)
  const handleEliminar = (salario) => {
    setSalarioParaEliminar(salario);
    setOpenDeleteModal(true);
  };

  const confirmarEliminacao = async () => {
    if (!salarioParaEliminar) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");

      await api.delete(`/salarios/${salarioParaEliminar.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpenDeleteModal(false);
      setSalarioParaEliminar(null);
      fetchSalarios();
    } catch (error) {
      console.error("Erro ao eliminar salário:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={42} thickness={4} />
        <Typography fontWeight={700} color="#64748b">
          A carregar pagamentos salariais...
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Box>
        {/* HEADER PREMIUM */}
        <Box
          sx={{
            mb: 3,
            p: 3,
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
            color: "#fff",
            boxShadow: "0 25px 60px rgba(2,6,23,0.35)",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background:
                  "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
              }}
            >
              <MonetizationOn sx={{ fontSize: 30 }} />
            </Avatar>

            <Box>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={900}>
                Lista de Salários Efetuados
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Histórico completo de pagamentos salariais
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Paper
          sx={{
            borderRadius: "26px",
            overflow: "hidden",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 30px 80px rgba(2,6,23,0.06)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background:
                    "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
                }}
              >
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Funcionário
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Mês/Ano
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Salário Base
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Total Pago
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {salarios.map((s, index) => (
                <TableRow
                  key={s.id}
                  component={motion.tr}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  hover
                >
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: "#1e3a8a", fontWeight: 900 }}>
                        {s.Funcionario?.Membro?.nome?.charAt(0) || "F"}
                      </Avatar>
                      <Typography fontWeight={800}>
                        {s.Funcionario?.Membro?.nome || "Sem Nome"}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={<CalendarMonth />}
                      label={s.mes_ano}
                      sx={{
                        fontWeight: 800,
                        borderRadius: "12px",
                        background: "#eef2ff",
                        color: "#1e3a8a",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={900}>
                      {Number(s.salario_base || 0).toLocaleString()} Kz
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={900} color="#16a34a">
                      {Number(s.salario_liquido || 0).toLocaleString()} Kz
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Editar salário">
                        <IconButton
                          onClick={() => handleEditar(s)}
                          sx={{
                            bgcolor: "#eef2ff",
                            "&:hover": { bgcolor: "#c7d2fe" },
                          }}
                        >
                          <Edit sx={{ color: "#1e3a8a" }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar salário">
                        <IconButton
                          onClick={() => handleEliminar(s)}
                          sx={{
                            bgcolor: "#fee2e2",
                            "&:hover": { bgcolor: "#fecaca" },
                          }}
                        >
                          <Delete sx={{ color: "#b91c1c" }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Divider />

          <Box
            sx={{
              p: 2.5,
              background: "#f8fafc",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography fontWeight={800}>
              Total de Pagamentos: {salarios.length}
            </Typography>
            <Typography fontWeight={600} color="#64748b">
              Sistema Salarial • Histórico Financeiro
            </Typography>
          </Box>
        </Paper>

        {/* MODAL DE EDIÇÃO */}
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogContent sx={{ p: 0 }}>
            <FormSalario
              salarioEditando={salarioSelecionado}
              onSuccess={() => {
                setOpenModal(false);
                fetchSalarios();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* MODAL SURREAL DE CONFIRMAÇÃO (ELEGANTE) */}
        <Dialog
          open={openDeleteModal}
          onClose={() => !deleting && setOpenDeleteModal(false)}
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 400,
            sx: {
              backdropFilter: "blur(6px)",
              background: "rgba(2,6,23,0.75)",
            },
          }}
        >
          <DialogContent sx={{ p: 0, borderRadius: "24px", overflow: "hidden" }}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <Box
                sx={{
                  p: 4,
                  minWidth: isMobile ? 280 : 420,
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #020617 0%, #0f172a 60%, #111827 100%)",
                  color: "#fff",
                  position: "relative",
                }}
              >
                {/* Aura surreal suave */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -40,
                    left: -40,
                    width: 160,
                    height: 160,
                    background:
                      "radial-gradient(circle, rgba(239,68,68,0.35) 0%, transparent 70%)",
                    filter: "blur(30px)",
                  }}
                />

                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    margin: "0 auto 16px auto",
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                    boxShadow: "0 0 35px rgba(239,68,68,0.6)",
                  }}
                >
                  <WarningAmber sx={{ fontSize: 38 }} />
                </Avatar>

                <Typography variant="h5" fontWeight={900} mb={1}>
                  Confirmar Eliminação
                </Typography>

                <Typography sx={{ opacity: 0.8, mb: 3 }}>
                  Esta ação irá remover permanentemente o salário de{" "}
                  <strong>
                    {salarioParaEliminar?.Funcionario?.Membro?.nome ||
                      "Funcionário"}
                  </strong>
                  .
                </Typography>

                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    onClick={() => setOpenDeleteModal(false)}
                    disabled={deleting}
                    sx={{
                      borderRadius: "12px",
                      color: "#cbd5f5",
                      borderColor: "#334155",
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="contained"
                    onClick={confirmarEliminacao}
                    disabled={deleting}
                    sx={{
                      borderRadius: "12px",
                      fontWeight: 800,
                      background:
                        "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                      boxShadow: "0 10px 30px rgba(239,68,68,0.4)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                      },
                    }}
                  >
                    {deleting ? "A eliminar..." : "Eliminar Permanentemente"}
                  </Button>
                </Stack>
              </Box>
            </motion.div>
          </DialogContent>
        </Dialog>
      </Box>
    </motion.div>
  );
}