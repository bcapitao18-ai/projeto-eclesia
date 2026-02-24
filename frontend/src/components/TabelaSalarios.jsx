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
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import dayjs from "dayjs";
import "dayjs/locale/pt-br"; // 🔥 PORTUGUÊS
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Ativar idioma português globalmente
dayjs.locale("pt-br");

// Função para deixar o mês com primeira letra maiúscula (Fevereiro)
const formatarMes = (mes) => {
  const nomeMes = dayjs(mes).format("MMMM"); // fevereiro
  return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1); // Fevereiro
};

export default function TabelaSalarios() {
  const [relatorio, setRelatorio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM"));
  const [endDate, setEndDate] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

  // Meses dinâmicos (colunas)
  const meses = useMemo(() => {
    const setMeses = new Set();
    relatorio.forEach((f) => {
      Object.keys(f.meses || {}).forEach((m) => setMeses.add(m));
    });
    return Array.from(setMeses).sort();
  }, [relatorio]);

  // KPI Total Geral
  const totalGeralEmpresa = useMemo(() => {
    return relatorio.reduce((acc, f) => acc + f.totalGeral, 0);
  }, [relatorio]);

  const exportarExcel = () => {
    const dados = relatorio.map((f) => {
      const linha = { Funcionario: f.nome };

      meses.forEach((mes) => {
        linha[formatarMes(mes)] = f.meses[mes]?.liquido || 0; // 🔥 MES EM PORTUGUÊS NO EXCEL
      });

      linha["Total Geral"] = f.totalGeral;
      return linha;
    });

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
    XLSX.writeFile(wb, "relatorio_executivo_salarios.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatório Executivo de Salários", 14, 18);

    const head = [["Funcionário", ...meses.map(formatarMes), "Total Geral"]];

    const body = relatorio.map((f) => [
      f.nome,
      ...meses.map((mes) =>
        `Kz ${(f.meses[mes]?.liquido || 0).toFixed(2)}`
      ),
      `Kz ${f.totalGeral.toFixed(2)}`,
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 30,
    });

    doc.save("relatorio_executivo_salarios.pdf");
  };

  const cardPremium = {
    borderRadius: 5,
    backgroundColor: "#ffffff",
    border: "1px solid #e6eefc",
    boxShadow: "0 20px 60px rgba(0, 82, 255, 0.08)",
  };

  const buttonPrimary = {
    borderRadius: "14px",
    fontWeight: 800,
    px: 3,
    py: 1.2,
    textTransform: "none",
    backgroundColor: "#0052ff",
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "#003ec2",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        px: { xs: 2, md: 6 },
        py: { xs: 3, md: 5 },
      }}
    >
      {/* HEADER SURREAL */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          fontWeight={900}
          sx={{
            color: "#0a1f44",
            mb: 1,
            textAlign: "center",
          }}
        >
          Painel Executivo de Salários
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#3b5bdb",
            fontWeight: 600,
            mb: 4,
          }}
        >
          Relatório Analítico • Gestão Premium • Visual Corporativo
        </Typography>
      </motion.div>

      {/* FILTROS */}
      <Card sx={{ ...cardPremium, mb: 4 }}>
        <CardContent>
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
          >
            <TextField
              type="month"
              label="Mês Inicial"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth={isMobile}
            />

            <TextField
              type="month"
              label="Mês Final"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth={isMobile}
            />

            <FormControl sx={{ minWidth: 220, width: isMobile ? "100%" : "auto" }}>
              <InputLabel>Funcionário</InputLabel>
              <Select
                value={selectedFuncionario}
                label="Funcionário"
                onChange={(e) => setSelectedFuncionario(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {funcionarios.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.Membro.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button sx={buttonPrimary} onClick={handleFiltrar}>
              Filtrar
            </Button>

            <Button sx={buttonPrimary} onClick={exportarExcel}>
              Excel
            </Button>

            <Button sx={buttonPrimary} onClick={exportarPDF}>
              PDF
            </Button>

            <Button
              onClick={handleReset}
              sx={{
                ...buttonPrimary,
                backgroundColor: "#e6eefc",
                color: "#003ec2",
              }}
            >
              Resetar
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* TABELA */}
      <Card sx={cardPremium}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: "#0052ff" }} />
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #e6eefc",
                overflowX: "auto",
              }}
            >
              <Table stickyHeader sx={{ minWidth: meses.length * 140 + 300 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f8ff" }}>
                    <TableCell sx={{ fontWeight: 900, color: "#0a1f44" }}>
                      Funcionário
                    </TableCell>

                    {meses.map((mes) => (
                      <TableCell
                        key={mes}
                        align="right"
                        sx={{ fontWeight: 900, color: "#0a1f44" }}
                      >
                        {formatarMes(mes)} {/* 🔥 AGORA: Fevereiro */}
                      </TableCell>
                    ))}

                    <TableCell align="right" sx={{ fontWeight: 900, color: "#003ec2" }}>
                      Total Geral
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {relatorio.map((f) => (
                    <TableRow key={f.FuncionarioId}>
                      <TableCell sx={{ fontWeight: 800, color: "#0a1f44" }}>
                        {f.nome}
                      </TableCell>

                      {meses.map((mes) => (
                        <TableCell key={mes} align="right">
                          <Chip
                            label={`Kz ${(f.meses[mes]?.liquido || 0).toFixed(2)}`}
                            sx={{
                              fontWeight: 800,
                              borderRadius: "12px",
                              backgroundColor: "#e6efff",
                              color: "#003ec2",
                            }}
                          />
                        </TableCell>
                      ))}

                      <TableCell align="right">
                        <Chip
                          label={`Kz ${f.totalGeral.toFixed(2)}`}
                          sx={{
                            fontWeight: 900,
                            borderRadius: "14px",
                            backgroundColor: "#0052ff",
                            color: "#ffffff",
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