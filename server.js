const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Configurações do PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'rastreabilidade_hortalicas',
    password: '123',
    port: 5432,
});

// Testar a conexão com o banco de dados
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao conectar ao banco de dados:', err);
    }
    console.log('Conexão ao banco de dados estabelecida com sucesso!');
    release();
});

// Middleware para analisar dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para analisar JSON
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Lidar com a rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index/index.html'));
});

// Rota para lidar com o envio do formulário de cadastro de ente anterior
app.get('/cadastro-ente-anterior', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/cadastro-ente-anterior.html'));
});

// Rota para lidar com o envio do formulário de cadastro de ente posterior
app.get('/cadastro-ente-posterior', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/cadastro-ente-posterior.html'));
});

// Rota para lidar com a página de busca_anterior
app.get('/busca_anterior', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/busca_anterior.html'));
});

// Rota para lidar com a página de busca_posterior
app.get('/busca_posterior', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/busca_posterior.html'));
});

// Rota para lidar com o envio do formulário de cadastro de ente anterior - PRODUÇÃO
app.post('/cadastro-ente-anterior', async (req, res) => {
    // Obtenha os dados do corpo da requisição
    const {
        nome_produto_vegetal,
        variedade_cultivar,
        quantidade_recebida,
        identificacao_lote,
        data_recebimento
    } = req.body;

    try {
        // Buscar IDs correspondentes com base nos nomes
        const produtoIdQuery = 'SELECT produto_id FROM produtos_vegetais WHERE nome_produto_vegetal = $1';
        const produtoIdResult = await pool.query(produtoIdQuery, [nome_produto_vegetal]);
        const produtoId = produtoIdResult.rows[0].produto_id;

        const variedadeIdQuery = 'SELECT id FROM variedade_cultivar_vegetal WHERE variedade_cultivar = $1';
        const variedadeIdResult = await pool.query(variedadeIdQuery, [variedade_cultivar]);
        const variedadeId = variedadeIdResult.rows[0].id;

        // Inserir os dados na tabela
        const queryInsert = `
            INSERT INTO entes_anteriores (
                produto_id,
                variedade_cultivar_id,
                quantidade_recebida,
                identificacao_lote,
                data_recebimento
            ) VALUES ($1, $2, $3, $4, $5)
        `;
        const values = [
            produtoId,
            variedadeId,
            quantidade_recebida,
            identificacao_lote,
            data_recebimento
        ];
        await pool.query(queryInsert, values);

        console.log('Dados inseridos com sucesso no banco de dados');
        res.redirect('/index.html');
    } catch (error) {
        console.error('Erro ao inserir dados no banco de dados:', error);
        res.status(500).json({ message: 'Erro ao cadastrar ente anterior' });
    }
});

