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
  Alert,
  Grid,
  Fade,
} from "@mui/material";
import {
  Paid,
  Person,
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Edit,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";

export default function FormSalario({
  salarioEditando = null,
  onSalvo = () => {},
  onCancel = () => {},
}) {
  const modoEdicao = !!salarioEditando;

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
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  // 🔹 Carregar dados base (funcionários, subsídios e descontos)
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchDataBase = async () => {
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

        setFuncionarios(resFunc.data || []);
        setSubsidios(resSubs.data || []);
        setDescontos(resDesc.data || []);
      } catch (err) {
        console.error("Erro ao carregar dados base:", err);
      }
    };

    fetchDataBase();
  }, []);

  // 🔥 NOVO: Buscar dados detalhados do salário ao editar
  useEffect(() => {
    if (!salarioEditando) return;

    const token = localStorage.getItem("token");

    const fetchDetalhado = async () => {
      try {
        setCarregandoDetalhes(true);

        const res = await api.get(
          `/salarios/${salarioEditando.id}/detalhado`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { salario, subsidiosDisponiveis, descontosDisponiveis } = res.data;

        // Atualiza listas disponíveis (mantém consistência com backend)
        if (subsidiosDisponiveis) setSubsidios(subsidiosDisponiveis);
        if (descontosDisponiveis) setDescontos(descontosDisponiveis);

        // Preencher campos principais
        setFuncionarioId(salario.FuncionarioId || "");
        setMesAno(salario.mes_ano || "");

        // ⚠️ IMPORTANTE:
        // Aqui assumimos que no futuro terás tabelas de ligação (SalarioSubsidios / SalarioDescontos)
        // Por agora vamos reconstruir pelos totais (fallback inteligente)
        setValores({
          salario_base: salario.salario_base || 0,
          total_subsidios: salario.total_subsidios || 0,
          total_descontos:
            (salario.salario_base || 0) +
              (salario.total_subsidios || 0) -
              (salario.salario_liquido || 0) || 0,
          salario_liquido: salario.salario_liquido || 0,
        });

        // 🔥 LÓGICA INTELIGENTE:
        // Se o total_subsidios > 0, seleciona automaticamente os subsídios que somam esse valor
        if (salario.total_subsidios > 0 && subsidiosDisponiveis?.length) {
          let soma = 0;
          const selecionados = [];

          for (const s of subsidiosDisponiveis) {
            if (soma < salario.total_subsidios) {
              selecionados.push(s.id);
              soma += parseFloat(s.valor);
            }
          }

          setSubsidiosSelecionados(selecionados);
        }

        // Mesma lógica para descontos
        const totalDescontosCalc =
          (salario.salario_base || 0) +
          (salario.total_subsidios || 0) -
          (salario.salario_liquido || 0);

        if (totalDescontosCalc > 0 && descontosDisponiveis?.length) {
          let somaDesc = 0;
          const descSelecionados = [];

          for (const d of descontosDisponiveis) {
            if (somaDesc < totalDescontosCalc) {
              descSelecionados.push(d.id);
              somaDesc += parseFloat(d.valor);
            }
          }

          setDescontosSelecionados(descSelecionados);
        }
      } catch (err) {
        console.error("Erro ao carregar salário detalhado:", err);
      } finally {
        setCarregandoDetalhes(false);
      }
    };

    fetchDetalhado();
  }, [salarioEditando]);

  const handleFuncionarioChange = (id) => {
    const funcionario = funcionarios.find((f) => f.id === id);
    setFuncionarioId(id);

    setValores((v) => ({
      ...v,
      salario_base: funcionario
        ? parseFloat(funcionario.salario_base || 0)
        : 0,
    }));
  };

  // 🔥 Cálculo automático (MANTIDO INTACTO)
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
  }, [
    subsidiosSelecionados,
    descontosSelecionados,
    valores.salario_base,
    subsidios,
    descontos,
  ]);

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

      if (modoEdicao) {
        await api.put(
          `/salarios/${salarioEditando.id}`,
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

        setMensagem({
          tipo: "success",
          texto: "Salário atualizado com sucesso!",
        });
      } else {
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

        setMensagem({
          tipo: "success",
          texto: "Salário gerado com sucesso!",
        });
      }

      onSalvo();
    } catch (error) {
      console.error("Erro ao salvar salário:", error);
      setMensagem({
        tipo: "error",
        texto: "Erro ao salvar salário.",
      });
    } finally {
      setSalvando(false);
    }
  };

  if (carregandoDetalhes) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography fontWeight={700}>
          A carregar dados detalhados do salário...
        </Typography>
      </Box>
    );
  }

  const cardResumo = (titulo, valor, icon, color) => (
    <Box
      sx={{
        p: 3,
        borderRadius: "20px",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(15,23,42,0.06)",
        boxShadow: "0 15px 45px rgba(2,6,23,0.08)",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography fontSize="0.85rem" fontWeight={700} color="#64748b">
            {titulo}
          </Typography>
          <Typography fontSize="1.4rem" fontWeight={900} color="#020617">
            {Number(valor || 0).toFixed(2)} Kz
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
          }}
        >
          {icon}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Fade in timeout={700}>
      <Box sx={{ minHeight: "100%", p: { xs: 2, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            sx={{
              borderRadius: "30px",
              overflow: "hidden",
              background:
                "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              boxShadow: "0 40px 120px rgba(2,6,23,0.12)",
            }}
          >
            {/* HEADER INTACTO */}
            <Box
              sx={{
                p: 4,
                background:
                  "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
                color: "#fff",
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                {modoEdicao ? (
                  <Edit sx={{ fontSize: 42, color: "#60a5fa" }} />
                ) : (
                  <Paid sx={{ fontSize: 42, color: "#60a5fa" }} />
                )}
                <Box>
                  <Typography variant="h4" fontWeight={900}>
                    {modoEdicao
                      ? "Editar Pagamento Salarial"
                      : "Processamento Salarial Premium"}
                  </Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    {modoEdicao
                      ? "Atualização avançada do salário do funcionário"
                      : "Geração inteligente e automatizada de salários"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
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
                        {funcionarios.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            <Person sx={{ mr: 1, fontSize: 18 }} />
                            {f.Membro?.nome || `Funcionário #${f.id}`}
                          </MenuItem>
                        ))}
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

                {/* RESUMO INTACTO */}
                <Box sx={{ mt: 5 }}>
                  <Typography variant="h6" fontWeight={900} mb={2}>
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

                {mensagem.texto && (
                  <Alert
                    severity={mensagem.tipo}
                    sx={{ mt: 4, borderRadius: "16px", fontWeight: 700 }}
                  >
                    {mensagem.texto}
                  </Alert>
                )}

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
                    background:
                      "linear-gradient(135deg,#020617,#1e3a8a,#2563eb)",
                    color: "#fff",
                  }}
                >
                  {salvando ? (
                    <CircularProgress size={26} color="inherit" />
                  ) : modoEdicao ? (
                    "Atualizar Pagamento"
                  ) : (
                    "Efetuar pagamento"
                  )}
                </Button>

                {modoEdicao && (
                  <Button
                    fullWidth
                    onClick={onCancel}
                    sx={{ mt: 2, borderRadius: "50px", fontWeight: 800 }}
                  >
                    Cancelar edição
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Fade>
  );
}