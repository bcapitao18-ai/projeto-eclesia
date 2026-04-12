import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Grid,
  Fade,
  Chip,
  Stack,
  Divider,
} from "@mui/material";

import {
  Paid,
  Person,
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";



import api from "../api/axiosConfig";

export default function FormSalario({
  salarioEditando = null,
  onSalvo = () => {},
}) {
  const modoEdicao = !!salarioEditando;

  const [funcionarios, setFuncionarios] = useState([]);
  const [subsidios, setSubsidios] = useState([]);
  const [descontos, setDescontos] = useState([]);

  const [FuncionarioId, setFuncionarioId] = useState("");
  const [mesAno, setMesAno] = useState("");

  const [subsidiosSelecionados, setSubsidiosSelecionados] = useState([]);
  const [descontosSelecionados, setDescontosSelecionados] = useState([]);

  const [salarioBase, setSalarioBase] = useState(0);

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

 const [openSucesso, setOpenSucesso] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const load = async () => {
      try {
        const [f, s, d] = await Promise.all([
          api.get("/funcionarios", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/subsidios", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/descontos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setFuncionarios(f.data || []);
        setSubsidios(s.data || []);
        setDescontos(d.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  const subsidioMap = useMemo(() => {
    const map = {};
    subsidios.forEach((s) => (map[s.id] = Number(s.percentagem || 0)));
    return map;
  }, [subsidios]);

  const descontoMap = useMemo(() => {
    const map = {};
    descontos.forEach((d) => (map[d.id] = Number(d.percentagem || 0)));
    return map;
  }, [descontos]);

  const handleFuncionarioChange = (id) => {
    const f = funcionarios.find((x) => x.id === id);
    setFuncionarioId(id);
    setSalarioBase(Number(f?.salario_base || 0));
  };

  const totalSubs = useMemo(() => {
    return subsidiosSelecionados.reduce((acc, id) => {
      const percent = subsidioMap[id] || 0;
      return acc + (salarioBase * percent) / 100;
    }, 0);
  }, [subsidiosSelecionados, salarioBase, subsidioMap]);

  const totalDesc = useMemo(() => {
    return descontosSelecionados.reduce((acc, id) => {
      const percent = descontoMap[id] || 0;
      return acc + (salarioBase * percent) / 100;
    }, 0);
  }, [descontosSelecionados, salarioBase, descontoMap]);

  const liquido = salarioBase + totalSubs - totalDesc;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        FuncionarioId,
        mes_ano: mesAno,
        subsidiosAplicados: subsidiosSelecionados,
        descontosAplicados: descontosSelecionados,
      };

      if (modoEdicao) {
        await api.put(`/salarios/${salarioEditando.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

onSalvo();
setOpenSucesso(true);


      } else {
        await api.post(`/salarios`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        
onSalvo();
setOpenSucesso(true);

      }

      onSalvo();
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in>
      <Box sx={{ p: 3, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            bgcolor: "#ffffff",
            maxWidth: 1100,
            mx: "auto",
          }}
        >
          <CardContent sx={{ p: 4 }}>

            {/* HEADER */}
            <Stack spacing={0.5} mb={3}>
              <Typography variant="h5" fontWeight={800}>
                Processamento Salarial
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestão inteligente de salários com subsídios e descontos automáticos
              </Typography>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2.5}>

                <Grid item xs={12} md={6}>
                  <TextField
                    type="month"
                    value={mesAno}
                    onChange={(e) => setMesAno(e.target.value)}
                    fullWidth
                    label="Mês / Ano"
                    sx={{ bgcolor: "#fff" }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Funcionário</InputLabel>
                    <Select
                      value={FuncionarioId}
                      onChange={(e) => handleFuncionarioChange(e.target.value)}
                      input={<OutlinedInput label="Funcionário" />}
                      sx={{ bgcolor: "#fff" }}
                    >
                      {funcionarios.map((f) => (
                        <MenuItem
                          key={f.id}
                          value={f.id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 1,
                            py: 1.2,
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Person fontSize="small" />
                            <Typography fontWeight={600}>
                              {f.Membro?.nome}
                            </Typography>
                          </Stack>

                          <Typography variant="caption" color="text.secondary">
                            Base: {Number(f.salario_base).toFixed(2)} Kz
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* SUBSÍDIOS */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Subsídios</InputLabel>
                    <Select
                      multiple
                      value={subsidiosSelecionados}
                      onChange={(e) => setSubsidiosSelecionados(e.target.value)}
                      input={<OutlinedInput label="Subsídios" />}
                      sx={{ bgcolor: "#fff" }}
                      renderValue={(selected) => (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {selected.map((id) => (
                            <Chip
                              key={id}
                              label={subsidios.find((s) => s.id === id)?.nome}
                              size="small"
                            />
                          ))}
                        </Stack>
                      )}
                    >
                      {subsidios.map((s) => {
                        const percent = subsidioMap[s.id] || 0;
                        const valor = (salarioBase * percent) / 100;

                        return (
                          <MenuItem key={s.id} value={s.id}>
                            <Checkbox checked={subsidiosSelecionados.includes(s.id)} />
                            <ListItemText
                              primary={s.nome}
                              secondary={`+${percent}% • +${valor.toFixed(2)} Kz`}
                            />
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                {/* DESCONTOS (🔥 VERMELHO PREMIUM) */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Descontos</InputLabel>
                    <Select
                      multiple
                      value={descontosSelecionados}
                      onChange={(e) => setDescontosSelecionados(e.target.value)}
                      input={<OutlinedInput label="Descontos" />}
                      sx={{
                        bgcolor: "#fff",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(220,38,38,0.2)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(220,38,38,0.4)",
                        },
                      }}
                    >
                      {descontos.map((d) => {
                        const percent = descontoMap[d.id] || 0;
                        const valor = (salarioBase * percent) / 100;

                        return (
                          <MenuItem
                            key={d.id}
                            value={d.id}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Stack direction="row" alignItems="center">
                              <Checkbox
                                checked={descontosSelecionados.includes(d.id)}
                                sx={{ color: "#dc2626" }}
                              />
                              <ListItemText primary={d.nome} />
                            </Stack>

                            <Typography variant="caption" color="error">
                              -{percent}% ({valor.toFixed(2)} Kz)
                            </Typography>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* RESUMO */}
              <Box mt={4}>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <SummaryCard title="Base" value={salarioBase} icon={<AccountBalanceWallet />} />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <SummaryCard title="Subsídios" value={totalSubs} icon={<TrendingUp />} />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <SummaryCard title="Descontos" value={totalDesc} icon={<TrendingDown />} danger />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <SummaryCard title="Líquido" value={liquido} icon={<Paid />} highlight />
                  </Grid>
                </Grid>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{
                  mt: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  bgcolor: "#111827",
                  "&:hover": { bgcolor: "#000" },
                }}
              >
                {salvando ? "Processando..." : "Salvar Salário"}
              </Button>

            </form>
          </CardContent>
        </Card>
        <Dialog
  open={openSucesso}
  onClose={() => setOpenSucesso(false)}
  PaperProps={{
    sx: {
      borderRadius: 5,
      p: 3,
      textAlign: "center",
      width: 380,
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(14px)",
      border: "1px solid rgba(255,255,255,0.6)",
      boxShadow: "0 25px 80px rgba(0,0,0,0.12)",
      overflow: "hidden",
      position: "relative",
    },
  }}
  TransitionProps={{
    timeout: 350,
  }}
>
  <DialogContent sx={{ py: 2 }}>
    
    {/* ICON CIRCLE */}
    <Box
      sx={{
        width: 90,
        height: 90,
        borderRadius: "50%",
        mx: "auto",
        mb: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #dcfce7, #bbf7d0)",
        animation: "pop .4s ease",
      }}
    >
      <CheckCircleOutlineIcon
        sx={{
          fontSize: 48,
          color: "#16a34a",
        }}
      />
    </Box>

    {/* TITLE */}
    <Typography fontWeight={900} fontSize={22} color="#0f172a">
      Sucesso
    </Typography>

    {/* SUBTITLE */}
    <Typography
      fontSize={13}
      sx={{
        color: "rgba(15,23,42,0.6)",
        mt: 1,
      }}
    >
      Salário processado com sucesso e guardado no sistema.
    </Typography>

    {/* BUTTON */}
    <Button
      onClick={() => setOpenSucesso(false)}
      variant="contained"
      sx={{
        mt: 3,
        borderRadius: 999,
        px: 4,
        py: 1,
        fontWeight: 700,
        textTransform: "none",
        background: "linear-gradient(135deg, #16a34a, #22c55e)",
        boxShadow: "0 10px 25px rgba(34,197,94,0.25)",
        "&:hover": {
          background: "linear-gradient(135deg, #15803d, #16a34a)",
        },
      }}
    >
      Continuar
    </Button>

    {/* ANIMATION */}
    <style>
      {`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}
    </style>
  </DialogContent>
</Dialog>
      </Box>
    </Fade>
  );
}

/* CARD PREMIUM MELHORADO */
function SummaryCard({ title, value, icon, highlight, danger }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        bgcolor: highlight ? "#0f172a" : danger ? "#fef2f2" : "#fff",
        color: highlight ? "#fff" : "inherit",
        border: danger ? "1px solid #fecaca" : "1px solid #eee",
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontSize={12} color={highlight ? "#cbd5e1" : "text.secondary"}>
              {title}
            </Typography>
            <Box>{icon}</Box>
          </Stack>

          <Typography fontWeight={800} fontSize={18}>
            {Number(value).toFixed(2)} Kz
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}