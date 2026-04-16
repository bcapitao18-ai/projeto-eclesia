import React, { useEffect, useState } from 'react'; 
import {
  Box,
  Button,
  Grid,
  Card,
  Typography,
  Checkbox,
  Avatar,
  TextField
} from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../api/axiosConfig';


export default function Cartao() {

  const [membros, setMembros] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [fundo, setFundo] = useState(null);
  const [logo, setLogo] = useState(null);
  const [horizontal, setHorizontal] = useState(false);

  const [linha1, setLinha1] = useState('');
  const [linha2, setLinha2] = useState('');
  const [linha3, setLinha3] = useState('');

  const [busca, setBusca] = useState('');
const [pagina, setPagina] = useState(1);
const itensPorPagina = 6;

  useEffect(() => {
    async function fetchMembros() {
      try {
        const res = await api.get('/membros');
        setMembros(res.data);
      } catch (err) {
        console.log('Erro (possível 401):', err);
      }
    }
    fetchMembros();
  }, []);

  const toggleSelecionado = (id) => {
    setSelecionados(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleUploadFundo = (e) => {
    const file = e.target.files[0];
    if (file) setFundo(URL.createObjectURL(file));
  };

  const handleUploadLogo = (e) => {
    const file = e.target.files[0];
    if (file) setLogo(URL.createObjectURL(file));
  };

  const buscarDadosCartao = async () => {
    const res = await api.post('/dados-cartao', {
      membrosIds: selecionados
    });
    return res.data;
  };


  const membrosFiltrados = membros.filter(m =>
  m.nome.toLowerCase().includes(busca.toLowerCase())
);

const totalPaginas = Math.ceil(membrosFiltrados.length / itensPorPagina);

const membrosPaginados = membrosFiltrados.slice(
  (pagina - 1) * itensPorPagina,
  pagina * itensPorPagina
);

  // =========================
  // 🔥 CARTÃO (PREVIEW + PDF)
  // =========================
  const renderCartao = (m, isPdf = false) => {
    const isHorizontal = horizontal;
    const isPdfHorizontal = isPdf && isHorizontal;

    const totalLinhas = [linha1, linha2, linha3].filter(Boolean).length;
    const offsetTopo = 120 + (totalLinhas * 20);

    return `
      <div style="
        width:${isHorizontal ? '900px' : '420px'};
        height:${isHorizontal ? '360px' : '650px'};
        position:relative;
        font-family:'Poppins','Inter','Segoe UI',sans-serif;
        background-image:url(${fundo || ''});
        background-size:cover;
        background-position:center;
        border-radius:24px;
        overflow:hidden;
      ">

        <div style="
          position:absolute;
          inset:0;
          background:linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.15));
        "></div>

        <div style="
          text-align:center;
          padding-top:10px;
          position:relative;
          color:white;
        ">
          
          ${logo ? `<img src="${logo}" style="width:55px; margin-bottom:6px;" />` : ''}

          <div style="
            font-size:${isPdfHorizontal ? '14px' : '13px'};
            line-height:1.4;
            white-space:normal;
          ">
            ${linha1 ? `<div style="font-weight:600;">${linha1}</div>` : ''}
            ${linha2 ? `<div>${linha2}</div>` : ''}
            ${linha3 ? `<div>${linha3}</div>` : ''}
          </div>

   <div style="
  margin-top:8px;
  text-align:center;
  white-space:nowrap;
  font-size:0;
">
  
  <span style="
    display:inline-block;
    font-size:${isPdfHorizontal ? '22px' : (isHorizontal ? '30px' : '20px')};
    font-weight:800;
    margin-right:12px;
    vertical-align:middle;

    font-family:'Bebas Neue','Oswald','Anton',sans-serif;
    letter-spacing:2px;

    color:#ffffff;

    text-shadow:
      0 2px 4px rgba(0,0,0,0.9),
      0 6px 12px rgba(0,0,0,0.8),
      0 0 20px rgba(0,0,0,0.6);
  ">
    CARTÃO DE MEMBRO
  </span>

  <span style="
    display:inline-block;
    font-size:${isPdfHorizontal ? '26px' : (isHorizontal ? '34px' : '24px')};
    font-weight:900;
    vertical-align:middle;
    letter-spacing:2px;

    font-family:'Poppins','Montserrat','Segoe UI',sans-serif;

    color:#ffffff;

    text-shadow:
      0 2px 4px rgba(0,0,0,0.95),
      0 8px 18px rgba(0,0,0,0.9),
      0 0 25px rgba(0,0,0,0.7);
  ">
    Nº ${m.numero_membro || '----'}
  </span>

</div>
        </div>

        ${m.foto ? `
          <img src="${m.foto}" style="
            position:absolute;
            ${isHorizontal 
              ? 'top:15px; right:15px;' 
              : `left:50%; transform:translateX(-50%); top:${offsetTopo}px;`
            }
            width:${isHorizontal ? '150px' : '200px'};
            height:${isHorizontal ? '150px' : '200px'};
            object-fit:cover;
            border-radius:16px;
            border:4px solid white;
            box-shadow:0 12px 30px rgba(0,0,0,0.6);
          "/>
        ` : ''}

        <!-- INFO -->
        <div style="
          position:absolute;
          ${isHorizontal 
            ? 'bottom:18px; left:18px; width:65%;'
            : `left:50%; transform:translateX(-50%); top:${offsetTopo + 220}px; width:85%;`
          }
          padding:18px;
          border-radius:18px;
          background:rgba(0,0,0,0.50);
          color:#ffffff;
          text-align:left;
          box-shadow:0 12px 30px rgba(0,0,0,0.6);
          line-height:1.4;
          word-break:normal;
          white-space:normal;
        ">

          <div style="
            font-size:${isPdfHorizontal ? '18px' : '24px'};
            font-weight:900;
            line-height:1.3;
            letter-spacing:0px;
          ">
            ${m.nome || '---'}
          </div>

          <div style="margin-top:10px; font-size:${isPdfHorizontal ? '13px' : '15px'};">
            <span style="color:#cbd5e1;">Função:</span> 
            <span style="font-weight:700;"> ${m.cargos || '---'}</span>
          </div>

          <div style="font-size:${isPdfHorizontal ? '13px' : '15px'};">
            <span style="color:#cbd5e1;">Departamento:</span> 
            <span style="font-weight:700;"> ${m.departamentos || '---'}</span>
          </div>

          <div style="margin-top:8px; font-size:${isPdfHorizontal ? '13px' : '14px'};">
            <span style="color:#cbd5e1;">Batismo:</span> 
            <span style="font-weight:600;"> ${m.data_batismo || '---'}</span>
          </div>

          <div style="font-size:${isPdfHorizontal ? '13px' : '14px'};">
            <span style="color:#cbd5e1;">Validade:</span> 
            <span style="font-weight:600;"> ${m.data_validade || '---'}</span>
          </div>

        </div>

        <!-- ASSINATURA -->
        <div style="
          position:absolute;
          ${isHorizontal 
            ? 'top:180px; right:18px; width:150px; text-align:center;'
            : 'bottom:25px; width:100%; display:flex; flex-direction:column; align-items:center;'
          }
          color:white;
          font-size:13px;
        ">

          <div style="margin-bottom:20px; letter-spacing:1px;">
            Assinatura do Pastor
          </div>

          <div style="
            border-top:2px solid rgba(255,255,255,0.9);
            width:${isHorizontal ? '100%' : '180px'};
          "></div>

        </div>

      </div>
    `;
  };


  const renderVersoCartao = (isPdf = false) => {
  const isHorizontal = horizontal;

  return `
    <div style="
      width:${isHorizontal ? '900px' : '420px'};
      height:${isHorizontal ? '360px' : '650px'};
      position:relative;
      font-family:'Poppins','Inter','Segoe UI',sans-serif;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      border-radius:24px;
      overflow:hidden;
      color:white;
    ">

      <!-- Efeito decorativo -->
      <div style="
        position:absolute;
        inset:0;
        background: radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 60%);
      "></div>

      <!-- Conteúdo -->
      <div style="
        position:relative;
        height:100%;
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        text-align:center;
        padding:30px;
      ">

        <div style="
          font-size:${isHorizontal ? '28px' : '22px'};
          font-weight:900;
          margin-bottom:20px;
          letter-spacing:2px;
        ">
          CARTÃO DE MEMBRO
        </div>

        <div style="
          font-size:${isHorizontal ? '16px' : '14px'};
          max-width:80%;
          line-height:1.6;
          opacity:0.9;
        ">
          Este cartão é pessoal e intransmissível.<br/><br/>

          Em caso de perda, comunicar imediatamente à administração da igreja.<br/><br/>

          Manter sempre em local seguro e protegido.<br/><br/>
        </div>

        <div style="
          margin-top:30px;
          font-size:12px;
          opacity:0.6;
        ">
          IGREJA • DOCUMENTO OFICIAL
        </div>

      </div>
    </div>
  `;
};
  // =========================
  // 🔥 GERAR PDF
  // =========================
  const gerarCartoes = async () => {
    const dados = await buscarDadosCartao();

    const CARD_W = 85.6;
    const CARD_H = 53.98;

    const cardWidth = horizontal ? CARD_W : CARD_H;
    const cardHeight = horizontal ? CARD_H : CARD_W;

    const pdf = new jsPDF({
      orientation: horizontal ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [cardWidth, cardHeight]
    });

   for (let i = 0; i < dados.length; i++) {

  // ================= FRONT =================
  const divFront = document.createElement('div');
  divFront.innerHTML = renderCartao(dados[i], true);

  divFront.style.width = horizontal ? '900px' : '420px';
  divFront.style.height = horizontal ? '360px' : '650px';
  divFront.style.position = 'fixed';
  divFront.style.top = '-9999px';

  document.body.appendChild(divFront);

  const canvasFront = await html2canvas(divFront, {
    scale: 4,
    useCORS: true,
    backgroundColor: null
  });

  const imgFront = canvasFront.toDataURL('image/png');

  // ================= BACK =================
  const divBack = document.createElement('div');
  divBack.innerHTML = renderVersoCartao(true);

  divBack.style.width = horizontal ? '900px' : '420px';
  divBack.style.height = horizontal ? '360px' : '650px';
  divBack.style.position = 'fixed';
  divBack.style.top = '-9999px';

  document.body.appendChild(divBack);

  const canvasBack = await html2canvas(divBack, {
    scale: 4,
    useCORS: true,
    backgroundColor: null
  });

  const imgBack = canvasBack.toDataURL('image/png');

  // ================= PDF =================
  if (i > 0) {
    pdf.addPage([cardWidth, cardHeight]);
  }

  pdf.addImage(imgFront, 'PNG', 0, 0, cardWidth, cardHeight);

  pdf.addPage([cardWidth, cardHeight]);
  pdf.addImage(imgBack, 'PNG', 0, 0, cardWidth, cardHeight);

  document.body.removeChild(divFront);
  document.body.removeChild(divBack);
}

    pdf.save('cartoes.pdf');
  };

  return (
    <Grid container spacing={2} sx={{ minHeight: '100vh', p: 2 }}>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, borderRadius: 4 }}>

          <Typography fontWeight={900} mb={2}>
            Preview do Cartão
          </Typography>

          <Box
            dangerouslySetInnerHTML={{
              __html: renderCartao(membros[0] || {})
            }}
          />

          <Box mt={2} display="flex" flexDirection="column" gap={1}>
            <TextField label="Linha 1" value={linha1} onChange={e => setLinha1(e.target.value)} />
            <TextField label="Linha 2" value={linha2} onChange={e => setLinha2(e.target.value)} />
            <TextField label="Linha 3" value={linha3} onChange={e => setLinha3(e.target.value)} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="contained" onClick={() => setHorizontal(!horizontal)}>
              Mudar Layout
            </Button>

            <Button component="label">
              Fundo
              <input hidden type="file" onChange={handleUploadFundo} />
            </Button>

            <Button component="label">
              Logo
              <input hidden type="file" onChange={handleUploadLogo} />
            </Button>
          </Box>

        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, borderRadius: 4 }}>
