import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import {
Box,
Typography,
CircularProgress,
Avatar,
Divider,
Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { FaBirthdayCake } from "react-icons/fa";
import { styled } from "@mui/material/styles";

import AniversarianteMes from "../components/AniversarioMes";


/* 🌌 FUNDO PREMIUM COM EFEITOS DE LUZ */
const Background = styled(Box)(({ theme }) => ({
minHeight: "100vh",
width: "100%",
background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #ffffff 100%)",
display: "flex",
flexDirection: "column",
alignItems: "center",
justifyContent: "flex-start",
padding: theme.spacing(10, 3),
position: "relative",
overflow: "hidden",
}));

/* ✨ EFEITO DE LUZES FLUTUANTES SUAVES */
const FloatingLights = styled("div")({
position: "absolute",
inset: 0,
zIndex: 0,
"&::before, &::after": {
content: '""',
position: "absolute",
borderRadius: "50%",
filter: "blur(160px)",
animation: "float 12s ease-in-out infinite alternate",
},
"&::before": {
top: "10%",
left: "-15%",
width: "500px",
height: "500px",
background: "rgba(0,132,255,0.25)",
},
"&::after": {
bottom: "-15%",
right: "-10%",
width: "600px",
height: "600px",
background: "rgba(0,212,255,0.25)",
},
"@keyframes float": {
"0%": { transform: "translateY(0)" },
"100%": { transform: "translateY(25px)" },
},
});

/* 💎 TÍTULO E SUBTÍTULO */
const Title = styled(Typography)(({ theme }) => ({
fontFamily: "'Raleway', sans-serif",
fontWeight: 900,
fontSize: "3.2rem",
background: "linear-gradient(90deg, #0038ff, #00c3ff)",
WebkitBackgroundClip: "text",
WebkitTextFillColor: "transparent",
textAlign: "center",
textShadow: "0px 4px 25px rgba(0,72,255,0.25)",
marginBottom: theme.spacing(1),
letterSpacing: "1px",
zIndex: 2,
}));

const Subtitle = styled(Typography)(({ theme }) => ({
fontFamily: "'Inter', sans-serif",
fontSize: "1.2rem",
color: "#003366",
textAlign: "center",
opacity: 0.85,
marginBottom: theme.spacing(6),
zIndex: 2,
}));

/* 🎁 CARTÕES E ELEMENTOS */
const CelebrationCard = styled(motion.div)(({ theme }) => ({
width: "100%",
maxWidth: "950px",
background:
"linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,245,255,0.8))",
borderRadius: "28px",
backdropFilter: "blur(25px)",
boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
padding: theme.spacing(4),
marginBottom: theme.spacing(4),
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: theme.spacing(4),
position: "relative",
overflow: "hidden",
transition: "transform 0.5s ease, box-shadow 0.5s ease",
"&:hover": {
transform: "translateY(-8px)",
boxShadow: "0 30px 90px rgba(0,100,255,0.25)",
},
}));

const CelebrationCardToday = styled(CelebrationCard)(() => ({
border: "2px solid rgba(255,215,0,0.6)",
background:
"linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,250,220,0.9))",
boxShadow: "0 0 40px rgba(255,215,0,0.35)",
"&::before": {
content: '""',
position: "absolute",
inset: 0,
borderRadius: "inherit",
background:
"radial-gradient(circle at 50% 50%, rgba(255,215,0,0.18), transparent 80%)",
animation: "pulse 3s ease-in-out infinite",
zIndex: 0,
},
"& *": {
position: "relative",
zIndex: 2,
},
"@keyframes pulse": {
"0%,100%": { opacity: 0.6 },
"50%": { opacity: 1 },
},
}));

const CakeIcon = styled(Avatar)(() => ({
width: 90,
height: 90,
fontSize: "2.8rem",
background: "linear-gradient(145deg, #0048ff, #00ccff)",
boxShadow: "0 12px 30px rgba(0,123,255,0.4)",
}));

const CelebrationText = styled(Box)(() => ({
display: "flex",
flexDirection: "column",
flex: 1,
color: "#002244",
}));

const Name = styled(Typography)(() => ({
fontWeight: 900,
fontSize: "2rem",
fontFamily: "'Raleway', sans-serif",
background: "linear-gradient(90deg, #0048ff, #00bfff)",
WebkitBackgroundClip: "text",
WebkitTextFillColor: "transparent",
textShadow: "0px 5px 25px rgba(0,102,255,0.25)",
letterSpacing: "0.8px",
}));

const NameToday = styled(Name)(() => ({
background: "linear-gradient(90deg, #cfa400, #fff6a0)",
WebkitBackgroundClip: "text",
WebkitTextFillColor: "transparent",
textShadow: "0px 3px 15px rgba(255,215,0,0.6)",
transform: "scale(1.08)",
}));

const Message = styled(Typography)(() => ({
fontSize: "1.1rem",
color: "#002b5c",
opacity: 0.9,
marginTop: 8,
lineHeight: 1.6,
fontFamily: "'Inter', sans-serif",
}));

const DateText = styled(Typography)(() => ({
fontSize: "0.9rem",
color: "#004c99",
opacity: 0.8,
marginTop: 14,
fontFamily: "'Inter', sans-serif",
}));

const MemberPhoto = styled(Avatar)(() => ({
width: 100,
height: 100,
borderRadius: "20px",
objectFit: "cover",
border: "3px solid rgba(0,102,255,0.2)",
boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
}));

const MemberPhotoToday = styled(MemberPhoto)(() => ({
border: "3px solid rgba(255,215,0,0.7)",
boxShadow: "0 0 40px rgba(255,215,0,0.6)",
}));

const TodayBadge = styled(Chip)(() => ({
position: "absolute",
top: 15,
right: 15,
background: "linear-gradient(90deg, #ffd700, #fff6b0)",
color: "#4d3b00",
fontWeight: 700,
fontFamily: "'Poppins', sans-serif",
boxShadow: "0 0 25px rgba(255,215,0,0.6)",
border: "1px solid rgba(255,215,0,0.4)",
zIndex: 3,
"& .MuiChip-label": {
fontSize: "0.9rem",
},
}));

const Notificacoes = () => {
const [notificacoes, setNotificacoes] = useState([]);
const [loading, setLoading] = useState(true);
const [atualizando, setAtualizando] = useState(false);

useEffect(() => {
const fetchNotificacoes = async () => {
try {
if (!loading) setAtualizando(true);
const response = await axios.get("/aniversarios");
setNotificacoes(response.data.todasNotificacoes || []);
} catch (error) {
console.error("Erro ao buscar notificações:", error);
} finally {
setLoading(false);
setTimeout(() => setAtualizando(false), 800);
}
};


fetchNotificacoes();
const interval = setInterval(fetchNotificacoes, 60000);
return () => clearInterval(interval);


}, []);

const isBirthdayToday = (dateStr) => {
const today = new Date();
const date = new Date(dateStr);
return (
date.getDate() === today.getDate() && date.getMonth() === today.getMonth()
);
};

const calculateAge = (dateStr) => {
if (!dateStr) return "-";
const birthDate = new Date(dateStr);
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear();
if (
today.getMonth() < birthDate.getMonth() ||
(today.getMonth() === birthDate.getMonth() &&
today.getDate() < birthDate.getDate())
) {
age--;
}
return age;
};

return ( <Background> <FloatingLights />


  <motion.div
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    style={{ zIndex: 2 }}
  >
    <Title>🎂 Aniversariantes</Title>
    <Subtitle>Comemore conosco cada momento especial 💙</Subtitle>

    {atualizando && (
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          opacity: 0.7,
          marginBottom: 2,
        }}
      >
        🔄 Atualizando lista...
      </Typography>
    )}
  </motion.div>

  {loading ? (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="50vh"
      zIndex={2}
    >
      <CircularProgress sx={{ color: "#0048ff" }} />
    </Box>
  ) : (
    <>
      <Box
        zIndex={2}
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="100%"
      >
        {notificacoes.length === 0 ? (
          <Box textAlign="center" mt={8}>
            <Typography
              variant="h6"
              sx={{
                color: "#003366",
                fontFamily: "'Inter', sans-serif",
                opacity: 0.9,
              }}
            >
              Nenhum aniversário recente 🎈
            </Typography>
          </Box>
        ) : (
          notificacoes.map((notif, index) => {
            const isToday = isBirthdayToday(notif.Membro?.data_nascimento);
            const Card = isToday ? CelebrationCardToday : CelebrationCard;
            const NameStyled = isToday ? NameToday : Name;
            const PhotoStyled = isToday ? MemberPhotoToday : MemberPhoto;
            const idade = calculateAge(notif.Membro?.data_nascimento);

            return (
              <Card
                key={notif.id || index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {isToday && <TodayBadge label="🎊 Aniversariante de Hoje!" />}

                <CakeIcon>
                  <FaBirthdayCake color="#fff" />
                </CakeIcon>

                <CelebrationText>
                  <NameStyled>
                    {notif.Membro?.nome || "Membro Desconhecido"}
                  </NameStyled>
                  <Typography
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: isToday ? "#cfa400" : "#0048ff",
                      marginBottom: 1,
                    }}
                  >
                    {idade} anos
                  </Typography>
                  <Divider
                    sx={{
                      width: "70px",
                      borderColor: isToday ? "#ffd700" : "#008cff",
                      borderWidth: "2px",
                      my: 1.5,
                      borderRadius: "10px",
                    }}
                  />
                  <Message>{notif.mensagem}</Message>
                  <DateText>
                    📅 Gerado em:{" "}
                    {new Date(notif.createdAt).toLocaleDateString("pt-BR")}
                  </DateText>
                </CelebrationText>

                {notif.Membro?.foto && (
                  <PhotoStyled
                    src={notif.Membro.foto}
                    alt={notif.Membro.nome}
                  />
                )}
              </Card>
            );
          })
        )}
      </Box>

    

      <Box sx={{ width: "100%", mt: 8 }}>
        <AniversarianteMes />
      </Box>
    </>
  )}
</Background>


);
};

export default Notificacoes;
