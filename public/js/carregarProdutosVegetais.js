// Função para carregar os produtos vegetais no <select>
function carregarProdutosVegetais() {
      // Faz uma requisição GET para a rota '/produtos_vegetais' no servidor
      fetch('/produtos_vegetais')
      .then(response => response.json()) // Converte a resposta para JSON
      .then(produtos => {
        // Seleciona o elemento <select> pelo ID
        const selectProdutos = document.getElementById('nomeProdutoVegetal');
        
        // Limpa quaisquer opções existentes no <select>
        selectProdutos.innerHTML = '';
        
        // Adiciona uma opção padrão
        const optionPadrao = document.createElement('option');
        optionPadrao.value = '';
        optionPadrao.textContent = 'Selecione um produto...';
        selectProdutos.appendChild(optionPadrao);
        
        // Para cada produto retornado pelo servidor, cria uma nova opção no <select>
        produtos.forEach(produto => {
          const option = document.createElement('option');
          option.textContent = produto.nome_produto_vegetal; // Define o texto da opção como o nome do produto
          selectProdutos.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Erro ao carregar produtos vegetais:', error);
      });
    }
    