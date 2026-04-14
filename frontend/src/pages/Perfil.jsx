import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
  InputAdornment,
  IconButton,
  OutlinedInput,
  FormControl,
  InputLabel,
  Chip,
  Divider
} from '@mui/material';

import { motion } from 'framer-motion';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import api from '../api/axiosConfig';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formUsuario, setFormUsuario] = useState({
    nome: '',
    senha: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const fetchPerfil = async () => {
    try {
      const res = await api.get('/meu-perfil');
      setUsuario(res.data.usuario);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  const handleOpen = () => {
    setFormUsuario({
      nome: usuario.nome,
      senha: '',
    });
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      await api.put('/meu-perfil', formUsuario);

      setSnackbar({
        open: true,
        message: 'Perfil atualizado com sucesso!',
        severity: 'success'
      });

      setOpenModal(false);
      fetchPerfil();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar perfil',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={styles.center}>
        <CircularProgress />
      </Box>
    );
  }

  if (!usuario) {
    return (
      <Typography align="center" color="error" sx={{ mt: 10 }}>
        Erro ao carregar perfil
      </Typography>
    );
  }

  const membro = usuario.membro;

  return (
    <Box sx={styles.page}>

      <Box sx={styles.bgGlow} />

      <MotionPaper sx={styles.header} />

      <MotionPaper sx={styles.profileCard}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">

          <Avatar
            src={membro?.foto || usuario.foto || ''}
            sx={styles.avatar}
          />

          <Box flex={1}>
            <Typography variant="h4" fontWeight={900}>
              {usuario.nome}
            </Typography>

            <Typography color="text.secondary">
              {membro?.email}
            </Typography>

            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              {(membro?.cargos || []).map((cargo) => (
                <Chip
                  key={cargo.id}
                  label={cargo.nome}
                  sx={styles.chip}
                />
              ))}
            </Stack>
          </Box>

          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleOpen}
            sx={styles.button}
          >
            Editar
          </Button>
        </Stack>
      </MotionPaper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mt={4}>
        <StatCard title="Perfil Completo" value="98%" />
        <StatCard title="Atividade" value="Alta" />
        <StatCard title="Segurança" value="Protegido" />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mt={3}>

        <InfoCard title="Contactos">
          <Info label="Telefone" value={membro?.telefone || 'N/D'} />
          <Divider sx={{ my: 2 }} />
          <Info label="Email" value={membro?.email || 'N/D'} />
        </InfoCard>

        <InfoCard title="Organização">
          <Info label="Sede" value={usuario.Sede?.nome || 'N/D'} />
          <Divider sx={{ my: 2 }} />
          <Info label="Filial" value={usuario.Filhal?.nome || 'N/D'} />
        </InfoCard>

        <InfoCard title="Segurança">
          <Typography color="text.secondary">
            A tua conta está protegida com nível elevado de segurança.
            A sua senha está bem protejida e incriptografada. Se desejar mudá-la use a ediçao de perfil.
          </Typography>
        </InfoCard>
      </Stack>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Nome"
              value={formUsuario.nome}
              onChange={(e) => setFormUsuario({ ...formUsuario, nome: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Senha</InputLabel>
              <OutlinedInput
                type={showPassword ? 'text' : 'password'}
                value={formUsuario.senha}
                onChange={(e) => setFormUsuario({ ...formUsuario, senha: e.target.value })}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* ---------- COMPONENTES ---------- */

function Info({ label, value }) {
  return (
    <Box>
      <Typography fontSize={12} color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={700}>{value}</Typography>
    </Box>
  );
}

function InfoCard({ title, children }) {
  return (
    <Paper sx={styles.card}>
      <Typography fontWeight={900} mb={2}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function StatCard({ title, value }) {
  return (
    <MotionPaper whileHover={{ scale: 1.03 }} sx={styles.statCard}>
      <Typography fontSize={12} color="text.secondary">
        {title}
      </Typography>
      <Typography fontSize={26} fontWeight={900}>
        {value}
      </Typography>
    </MotionPaper>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  page: {
    minHeight: '100vh',
    p: 4,
    background: 'radial-gradient(circle at top, #eef2ff, #f8fafc)'
  },

  bgGlow: {
    position: 'absolute',
    width: 500,
    height: 500,
    background: 'radial-gradient(circle, rgba(59,130,246,0.25), transparent)', // 🔵 só azul
    filter: 'blur(100px)',
    top: -100,
    right: -100,
    zIndex: 0
  },

  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh'
  },

  header: {
    height: 220,
    borderRadius: 6,
    background: 'linear-gradient(135deg,#6366f1,#3b82f6)', // 🔵 removido verde
    boxShadow: '0 25px 60px rgba(0,0,0,0.2)'
  },

  profileCard: {
    mt: -10,
    p: 4,
    borderRadius: 6,
    backdropFilter: 'blur(20px)',
    background: 'rgba(255,255,255,0.7)',
    boxShadow: '0 25px 80px rgba(0,0,0,0.08)',
    position: 'relative',
    zIndex: 2
  },

  avatar: {
    width: 150,
    height: 150,
    border: '5px solid white',
    boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
  },

  chip: {
    background: 'linear-gradient(135deg,#4f46e5,#3b82f6)',
    color: 'white',
    fontWeight: 700
  },

  button: {
    borderRadius: 4,
    px: 4,
    py: 1.5,
    fontWeight: 800,
    background: 'linear-gradient(135deg,#6366f1,#3b82f6)'
  },

  card: {
    flex: 1,
    p: 3,
    borderRadius: 5,
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.06)'
  },

  statCard: {
    flex: 1,
    p: 3,
    borderRadius: 5,
    background: 'white',
    boxShadow: '0 15px 40px rgba(0,0,0,0.08)'
  }
};