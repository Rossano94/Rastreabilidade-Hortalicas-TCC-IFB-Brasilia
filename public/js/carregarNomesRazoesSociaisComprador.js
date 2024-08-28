// Função para carregar os nomes dos compradores no <select>
function carregarNomesCompradores() {
    // Faz uma requisição GET para a rota '/compradores' no servidor
    fetch('/compradores')
    .then(response => response.json()) // Converte a resposta para JSON
    .then(compradores => {
    // Seleciona o elemento <select> pelo ID
    const selectComprador = document.getElementById('nomeComprador');
    
    // Limpa quaisquer opções existentes no <select>
    selectComprador.innerHTML = '';
    
    // Adiciona uma opção padrão
    const optionPadrao = document.createElement('option');
    optionPadrao.value = '';
    optionPadrao.textContent = 'Selecione um comprador...';
    selectComprador.appendChild(optionPadrao);
    
    // Para cada Comprador retornado pelo servidor, cria uma nova opção no <select>
    compradores.forEach(comprador => {
    const option = document.createElement('option');
    option.textContent = comprador.nome_razao_social_comprador; // Define o texto da opção como o nome do Comprador
    selectComprador.appendChild(option);
    });
    })
    .catch(error => {
    console.error('Erro ao carregar compradores:', error);
    });
    }
    
    // Chama a função para carregar os nomes dos compradores assim que a página é carregada
    document.addEventListener('DOMContentLoaded', carregarNomesCompradores);
    