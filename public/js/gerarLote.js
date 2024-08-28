// Função para gerar o número do lote automaticamente ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    gerarNumeroLote();
});

// Função para fazer a requisição AJAX e obter o próximo número do lote
function gerarNumeroLote() {
    fetch('/gerar-numero-lote')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('identificacaoLote').value = data.numeroLoteFormatado;
            } else {
                console.error('Erro:', data.message);
            }
        })
        .catch(error => console.error('Erro:', error));
}
