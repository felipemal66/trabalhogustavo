const express = require('express');
const httpErrors = require('http-errors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 3000;

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config();

// Configurações do servidor Express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));

// Configuração da conexão com o banco de dados MySQL
const connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Middleware para adicionar a conexão ao banco de dados em todas as requisições
app.use((req, res, next) => {
    mysql.createConnection(connectionConfig)
        .then((connection) => {
            req.db = connection;
            next();
        })
        .catch((error) => {
            console.error('Erro ao conectar ao banco de dados:', error);
            next(error);
        });
});

// Operações CRUD para clientes
// Função para criar um novo cliente
async function createCliente(clienteData) {
    try {
        const [result] = await req.db.execute('INSERT INTO clientes (nome, sobrenome, email, idade) VALUES (?, ?, ?, ?)', [clienteData.nome, clienteData.sobrenome, clienteData.email, clienteData.idade]);
        return result.insertId; // Retorna o ID do cliente recém-criado
    } catch (error) {
        throw error;
    }
}

// Função para buscar todos os clientes
async function getClientes() {
    try {
        const [rows, fields] = await req.db.execute('SELECT * FROM clientes');
        return rows; // Retorna todos os clientes
    } catch (error) {
        throw error;
    }
}

// Função para buscar um cliente pelo ID
async function getClienteById(clienteId) {
    try {
        const [rows, fields] = await req.db.execute('SELECT * FROM clientes WHERE id = ?', [clienteId]);
        if (rows.length === 0) {
            throw new Error('Cliente não encontrado');
        }
        return rows[0]; // Retorna o cliente encontrado
    } catch (error) {
        throw error;
    }
}

// Função para atualizar um cliente pelo ID
async function updateCliente(clienteId, clienteData) {
    try {
        const result = await req.db.execute('UPDATE clientes SET nome = ?, sobrenome = ?, email = ?, idade = ? WHERE id = ?', [clienteData.nome, clienteData.sobrenome, clienteData.email, clienteData.idade, clienteId]);
        if (result[0].affectedRows === 0) {
            throw new Error('Cliente não encontrado');
        }
    } catch (error) {
        throw error;
    }
}

// Função para excluir um cliente pelo ID
async function deleteCliente(clienteId) {
    try {
        const result = await req.db.execute('DELETE FROM clientes WHERE id = ?', [clienteId]);
        if (result[0].affectedRows === 0) {
            throw new Error('Cliente não encontrado');
        }
    } catch (error) {
        throw error;
    }
}

// Operações CRUD para clientes

// Endpoint /clientes para criar um novo cliente (POST)
app.post('/clientes', async (req, res, next) => {
    try {
        const clienteId = await createCliente(req.body);
        res.status(201).json({ id: clienteId, message: 'Cliente criado com sucesso' });
    } catch (error) {
        next(error);
    }
});

// Endpoint /clientes/:id para buscar um cliente pelo ID (GET)
app.get('/clientes/:id', async (req, res, next) => {
    try {
        const cliente = await getClienteById(req.params.id);
        res.json(cliente);
    } catch (error) {
        next(error);
    }
});

// Endpoint /clientes para buscar todos os clientes (GET)
app.get('/clientes', async (req, res, next) => {
    try {
        const clientes = await getClientes();
        res.json(clientes);
    } catch (error) {
        next(error);
    }
});

// Endpoint /clientes/:id para atualizar um cliente pelo ID (PUT)
app.put('/clientes/:id', async (req, res, next) => {
    try {
        await updateCliente(req.params.id, req.body);
        res.json({ message: 'Cliente atualizado com sucesso' });
    } catch (error) {
        next(error);
    }
});

// Endpoint /clientes/:id para excluir um cliente pelo ID (DELETE)
app.delete('/clientes/:id', async (req, res, next) => {
    try {
        await deleteCliente(req.params.id);
        res.json({ message: 'Cliente excluído com sucesso' });
    } catch (error) {
        next(error);
    }
});

// Endpoint padrão
app.get('/', (req, res) => {
    res.send('Bem-vindo à minha aplicação!');
});

// Endpoint /produtos
app.get('/produtos', async (req, res, next) => {
    try {
        const [rows, fields] = await req.db.execute('SELECT * FROM produtos');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Middleware para lidar com erros 404
app.use((req, res, next) => {
    next(httpErrors(404));
});

// Middleware para lidar com outros erros
app.use((err, req, res, next) => {
    // Configurar a resposta de erro
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: process.env.NODE_ENV === 'production' ? {} : err,
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
