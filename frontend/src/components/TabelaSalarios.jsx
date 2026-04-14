// src/pages/TabelaSalarios.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Card,
  CardContent,
  Skeleton
} from "@mui/material";

import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import dayjs from "dayjs";
import "dayjs/locale/pt";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// FIX: português correto
dayjs.locale("pt");

// ---------------- UTIL ----------------
const formatarMes = (mes) => {
  const nome = dayjs(mes).locale("pt").format("MMMM");
  return nome.charAt(0).toUpperCase() + nome.slice(1);
};

// ---------------- COMPONENTE ----------------
export default function TabelaSalarios() {
  const [relatorio, setRelatorio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM"));
  const [endDate, setEndDate] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState("");

  // ---------------- API ----------------
  const fetchFuncionarios = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get("/funcionarios", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFuncionarios(res.data);
  };

  const fetchRelatorio = async (start, end, funcionarioId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const params = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;
      if (funcionarioId) params.FuncionarioId = funcionarioId;

      const res = await api.get("/salarios", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setRelatorio(res.data.relatorio || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorio();
    fetchFuncionarios();
  }, []);

  // ---------------- FILTROS ----------------
  const handleFiltrar = () => {
    const finalDate = endDate || startDate;
    fetchRelatorio(startDate, finalDate, selectedFuncionario);
  };

  const handleReset = () => {
    setStartDate(dayjs().format("YYYY-MM"));
    setEndDate("");
    setSelectedFuncionario("");
    fetchRelatorio();
  };

  // ---------------- DADOS ----------------
  const meses = useMemo(() => {
    const setMeses = new Set();
    relatorio.forEach((f) =>
      Object.keys(f.meses || {}).forEach((m) => setMeses.add(m))
    );
    return Array.from(setMeses).sort();
  }, [relatorio]);

  const totalGeral = useMemo(() => {
    return relatorio.reduce((acc, f) => acc + f.totalGeral, 0);
  }, [relatorio]);

  const topFuncionario = useMemo(() => {
    if (!relatorio.length) return null;
    return [...relatorio].sort((a, b) => b.totalGeral - a.totalGeral)[0];
  }, [relatorio]);

  // ---------------- EXPORTS ----------------
  const exportarExcel = () => {
    const dados = relatorio.map((f) => {
      const linha = { Funcionario: f.nome };
      meses.forEach((m) => {
        linha[formatarMes(m)] = f.meses[m]?.liquido || 0;
      });
      linha["Total"] = f.totalGeral;
      return linha;
    });

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
    XLSX.writeFile(wb, "salarios.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Salários Premium", 14, 18);

    const head = [["Funcionário", ...meses.map(formatarMes), "Total"]];
    const body = relatorio.map((f) => [
      f.nome,
      ...meses.map((m) => `Kz ${(f.meses[m]?.liquido || 0).toFixed(2)}`),
      `Kz ${f.totalGeral.toFixed(2)}`
    ]);

    autoTable(doc, { head, body, startY: 30 });
    doc.save("salarios.pdf");
  };

  // ---------------- STYLE PREMIUM ----------------
  const glassCard = {
    borderRadius: 4,
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.3)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.06)"
  };

  const kpiCard = (color1, color2) => ({
    ...glassCard,
    p: 2,
    background: `linear-gradient(135deg, ${color1}, ${color2})`,
    color: "#fff"
  });

  const MoneyChip = ({ value }) => (
    <Chip
      label={`Kz ${value}`}
      sx={{
        background: "linear-gradient(135deg,#6366f1,#3b82f6)",
        color: "#fff",
        fontWeight: 800
      }}
    />
  );

  // ---------------- UI ----------------
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at 10% 20%, #eef2ff 0%, transparent 30%),
          radial-gradient(circle at 90% 80%, #ecfeff 0%, transparent 30%),
          linear-gradient(135deg,#f8fafc,#f1f5f9)
        `,
        p: { xs: 2, md: 4 }
      }}
    >

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography fontSize={34} fontWeight={900} textAlign="center">
          Relatório de Salários
        </Typography>

        <Typography textAlign="center" sx={{ color: "#64748b", mb: 3 }}>
          Gestão Financeira Inteligente
        </Typography>
      </motion.div>

      {/* KPI ROW */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>

        <Card sx={kpiCard("#6366f1", "#3b82f6")}>
          <Typography fontSize={12}>TOTAL GERAL</Typography>
          <Typography fontSize={26} fontWeight={900}>
            Kz {totalGeral.toFixed(2)}
          </Typography>
        </Card>

        <Card sx={glassCard}>
          <CardContent>
            <Typography fontSize={12}>FUNCIONÁRIOS</Typography>
            <Typography fontSize={26} fontWeight={900}>
              {relatorio.length}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={glassCard}>
          <CardContent>
            <Typography fontSize={12}>TOP FUNCIONÁRIO</Typography>
            <Typography fontSize={18} fontWeight={900}>
              {topFuncionario?.nome || "-"}
            </Typography>
          </CardContent>
        </Card>

      </Stack>

      {/* FILTROS */}
      <Card sx={{ ...glassCard, mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

            <TextField
              type="month"
              label="Início"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />

            <TextField
              type="month"
              label="Fim"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Funcionário</InputLabel>
              <Select
                value={selectedFuncionario}
                onChange={(e) => setSelectedFuncionario(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {funcionarios.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.Membro?.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" onClick={handleFiltrar}>
              Filtrar
            </Button>

            <Button onClick={exportarExcel}>Excel</Button>
            <Button onClick={exportarPDF}>PDF</Button>
            <Button onClick={handleReset}>Reset</Button>

          </Stack>
        </CardContent>
      </Card>

      {/* TABELA */}
      <Card sx={glassCard}>
        <CardContent>

          {loading ? (
            <Stack spacing={2}>
              <Skeleton height={60} />
              <Skeleton height={60} />
              <Skeleton height={60} />
            </Stack>
          ) : (
            <TableContainer>
              <Table stickyHeader>

                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 900,
                        position: "sticky",
                        left: 0,
                        background: "#fff",
                        zIndex: 2
                      }}
                    >
                      Funcionário
                    </TableCell>

                    {meses.map((m) => (
                      <TableCell key={m} align="right">
                        {formatarMes(m)}
                      </TableCell>
                    ))}

                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 900,
                        position: "sticky",
                        right: 0,
                        background: "#fff",
                        zIndex: 2
                      }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {relatorio.map((f) => (
                    <TableRow key={f.FuncionarioId}>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          position: "sticky",
                          left: 0,
                          background: "#fff",
                          zIndex: 1
                        }}
                      >
                        {f.nome}
                      </TableCell>

                      {meses.map((m) => (
                        <TableCell key={m} align="right">
                          <MoneyChip value={(f.meses[m]?.liquido || 0).toFixed(2)} />
                        </TableCell>
                      ))}

                      <TableCell
                        align="right"
                        sx={{
                          position: "sticky",
                          right: 0,
                          background: "#fff",
                          zIndex: 1
                        }}
                      >
                        <Chip
                          label={`Kz ${f.totalGeral.toFixed(2)}`}
                          sx={{
                            background: "linear-gradient(135deg,#22c55e,#16a34a)",
                            color: "#fff",
                            fontWeight: 900
                          }}
                        />
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </TableContainer>
          )}

        </CardContent>
      </Card>

    </Box>
  );
}