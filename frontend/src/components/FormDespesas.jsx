// src/components/FormDespesa.jsx
import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  InputAdornment,
  Typography,
  Paper,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import { CalendarToday, Notes } from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";

const MotionPaper = motion(Paper);

export default function FormDespesa({
  despesa = null,
  categoriaId = null,
  onSuccess,
  onCancel,
}) {
  const [descricao, setDescricao] = useState(despesa?.descricao || "");
  const [valor, setValor] = useState(despesa?.valor || "");
  const [data, setData] = useState(despesa?.data || "");
  const [tipo, setTipo] = useState(despesa?.tipo || "");
  const [observacao, setObservacao] = useState(
    despesa?.observacao || ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      descricao,
      valor,
      data,
      tipo,
      observacao: observacao || null,
      categoriaId,
    };

    try {
      if (despesa) {
        await api.put(`/despesas/${despesa.id}`, payload);
      } else {
        await api.post("/despesas", payload);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      alert("Erro ao salvar despesa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background: `
          radial-gradient(circle at 0% 0%, rgba(124,58,237,0.12) 0%, transparent 45%),
          radial-gradient(circle at 100% 0%, rgba(139,92,246,0.10) 0%, transparent 45%),
          linear-gradient(180deg, #ffffff 0%, #faf7ff 100%)
        `,
      }}
    >
      <MotionPaper
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 620,
          p: 5,
          borderRadius: 6,
          position: "relative",
          overflow: "hidden",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(25px)",
          border: "1px solid rgba(139,92,246,0.18)",
          boxShadow: `
            0 60px 180px rgba(88,28,135,0.25),
            0 20px 60px rgba(124,58,237,0.15)
          `,
          "&:before": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: 6,
            background:
              "radial-gradient(circle at top, rgba(139,92,246,0.12), transparent 60%)",
            pointerEvents: "none",
          },
        }}
      >
        {/* HEADER SURREAL */}
        <Box sx={{ textAlign: "center", mb: 3, position: "relative" }}>
          <Chip
            label="Gestão Financeira Premium"
            sx={{
              mb: 2,
              fontWeight: 800,
              letterSpacing: 0.5,
              px: 2,
              py: 2,
              borderRadius: 3,
              color: "#6d28d9",
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.25)",
              boxShadow: "0 10px 30px rgba(124,58,237,0.15)",
            }}
          />

          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: "-0.8px",
              color: "#2e1065",
            }}
          >
            {despesa ? "Editar Despesa" : "Nova Despesa"}
          </Typography>

          <Typography
            sx={{
              mt: 1.2,
              color: "#6b21a8",
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            Controle financeiro com precisão e luxo absoluto
          </Typography>
        </Box>

        <Divider
          sx={{
            mb: 4,
            borderColor: "rgba(139,92,246,0.2)",
          }}
        />

        <Box component="form" onSubmit={handleSubmit}>
          {/* DESCRIÇÃO */}
          <TextField
            label="Descrição da Despesa"
            placeholder="Ex: Alimentação, Internet, Transporte..."
            fullWidth
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            sx={surrealInput}
          />

          {/* VALOR */}
          <TextField
            label="Valor"
            placeholder="0.00"
            fullWidth
            required
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={kzBadge}>Kz</Box>
                </InputAdornment>
              ),
            }}
            sx={surrealInput}
          />

          {/* DATA */}
          <TextField
            label="Data da Despesa"
            type="date"
            fullWidth
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday
                    sx={{
                      color: "#7c3aed",
                      fontSize: 20,
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={surrealInput}
          />

          {/* TIPO */}
          <TextField
            label="Tipo de Despesa"
            select
            fullWidth
            required
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            sx={surrealInput}
          >
            <MenuItem value="Fixa">Despesa Fixa</MenuItem>
            <MenuItem value="Variável">Despesa Variável</MenuItem>
          </TextField>

          {/* OBSERVAÇÃO */}
          <TextField
            label="Observação (Opcional)"
            placeholder="Detalhes adicionais sobre a despesa..."
            fullWidth
            multiline
            rows={3}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Notes
                    sx={{
                      color: "#a78bfa",
                      fontSize: 20,
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={surrealInput}
          />

          {/* BOTÕES ULTRA PREMIUM */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mt={4}
            pt={3}
            sx={{
              borderTop: "1px solid rgba(139,92,246,0.18)",
            }}
          >
            <Button
              onClick={onCancel}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: "#6b7280",
                borderRadius: 3,
                px: 3.5,
                py: 1.2,
                "&:hover": {
                  background: "#faf5ff",
                },
              }}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                textTransform: "none",
                fontWeight: 900,
                fontSize: 15,
                px: 5.5,
                py: 1.6,
                borderRadius: 4,
                letterSpacing: 0.3,
                background:
                  "linear-gradient(135deg,#6d28d9,#8b5cf6)",
                boxShadow:
                  "0 20px 60px rgba(124,58,237,0.45)",
                transition: "all 0.35s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg,#5b21b6,#7c3aed)",
                  transform: "translateY(-3px) scale(1.02)",
                  boxShadow:
                    "0 30px 80px rgba(124,58,237,0.6)",
                },
              }}
            >
              {loading
                ? "Salvando..."
                : despesa
                ? "Atualizar Despesa"
                : "Cadastrar Despesa"}
            </Button>
          </Stack>
        </Box>
      </MotionPaper>
    </Box>
  );
}

/* INPUT SURREAL ROXO */
const surrealInput = {
  mb: 3,
  "& .MuiOutlinedInput-root": {
    borderRadius: 3.5,
    background: "#ffffff",
    fontWeight: 600,
    transition: "all 0.25s ease",
    "& fieldset": {
      borderColor: "rgba(139,92,246,0.25)",
    },
    "&:hover fieldset": {
      borderColor: "#7c3aed",
      boxShadow: "0 0 0 3px rgba(124,58,237,0.08)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#6d28d9",
      borderWidth: "1.6px",
      boxShadow: "0 0 0 4px rgba(124,58,237,0.15)",
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 700,
    color: "#4c1d95",
  },
  "& .MuiInputBase-input": {
    color: "#1e1b4b",
    fontWeight: 600,
  },
};

/* BADGE KZ LUXO */
const kzBadge = {
  fontWeight: 900,
  color: "#5b21b6",
  background: "rgba(124,58,237,0.12)",
  px: 1.4,
  py: 0.6,
  borderRadius: 2,
  fontSize: 13,
  border: "1px solid rgba(124,58,237,0.3)",
};