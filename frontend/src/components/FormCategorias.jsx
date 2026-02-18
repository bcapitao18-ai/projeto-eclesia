// src/components/FormCategoria.jsx
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { Category } from '@mui/icons-material';
import api from '../api/axiosConfig';

export default function FormCategoria({ categoria = null, onSuccess, onCancel }) {
  const [nome, setNome] = useState(categoria?.nome || '');
  const [descricao, setDescricao] = useState(categoria?.descricao || '');
  const [ativa, setAtiva] = useState(
    categoria?.ativa !== undefined ? categoria.ativa : true
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      return alert('O nome da categoria é obrigatório.');
    }

    setLoading(true);

    const payload = {
      nome,
      descricao: descricao || null,
      ativa
    };

    try {
      if (categoria) {
        await api.put(`/categorias/${categoria.id}`, payload);
      } else {
        await api.post('/categorias', payload);
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(180deg, #fafbff 0%, #f4f6fc 100%)'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 560,
          p: 5,
          borderRadius: 5,
          background: '#ffffff',
          border: '1px solid rgba(15,23,42,0.06)',
          boxShadow: `
            0 10px 30px rgba(15,23,42,0.04),
            0 2px 10px rgba(15,23,42,0.03)
          `,
          transition: 'all 0.35s ease',
          '&:hover': {
            boxShadow: `
              0 20px 60px rgba(15,23,42,0.08),
              0 8px 25px rgba(15,23,42,0.05)
            `,
            transform: 'translateY(-2px)'
          }
        }}
      >
        {/* HEADER PREMIUM */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Chip
            icon={<Category sx={{ fontSize: 18 }} />}
            label="Organização Financeira"
            sx={{
              mb: 2,
              fontWeight: 600,
              background: 'rgba(99,102,241,0.08)',
              color: '#6366f1',
              borderRadius: 2
            }}
          />

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: '#0f172a'
            }}
          >
            {categoria ? 'Editar Categoria' : 'Nova Categoria'}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 1,
              color: '#64748b',
              fontWeight: 400
            }}
          >
            Organize suas despesas com categorias elegantes e inteligentes
          </Typography>
        </Box>

        <Divider
          sx={{
            mb: 4,
            borderColor: 'rgba(15,23,42,0.06)'
          }}
        />

        <Box component="form" onSubmit={handleSubmit}>
          {/* NOME */}
          <TextField
            label="Nome da Categoria"
            placeholder="Ex: Alimentação, Transporte, Internet..."
            fullWidth
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            sx={premiumInput}
          />

          {/* DESCRIÇÃO */}
          <TextField
            label="Descrição (Opcional)"
            placeholder="Descreva o objetivo desta categoria..."
            fullWidth
            multiline
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            sx={premiumInput}
          />

          {/* STATUS ATIVO */}
          <Box
            sx={{
              mt: 2,
              mb: 3,
              p: 2,
              borderRadius: 3,
              background: '#f8fafc',
              border: '1px solid rgba(15,23,42,0.06)'
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={ativa}
                  onChange={(e) => setAtiva(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#6366f1'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#6366f1'
                    }
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: '#0f172a'
                  }}
                >
                  Categoria ativa
                </Typography>
              }
            />
          </Box>

          {/* BOTÕES */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: '1px solid rgba(15,23,42,0.06)'
            }}
          >
            <Button
              onClick={onCancel}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: '#64748b',
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  background: '#f1f5f9'
                }
              }}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 15,
                px: 5,
                py: 1.4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 10px 25px rgba(99,102,241,0.25)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 18px 40px rgba(99,102,241,0.35)'
                }
              }}
            >
              {loading
                ? 'Salvando...'
                : categoria
                ? 'Atualizar Categoria'
                : 'Cadastrar Categoria'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

const premiumInput = {
  mb: 2.5,
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    background: '#ffffff',
    fontWeight: 500,
    transition: 'all 0.25s ease',
    '& fieldset': {
      borderColor: 'rgba(15,23,42,0.12)'
    },
    '&:hover fieldset': {
      borderColor: '#6366f1'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6366f1',
      borderWidth: '1.5px'
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    color: '#334155'
  },
  '& .MuiInputBase-input': {
    color: '#0f172a',
    fontWeight: 500
  }
};
