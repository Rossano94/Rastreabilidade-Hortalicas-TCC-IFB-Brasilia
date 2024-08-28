// Função para carregar as variedades ou cultivares no <select>
function carregarVariedadesCultivar() {
    // Faz uma requisição GET para a rota '/variedades_cultivar' no servidor
    fetch('/variedades_cultivar')
    .then(response => response.json()) // Converte a resposta para JSON
    .then(variedades => {
      // Seleciona o elemento <select> pelo ID
      const selectVariedades = document.getElementById('variedadeCultivar');
      
      // Limpa quaisquer opções existentes no <select>
      selectVariedades.innerHTML = '';
      
      // Adiciona uma opção padrão
      const optionPadrao = document.createElement('option');
      optionPadrao.value = '';
      optionPadrao.textContent = 'Selecione uma variedade ou cultivar...';
      selectVariedades.appendChild(optionPadrao);
      
      // Para cada variedade ou cultivar retornado pelo servidor, cria uma nova opção no <select>
      variedades.forEach(variedade => {
        const option = document.createElement('option');
        option.textContent = variedade.variedade_cultivar; // Define o texto da opção como a variedade ou cultivar
        selectVariedades.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar variedades ou cultivares:', error);
    });
  }
  