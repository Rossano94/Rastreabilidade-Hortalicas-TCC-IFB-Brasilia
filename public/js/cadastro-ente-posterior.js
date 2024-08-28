app.post('/cadastro-ente-posterior', async (req, res) => {
    // Obtenha os dados do corpo da requisição
    const {
        nome_produto_vegetal,
        variedade_cultivar,
        nome_razao_social,
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
        const compradorIdResult = await pool.query(compradorIdQuery, [nome_razao_social]);
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
        res.status(500).json({ message: 'Erro ao cadastrar ente anterior' });
    }
});
