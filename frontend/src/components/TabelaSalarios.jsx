import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function TabelaSalarios() {
  const [salarios, setSalarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM"));
  const [endDate, setEndDate] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState("");

  const fetchSalarios = async (start, end, funcionarioId) => {
    setLoading(true);
    setMensagem("");
    try {
      const token = localStorage.getItem("token");
      const params = {};
      if (start) params.startDate = dayjs(start).format("YYYY-MM");
      if (end) params.endDate = dayjs(end).format("YYYY-MM");
      if (funcionarioId) params.FuncionarioId = funcionarioId;

      const response = await api.get("/salarios", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const salariosConvertidos = (response.data.salarios || []).map((s) => ({
        ...s,
        salario_base: Number(s.salario_base),
        total_subsidios: Number(s.total_subsidios),
        salario_liquido: Number(s.salario_liquido),
      }));

      setSalarios(salariosConvertidos);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao carregar salários.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFuncionarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/funcionarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFuncionarios(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSalarios();
    fetchFuncionarios();
  }, []);

  const handleFiltrar = () => {
    const finalDate = endDate || startDate;
    fetchSalarios(startDate, finalDate, selectedFuncionario);
  };

  const handleReset = () => {
    setStartDate(dayjs().format("YYYY-MM"));
    setEndDate("");
    setSelectedFuncionario("");
    fetchSalarios();
  };

  // KPIs (LÓGICA ORIGINAL MANTIDA)
  const totalPago = useMemo(
    () => salarios.reduce((acc, s) => acc + s.salario_liquido, 0),
    [salarios]
  );

  const totalSubsidios = useMemo(
    () => salarios.reduce((acc, s) => acc + s.total_subsidios, 0),
    [salarios]
  );

  const mediaSalarial = useMemo(
    () => (salarios.length ? totalPago / salarios.length : 0),
    [totalPago, salarios]
  );

  // DADOS DO GRÁFICO DE PIZZA (SURREAL E INTELIGENTE)
  const pieData = useMemo(() => {
    const agrupado = salarios.reduce((acc, s) => {
      const nome = s.Funcionario?.Membro?.nome || "Sem Nome";
      if (!acc[nome]) acc[nome] = 0;
      acc[nome] += s.salario_liquido;
      return acc;
    }, {});

    return Object.keys(agrupado).map((nome) => ({
      name: nome,
      value: agrupado[nome],
    }));
  }, [salarios]);

  const COLORS = [
    "#6366f1",
    "#22c55e",
    "#06b6d4",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
  ];

  // EXPORTAR PDF (LÓGICA RESTAURADA)
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatório Executivo de Salários", 14, 20);

    const tableData = salarios.map((s) => [
      s.Funcionario?.Membro?.nome || "—",
      s.mes_ano,
      `Kz ${s.salario_base.toFixed(2)}`,
      `Kz ${s.total_subsidios.toFixed(2)}`,
      `Kz ${(s.salario_base + s.total_subsidios - s.salario_liquido).toFixed(2)}`,
      `Kz ${s.salario_liquido.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "Funcionário",
          "Mês/Ano",
          "Salário Base",
          "Subsídios",
          "Descontos",
          "Salário Líquido",
        ],
      ],
      body: tableData,
    });

    doc.save("relatorio_salarios.pdf");
  };

  // EXPORTAR EXCEL (LÓGICA RESTAURADA)
  const exportarExcel = () => {
    const dados = salarios.map((s) => ({
      Funcionario: s.Funcionario?.Membro?.nome || "—",
      Mes: s.mes_ano,
      Salario_Base: s.salario_base,
      Subsidios: s.total_subsidios,
      Descontos:
        s.salario_base + s.total_subsidios - s.salario_liquido,
      Salario_Liquido: s.salario_liquido,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salarios");
    XLSX.writeFile(workbook, "relatorio_salarios.xlsx");
  };

  const premiumCard = {
    borderRadius: 6,
    background: "#ffffff",
    boxShadow: "0 25px 80px rgba(0,0,0,0.05)",
    border: "1px solid #f1f5f9",
    backdropFilter: "blur(10px)",
  };

  const premiumButton = {
    borderRadius: "16px",
    px: 3.5,
    py: 1.4,
    fontWeight: 800,
    textTransform: "none",
    background: "linear-gradient(135deg,#4f46e5,#6366f1)",
    color: "#fff",
    boxShadow: "0 10px 30px rgba(79,70,229,0.25)",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 15px 40px rgba(79,70,229,0.35)",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        px: { xs: 2, md: 6 },
        background:
          "radial-gradient(circle at top, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
      }}
    >
      {/* HEADER SURREAL BRANCO */}
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <Typography
          variant="h3"
          fontWeight={900}
          textAlign="center"
          sx={{ color: "#0f172a", mb: 1, letterSpacing: 1 }}
        >
          Painel Executivo de Salários
        </Typography>
        <Typography
          textAlign="center"
          sx={{ mb: 5, color: "#64748b", fontWeight: 500 }}
        >
          Relatórios Financeiros • Análise Premium • Gestão Inteligente
        </Typography>
      </motion.div>

      {/* KPIs SURREAIS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total Pago", value: totalPago },
          { title: "Total Subsídios", value: totalSubsidios },
          { title: "Média Salarial", value: mediaSalarial },
          { title: "Registos", value: salarios.length },
        ].map((kpi, index) => (
          <Grid item xs={12} md={3} key={index}>
            <motion.div whileHover={{ y: -6 }}>
              <Card sx={premiumCard}>
                <CardContent>
                  <Typography color="#64748b" fontWeight={700}>
                    {kpi.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    sx={{ mt: 1, color: "#020617" }}
                  >
                    {typeof kpi.value === "number"
                      ? `Kz ${kpi.value.toFixed(2)}`
                      : kpi.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* FILTROS + EXPORT PREMIUM */}
      <Card sx={{ ...premiumCard, mb: 4 }}>
        <CardContent
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextField
            label="Mês Inicial"
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            label="Mês Final"
            type="month"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Funcionário</InputLabel>
            <Select
              value={selectedFuncionario}
              label="Funcionário"
              onChange={(e) => setSelectedFuncionario(e.target.value)}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {funcionarios.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.Membro.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button onClick={handleFiltrar} sx={premiumButton}>
            Filtrar Relatório
          </Button>

          <Button
            onClick={exportarPDF}
            sx={{
              ...premiumButton,
              background: "linear-gradient(135deg,#0ea5e9,#38bdf8)",
            }}
          >
            Exportar PDF
          </Button>

          <Button
            onClick={exportarExcel}
            sx={{
              ...premiumButton,
              background: "linear-gradient(135deg,#10b981,#34d399)",
            }}
          >
            Exportar Excel
          </Button>

          <Button
            onClick={handleReset}
            sx={{
              ...premiumButton,
              background: "linear-gradient(135deg,#64748b,#94a3b8)",
            }}
          >
            Resetar
          </Button>
        </CardContent>
      </Card>

      {/* GRÁFICO DE PIZZA SURREAL */}
      <Card sx={{ ...premiumCard, mb: 4 }}>
        <CardContent>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ mb: 3, color: "#0f172a" }}
          >
            Distribuição de Salários por Funcionário
          </Typography>

          <Box sx={{ width: "100%", height: 380 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={130}
                  innerRadius={60}
                  paddingAngle={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `Kz ${v.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* TABELA ULTRA PREMIUM */}
      <Card sx={premiumCard}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ background: "#f1f5f9" }}>
                    {[
                      "Funcionário",
                      "Mês/Ano",
                      "Salário Base",
                      "Subsídios",
                      "Descontos",
                      "Salário Líquido",
                    ].map((head) => (
                      <TableCell
                        key={head}
                        sx={{
                          fontWeight: 900,
                          color: "#020617",
                          fontSize: "0.95rem",
                        }}
                        align={head === "Funcionário" ? "left" : "right"}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {salarios.length > 0 ? (
                    salarios.map((s) => (
                      <TableRow
                        key={s.id}
                        sx={{
                          transition: "0.25s",
                          "&:hover": {
                            background: "#f8fafc",
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 700 }}>
                          {s.Funcionario?.Membro?.nome || "—"}
                        </TableCell>
                        <TableCell>{s.mes_ano}</TableCell>
                        <TableCell align="right">
                          Kz {s.salario_base.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          Kz {s.total_subsidios.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          Kz{" "}
                          {(
                            s.salario_base +
                            s.total_subsidios -
                            s.salario_liquido
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`Kz ${s.salario_liquido.toFixed(2)}`}
                            sx={{
                              fontWeight: 900,
                              fontSize: "0.9rem",
                              borderRadius: "12px",
                              background:
                                "linear-gradient(135deg,#10b981,#34d399)",
                              color: "#022c22",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Nenhum salário encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}