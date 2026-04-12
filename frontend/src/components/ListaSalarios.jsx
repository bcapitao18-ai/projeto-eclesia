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

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [salarioParaEliminar, setSalarioParaEliminar] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // =========================
  // FETCH SALÁRIOS (NOVO ENDPOINT)
  // =========================
  const fetchSalarios = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/salarios/lista", {
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

  // =========================
  // EDITAR
  // =========================
  const handleEditar = (salario) => {
    setSalarioSelecionado(salario);
    setOpenModal(true);
  };

  // =========================
  // ELIMINAR
  // =========================
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

  // =========================
  // LOADING
  // =========================
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
          A carregar salários...
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

        {/* HEADER */}
        <Box
          sx={{
            mb: 3,
            p: 3,
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
            color: "#fff",
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
              <MonetizationOn />
            </Avatar>

            <Box>
              <Typography variant="h5" fontWeight={900}>
                Lista de Salários
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Histórico de pagamentos efetuados
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* TABLE */}
        <Paper
          sx={{
            borderRadius: "26px",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#0f172a" }}>
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Funcionário
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Mês/Ano
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Base
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Subsídios
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Descontos
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Líquido
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {salarios.map((s) => (
                <TableRow key={s.id} hover>

                  {/* FUNCIONÁRIO */}
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: "#1e3a8a" }}>
                        {s.Funcionario?.Membro?.nome?.charAt(0) || "F"}
                      </Avatar>
                      <Typography fontWeight={800}>
                        {s.Funcionario?.Membro?.nome || "Sem Nome"}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* MES */}
                  <TableCell>
                    <Chip
                      icon={<CalendarMonth />}
                      label={s.mes_ano}
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>

                  {/* BASE */}
                  <TableCell>
                    {Number(s.salario_base).toLocaleString()} Kz
                  </TableCell>

                  {/* SUBS */}
                  <TableCell>
                    <Typography color="green" fontWeight={700}>
                      +{Number(s.total_subsidios).toLocaleString()} Kz
                    </Typography>
                  </TableCell>

                  {/* DESC */}
                  <TableCell>
                    <Typography color="red" fontWeight={700}>
                      -{Number(s.total_descontos).toLocaleString()} Kz
                    </Typography>
                  </TableCell>

                  {/* LÍQUIDO */}
                  <TableCell>
                    <Typography fontWeight={900} color="#16a34a">
                      {Number(s.salario_liquido).toLocaleString()} Kz
                    </Typography>
                  </TableCell>

                  {/* AÇÕES */}
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => handleEditar(s)}>
                        <Edit />
                      </IconButton>

                      <IconButton onClick={() => handleEliminar(s)}>
                        <Delete color="error" />
                      </IconButton>
                    </Stack>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Divider />

          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
            <Typography fontWeight={800}>
              Total: {salarios.length} salários
            </Typography>
            <Typography color="gray">
              Sistema de Gestão Salarial
            </Typography>
          </Box>
        </Paper>

        {/* EDIT MODAL */}
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          fullWidth
          maxWidth="lg"
        >
          <DialogContent>
            <FormSalario
              salarioEditando={salarioSelecionado}
              onSalvo={() => {
                setOpenModal(false);
                fetchSalarios();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* DELETE MODAL */}
        <Dialog open={openDeleteModal}>
          <DialogContent>
            <Typography fontWeight={900}>
              Confirmar eliminação?
            </Typography>

            <Button onClick={confirmarEliminacao}>
              {deleting ? "A eliminar..." : "Eliminar"}
            </Button>

            <Button onClick={() => setOpenDeleteModal(false)}>
              Cancelar
            </Button>
          </DialogContent>
        </Dialog>

      </Box>
    </motion.div>
  );
}