// Rota para lidar com o envio do formulário de cadastro de ente posterior - VENDA
app.post('/cadastro-ente-posterior', async (req, res) => {
    // Obtenha os dados do corpo da requisição
    const {
        nome_produto_vegetal,
        variedade_cultivar,
        nome_comprador, // Atualizado para nome_comprador
        quantidade_expedido,
        identificacao_lote,
        data_recebimento
    } = req.body;

    try {
        // Buscar IDs correspondentes com base nos nomes
        const produtoIdQuery = 'SELECT produto_id FROM produtos_vegetais WHERE nome_produto_vegetal = $1';
        const produtoIdResult = await pool.query(produtoIdQuery, [nome_produto_vegetal]);
        const produtoId = produtoIdResult.rows[0].produto_id;

        const variedadeIdQuery = 'SELECT id FROM variedade_cultivar_vegetal WHERE variedade_cultivar = $1';
        const variedadeIdResult = await pool.query(variedadeIdQuery, [variedade_cultivar]);
        const variedadeId = variedadeIdResult.rows[0].id;

        const compradorIdQuery = 'SELECT comprador_id FROM compradores WHERE nome_razao_social_comprador = $1';
        const compradorIdResult = await pool.query(compradorIdQuery, [nome_comprador]); // Atualizado para nome_comprador
        const compradorId = compradorIdResult.rows[0].comprador_id;

        // Inserir os dados na tabela
        const queryInsert = `
            INSERT INTO entes_posteriores (
                produto_id,
                variedade_cultivar_id,
                quantidade_expedido,
                identificacao_lote,
                data_recebimento,
                comprador_id
            ) VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [
            produtoId,
            variedadeId,
            quantidade_expedido,
            identificacao_lote,
            data_recebimento,
            compradorId
        ];
        await pool.query(queryInsert, values);

        console.log('Dados inseridos com sucesso no banco de dados');
        res.redirect('/index.html');
    } catch (error) {
        console.error('Erro ao inserir dados no banco de dados:', error);
        res.status(500).json({ message: 'Erro ao cadastrar ente posterior' });
    }
});

//Rota para lidar com a busca dos dados através da identificação do lote ente anterior - PRODUÇÃO
app.post('/buscar-entes-anteriores', async (req, res) => {
    const identificacaoLote = req.body.identificacao_lote;

    try {
        const query = `
        SELECT 
    f.nome_razao_social, 
    f.cpf_cnpj_ie_cgc_mapa, 
    f.endereco_completo,
	pv.nome_produto_vegetal, 
    vc.variedade_cultivar,
	ea.quantidade_recebida,
	ea.identificacao_lote,
	ea.data_recebimento,
    TO_CHAR(ea.data_recebimento, 'DD/MM/YYYY') AS data_recebimento
FROM 
    agricultor f, entes_anteriores ea
JOIN 
    produtos_vegetais pv ON ea.produto_id = pv.produto_id
JOIN 
    variedade_cultivar_vegetal vc ON ea.variedade_cultivar_id = vc.id
WHERE 
    ea.identificacao_lote = $1;
        `;

        const { rows } = await pool.query(query, [identificacaoLote]);

        res.json({ success: true, results: rows });
    } catch (error) {
        console.error('Erro ao buscar entes anteriores:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar entes anteriores' });
    }
});

//Rota para lidar com a busca dos dados através da identificação do lote ente posterior - VENDA
app.post('/buscar-entes-posteriores', async (req, res) => {
    const identificacaoLote = req.body.identificacao_lote;

    try {
        const query = `
        SELECT 
    f.nome_razao_social_comprador, 
    f.cpf_cnpj_ie_cgc_mapa, 
    f.endereco_completo,
	pv.nome_produto_vegetal, 
    vc.variedade_cultivar,
	ea.quantidade_expedido,
	ea.identificacao_lote,
	ea.data_recebimento,
    TO_CHAR(ea.data_recebimento, 'DD/MM/YYYY') AS data_recebimento
FROM 
    entes_posteriores ea
JOIN 
    produtos_vegetais pv ON ea.produto_id = pv.produto_id
JOIN 
    variedade_cultivar_vegetal vc ON ea.variedade_cultivar_id = vc.id
JOIN 
    compradores f ON ea.comprador_id = f.comprador_id
WHERE 
    ea.identificacao_lote = $1;
        `;

        const { rows } = await pool.query(query, [identificacaoLote]);

        res.json({ success: true, results: rows });
    } catch (error) {
        console.error('Erro ao buscar entes posteriores:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar entes posteriores' });
    }
});

// Rota para consultar os produtos vegetais
app.get('/produtos_vegetais', (req, res) => {
    const query = 'SELECT nome_produto_vegetal FROM produtos_vegetais'; // Seleciona apenas o nome do produto
        pool.query(query, (error, result) => {
            if (error) {
            console.error('Erro ao consultar produtos vegetais:', error);
            res.status(500).json({ message: 'Erro ao consultar produtos vegetais' });
            } else {
            res.json(result.rows); // Retorna apenas os nomes dos produtos
            }
        });
    });

 app.get('/variedades_cultivar', (req, res) => {
    const query = 'SELECT variedade_cultivar FROM variedade_cultivar_vegetal'; // Seleciona apenas o nome da variedade ou cultivar
        pool.query(query, (error, result) => {
            if (error) {
            console.error('Erro ao consultar variedades ou cultivares:', error);
            res.status(500).json({ message: 'Erro ao consultar variedades ou cultivares' });
            } else {
            res.json(result.rows); // Retorna apenas os nomes das variedades ou cultivares
            }
        });
    });
   
// Rota para consultar os nomes ou razões sociais dos comprador
app.get('/compradores', (req, res) => {
    const query = 'SELECT nome_razao_social_comprador FROM compradores'; // 
        pool.query(query, (error, result) => {
            if (error) {
            console.error('Erro ao consultar compradores:', error);
            res.status(500).json({ message: 'Erro ao consultar compradores' });
            } else {
            res.json(result.rows); // Retorna apenas os nomes dos compradores
            }
        });
    });

// Rota para gerar o número do lote
app.get('/gerar-numero-lote', async (req, res) => {
    try {
        // Consulta para obter o último número de lote
        const query = 'SELECT identificacao_lote FROM entes_anteriores ORDER BY identificacao_lote DESC LIMIT 1';
        const { rows } = await pool.query(query);

        let ultimoNumeroLote = 0;
        if (rows.length > 0) {
            // Extrair o número do último lote e convertê-lo para um número
            const ultimoLote = rows[0].identificacao_lote;
            ultimoNumeroLote = parseInt(ultimoLote.replace('24ALF', ''), 10);
        }

        // Incrementar o número do último lote para obter o próximo número
        const novoNumeroLote = ultimoNumeroLote + 1;

        // Formatando o novo número do lote com a máscara especificada
        const novoNumeroFormatado = '24ALF' + pad(novoNumeroLote, 3);

        // Retornar o novo número do lote formatado
        res.json({ success: true, numeroLoteFormatado: novoNumeroFormatado });
    } catch (error) {
        console.error('Erro ao gerar número do lote:', error);
        res.status(500).json({ success: false, error: 'Erro ao gerar número do lote' });
    }
});

// Função para adicionar zeros à esquerda
function pad(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

app.get('/gerar-numero-lote-venda', async (req, res) => {
    try {
        // Consulta para obter o último número de lote
        const query = 'SELECT identificacao_lote FROM entes_posteriores ORDER BY identificacao_lote DESC LIMIT 1';
        const { rows } = await pool.query(query);

        let ultimoNumeroLote = 0;
        if (rows.length > 0) {
            // Extrair o número do último lote e convertê-lo para um número
            const ultimoLote = rows[0].identificacao_lote;
            ultimoNumeroLote = parseInt(ultimoLote.replace('24TECAGRO', ''), 10);
        }

        // Incrementar o número do último lote para obter o próximo número
        const novoNumeroLote = ultimoNumeroLote + 1;

        // Formatando o novo número do lote com a máscara especificada
        const novoNumeroFormatado = '24TECAGRO' + pad(novoNumeroLote, 3);

        // Retornar o novo número do lote formatado
        res.json({ success: true, numeroLoteFormatado: novoNumeroFormatado });
    } catch (error) {
        console.error('Erro ao gerar número do lote:', error);
        res.status(500).json({ success: false, error: 'Erro ao gerar número do lote' });
    }
});


// Inicie o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
