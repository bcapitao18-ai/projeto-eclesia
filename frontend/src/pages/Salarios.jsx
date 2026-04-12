import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Stack,
  Divider,
  Card,
  CardContent,
  Fade,
  Chip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";

import FormFuncionarios from "../components/FormFuncionarios";
import FormSubsidios from "../components/FormSubsidios";
import FormDescontos from "../components/FormDescontos";
import FormSalarios from "../components/FormSalarios";
import ListaFuncionarios from "../components/ListaFuncionarios";
import ListaSalarios from "../components/ListaSalarios";

export default function GestaoSalarios() {
  const [tab, setTab] = useState(0);
  const [openFuncionarios, setOpenFuncionarios] = useState(false);
  const [openSalarios, setOpenSalarios] = useState(false);

  const handleChange = (e, newValue) => setTab(newValue);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 3,
        background: "linear-gradient(135deg, #f6f8fc 0%, #eef2f7 100%)",
      }}
    >

      {/* HEADER PREMIUM */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
          color: "white",
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight={800}>
            Gestão de Salários
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Administração de funcionários - membros, subsídios, descontos e processamento salarial
          </Typography>

          <Stack direction="row" spacing={1} mt={2}>
            <Chip label="Sistema Ativo" size="small" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }} />
            <Chip label="IGREJAS" size="small" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }} />
          </Stack>
        </CardContent>
      </Card>

      {/* TABS PREMIUM */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
        }}
      >
        <Tabs
          value={tab}
          onChange={handleChange}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              py: 2,
            },
          }}
        >
          <Tab label="Funcionários" />
          <Tab label="Subsídios" />
          <Tab label="Descontos" />
          <Tab label="Salários" />
        </Tabs>
      </Card>

      {/* CONTEÚDO */}
      <Card
        sx={{
          borderRadius: 3,
          minHeight: 420,
          boxShadow: "0 12px 35px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 3 }}>

          <Fade in={true} key={tab}>
            <Box>

              {/* FUNCIONÁRIOS */}
              {tab === 0 && (
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={800}>
                    Funcionários
                  </Typography>

                  <Button
                    startIcon={<VisibilityIcon />}
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                    onClick={() => setOpenFuncionarios(true)}
                  >
                    Ver Funcionários
                  </Button>

                  <FormFuncionarios />
                </Stack>
              )}

              {/* SUBSÍDIOS */}
              {tab === 1 && (
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={800}>
                    Subsídios
                  </Typography>
                  <FormSubsidios />
                </Stack>
              )}

              {/* DESCONTOS */}
              {tab === 2 && (
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={800}>
                    Descontos
                  </Typography>
                  <FormDescontos />
                </Stack>
              )}

              {/* SALÁRIOS */}
              {tab === 3 && (
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={800}>
                    Processamento Salarial
                  </Typography>

                  <Button
                    startIcon={<VisibilityIcon />}
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                    onClick={() => setOpenSalarios(true)}
                  >
                    Ver Salários Efetuados
                  </Button>

                  <FormSalarios />
                </Stack>
              )}

            </Box>
          </Fade>

        </CardContent>
      </Card>

      {/* MODAL FUNCIONÁRIOS */}
      <Dialog
        open={openFuncionarios}
        onClose={() => setOpenFuncionarios(false)}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Lista de Funcionários
          <IconButton
            onClick={() => setOpenFuncionarios(false)}
            sx={{ position: "absolute", right: 10, top: 10 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <ListaFuncionarios />
        </DialogContent>
      </Dialog>

      {/* MODAL SALÁRIOS */}
      <Dialog
        open={openSalarios}
        onClose={() => setOpenSalarios(false)}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Salários Efetuados
          <IconButton
            onClick={() => setOpenSalarios(false)}
            sx={{ position: "absolute", right: 10, top: 10 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <ListaSalarios />
        </DialogContent>
      </Dialog>

    </Box>
  );
}