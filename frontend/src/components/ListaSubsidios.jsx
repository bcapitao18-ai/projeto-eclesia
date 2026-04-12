import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Fade,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import PercentIcon from "@mui/icons-material/Percent";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import api from "../api/axiosConfig";
import FormSubsidios from "./FormSubsidios";

export default function ListaSubsidios() {
  const [subsidios, setSubsidios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // GET
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/subsidios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubsidios(res.data || []);
    } catch (error) {
      console.error("Erro ao buscar subsídios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // EDITAR
  const handleEdit = (item) => {
    setEditing(item);
    setOpenModal(true);
  };

  const handleClose = () => {
    setEditing(null);
    setOpenModal(false);
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Tens certeza que quer eliminar este subsídio?"))
      return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/subsidios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchData();
    } catch (error) {
      console.error("Erro ao eliminar subsídio:", error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={45} thickness={4} />
        <Typography fontWeight={700} color="#64748b">
          A carregar subsídios...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in>
      <Box sx={{ p: 3, background: "#f8fafc", minHeight: "100vh" }}>

        {/* ================= MODAL ================= */}
        <Dialog open={openModal} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 900,
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              color: "#fff",
            }}
          >
            Editar Subsídio
            <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <FormSubsidios
              editData={editing}
              onFinish={() => {
                handleClose();
                fetchData();
              }}
              onCancelEdit={handleClose}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleClose}
              sx={{
                fontWeight: 800,
                textTransform: "none",
                borderRadius: "10px",
              }}
            >
              Fechar
            </Button>
          </DialogActions>
        </Dialog>

        {/* ================= HEADER ================= */}
        <Card
          sx={{
            mb: 3,
            borderRadius: "22px",
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(2,6,23,0.15)",
            background: "linear-gradient(135deg, #020617, #0f172a, #1e293b)",
            color: "#fff",
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <PercentIcon sx={{ fontSize: 34, color: "#38bdf8" }} />

              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Lista de Subsídios
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Gestão avançada de subsídios do ERP
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* ================= TABELA ================= */}
        <Card
          sx={{
            borderRadius: "22px",
            boxShadow: "0 20px 60px rgba(2,6,23,0.08)",
            overflow: "hidden",
          }}
        >
          <TableContainer component={Paper}>
            <Table>

              {/* HEADER */}
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, #0f172a, #1e293b)",
                  }}
                >
                  <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                    Nome
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                    Percentagem
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 900 }}>
                    Status
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff", fontWeight: 900 }}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>

              {/* BODY */}
              <TableBody>
                {subsidios.map((s) => (
                  <TableRow
                    key={s.id}
                    hover
                    sx={{
                      "&:hover": {
                        background: "#f1f5f9",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 800 }}>
                      {s.nome}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`${s.percentagem}%`}
                        sx={{
                          fontWeight: 800,
                          background: "#e0f2fe",
                          color: "#0369a1",
                          borderRadius: "10px",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {s.ativo ? (
                        <Chip
                          label="Ativo"
                          sx={{
                            fontWeight: 800,
                            background:
                              "linear-gradient(135deg, #16a34a, #22c55e)",
                            color: "#fff",
                          }}
                        />
                      ) : (
                        <Chip
                          label="Inativo"
                          sx={{
                            fontWeight: 800,
                            background: "#e5e7eb",
                            color: "#374151",
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">

                        <IconButton
                          onClick={() => handleEdit(s)}
                          sx={{
                            background:
                              "linear-gradient(135deg, #1e3a8a, #2563eb)",
                            color: "#fff",
                            borderRadius: "10px",
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => handleDelete(s.id)}
                          sx={{
                            background:
                              "linear-gradient(135deg, #ef4444, #dc2626)",
                            color: "#fff",
                            borderRadius: "10px",
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>

                      </Stack>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </TableContainer>
        </Card>

      </Box>
    </Fade>
  );
}