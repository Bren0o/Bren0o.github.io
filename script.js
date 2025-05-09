// script.js

document.addEventListener('DOMContentLoaded', function() {
    const botaoGerar = document.getElementById('botaoGerarPdf');
    if (botaoGerar) {
        botaoGerar.addEventListener('click', gerarPDF);
    } else {
        console.error("Botão com ID 'botaoGerarPdf' não encontrado.");
    }
});

function gerarPDF() {
    const elementoParaPdf = document.getElementById('pagina-container-para-pdf');
    const headerConteudoPdf = document.querySelector('.header-conteudo-pdf');

    if (!elementoParaPdf) {
        console.error("Elemento com ID 'pagina-container-para-pdf' não encontrado.");
        alert("Erro: Não foi possível encontrar o conteúdo principal para gerar o PDF.");
        return;
    }
    if (!headerConteudoPdf) {
        console.error("Elemento com classe '.header-conteudo-pdf' não encontrado.");
    }

    // Mostrar o header do PDF para captura
    if (headerConteudoPdf) {
        headerConteudoPdf.classList.remove('oculto-na-pagina');
        headerConteudoPdf.classList.add('mostrar-para-pdf');
    }

    // Definir a largura de captura desejada (a max-width do seu conteúdo)
    // Adicione o padding do #pagina-container-para-pdf se ele tiver padding lateral.
    // No nosso CSS atual, #pagina-container-para-pdf tem padding: 20px 0; (sem padding lateral)
    // então a largura de captura deve ser a max-width do conteúdo.
    const larguraDeCapturaPx = 900; // Sua max-width em pixels

    const options = {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#E6E6E6', // Fundo do canvas
        width: larguraDeCapturaPx,   // Força a largura da área de captura
        windowWidth: larguraDeCapturaPx, // Simula uma janela com esta largura
        height: elementoParaPdf.scrollHeight, // Continua usando scrollHeight para a altura
        windowHeight: elementoParaPdf.scrollHeight,
        x: (elementoParaPdf.offsetWidth - larguraDeCapturaPx) / 2 // Centraliza a captura se o elementoParaPdf for mais largo
    };
    // Se o elementoParaPdf (width:100%) for mais largo que 900px,
    // o 'x' vai centralizar a área de 900px que será capturada.

    // Se o #pagina-container-para-pdf tiver padding lateral, você precisaria ajustar
    // a larguraDeCapturaPx para incluir esse padding, ou o 'x' para compensar.
    // Exemplo: se #pagina-container-para-pdf tivesse padding: 0 20px;
    // larguraDeCapturaPx = 900 + 40;
    // options.x = (elementoParaPdf.offsetWidth - larguraDeCapturaPx) / 2 + 20; // +20 para o padding esquerdo

    // No nosso CSS atual, #pagina-container-para-pdf tem width:100% e padding: 20px 0;
    // Os filhos (.header-conteudo-pdf e main#main-content) têm max-width: 900px e margin: auto.
    // Para que o html2canvas capture corretamente, precisamos garantir que o #pagina-container-para-pdf
    // se "ajuste" à largura dos seus filhos centralizados, ou que a captura seja feita
    // na área correta.

    // Alternativa para 'x': Se os filhos já estão centralizados e o pai é 100%
    // podemos apenas definir a largura e esperar que a centralização funcione.
    // Se o elementoParaPdf tem width: 100%, e os filhos max-width: 900px; margin:auto;
    // e backgroundColor do elementoParaPdf é o creme.
    // Ao definir width: 900 no html2canvas, ele deve pegar a área central.

    // Simplificando 'x' por enquanto, confiando que o conteúdo interno está centralizado
    // e o #pagina-container-para-pdf tem o fundo creme.
    // O problema é que definir 'width' no html2canvas pode cortar o fundo creme se o container for mais largo.

    // --- NOVA ABORDAGEM PARA 'x' e 'width' ---
    // Calcular o deslocamento 'x' baseado na largura real do container e a largura desejada
    const estiloComputadoContainer = window.getComputedStyle(elementoParaPdf);
    const paddingLeftContainer = parseFloat(estiloComputadoContainer.paddingLeft);
    const paddingRightContainer = parseFloat(estiloComputadoContainer.paddingRight);

    // A largura visível do conteúdo dentro do container (excluindo paddings do container)
    // const larguraInternaContainer = elementoParaPdf.clientWidth; // clientWidth = width + padding - scrollbar
    const larguraInternaContainer = elementoParaPdf.offsetWidth - paddingLeftContainer - paddingRightContainer;


    // Idealmente, a largura de captura é a largura máxima do seu conteúdo.
    // O 'x' deve ser o espaço à esquerda do seu conteúdo centralizado.
    let captureX = 0;
    if (larguraInternaContainer > larguraDeCapturaPx) {
        captureX = (larguraInternaContainer - larguraDeCapturaPx) / 2;
    }
    // Adiciona o padding esquerdo do container ao 'x' para começar a captura APÓS o padding.
    // options.x = paddingLeftContainer + captureX; // Se #pagina-container-para-pdf tem padding lateral
    // Como #pagina-container-para-pdf não tem padding lateral (padding: 20px 0),
    // e os filhos se centralizam, o 'x' para html2canvas pode ser mais complexo
    // se o próprio #pagina-container-para-pdf for muito largo.

    // Se o seu #pagina-container-para-pdf tem width: 100%, e o conteúdo dentro
    // (.header-conteudo-pdf, main#main-content) tem max-width: 900px e margin: auto,
    // o html2canvas ao capturar #pagina-container-para-pdf com uma 'width' menor
    // pode não capturar o fundo creme nas laterais corretamente.

    // VAMOS TENTAR UMA ESTRATÉGIA DIFERENTE:
    // Definir a largura do #pagina-container-para-pdf temporariamente para 900px
    // e depois capturar.

    const larguraOriginalContainer = elementoParaPdf.style.width;
    const marginLeftOriginalContainer = elementoParaPdf.style.marginLeft;
    const marginRightOriginalContainer = elementoParaPdf.style.marginRight;

    elementoParaPdf.style.width = larguraDeCapturaPx + 'px';
    elementoParaPdf.style.marginLeft = 'auto';
    elementoParaPdf.style.marginRight = 'auto';
    // Isso deve fazer com que o próprio #pagina-container-para-pdf (com seu fundo creme)
    // tenha 900px de largura e esteja centralizado, e os filhos (header e main)
    // também ocuparão esses 900px.

    options.width = larguraDeCapturaPx; // Captura exatamente esta largura
    options.windowWidth = larguraDeCapturaPx;
    options.x = 0; // Agora capturamos a partir da borda esquerda do container redimensionado

    // --- FIM DA NOVA ABORDAGEM ---


    html2canvas(elementoParaPdf, options).then(canvas => {
        // Restaurar estilos do container
        elementoParaPdf.style.width = larguraOriginalContainer;
        elementoParaPdf.style.marginLeft = marginLeftOriginalContainer;
        elementoParaPdf.style.marginRight = marginRightOriginalContainer;

        if (headerConteudoPdf) {
            headerConteudoPdf.classList.remove('mostrar-para-pdf');
            headerConteudoPdf.classList.add('oculto-na-pagina');
        }

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);

        const scaledImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const scaledImgWidth = pdfWidth;

        let currentPositionInImage = 0;
        let pageCount = 0;

        while(currentPositionInImage < scaledImgHeight) {
            if (pageCount > 0) {
                pdf.addPage();
            }
            pdf.addImage(imgData, 'PNG', 0, -currentPositionInImage, scaledImgWidth, scaledImgHeight);
            currentPositionInImage += pdfPageHeight;
            pageCount++;
            if (currentPositionInImage >= scaledImgHeight - 10) break;
        }

        pdf.save('Curriculo_Breno_Caldas.pdf');

    }).catch(error => {
        // Restaurar estilos do container em caso de erro
        elementoParaPdf.style.width = larguraOriginalContainer;
        elementoParaPdf.style.marginLeft = marginLeftOriginalContainer;
        elementoParaPdf.style.marginRight = marginRightOriginalContainer;

        if (headerConteudoPdf) {
            headerConteudoPdf.classList.remove('mostrar-para-pdf');
            headerConteudoPdf.classList.add('oculto-na-pagina');
        }
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
