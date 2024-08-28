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
