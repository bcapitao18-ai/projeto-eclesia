import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Fade,
  Chip,
} from "@mui/material";

import { Percent, AutoAwesome } from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";

export default function FormDescontos({
  editData,
  onFinish,
  onCancelEdit,
}) {
  const [nome, setNome] = useState("");
  const [percentagem, setPercentagem] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  const isEditMode = !!editData;

  // ================= FILL EDIT =================
  useEffect(() => {
    if (editData) {
      setNome(editData.nome || "");
      setPercentagem(editData.percentagem || "");
      setDescricao(editData.descricao || "");
      setAtivo(editData.ativo);
    }
  }, [editData]);

  const resetForm = () => {
    setNome("");
    setPercentagem("");
    setDescricao("");
    setAtivo(true);
  };

  // ================= INPUT STYLE PREMIUM =================
  const inputPremium = {
    mb: 3,
    "& .MuiOutlinedInput-root": {
      borderRadius: "18px",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease",
      "& fieldset": {
        borderColor: "rgba(255,0,0,0.2)",
      },
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(255,0,0,0.12)",
      },
      "&.Mui-focused": {
        boxShadow:
          "0 0 0 2px rgba(255,0,0,0.25), 0 12px 35px rgba(255,0,0,0.18)",
      },
    },
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSalvando(true);
      setMensagem({ tipo: "", texto: "" });

      const token = localStorage.getItem("token");

      if (isEditMode) {
        await api.put(
          `/descontos/${editData.id}`,
          { nome, percentagem, descricao, ativo },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMensagem({
          tipo: "success",
          texto: "Desconto atualizado com sucesso!",
        });
      } else {
        await api.post(
          "/descontos",
          { nome, percentagem, descricao, ativo },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMensagem({
          tipo: "success",
          texto: "Desconto cadastrado com sucesso!",
        });
      }

      resetForm();
      onFinish?.();

    } catch (error) {
      setMensagem({
        tipo: "error",
        texto: "Erro ao salvar desconto.",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Fade in timeout={700}>
      <Box
        sx={{
          minHeight: isEditMode ? "auto" : "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 3 },
          background: isEditMode
            ? "transparent"
            : "linear-gradient(135deg, #fff5f5 0%, #ffffff 40%, #ffecec 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: "100%", maxWidth: 720 }}
        >
          <Card
            sx={{
              borderRadius: "32px",
              overflow: "hidden",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(255,245,245,0.95))",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(255,80,80,0.18)",
              boxShadow:
                "0 30px 80px rgba(200,0,0,0.15), inset 0 0 60px rgba(255,255,255,0.4)",
            }}
          >
            {/* ================= HEADER ================= */}
            <Box
              sx={{
                p: 4,
                background:
                  "linear-gradient(120deg, #7f1d1d, #b91c1c, #ef4444)",
                color: "#fff",
                textAlign: "center",
                position: "relative",
              }}
            >
              <AutoAwesome
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 20,
                  opacity: 0.4,
                  fontSize: 28,
                }}
              />

              <Percent sx={{ fontSize: 40, mb: 1 }} />

              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {isEditMode ? "Editar Desconto" : "Gestão de Descontos"}
              </Typography>

              <Typography sx={{ opacity: 0.9, mt: 1 }}>
                {isEditMode
                  ? "Atualização de desconto existente"
                  : "Cadastro de descontos percentuais (%)"}
              </Typography>
            </Box>

            <CardContent sx={{ p: 5 }}>
              <form onSubmit={handleSubmit}>

                <TextField
                  label="Nome do Desconto"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  fullWidth
                  required
                  sx={inputPremium}
                />

                <TextField
                  label="Percentagem (%)"
                  type="number"
                  value={percentagem}
                  onChange={(e) => setPercentagem(e.target.value)}
                  fullWidth
                  required
                  sx={inputPremium}
                />

                <TextField
                  label="Descrição"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  sx={inputPremium}
                />

                <FormControl fullWidth sx={inputPremium}>
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
                    sx={{
                      mb: 3,
                      borderRadius: "16px",
                      fontWeight: 600,
                    }}
                  >
                    {mensagem.texto}
                  </Alert>
                )}

                <Button
                  fullWidth
                  type="submit"
                  disabled={salvando}
                  sx={{
                    py: 2,
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    borderRadius: "18px",
                    textTransform: "none",
                    color: "#fff",
                    background:
                      "linear-gradient(90deg, #7f1d1d, #b91c1c, #ef4444)",
                    boxShadow: "0 15px 40px rgba(220,38,38,0.35)",
                    "&:hover": {
                      transform: "translateY(-3px) scale(1.02)",
                      boxShadow: "0 20px 55px rgba(220,38,38,0.5)",
                    },
                  }}
                >
                  {salvando ? (
                    <CircularProgress size={26} color="inherit" />
                  ) : isEditMode ? (
                    "Atualizar Desconto"
                  ) : (
                    "Cadastrar Desconto"
                  )}
                </Button>

                {isEditMode && (
                  <Button
                    fullWidth
                    onClick={onCancelEdit}
                    sx={{
                      mt: 2,
                      borderRadius: "18px",
                      fontWeight: 700,
                    }}
                  >
                    Cancelar Edição
                  </Button>
                )}

              </form>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Fade>
  );
}