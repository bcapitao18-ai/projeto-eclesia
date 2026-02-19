// src/pages/FormDescontos.jsx
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
import { Percent, Diamond } from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";

export default function FormDescontos() {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  const inputLuxury = {
    mb: 3,
    "& .MuiOutlinedInput-root": {
      borderRadius: "20px",
      background: "rgba(255,255,255,0.97)",
      transition: "all 0.35s ease",
      "&:hover": {
        boxShadow: "0 10px 30px rgba(0,80,255,0.18)",
        transform: "translateY(-2px)",
      },
      "&.Mui-focused": {
        boxShadow: "0 0 0 2px rgba(0,80,255,0.25), 0 15px 40px rgba(0,80,255,0.25)",
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
        "/descontos",
        { nome, valor, descricao, ativo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMensagem({ tipo: "success", texto: "Desconto cadastrado com sucesso!" });
      setNome("");
      setValor("");
      setDescricao("");
      setAtivo(true);
    } catch (error) {
      setMensagem({
        tipo: "error",
        texto: error.response?.data?.message || "Erro ao cadastrar desconto.",
      });
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
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 2, md: 6 },
          background:
            "linear-gradient(135deg, #f7f9ff 0%, #ffffff 45%, #eef2ff 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85 }}
          style={{ width: "100%", maxWidth: 720 }}
        >
          <Card
            sx={{
              borderRadius: "34px",
              overflow: "hidden",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.99), rgba(240,245,255,0.96))",
              border: "1px solid rgba(0,70,255,0.18)",
              boxShadow:
                "0 35px 90px rgba(0,60,180,0.2)",
            }}
          >
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                background:
                  "linear-gradient(120deg, #001f6b, #0046ff, #5c8dff)",
                color: "#fff",
              }}
            >
              <Diamond sx={{ fontSize: 38, mb: 1 }} />
              <Typography variant="h4" fontWeight={900}>
                Gestão de Descontos
              </Typography>
              <Typography sx={{ opacity: 0.9 }}>
                Sistema premium de descontos salariais
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
                  sx={inputLuxury}
                />

                <TextField
                  label="Valor do Desconto (Kz)"
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  fullWidth
                  required
                  sx={inputLuxury}
                />

                <TextField
                  label="Descrição (opcional)"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  sx={inputLuxury}
                />

                <FormControl fullWidth sx={inputLuxury}>
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
                  <Alert severity={mensagem.tipo} sx={{ mb: 3, borderRadius: 3 }}>
                    {mensagem.texto}
                  </Alert>
                )}

                <Button
                  fullWidth
                  type="submit"
                  disabled={salvando}
                  sx={{
                    py: 2,
                    borderRadius: "20px",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    textTransform: "none",
                    color: "#fff",
                    background:
                      "linear-gradient(90deg, #001f6b, #0046ff, #5c8dff)",
                    boxShadow: "0 18px 45px rgba(0,80,255,0.45)",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: "0 25px 60px rgba(0,80,255,0.6)",
                    },
                  }}
                >
                  {salvando ? <CircularProgress size={26} color="inherit" /> : "Cadastrar Desconto"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Fade>
  );
}
