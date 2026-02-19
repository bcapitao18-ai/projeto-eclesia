// src/pages/GestaoFuncionarios.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  CircularProgress,
  Alert,
  Fade,
  Autocomplete,
  Chip,
} from "@mui/material";
import { WorkspacePremium, Edit } from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";

export default function GestaoFuncionarios({
  funcionarioSelecionado = null,
  onSucesso = () => {},
  onCancelar = () => {},
}) {
  const [membros, setMembros] = useState([]);
  const [membroId, setMembroId] = useState("");
  const [salarioBase, setSalarioBase] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  const modoEdicao = !!funcionarioSelecionado;

  const inputUltra = {
    mb: 3,
    "& .MuiOutlinedInput-root": {
      borderRadius: "20px",
      background: "rgba(255,255,255,0.98)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 12px 35px rgba(0,80,255,0.2)",
      },
      "&.Mui-focused": {
        boxShadow:
          "0 0 0 2px rgba(0,80,255,0.25), 0 18px 50px rgba(0,80,255,0.25)",
      },
    },
  };

  // 🔥 Carregar membros
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const resMembros = await api.get("/membros", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMembros(resMembros.data);
      } catch (error) {
        setMensagem({ tipo: "error", texto: "Erro ao carregar membros." });
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // 🔥 Preencher formulário quando for edição
  useEffect(() => {
    if (funcionarioSelecionado) {
      setMembroId(funcionarioSelecionado.MembroId || "");
      setSalarioBase(funcionarioSelecionado.salario_base || "");
      setAtivo(funcionarioSelecionado.ativo);
    }
  }, [funcionarioSelecionado]);

  const resetForm = () => {
    setSalarioBase("");
    setMembroId("");
    setAtivo(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      setMensagem({ tipo: "", texto: "" });

      const token = localStorage.getItem("token");

      const payload = {
        salario_base: salarioBase,
        ativo,
        MembroId: membroId,
      };

      if (modoEdicao) {
        // 🔥 PUT (EDITAR)
        await api.put(
          `/funcionarios/${funcionarioSelecionado.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMensagem({
          tipo: "success",
          texto: "Funcionário atualizado com sucesso!",
        });
      } else {
        // 🔥 POST (CADASTRAR)
        await api.post("/funcionarios", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMensagem({
          tipo: "success",
          texto: "Funcionário cadastrado com sucesso!",
        });

        resetForm();
      }

      onSucesso(); // atualiza lista
    } catch (error) {
      setMensagem({
        tipo: "error",
        texto:
          error?.response?.data?.message ||
          "Erro ao salvar funcionário.",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Fade in timeout={700}>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          background:
            "linear-gradient(135deg, #f4f7ff 0%, #ffffff 40%, #eef2ff 100%)",
          borderRadius: "26px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            sx={{
              borderRadius: "36px",
              overflow: "hidden",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.99), rgba(240,245,255,0.96))",
              border: "1px solid rgba(0,70,255,0.18)",
              boxShadow: "0 40px 100px rgba(0,60,180,0.22)",
            }}
          >
            {/* HEADER PREMIUM DINÂMICO */}
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                background:
                  "linear-gradient(120deg, #001a5e, #003cff, #6a95ff)",
                color: "#fff",
              }}
            >
              {modoEdicao ? (
                <Edit sx={{ fontSize: 40, mb: 1 }} />
              ) : (
                <WorkspacePremium sx={{ fontSize: 40, mb: 1 }} />
              )}

              <Typography variant="h4" fontWeight={900}>
                {modoEdicao
                  ? "Editar Funcionário"
                  : "Cadastro de Funcionário"}
              </Typography>

              <Typography sx={{ opacity: 0.9 }}>
                {modoEdicao
                  ? "Atualização premium de colaborador"
                  : "Cadastro corporativo premium de colaboradores"}
              </Typography>
            </Box>

            <CardContent sx={{ p: 5 }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Autocomplete
                    options={membros}
                    getOptionLabel={(m) => m.nome || ""}
                    value={
                      membros.find((m) => m.id === membroId) || null
                    }
                    onChange={(e, value) =>
                      setMembroId(value ? value.id : "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Selecionar Membro"
                        required
                      />
                    )}
                    sx={inputUltra}
                  />

                  <TextField
                    label="Salário Base (Kz)"
                    type="number"
                    value={salarioBase}
                    onChange={(e) => setSalarioBase(e.target.value)}
                    fullWidth
                    required
                    sx={inputUltra}
                  />

                  <FormControl fullWidth sx={inputUltra}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={ativo ? 1 : 0}
                      onChange={(e) => setAtivo(e.target.value === 1)}
                      label="Status"
                    >
                      <MenuItem value={1}>
                        <Chip label="Ativo" color="success" />
                      </MenuItem>
                      <MenuItem value={0}>
                        <Chip label="Inativo" color="error" />
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {mensagem.texto && (
                    <Alert
                      severity={mensagem.tipo}
                      sx={{ mb: 3, borderRadius: 3 }}
                    >
                      {mensagem.texto}
                    </Alert>
                  )}

                  <Box display="flex" gap={2}>
                    {modoEdicao && (
                      <Button
                        fullWidth
                        onClick={onCancelar}
                        sx={{
                          py: 2,
                          borderRadius: "22px",
                          fontWeight: 800,
                        }}
                      >
                        Cancelar
                      </Button>
                    )}

                    <Button
                      fullWidth
                      type="submit"
                      disabled={salvando}
                      sx={{
                        py: 2.2,
                        borderRadius: "22px",
                        fontWeight: 900,
                        fontSize: "1.15rem",
                        textTransform: "none",
                        color: "#fff",
                        background:
                          "linear-gradient(90deg, #001a5e, #003cff, #6a95ff)",
                        boxShadow:
                          "0 20px 55px rgba(0,80,255,0.5)",
                        "&:hover": {
                          transform: "scale(1.03)",
                          boxShadow:
                            "0 30px 75px rgba(0,80,255,0.65)",
                        },
                      }}
                    >
                      {salvando ? (
                        <CircularProgress size={28} color="inherit" />
                      ) : modoEdicao ? (
                        "Atualizar Funcionário"
                      ) : (
                        "Cadastrar Funcionário"
                      )}
                    </Button>
                  </Box>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Fade>
  );
}
