// src/components/ListaFuncionarios.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Edit,
  Delete,
  PeopleAlt,
  WorkOutline,
  MonetizationOn,
  WarningAmber,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import GestaoFuncionarios from "./FormFuncionarios";

export default function ListaFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // RESPONSIVIDADE
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // 🔹 MODAL EDIÇÃO
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // 🔥 MODAL ELIMINAR PREMIUM
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [funcionarioParaEliminar, setFuncionarioParaEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const fetchFuncionarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/lista-funcionarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFuncionarios(res.data);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  // ================= EDITAR =================
  const handleEditar = (funcionario) => {
    setFuncionarioSelecionado(funcionario);
    setOpenModal(true);
  };

  const fecharModal = () => {
    setOpenModal(false);
    setFuncionarioSelecionado(null);
  };

  const handleSucesso = () => {
    fetchFuncionarios();
    fecharModal();
  };

  // ================= ELIMINAR =================
  const abrirModalEliminar = (funcionario) => {
    setFuncionarioParaEliminar(funcionario);
    setOpenDeleteModal(true);
  };

  const fecharModalEliminar = () => {
    if (eliminando) return;
    setOpenDeleteModal(false);
    setFuncionarioParaEliminar(null);
  };

  const confirmarEliminacao = async () => {
    if (!funcionarioParaEliminar) return;

    try {
      setEliminando(true);
      const token = localStorage.getItem("token");

      await api.delete(`/funcionarios/${funcionarioParaEliminar.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchFuncionarios();
      fecharModalEliminar();
    } catch (error) {
      console.error("Erro ao eliminar funcionário:", error);
    } finally {
      setEliminando(false);
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
          A carregar funcionários...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* ================= MODAL DE EDIÇÃO ================= */}
      <Dialog open={openModal} onClose={fecharModal} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <GestaoFuncionarios
            funcionarioSelecionado={funcionarioSelecionado}
            onSucesso={handleSucesso}
            onCancelar={fecharModal}
          />
        </DialogContent>
      </Dialog>

      {/* 🔥 MODAL SURREAL DE ELIMINAÇÃO (PREMIUM DARK) */}
      <Dialog
        open={openDeleteModal}
        onClose={fecharModalEliminar}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "30px",
            background:
              "linear-gradient(145deg, #020617 0%, #020617 40%, #0f172a 100%)",
            border: "1px solid rgba(239,68,68,0.25)",
            boxShadow:
              "0 50px 140px rgba(0,0,0,0.9), 0 0 60px rgba(239,68,68,0.15)",
          },
        }}
      >
        <DialogContent sx={{ p: 4, color: "#fff", textAlign: "center" }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                margin: "0 auto 22px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "radial-gradient(circle, rgba(239,68,68,0.35), rgba(239,68,68,0.05))",
                boxShadow:
                  "0 0 60px rgba(239,68,68,0.45), inset 0 0 30px rgba(239,68,68,0.25)",
              }}
            >
              <WarningAmber sx={{ fontSize: 46, color: "#ef4444" }} />
            </Box>

            <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
              Eliminar Funcionário
            </Typography>

            <Typography sx={{ opacity: 0.85, mb: 2 }}>
              Esta ação irá desativar o funcionário do sistema.
            </Typography>

            <Typography
              sx={{
                fontWeight: 900,
                fontSize: "1.2rem",
                color: "#38bdf8",
                mb: 4,
              }}
            >
              {funcionarioParaEliminar?.Membro?.nome || "Funcionário"}
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                onClick={fecharModalEliminar}
                disabled={eliminando}
                sx={{
                  py: 1.6,
                  borderRadius: "18px",
                  fontWeight: 800,
                  textTransform: "none",
                  background: "rgba(255,255,255,0.08)",
                  color: "#e2e8f0",
                  backdropFilter: "blur(8px)",
                }}
              >
                Cancelar
              </Button>

              <Button
                fullWidth
                onClick={confirmarEliminacao}
                disabled={eliminando}
                sx={{
                  py: 1.6,
                  borderRadius: "18px",
                  fontWeight: 900,
                  textTransform: "none",
                  background:
                    "linear-gradient(135deg, #ef4444, #dc2626, #991b1b)",
                  color: "#fff",
                  boxShadow: "0 20px 50px rgba(239,68,68,0.55)",
                }}
              >
                {eliminando ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sim, Eliminar"
                )}
              </Button>
            </Stack>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* ================= CONTEÚDO ================= */}
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
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                }}
              >
                <PeopleAlt sx={{ fontSize: 30 }} />
              </Avatar>

              <Box>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  fontWeight={900}
                >
                  Lista de Funcionários
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.85, fontSize: isMobile ? 12 : 14 }}
                >
                  Controlo corporativo e gestão avançada
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* ================= MOBILE (CARDS PREMIUM) ================= */}
          {isMobile ? (
            <Stack spacing={2}>
              {funcionarios.map((f, index) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: "20px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 15px 40px rgba(2,6,23,0.08)",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "#1e3a8a", fontWeight: 900 }}>
                          {f.Membro?.nome?.charAt(0) || "F"}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={800}>
                            {f.Membro?.nome || "Sem Nome"}
                          </Typography>
                          <Typography variant="caption" color="#64748b">
                            ID: {f.id}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        icon={<WorkOutline />}
                        label={f.Cargo?.nome || "Sem Cargo"}
                        sx={{
                          fontWeight: 700,
                          borderRadius: "10px",
                          background: "#eef2ff",
                          color: "#1e3a8a",
                          width: "fit-content",
                        }}
                      />

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MonetizationOn sx={{ color: "#16a34a" }} />
                        <Typography fontWeight={900}>
                          {Number(f.salario_base || 0).toLocaleString()} Kz
                        </Typography>
                      </Stack>

                      <Chip
                        label={f.ativo ? "Ativo" : "Inativo"}
                        sx={{
                          fontWeight: 800,
                          borderRadius: "12px",
                          background: f.ativo
                            ? "linear-gradient(135deg, #16a34a, #22c55e)"
                            : "#e5e7eb",
                          color: f.ativo ? "#fff" : "#374151",
                          width: "fit-content",
                        }}
                      />

                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          startIcon={<Edit />}
                          onClick={() => handleEditar(f)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 800,
                            borderRadius: "14px",
                            background:
                              "linear-gradient(135deg, #1e3a8a, #2563eb)",
                            color: "#fff",
                          }}
                        >
                          Editar
                        </Button>

                        <Button
                          fullWidth
                          startIcon={<Delete />}
                          onClick={() => abrirModalEliminar(f)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 800,
                            borderRadius: "14px",
                            background:
                              "linear-gradient(135deg, #ef4444, #dc2626)",
                            color: "#fff",
                          }}
                        >
                          Eliminar
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                </motion.div>
              ))}
            </Stack>
          ) : (
            /* ================= DESKTOP (TABELA PREMIUM) ================= */
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
                      Cargo
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                      Salário Base
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                      Status
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 900 }}
                    >
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {funcionarios.map((f, index) => (
                    <TableRow
                      key={f.id}
                      hover
                      component={motion.tr}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: "#1e3a8a", fontWeight: 900 }}>
                            {f.Membro?.nome?.charAt(0) || "F"}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={800}>
                              {f.Membro?.nome || "Sem Nome"}
                            </Typography>
                            <Typography variant="caption" color="#64748b">
                              ID: {f.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={<WorkOutline />}
                          label={f.Cargo?.nome || "Sem Cargo"}
                          sx={{
                            fontWeight: 700,
                            borderRadius: "10px",
                            background: "#eef2ff",
                            color: "#1e3a8a",
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <MonetizationOn sx={{ color: "#16a34a" }} />
                          <Typography fontWeight={900}>
                            {Number(f.salario_base || 0).toLocaleString()} Kz
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={f.ativo ? "Ativo" : "Inativo"}
                          sx={{
                            fontWeight: 800,
                            borderRadius: "12px",
                            px: 1.5,
                            background: f.ativo
                              ? "linear-gradient(135deg, #16a34a, #22c55e)"
                              : "#e5e7eb",
                            color: f.ativo ? "#fff" : "#374151",
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => handleEditar(f)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 800,
                              borderRadius: "12px",
                              background:
                                "linear-gradient(135deg, #1e3a8a, #2563eb)",
                              color: "#fff",
                              px: 2,
                            }}
                          >
                            Editar
                          </Button>

                          <IconButton
                            onClick={() => abrirModalEliminar(f)}
                            sx={{
                              borderRadius: "12px",
                              background:
                                "linear-gradient(135deg, #ef4444, #dc2626)",
                              color: "#fff",
                              boxShadow:
                                "0 8px 20px rgba(239,68,68,0.35)",
                            }}
                          >
                            <Delete />
                          </IconButton>
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
                  Total de Funcionários: {funcionarios.length}
                </Typography>
                <Typography fontWeight={600} color="#64748b">
                  Sistema Salarial • Painel Corporativo
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </motion.div>
    </>
  );
}
