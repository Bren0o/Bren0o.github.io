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

    if (!elementoParaPdf) { /* ... verificações ... */ return; }
    if (!headerConteudoPdf) { /* ... verificações ... */ }

    if (headerConteudoPdf) {
        headerConteudoPdf.classList.remove('oculto-na-pagina');
        headerConteudoPdf.classList.add('mostrar-para-pdf');
    }

    const larguraDeCapturaPx = 900; // Sua max-width
    const larguraOriginalContainer = elementoParaPdf.style.width;
    const marginLeftOriginalContainer = elementoParaPdf.style.marginLeft;
    const marginRightOriginalContainer = elementoParaPdf.style.marginRight;
    const paddingTopOriginal = elementoParaPdf.style.paddingTop; // Salvar padding original
    const paddingBottomOriginal = elementoParaPdf.style.paddingBottom;

    // Forçar o container a ter a largura exata e centralização para a captura
    elementoParaPdf.style.width = larguraDeCapturaPx + 'px';
    elementoParaPdf.style.marginLeft = 'auto';
    elementoParaPdf.style.marginRight = 'auto';
    // Garantir que o padding que queremos no PDF esteja aplicado durante a captura
    elementoParaPdf.style.paddingTop = '20px'; // Conforme CSS
    elementoParaPdf.style.paddingBottom = '100px'; // Conforme CSS (espaço creme)


    const options = {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: null, // DEIXE O HTML2CANVAS TENTAR PEGAR DO ELEMENTO
                              // Se o elemento tem !important, deve funcionar.
                              // Ou tente '#E6E6E6' se null não funcionar.
        width: larguraDeCapturaPx,
        windowWidth: larguraDeCapturaPx,
        height: elementoParaPdf.scrollHeight, // Deve incluir os paddings verticais
        windowHeight: elementoParaPdf.scrollHeight,
        x: 0, // Começa a capturar da borda esquerda do container redimensionado
        removeContainer: false // Adicionado para garantir que o container não seja removido/alterado pelo html2canvas
    };

    html2canvas(elementoParaPdf, options).then(canvas => {
        // Restaurar estilos do container
        elementoParaPdf.style.width = larguraOriginalContainer;
        elementoParaPdf.style.marginLeft = marginLeftOriginalContainer;
        elementoParaPdf.style.marginRight = marginRightOriginalContainer;
        elementoParaPdf.style.paddingTop = paddingTopOriginal;
        elementoParaPdf.style.paddingBottom = paddingBottomOriginal;


        if (headerConteudoPdf) {
            headerConteudoPdf.classList.remove('mostrar-para-pdf');
            headerConteudoPdf.classList.add('oculto-na-pagina');
        }

        const imgData = canvas.toDataURL('image/png');
        // ... (resto da lógica do jsPDF como antes) ...
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const scaledImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const scaledImgWidth = pdfWidth;
        let currentPositionInImage = 0;
        let pageCount = 0;
        while(currentPositionInImage < scaledImgHeight) {
            if (pageCount > 0) { pdf.addPage(); }
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
        elementoParaPdf.style.paddingTop = paddingTopOriginal;
        elementoParaPdf.style.paddingBottom = paddingBottomOriginal;

        if (headerConteudoPdf) {
            headerConteudoPdf.classList.remove('mostrar-para-pdf');
            headerConteudoPdf.classList.add('oculto-na-pagina');
        }
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
