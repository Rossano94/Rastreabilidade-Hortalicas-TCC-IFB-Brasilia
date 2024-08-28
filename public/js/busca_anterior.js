document.addEventListener('DOMContentLoaded', async function () {
    const formBusca = document.getElementById('formBusca');

    formBusca.addEventListener('submit', async function (event) {
        event.preventDefault();

        const identificacaoLote = document.getElementById('identificacaoLote').value;

        try {
            const response = await fetch('/buscar-entes-anteriores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identificacao_lote: identificacaoLote }),
            });

            const result = await response.json();

            if (result.success) {
                mostrarResultados(result.results);
            } else {
                alert('Erro ao buscar entes anteriores');
            }
        } catch (error) {
            console.error('Erro ao buscar entes anteriores:', error);
            alert('Erro ao buscar entes anteriores');
        }
    });

    function mostrarResultados(resultados) {
        const resultadosDiv = document.getElementById('resultados');
        resultadosDiv.innerHTML = '';

        if (resultados.length === 0) {
            resultadosDiv.innerHTML = '<h2 class="resultado-busca">Nenhum resultado encontrado referente ao lote informado</h2>';
            return;
        }

        resultadosDiv.innerHTML = '<h2 class="resultado-busca">Produzido por:</h2>';

        resultados.forEach(registro => {
            const divRegistro = document.createElement('div');
            divRegistro.classList.add('registro');

            divRegistro.innerHTML = `            
        <div>
            <p>Nome ou Razão Social: ${registro.nome_razao_social}</p>
            <p>CPF, IE ou CNPJ ou CGC/MAPA: ${registro.cpf_cnpj_ie_cgc_mapa}</p>
            <p>Endereço Completo: ${registro.endereco_completo}</p>
        </div>
        
        <div>
          <p><strong>Informações do Produto Vegetal</strong></p>
          <p>Nome: ${registro.nome_produto_vegetal}</p>
          <p>Variedade ou Cultivar: ${registro.variedade_cultivar}</p>
          <p>Peso Líquido (KG): ${registro.quantidade_recebida}</p>
          <p>Identificação do Lote: ${registro.identificacao_lote}</p>
          <p>Data da Colheita: ${registro.data_recebimento}</p>
        </div>
      `;

            resultadosDiv.appendChild(divRegistro);
            resultadosDiv.appendChild(document.createElement('hr'));
        });
    }
});
