require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;


app.use(cors({
  origin: 'http://168.231.112.34:3000', // IP da VPS onde o frontend vai rodar
  credentials: true
}));




app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const session = require('express-session');

app.use(session({
  secret: 'seuSegredoAqui',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Rota simples de teste
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' });
});



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



const DespesaController = require("./routes/DespesaController")

app.use("/", DespesaController);



const UsuarioController = require("./routes/UsuarioControllers")

app.use("/", UsuarioController);




const RelatoriosController = require("./routes/RelatoriosController")

app.use("/", RelatoriosController);




const GraficoController = require("./routes/GraficoController")

app.use("/", GraficoController);


// Aqui continua o resto do seu código normalmente...

const bcrypt = require("bcrypt")

const usuarios = require("./modells/Usuarios");
const TipoContribuicao = require("./modells/TipoContribuicao");

const Contribuicao = require("./modells/Contribuicoes");
const Despesas = require("./modells/Despesas");

const Membros = require("./modells/Membros");
const Cargo = require("./modells/Cargo");

const CargoMembro = require("./modells/CargoMembro");


const Cultos = require("./modells/Cultos");
const Presencas = require("./modells/Presencas");


const Departamentos = require("./modells/Departamentos");


const DepartamentoMembros = require("./modells/DptMembros");




const DadosAcademicos = require("./modells/DadosAcademicos");
const DadosCristaos = require("./modells/DadosCristaos");


const Diversos = require("./modells/Diversos");



const TipoCultos = require("./modells/TipoCulto");
















// Inicializa conexão com o banco e sobe o servidor
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados com sucesso.');
    await sequelize.sync({ force: false });

  // Altera para 0.0.0.0 para aceitar conexões externas
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
    });


  } catch (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
  }
})();
