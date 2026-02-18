// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { 
  FaUsers, FaUserPlus, FaMoneyBillWave, FaChartPie, FaBalanceScale, 
  FaCalendarAlt, FaVenusMars, FaChild, FaHeart, FaExclamationTriangle 
} from "react-icons/fa";
import { Box, Typography, Paper, Grid, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import Graficos from "../components/Graficos";

import Crincas from "../components/Criancas";
/* ---------- ESTILOS ---------- */
const DashboardCard = styled(Paper)(({ theme }) => ({
  padding: "35px 30px",
  borderRadius: "28px",
  minHeight: "250px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  background: "linear-gradient(145deg, #ffffff, #e3e9ff)",
  backdropFilter: "blur(8px)",
  boxShadow: "0 30px 60px rgba(0,0,0,0.08), 0 0 30px rgba(0,86,255,0.2)",
  transition: "all 0.4s ease",
  "&:hover": {
    transform: "translateY(-15px) scale(1.07)",
    boxShadow: "0 40px 80px rgba(0,0,0,0.15), 0 0 50px rgba(0,86,255,0.25)",
  },
}));

const IconWrapper = styled(Box)({
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #0056FF, #00D4FF)",
  boxShadow: "0 10px 20px rgba(0,86,255,0.3), 0 0 15px rgba(0,212,255,0.4)",
  marginBottom: "14px",
  "& svg": {
    color: "#fff",
    width: "40px",
    height: "40px",
  },
});

const CardTitle = styled(Typography)({
  fontWeight: 700,
  fontFamily: "'Poppins', sans-serif",
  fontSize: "1.25rem",
  marginTop: "12px",
  color: "#333",
});

const CardValue = styled(Typography)({
  fontWeight: 800,
  fontSize: "2.4rem",
  fontFamily: "'Poppins', sans-serif",
  marginTop: "8px",
  color: "#0056FF",
});

const BadgeContainer = styled(Box)({
  marginTop: "14px",
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  flexWrap: "wrap",
});

const GlassBadge = styled(Box)({
  backdropFilter: "blur(6px)",
  backgroundColor: "rgba(0,0,0,0.25)",
  color: "#fff",
  padding: "10px 22px",
  borderRadius: "18px",
  fontWeight: 700,
  fontSize: "1rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
});

const SubGrid = styled(Grid)({
  marginTop: "14px",
  width: "100%",
});

/* ---------- COMPONENTE ---------- */
export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        setDados(res.data);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress color="primary" size={80} />
      </Box>
    );
  }

  if (!dados) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="error">
          Não foi possível carregar os dados do dashboard.
        </Typography>
      </Box>
    );
  }

  const { membros, novosMembrosMes, financeiro, proximosEventos } = dados;

  return (
    <Box sx={{ backgroundColor: "#f0f3ff", minHeight: "100vh", py: 24, px: { xs: 3, md: 12 } }}>
      <Grid container spacing={7} justifyContent="center">

        {/* Total de Membros */}
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <DashboardCard component={motion.div} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <IconWrapper><FaUsers /></IconWrapper>
            <CardTitle>Total de Membros</CardTitle>
            <CardValue>{membros.total}</CardValue>
            <BadgeContainer>
              <GlassBadge sx={{ backgroundColor: "rgba(76,175,80,0.8)" }}>Ativos: {membros.ativos.total}</GlassBadge>
              <GlassBadge sx={{ backgroundColor: "rgba(244,67,54,0.8)" }}>Inativos: {membros.inativos.total}</GlassBadge>
            </BadgeContainer>
          </DashboardCard>
        </Grid>

        {/* Novos Membros */}
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <DashboardCard component={motion.div} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <IconWrapper><FaUserPlus /></IconWrapper>
            <CardTitle>Novos Membros (Mês)</CardTitle>
            <CardValue>{novosMembrosMes}</CardValue>
          </DashboardCard>
        </Grid>

        {/* Contribuições */}
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <DashboardCard component={motion.div} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <IconWrapper><FaMoneyBillWave /></IconWrapper>
            <CardTitle>Contribuições (Total)</CardTitle>
            <CardValue>{financeiro.totalContribuicoesMes.toLocaleString()} Kz</CardValue>
          </DashboardCard>
        </Grid>

        {/* Despesas */}
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <DashboardCard component={motion.div} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <IconWrapper sx={{ background: "linear-gradient(135deg, #f44336, #ff7961)" }}>
              <FaChartPie />
            </IconWrapper>
            <CardTitle>Despesas (Mês)</CardTitle>
            {/* 🔴 Valor em vermelho */}
            <CardValue sx={{ color: "#f44336" }}>
              {financeiro.despesasMes.toLocaleString()} Kz
            </CardValue>
          </DashboardCard>
        </Grid>

        {/* Saldo Financeiro */}
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <DashboardCard component={motion.div} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <IconWrapper><FaBalanceScale /></IconWrapper>
            <CardTitle>Saldo Financeiro</CardTitle>
            <CardValue sx={{ color: financeiro.saldoFinanceiro >= 0 ? "#4caf50" : "#f44336" }}>
              {financeiro.saldoFinanceiro.toLocaleString()} Kz
            </CardValue>
          </DashboardCard>
        </Grid>

        {/* Distribuição por Gênero */}
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <DashboardCard component={motion.div} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            <IconWrapper><FaVenusMars /></IconWrapper>
            <CardTitle>Distribuição por Gênero</CardTitle>
            <SubGrid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 3, textAlign: "center", borderRadius: "20px", bgcolor: "rgba(76,175,255,0.7)", boxShadow: "0 8px 20px rgba(0,86,255,0.2)" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Homens</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{membros.distribuicaoGenero.homens}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 3, textAlign: "center", borderRadius: "20px", bgcolor: "rgba(244,67,54,0.7)", boxShadow: "0 8px 20px rgba(255,0,86,0.2)" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Mulheres</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{membros.distribuicaoGenero.mulheres}</Typography>
                </Paper>
              </Grid>
            </SubGrid>
          </DashboardCard>
        </Grid>

        {/* Faixas Etárias */}
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <DashboardCard component={motion.div} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
            <IconWrapper><FaChild /></IconWrapper>
            <CardTitle>Faixas Etárias</CardTitle>
            <SubGrid container spacing={1}>
              {Object.entries(membros.faixasEtarias).map(([faixa, total], idx) => (
                <Grid item xs={6} key={idx}>
                  <Paper sx={{ p: 2, textAlign: "center", borderRadius: "16px", bgcolor: "rgba(255,243,224,0.7)", boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{faixa}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{total}</Typography>
                  </Paper>
                </Grid>
              ))}
            </SubGrid>
          </DashboardCard>
        </Grid>

        {/* Situação de Batismo */}
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <DashboardCard component={motion.div} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
            <IconWrapper sx={{ background: "linear-gradient(135deg, #FF1744, #FF616F)" }}><FaHeart /></IconWrapper>
            <CardTitle>Situação de Batismo</CardTitle>
            <BadgeContainer>
              <GlassBadge sx={{ backgroundColor: "rgba(76,175,80,0.7)" }}>Batizados: {membros.situacaoBatismo.batizados}</GlassBadge>
              <GlassBadge sx={{ backgroundColor: "rgba(244,67,54,0.7)" }}>Não Batizados: {membros.situacaoBatismo.naoBatizados}</GlassBadge>
            </BadgeContainer>
          </DashboardCard>
        </Grid>

        {/* Próximos Cultos */}
        <Grid item xs={12}>
          <DashboardCard component={motion.div} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
            <IconWrapper><FaCalendarAlt /></IconWrapper>
            <CardTitle>Próximos Cultos ({proximosEventos.quantidade})</CardTitle>
            <Box sx={{ maxHeight: "240px", overflowY: "auto", textAlign: "left", mt: 2 }}>
              {proximosEventos.nomes.length > 0 ? (
                proximosEventos.nomes.map((nome, index) => (
                  <Typography key={index} sx={{ py: 0.5 }}>{nome}</Typography>
                ))
              ) : (
                <Typography sx={{ color: "#aaa", py: 0.5 }}>Nenhum culto futuro</Typography>
              )}
            </Box>
            {proximosEventos.alertas.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle1"
                  color="error"
                  sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <FaExclamationTriangle /> Alertas de Eventos
                </Typography>
                <Box sx={{ maxHeight: "220px", overflowY: "auto" }}>
                  {proximosEventos.alertas.map(alerta => (
                    <Typography key={alerta.id} sx={{ py: 0.5 }}>
                      {alerta.tipo} - {new Date(alerta.data).toLocaleString()} | Presença: {alerta.presenca} | Contribuição: {alerta.contribuicao.toLocaleString()} Kz
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </DashboardCard>
        </Grid>

      </Grid>

      <Box sx={{ mt: 16 }}>
        <Crincas />
      </Box>

      {/* GRÁFICOS */}
      <Box sx={{ mt: 16 }}>
        <Graficos />
      </Box>
    </Box>
  );
}