<TextField
  fullWidth
  placeholder="Pesquisar membro..."
  value={busca}
  onChange={(e) => {
    setBusca(e.target.value);
    setPagina(1);
  }}
  sx={{ mb: 2 }}
/>

<Grid container spacing={2}>
  {membrosPaginados.map(m => (
    <Grid item xs={12} sm={6} md={4} key={m.id}>
      <Card
        onClick={() => toggleSelecionado(m.id)}
        sx={{
          p: 2,
          borderRadius: 4,
          cursor: 'pointer',
          transition: '0.3s',
          position: 'relative',
          border: selecionados.includes(m.id)
            ? '2px solid #4f46e5'
            : '1px solid #e5e7eb',
          boxShadow: selecionados.includes(m.id)
            ? '0 10px 25px rgba(79,70,229,0.4)'
            : '0 5px 15px rgba(0,0,0,0.08)',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Checkbox
          checked={selecionados.includes(m.id)}
          sx={{ position: 'absolute', top: 5, right: 5 }}
        />

        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Avatar
            src={m.foto}
            sx={{ width: 70, height: 70 }}
          />

          <Typography fontWeight={700} textAlign="center">
            {m.nome}
          </Typography>
        </Box>
      </Card>
    </Grid>
  ))}
</Grid>


<Box mt={2} display="flex" justifyContent="center" gap={1}>
  <Button
    disabled={pagina === 1}
    onClick={() => setPagina(pagina - 1)}
  >
    Anterior
  </Button>

  <Typography alignSelf="center">
    {pagina} / {totalPaginas || 1}
  </Typography>

  <Button
    disabled={pagina === totalPaginas}
    onClick={() => setPagina(pagina + 1)}
  >
    Próximo
  </Button>
</Box>

          <Button
            fullWidth
            sx={{ mt: 2, background: '#4f46e5', color: '#fff', fontWeight: 800 }}
            onClick={gerarCartoes}
          >
            GERAR CARTÕES
          </Button>

        </Card>
      </Grid>

    </Grid>
  );
}