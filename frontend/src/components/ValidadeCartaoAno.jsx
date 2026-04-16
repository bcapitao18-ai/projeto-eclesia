import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  IconButton
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import api from "../api/axiosConfig";

export default function ValidadeCartaoAno({
  open,
  onClose,
  sedeId,
  filhalId,
  onSuccess
}) {
  const [ano, setAno] = useState("");

  const handleSubmit = async () => {
    if (!ano) return;

    console.log("ENVIANDO:", {
  SedeId: sedeId,
  FilhalId: filhalId,
  validade_cartao_ano: Number(ano),
});

    try {
      await api.post("/admin/config-validade-cartao", {
        SedeId: sedeId || null,
        FilhalId: filhalId || null,
        validade_cartao_ano: Number(ano),
      });

      setAno("");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.log("Erro ao definir validade:", err);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 3,
          boxShadow: 24
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography fontWeight={800}>
            Validade do Cartão (anos)
          </Typography>

          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          type="number"
          label="Número de anos"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          sx={{ mt: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, borderRadius: 2 }}
          onClick={handleSubmit}
        >
          Salvar
        </Button>
      </Box>
    </Modal>
  );
}