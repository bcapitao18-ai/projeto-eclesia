import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from '../components/NavBar';
import api from '../api/axiosConfig';

// Importa todas as páginas
import Home from '../pages/home';
import Membros from '../pages/membros';
import Ministerios from '../pages/ministerios';
import Relatorios from '../pages/relatorios';
import Login from '../pages/login';
import GestaoMembros from '../pages/GestaoMembros';
import CriarUsuarios from '../pages/criarUsuario';
import GestaoCargos from '../pages/GestaoCargos';
import GestaoContribuicoes from '../pages/GestaoContribuicoes';
import GestaoDespesas from '../pages/GestaoDespesas';
import RelatorioContribuicoes from '../pages/Relatrios/RelatorioContribuicoes';
import RelatorioFinanceiroGeral from '../pages/Relatrios/RelatorioFinanceiroGeral';
import RelatorioMembros from '../pages/Relatrios/RelatorioMembros';
import RelatorioDespesa from '../pages/Relatrios/RelatorioDespesa';
import RelatorioPresencas from '../pages/Relatrios/ReltorioPresencas';
import RelatorioSede from '../pages/Relatrios/RelatorioSede';
import GestaoIgrejas from '../pages/GestaoIgrejas';
import ListaCultos from '../pages/Cultos/ListaCultos';
import GestaoDepartamento from '../pages/GestaoDepartamentos';
import Perfil from '../pages/Perfil';
import TabelaCulto from '../pages/Cultos/GestaoCulto'; // <-- NOVA ROTA PÚBLICA

// Novas páginas públicas
import SobreEquipe from '../components/SobreEquipe';
import Planos from '../components/Planos';
import Testemunhos from '../components/Testemunhos';
import Contato from '../components/Contato';
import Servicos from '../components/servicos';
import Aniversarios from '../pages/Notificacoes';


// Dashboard agora é público
import Dashboard from '../pages/Dashboard';

// Dashboard agora é público
import Salarios from '../pages/Salarios';
import TabelaSalarios from '../components/TabelaSalarios'; // <-- nova página




// Importa o novo componente de Dashboard de Eventos
import CadastroMembros from '../pages/CadastroMembro'; // <-- Novo componente para /dasheventos



// Importa o novo componente de Dashboard de Eventos
import CriarContaMembro from '../pages/CriarContaMembro'; // <-- Novo componente para /dasheventos




// Importa o novo componente de Dashboard de Eventos
import PerfilMembro from '../pages/PerfilMembro'; // <-- Novo componente para /dasheventos



// ---------------- AuthWrapper ---------------- //
function AuthWrapper({ children }) {
  const [isAllowed, setIsAllowed] = useState(null); // null = carregando

  useEffect(() => {
    const verificarStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAllowed(false);
          return;
        }

        const res = await api.get('/usuario/status', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const usuario = res.data.usuario;

        // Super admin pode acessar tudo
        if (usuario.funcao === 'super_admin') {
          setIsAllowed(true);
          return;
        }

        // Usuário comum:
        const path = window.location.pathname;
        if (path === '/membros') {
          setIsAllowed(true);
          return;
        }

        // Pode adicionar outras verificações de status ativo aqui
        setIsAllowed(true);
      } catch (err) {
        setIsAllowed(false);
      }
    };

    verificarStatus();
  }, []);

  if (isAllowed === null) return <div>Carregando...</div>;
  if (!isAllowed) return <Navigate to="/login" replace />;

  return children;
}

// ---------------- AppRoutes ---------------- //
export default function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/criar-usuarios" element={<CriarUsuarios />} />
        <Route path="/sobre-equipe" element={<SobreEquipe />} />
        <Route path="/planos" element={<Planos />} />
        <Route path="/testemunhos" element={<Testemunhos />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/salarios" element={<Salarios />} /> {/* PÚBLICA */}
        <Route path="/tabelaSalarios" element={<TabelaSalarios />} /> {/* NOVA ROTA PÚBLICA */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* agora é público */}
        <Route path="/aniversarios" element={<Aniversarios />} /> {/* rota pública */}
       
        <Route path="/TabelaCulto" element={<TabelaCulto />} /> {/* NOVA ROTA PÚBLICA */}
      
        

  <Route path="/cadastro/membro" element={< CadastroMembros />} /> {/* rota pública */}

 <Route path="/perfil/membro" element={< PerfilMembro />} /> {/* rota pública */}



  <Route path="/criar/conta/membro" element={< CriarContaMembro />} /> {/* rota pública */}

     
        
        {/* Rotas protegidas (usuários autenticados) */}
        <Route element={<AuthWrapper><Outlet /></AuthWrapper>}>
          <Route path="/membros" element={<Membros />} />
          <Route path="/ministerios" element={<Ministerios />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/gestao/membros" element={<GestaoMembros />} />
          <Route path="/gestao/cargos" element={<GestaoCargos />} />
          <Route path="/gestao/contribuicoes" element={<GestaoContribuicoes />} />
          <Route path="/gestao/despesas" element={<GestaoDespesas />} />
          <Route path="/gestao/relatorioContribuicoes" element={<RelatorioContribuicoes />} />
          <Route path="/gestao/relatorioDespesas" element={<RelatorioDespesa />} />
          <Route path="/gestao/relatorioFinanceiroGeral" element={<RelatorioFinanceiroGeral />} />
          <Route path="/gestao/relatorioMembros" element={<RelatorioMembros />} />
          <Route path="/listaCultos" element={<ListaCultos />} />
          <Route path="/gestao/RelatorioPresencas" element={<RelatorioPresencas />} />
          <Route path="/gestao/relatorioSede" element={<RelatorioSede />} />
          <Route path="/gestao/departamentos" element={<GestaoDepartamento />} />
          <Route path="/gestao/gestaoigrejas" element={<GestaoIgrejas />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* Redirecionamento genérico caso rota não exista */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
