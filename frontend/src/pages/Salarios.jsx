// src/pages/GestaoSalarios.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  Divider,
  Modal,
  IconButton,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  People,
  Payment,
  Discount,
  AccountBalanceWallet,
  NavigateNext,
  Visibility,
  Close,
} from "@mui/icons-material";

import FormFuncionarios from "../components/FormFuncionarios";
import FormSubsidios from "../components/FormSubsidios";
import FormDescontos from "../components/FormDescontos";
import FormSalarios from "../components/FormSalarios";
import ListaFuncionarios from "../components/ListaFuncionarios";

// 🔥 NOVO: LISTA DE SALÁRIOS EFETUADOS (VAI USAR A ROTA /salarios)
import ListaSalarios from "../components/ListaSalarios";

export default function GestaoSalarios() {
  const [formAtivo, setFormAtivo] = useState("funcionarios");

  // MODAL FUNCIONÁRIOS
  const [openModalFuncionarios, setOpenModalFuncionarios] = useState(false);
  const handleOpenFuncionarios = () => setOpenModalFuncionarios(true);
  const handleCloseFuncionarios = () => setOpenModalFuncionarios(false);

  // 🔥 NOVO: MODAL SALÁRIOS EFETUADOS
  const [openModalSalarios, setOpenModalSalarios] = useState(false);
  const handleOpenSalarios = () => setOpenModalSalarios(true);
  const handleCloseSalarios = () => setOpenModalSalarios(false);

  const modulos = {
    funcionarios: {
      titulo: "Gestão de Funcionários",
      descricao:
        "Cadastre, visualize e administre todos os funcionários com controlo total, rastreabilidade e organização empresarial de alto nível.",
      componente: (
        <Stack spacing={4}>
          {/* HEADER PREMIUM */}
          <Box
            sx={{
              p: 3,
              borderRadius: "24px",
              background:
                "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
              color: "#fff",
              boxShadow: "0 25px 60px rgba(2,6,23,0.35)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={900}
                sx={{ letterSpacing: "0.5px" }}
              >
                Painel Corporativo de Funcionários
              </Typography>
              <Typography sx={{ opacity: 0.85, fontSize: "0.92rem" }}>
                Gestão inteligente, visual premium e controlo estratégico do
                capital humano
              </Typography>
            </Box>

            <Button
              startIcon={<Visibility />}
              onClick={handleOpenFuncionarios}
              sx={{
                textTransform: "none",
                fontWeight: 900,
                px: 3,
                py: 1.4,
                borderRadius: "16px",
                color: "#fff",
                background:
                  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 15px 40px rgba(37,99,235,0.5)",
                letterSpacing: "0.4px",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px) scale(1.03)",
                  background:
                    "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                  boxShadow: "0 20px 50px rgba(37,99,235,0.65)",
                },
              }}
            >
              Ver Funcionários
            </Button>
          </Box>

          {/* FORMULÁRIO */}
          <Box
            sx={{
              p: 4,
              borderRadius: "28px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 30px 80px rgba(2,6,23,0.06)",
            }}
          >
            <FormFuncionarios />
          </Box>

          {/* MODAL FUNCIONÁRIOS */}
          <AnimatePresence>
            {openModalFuncionarios && (
              <Modal
                open={openModalFuncionarios}
                onClose={handleCloseFuncionarios}
                closeAfterTransition
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(18px)",
                  background:
                    "linear-gradient(180deg, rgba(2,6,23,0.75) 0%, rgba(15,23,42,0.9) 100%)",
                  p: 2,
                }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.85, y: 80 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 60 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "1500px",
                    maxHeight: "92vh",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "32px",
                    overflow: "hidden",
                    background:
                      "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                    boxShadow:
                      "0 80px 180px rgba(2,6,23,0.7), 0 20px 60px rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.6)",
                  }}
                >
                  <Box
                    sx={{
                      px: 4,
                      py: 3,
                      background:
                        "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
                      color: "#fff",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h5" fontWeight={900}>
                      Lista Premium de Funcionários
                    </Typography>

                    <IconButton
                      onClick={handleCloseFuncionarios}
                      sx={{
                        background: "rgba(255,255,255,0.12)",
                        color: "#fff",
                        borderRadius: "14px",
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Box>

                  <Box sx={{ p: 4, overflowY: "auto", flex: 1 }}>
                    <ListaFuncionarios />
                  </Box>
                </Box>
              </Modal>
            )}
          </AnimatePresence>
        </Stack>
      ),
    },

    subsidios: {
      titulo: "Gestão de Subsídios",
      descricao:
        "Configure benefícios e incentivos salariais com precisão financeira e gestão estratégica empresarial.",
      componente: <FormSubsidios />,
    },

    descontos: {
      titulo: "Gestão de Descontos",
      descricao:
        "Defina políticas de descontos com segurança, transparência e controlo financeiro avançado.",
      componente: <FormDescontos />,
    },

    // 🔥 AQUI ESTÁ A MUDANÇA PRINCIPAL
    salarios: {
      titulo: "Processamento Salarial",
      descricao:
        "Execute o processamento completo de salários com auditoria, eficiência e segurança corporativa.",
      componente: (
        <Stack spacing={4}>
          {/* HEADER COM BOTÃO VER SALÁRIOS */}
          <Box
            sx={{
              p: 3,
              borderRadius: "24px",
              background:
                "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
              color: "#fff",
              boxShadow: "0 25px 60px rgba(2,6,23,0.35)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Painel de Processamento Salarial
              </Typography>
              <Typography sx={{ opacity: 0.85, fontSize: "0.92rem" }}>
                Processamento, auditoria e visualização dos salários efetuados
              </Typography>
            </Box>

            {/* 🔥 NOVO BOTÃO */}
            <Button
              startIcon={<Visibility />}
              onClick={handleOpenSalarios}
              sx={{
                textTransform: "none",
                fontWeight: 900,
                px: 3,
                py: 1.4,
                borderRadius: "16px",
                color: "#fff",
                background:
                  "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                boxShadow: "0 15px 40px rgba(22,163,74,0.45)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px) scale(1.03)",
                  background:
                    "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                },
              }}
            >
              Ver Salários Efetuados
            </Button>
          </Box>

          {/* FORM DE PROCESSAMENTO (INALTERADO) */}
          <Box
            sx={{
              p: 4,
              borderRadius: "28px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 30px 80px rgba(2,6,23,0.06)",
            }}
          >
            <FormSalarios />
          </Box>

          {/* 🔥 MODAL LISTA DE SALÁRIOS EFETUADOS */}
          <AnimatePresence>
            {openModalSalarios && (
              <Modal
                open={openModalSalarios}
                onClose={handleCloseSalarios}
                closeAfterTransition
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(18px)",
                  background:
                    "linear-gradient(180deg, rgba(2,6,23,0.75) 0%, rgba(15,23,42,0.9) 100%)",
                  p: 2,
                }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.85, y: 80 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 60 }}
                  transition={{ duration: 0.4 }}
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "1500px",
                    maxHeight: "92vh",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "32px",
                    overflow: "hidden",
                    background:
                      "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                    boxShadow:
                      "0 80px 180px rgba(2,6,23,0.7), 0 20px 60px rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.6)",
                  }}
                >
                  <Box
                    sx={{
                      px: 4,
                      py: 3,
                      background:
                        "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
                      color: "#fff",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h5" fontWeight={900}>
                      Lista de Salários Efetuados
                    </Typography>

                    <IconButton
                      onClick={handleCloseSalarios}
                      sx={{
                        background: "rgba(255,255,255,0.12)",
                        color: "#fff",
                        borderRadius: "14px",
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      p: 4,
                      overflowY: "auto",
                      flex: 1,
                      background:
                        "radial-gradient(circle at top, #ffffff 0%, #f1f5f9 100%)",
                    }}
                  >
                    <ListaSalarios />
                  </Box>
                </Box>
              </Modal>
            )}
          </AnimatePresence>
        </Stack>
      ),
    },
  };

  const menuButtonStyles = (active) => ({
    justifyContent: "flex-start",
    borderRadius: "20px",
    px: 3,
    py: 2,
    fontWeight: 900,
    textTransform: "none",
    width: "100%",
    color: active ? "#ffffff" : "#0f172a",
    background: active
      ? "linear-gradient(135deg, #020617 0%, #1e3a8a 100%)"
      : "#ffffff",
    border: active
      ? "1px solid rgba(255,255,255,0.15)"
      : "1px solid #e2e8f0",
    boxShadow: active
      ? "0 20px 45px rgba(30,58,138,0.35)"
      : "0 6px 18px rgba(0,0,0,0.05)",
    "&:hover": {
      transform: "translateX(6px) scale(1.02)",
      background: active
        ? "linear-gradient(135deg, #020617 0%, #1e40af 100%)"
        : "#f8fafc",
    },
  });

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #ffffff 0%, #f8fafc 40%, #eef2f7 100%)",
        px: { xs: 2, md: 6 },
        py: 5,
      }}
    >
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link underline="hover" sx={{ fontWeight: 700, color: "#64748b" }}>
          RH
        </Link>
        <Link underline="hover" sx={{ fontWeight: 700, color: "#64748b" }}>
          Gestão Financeira
        </Link>
        <Typography sx={{ fontWeight: 900, color: "#020617" }}>
          {modulos[formAtivo].titulo}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: "flex",
          gap: 4,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* SIDEBAR (INALTERADA) */}
        <Box
          sx={{
            width: { xs: "100%", md: 320 },
            minWidth: 300,
            borderRadius: "28px",
            p: 3,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 25px 60px rgba(15,23,42,0.06)",
            height: "fit-content",
          }}
        >
          <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 2 }}>
            MÓDULOS SALARIAIS
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <Button
              startIcon={<People />}
              onClick={() => setFormAtivo("funcionarios")}
              sx={menuButtonStyles(formAtivo === "funcionarios")}
            >
              Gestão de Funcionários
            </Button>

            <Button
              startIcon={<Payment />}
              onClick={() => setFormAtivo("subsidios")}
              sx={menuButtonStyles(formAtivo === "subsidios")}
            >
              Gestão de Subsídios
            </Button>

            <Button
              startIcon={<Discount />}
              onClick={() => setFormAtivo("descontos")}
              sx={menuButtonStyles(formAtivo === "descontos")}
            >
              Gestão de Descontos
            </Button>

            <Button
              startIcon={<AccountBalanceWallet />}
              onClick={() => setFormAtivo("salarios")}
              sx={menuButtonStyles(formAtivo === "salarios")}
            >
              Processamento Salarial
            </Button>
          </Stack>
        </Box>

        {/* CONTEÚDO */}
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              mb: 3,
              p: 4,
              borderRadius: "28px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 50px rgba(2,6,23,0.05)",
            }}
          >
            <Typography variant="h5" fontWeight={900}>
              {modulos[formAtivo].titulo}
            </Typography>

            <Typography sx={{ color: "#64748b", mt: 1 }}>
              {modulos[formAtivo].descricao}
            </Typography>
          </Box>

          <Box
            sx={{
              borderRadius: "32px",
              padding: "45px",
              minHeight: "560px",
              background: "#ffffff",
              boxShadow: "0 40px 100px rgba(2,6,23,0.07)",
              border: "1px solid #e2e8f0",
            }}
          >
            {modulos[formAtivo].componente}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}