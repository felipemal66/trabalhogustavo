const express = require('express');
const httpErrors = require('http-errors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(__dirname, 'configs', '.env') });

// Imprimir as variáveis de ambiente carregadas
console.log('Variáveis de ambiente carregadas:', process.env);

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

// Operações CRUD para produtos

// Endpoint /produtos para buscar todos os produtos (GET)
app.get('/produtos', async (req, res, next) => {
    try {
        const [rows, fields] = await req.db.execute('SELECT * FROM produtos');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Endpoint /produtos para criar um novo produto (POST)
app.post('/produtos', async (req, res, next) => {
    try {
        const { nome, preco } = req.body;
        if (!nome || !preco) {
            throw new Error('Nome e preço são obrigatórios.');
        }
        
        // Insira o novo produto no banco de dados
        const result = await req.db.execute('INSERT INTO produtos (nome, preco) VALUES (?, ?)', [nome, preco]);
        const novoProdutoId = result[0].insertId;
        
        res.status(201).json({ id: novoProdutoId, nome, preco, message: 'Produto criado com sucesso' });
    } catch (error) {
        next(error);
    }
});

// Endpoint /produtos/:id para buscar um produto pelo ID (GET)
app.get('/produtos/:id', async (req, res, next) => {
    try {
        const [rows, fields] = await req.db.execute('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            throw new Error('Produto não encontrado');
        }
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
});

// Endpoint /produtos/:id para atualizar um produto pelo ID (PUT)
app.put('/produtos/:id', async (req, res, next) => {
    try {
        const { nome, preco } = req.body;
        if (!nome || !preco) {
            throw new Error('Nome e preço são obrigatórios.');
        }

        // Atualize o produto no banco de dados
        const result = await req.db.execute('UPDATE produtos SET nome = ?, preco = ? WHERE id = ?', [nome, preco, req.params.id]);
        if (result[0].affectedRows === 0) {
            throw new Error('Produto não encontrado');
        }

        res.json({ message: 'Produto atualizado com sucesso' });
    } catch (error) {
        next(error);
    }
});

// Endpoint /produtos/:id para excluir um produto pelo ID (DELETE)
app.delete('/produtos/:id', async (req, res, next) => {
    try {
        const result = await req.db.execute('DELETE FROM produtos WHERE id = ?', [req.params.id]);
        if (result[0].affectedRows === 0) {
            throw new Error('Produto não encontrado');
        }
        res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
        next(error);
    }
});

// Operações CRUD para clientes

// Endpoint /clientes para buscar todos os clientes (GET)
app.get('/clientes', async (req, res, next) => {
    try {
        const [rows, fields] = await req.db.execute('SELECT * FROM clientes');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Endpoint /clientes para criar um novo cliente (POST)
app.post('/clientes', async (req, res, next) => {
    try {
        const { nome, sobrenome, email, idade } = req.body;
        if (!nome || !sobrenome || !email || !idade) {
            throw new Error('Nome, sobrenome, email e idade são obrigatórios.');
        }
        
        // Insira o novo cliente no banco de dados
        const result = await req.db.execute('INSERT INTO clientes (nome, sobrenome, email, idade) VALUES (?, ?, ?, ?)', [nome, sobrenome, email, idade]);
        const novoClienteId = result[0].insertId;
        
        res.status(201).json({ id: novoClienteId, nome, sobrenome, email, idade, message: 'Cliente criado com sucesso' });
    } catch (error) {
        next(error);
    }
});

// Endpoint /clientes/:id para buscar um cliente pelo ID (GET)
app.get('/clientes/:id', async (req, res, next) => {
    try {
        const [rows, fields] = await req.db.execute('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            throw new Error('Cliente não encontrado');
        }
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
});

// Endpoint /clientes/:id para atualizar um cliente pelo ID (PUT)
app.put('/clientes/:id', async (req, res, next) => {
    try {
        const { nome, sobrenome, email, idade } = req.body;
        if (!nome || !sobrenome || !email || !idade) {
            throw new Error('Nome, sobrenome, email e idade são obrigatórios.');
        }

        // Atualize o cliente no banco de dados
        const result = await req.db.execute('UPDATE clientes SET nome = ?, sobrenome = ?, email = ?, idade = ? WHERE id = ?', [nome, sobrenome, email, idade, req.params.id]);
        if (result[0].affectedRows === 0) {
            throw new Error('Cliente não encontrado');
        }

        res.json({ message: 'Cliente atualizado com sucesso' });
    } catch (error) {
        next(error);
    }
});

// Endpoint /clientes/:id para excluir um cliente pelo ID (DELETE)
app.delete('/clientes/:id', async (req, res, next) => {
    try {
        const result = await req.db.execute('DELETE FROM clientes WHERE id = ?', [req.params.id]);
        if (result[0].affectedRows === 0) {
            throw new Error('Cliente não encontrado');
        }
        res.json({ message: 'Cliente excluído com sucesso' });
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
