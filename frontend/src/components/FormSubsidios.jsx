// src/pages/GestaoSubsidios.jsx
import React, { useState } from "react";
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
import { AttachMoney, AutoAwesome } from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";

export default function GestaoSubsidios() {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  const inputPremium = {
    mb: 3,
    "& .MuiOutlinedInput-root": {
      borderRadius: "18px",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease",
      "& fieldset": {
        borderColor: "rgba(0,90,255,0.25)",
      },
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(0,80,255,0.15)",
      },
      "&.Mui-focused": {
        boxShadow: "0 0 0 2px rgba(0,80,255,0.25), 0 12px 35px rgba(0,80,255,0.2)",
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      setMensagem({ tipo: "", texto: "" });

      const token = localStorage.getItem("token");
      await api.post(
        "/subsidios",
        { nome, valor, ativo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMensagem({ tipo: "success", texto: "Subsídio cadastrado com sucesso!" });
      setNome("");
      setValor("");
      setAtivo(true);
    } catch (error) {
      setMensagem({ tipo: "error", texto: "Erro ao cadastrar subsídio." });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Fade in timeout={700}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 6 },
          background:
            "linear-gradient(135deg, #f5f9ff 0%, #ffffff 40%, #eef3ff 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: "100%", maxWidth: 720 }}
        >
          <Card
            sx={{
              borderRadius: "32px",
              overflow: "hidden",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(240,245,255,0.95))",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(0,80,255,0.18)",
              boxShadow:
                "0 30px 80px rgba(0,60,200,0.18), inset 0 0 60px rgba(255,255,255,0.4)",
            }}
          >
            {/* Header Luxuoso */}
            <Box
              sx={{
                p: 4,
                background:
                  "linear-gradient(120deg, #002b8f, #0052ff, #3a7bff)",
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
              <AttachMoney sx={{ fontSize: 40, mb: 1 }} />
              <Typography
                variant="h4"
                sx={{ fontWeight: 900, letterSpacing: 1 }}
              >
                Gestão de Subsídios
              </Typography>
              <Typography sx={{ opacity: 0.9, mt: 1 }}>
                Cadastro premium de benefícios e subsídios salariais
              </Typography>
            </Box>

            <CardContent sx={{ p: 5 }}>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Nome do Subsídio"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  fullWidth
                  required
                  sx={inputPremium}
                />

                <TextField
                  label="Valor (Kz)"
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  fullWidth
                  required
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
                      "linear-gradient(90deg, #002b8f, #0052ff, #3a7bff)",
                    boxShadow:
                      "0 15px 40px rgba(0,80,255,0.4)",
                    "&:hover": {
                      transform: "translateY(-3px) scale(1.02)",
                      boxShadow:
                        "0 20px 55px rgba(0,80,255,0.55)",
                    },
                  }}
                >
                  {salvando ? <CircularProgress size={26} color="inherit" /> : "Cadastrar Subsídio"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Fade>
  );
}
