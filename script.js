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

    if (!elementoParaPdf) { /* ... (verificações como antes) ... */ return; }
    if (!headerConteudoPdf) { /* ... (verificações como antes) ... */ }

    if (headerConteudoPdf) {
        headerConteudoPdf.classList.remove('oculto-na-pagina');
        headerConteudoPdf.classList.add('mostrar-para-pdf');
    }

    const larguraDeCapturaPx = 900;
    const larguraOriginalContainer = elementoParaPdf.style.width;
    const marginLeftOriginalContainer = elementoParaPdf.style.marginLeft;
    const marginRightOriginalContainer = elementoParaPdf.style.marginRight;

    elementoParaPdf.style.width = larguraDeCapturaPx + 'px';
    elementoParaPdf.style.marginLeft = 'auto';
    elementoParaPdf.style.marginRight = 'auto';

    const options = {
        scale: 1.5, // Mantenha um valor que dê boa qualidade (ex: 1.5 ou 2)
        useCORS: true,
        logging: true,
        backgroundColor: '#E6E6E6',
        width: larguraDeCapturaPx,
        windowWidth: larguraDeCapturaPx,
        height: elementoParaPdf.scrollHeight,
        windowHeight: elementoParaPdf.scrollHeight,
        x: 0
    };

    html2canvas(elementoParaPdf, options).then(canvas => {
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
        const pdfPageHeight = pdf.internal.pageSize.getHeight(); // Altura útil de uma página A4 em 'pt'
        const imgProps = pdf.getImageProperties(imgData);

        // Calcular a altura da imagem se ela for redimensionada para caber na LARGURA do PDF
        let scaledImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let scaledImgWidth = pdfWidth;

        // SE QUISER FORÇAR TUDO EM UMA PÁGINA, E A IMAGEM FOR MAIS ALTA QUE A PÁGINA PDF:
        // Redimensiona a imagem para caber na ALTURA da página, ajustando a largura proporcionalmente.
        // Isso pode fazer a imagem parecer "achatada" se o conteúdo for muito longo.
        // Ou, se scaledImgHeight > pdfPageHeight, você pode optar por CORTAR a imagem
        // ou permitir múltiplas páginas (que é o que a lógica anterior fazia).
        // Para forçar em uma página, se scaledImgHeight > pdfPageHeight:
        if (scaledImgHeight > pdfPageHeight) {
            console.warn("Conteúdo é maior que uma página A4. Tentando ajustar à altura da página.");
            scaledImgWidth = (imgProps.width * pdfPageHeight) / imgProps.height; // Recalcula a largura para manter proporção
            scaledImgHeight = pdfPageHeight; // Força a altura a ser a da página

            // Centralizar a imagem se ela ficou mais estreita que a página
            let offsetX = (pdfWidth - scaledImgWidth) / 2;
             pdf.addImage(imgData, 'PNG', offsetX, 0, scaledImgWidth, scaledImgHeight);
        } else {
            // A imagem já cabe ou é menor que uma página, centraliza horizontalmente
            let offsetX = (pdfWidth - scaledImgWidth) / 2;
            if (scaledImgWidth < pdfWidth) offsetX = (pdfWidth - scaledImgWidth) / 2; else offsetX =0;

            pdf.addImage(imgData, 'PNG', offsetX, 0, scaledImgWidth, scaledImgHeight);
        }

        // Remover a lógica de múltiplas páginas se você está forçando uma única página:
        /*
        let currentPositionInImage = 0;
        let pageCount = 0;
        while(currentPositionInImage < scaledImgHeight) {
            // ... (lógica antiga de múltiplas páginas) ...
        }
        */

        pdf.save('Curriculo_Breno_Caldas.pdf');

    }).catch(error => { /* ... (bloco catch como antes) ... */ });
}
