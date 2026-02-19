// src/pages/FormSalario.jsx
import React, { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Grid,
  Chip,
  Divider,
  Fade,
} from "@mui/material";
import {
  Paid,
  Person,
  CalendarMonth,
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";

export default function FormSalario() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [subsidios, setSubsidios] = useState([]);
  const [descontos, setDescontos] = useState([]);
  const [FuncionarioId, setFuncionarioId] = useState("");
  const [mesAno, setMesAno] = useState("");
  const [subsidiosSelecionados, setSubsidiosSelecionados] = useState([]);
  const [descontosSelecionados, setDescontosSelecionados] = useState([]);
  const [valores, setValores] = useState({
    salario_base: 0,
    total_subsidios: 0,
    total_descontos: 0,
    salario_liquido: 0,
  });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        const [resFunc, resSubs, resDesc] = await Promise.all([
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
        setFuncionarios(resFunc.data);
        setSubsidios(resSubs.data);
        setDescontos(resDesc.data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };
    fetchData();
  }, []);

  const handleFuncionarioChange = (id) => {
    const funcionario = funcionarios.find((f) => f.id === id);
    setFuncionarioId(id);
    setValores((v) => ({
      ...v,
      salario_base: funcionario ? parseFloat(funcionario.salario_base) : 0,
    }));
  };

  useEffect(() => {
    const totalSubs = subsidios
      .filter((s) => subsidiosSelecionados.includes(s.id))
      .reduce((acc, s) => acc + parseFloat(s.valor), 0);

    const totalDesc = descontos
      .filter((d) => descontosSelecionados.includes(d.id))
      .reduce((acc, d) => acc + parseFloat(d.valor), 0);

    const salario_liquido =
      parseFloat(valores.salario_base || 0) + totalSubs - totalDesc;

    setValores((v) => ({
      ...v,
      total_subsidios: totalSubs,
      total_descontos: totalDesc,
      salario_liquido,
    }));
  }, [subsidiosSelecionados, descontosSelecionados, valores.salario_base]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem({ tipo: "", texto: "" });

    try {
      const token = localStorage.getItem("token");

      const subsidiosAplicados = subsidios
        .filter((s) => subsidiosSelecionados.includes(s.id))
        .map((s) => ({ id: s.id, valor: s.valor }));

      const descontosAplicados = descontos
        .filter((d) => descontosSelecionados.includes(d.id))
        .map((d) => ({ id: d.id, valor: d.valor }));

      await api.post(
        "/salarios",
        {
          FuncionarioId,
          mes_ano: mesAno,
          subsidiosAplicados,
          descontosAplicados,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMensagem({ tipo: "success", texto: "Salário gerado com sucesso!" });
      setFuncionarioId("");
      setMesAno("");
      setSubsidiosSelecionados([]);
      setDescontosSelecionados([]);
      setValores({
        salario_base: 0,
        total_subsidios: 0,
        total_descontos: 0,
        salario_liquido: 0,
      });
    } catch (error) {
      console.error("Erro ao gerar salário:", error);
      setMensagem({ tipo: "error", texto: "Erro ao gerar salário." });
    } finally {
      setSalvando(false);
    }
  };

  const calcularPercentualDesconto = (valorDesconto) =>
    valores.salario_base > 0
      ? ((valorDesconto / valores.salario_base) * 100).toFixed(2)
      : "0.00";

  const cardResumo = (titulo, valor, icon, color) => (
    <Box
      sx={{
        p: 3,
        borderRadius: "20px",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(15,23,42,0.06)",
        boxShadow: "0 15px 45px rgba(2,6,23,0.08)",
        transition: "all 0.35s ease",
        "&:hover": {
          transform: "translateY(-4px) scale(1.01)",
          boxShadow: "0 25px 60px rgba(2,6,23,0.12)",
        },
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#64748b",
              letterSpacing: "0.5px",
            }}
          >
            {titulo}
          </Typography>
          <Typography
            sx={{
              fontSize: "1.4rem",
              fontWeight: 900,
              color: "#020617",
              mt: 0.5,
            }}
          >
            {valor.toFixed(2)} Kz
          </Typography>
        </Box>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: color,
            color: "#fff",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          }}
        >
          {icon}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Fade in timeout={700}>
      <Box
        sx={{
          minHeight: "100vh",
          p: { xs: 2, md: 6 },
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          background:
            "radial-gradient(circle at top, #eef2ff 0%, #f8fafc 40%, #ffffff 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 1100 }}
        >
          <Card
            sx={{
              borderRadius: "30px",
              overflow: "hidden",
              background:
                "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid rgba(2,6,23,0.04)",
              boxShadow:
                "0 40px 120px rgba(2,6,23,0.12)",
            }}
          >
            {/* HEADER LUXUOSO */}
            <Box
              sx={{
                p: 4,
                background:
                  "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  right: -60,
                  top: -60,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "rgba(59,130,246,0.25)",
                  filter: "blur(90px)",
                }}
              />

              <Box display="flex" alignItems="center" gap={2}>
                <Paid sx={{ fontSize: 42, color: "#60a5fa" }} />
                <Box>
                  <Typography variant="h4" fontWeight={900}>
                    Processamento Salarial Premium
                  </Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    Geração inteligente e automatizada de salários com controlo financeiro avançado
                  </Typography>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Mês */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Período (Mês/Ano)"
                      type="month"
                      value={mesAno}
                      onChange={(e) => setMesAno(e.target.value)}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* Funcionário */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Selecionar Funcionário</InputLabel>
                      <Select
                        value={FuncionarioId}
                        onChange={(e) =>
                          handleFuncionarioChange(e.target.value)
                        }
                        label="Selecionar Funcionário"
                      >
                        {funcionarios.length === 0 ? (
                          <MenuItem disabled>
                            Nenhum funcionário encontrado
                          </MenuItem>
                        ) : (
                          funcionarios.map((f) => (
                            <MenuItem key={f.id} value={f.id}>
                              <Person sx={{ mr: 1, fontSize: 18 }} />
                              {f.Membro?.nome || `Funcionário #${f.id}`}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Subsídios */}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Subsídios Aplicáveis</InputLabel>
                      <Select
                        multiple
                        value={subsidiosSelecionados}
                        onChange={(e) =>
                          setSubsidiosSelecionados(e.target.value)
                        }
                        input={<OutlinedInput label="Subsídios Aplicáveis" />}
                        renderValue={(selected) =>
                          selected
                            .map(
                              (id) =>
                                subsidios.find((s) => s.id === id)?.nome
                            )
                            .join(", ")
                        }
                      >
                        {subsidios.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            <Checkbox
                              checked={subsidiosSelecionados.includes(s.id)}
                            />
                            <ListItemText
                              primary={s.nome}
                              secondary={`+ ${s.valor} Kz`}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Descontos */}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Descontos Aplicáveis</InputLabel>
                      <Select
                        multiple
                        value={descontosSelecionados}
                        onChange={(e) =>
                          setDescontosSelecionados(e.target.value)
                        }
                        input={<OutlinedInput label="Descontos Aplicáveis" />}
                        renderValue={(selected) =>
                          selected
                            .map(
                              (id) =>
                                descontos.find((d) => d.id === id)?.nome
                            )
                            .join(", ")
                        }
                      >
                        {descontos.map((d) => (
                          <MenuItem key={d.id} value={d.id}>
                            <Checkbox
                              checked={descontosSelecionados.includes(d.id)}
                            />
                            <ListItemText
                              primary={d.nome}
                              secondary={`- ${d.valor} Kz`}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* RESUMO FINANCEIRO PREMIUM (SEM ÍCONES FEIOS) */}
                <Box sx={{ mt: 5 }}>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{ mb: 2, color: "#020617" }}
                  >
                    Resumo Financeiro
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      {cardResumo(
                        "Salário Base",
                        valores.salario_base,
                        <AccountBalanceWallet />,
                        "linear-gradient(135deg,#1e3a8a,#2563eb)"
                      )}
                    </Grid>

                    <Grid item xs={12} md={3}>
                      {cardResumo(
                        "Total de Subsídios",
                        valores.total_subsidios,
                        <TrendingUp />,
                        "linear-gradient(135deg,#065f46,#10b981)"
                      )}
                    </Grid>

                    <Grid item xs={12} md={3}>
                      {cardResumo(
                        "Total de Descontos",
                        valores.total_descontos,
                        <TrendingDown />,
                        "linear-gradient(135deg,#7f1d1d,#ef4444)"
                      )}
                    </Grid>

                    <Grid item xs={12} md={3}>
                      {cardResumo(
                        "Salário Líquido",
                        valores.salario_liquido,
                        <Paid />,
                        "linear-gradient(135deg,#020617,#334155)"
                      )}
                    </Grid>
                  </Grid>
                </Box>

                {/* TABELA PREMIUM */}
                {descontosSelecionados.length > 0 && (
                  <Box sx={{ mt: 5 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography
                      variant="h6"
                      fontWeight={900}
                      sx={{ mb: 2 }}
                    >
                      Descontos Aplicados (Análise Detalhada)
                    </Typography>

                    <TableContainer
                      component={Paper}
                      sx={{
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: "1px solid #f1f5f9",
                        boxShadow: "0 20px 50px rgba(2,6,23,0.08)",
                      }}
                    >
                      <Table>
                        <TableHead
                          sx={{
                            background:
                              "linear-gradient(90deg,#020617,#0f172a)",
                          }}
                        >
                          <TableRow>
                            <TableCell sx={{ color: "#fff", fontWeight: 800 }}>
                              Desconto
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: "#fff", fontWeight: 800 }}
                            >
                              Valor (Kz)
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: "#fff", fontWeight: 800 }}
                            >
                              Percentagem (%)
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {descontos
                            .filter((d) =>
                              descontosSelecionados.includes(d.id)
                            )
                            .map((desconto) => (
                              <TableRow key={desconto.id} hover>
                                <TableCell>{desconto.nome}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={`${desconto.valor} Kz`}
                                    sx={{ fontWeight: 700 }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  {calcularPercentualDesconto(
                                    desconto.valor
                                  )}
                                  %
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* ALERT PREMIUM */}
                {mensagem.texto && (
                  <Alert
                    severity={mensagem.tipo}
                    sx={{
                      mt: 4,
                      borderRadius: "16px",
                      fontWeight: 700,
                    }}
                  >
                    {mensagem.texto}
                  </Alert>
                )}

                {/* BOTÃO LUXUOSO */}
                <Button
                  type="submit"
                  fullWidth
                  disabled={salvando}
                  sx={{
                    mt: 5,
                    py: 2,
                    fontSize: "1.15rem",
                    fontWeight: 900,
                    borderRadius: "50px",
                    textTransform: "none",
                    letterSpacing: "0.5px",
                    background:
                      "linear-gradient(135deg,#020617,#1e3a8a,#2563eb)",
                    color: "#fff",
                    boxShadow:
                      "0 20px 50px rgba(37,99,235,0.45)",
                    transition: "all 0.35s ease",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow:
                        "0 25px 70px rgba(37,99,235,0.65)",
                    },
                  }}
                >
                  {salvando ? (
                    <CircularProgress size={26} color="inherit" />
                  ) : (
                    "Efetuar pagamento"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Fade>
  );
}
