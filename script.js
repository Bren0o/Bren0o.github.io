// script.js

document.addEventListener('DOMContentLoaded', function() {
    const botaoGerar = document.getElementById('botaoGerarPdf');
    if (botaoGerar) {
        botaoGerar.addEventListener('click', gerarPDF);
    } else {
        console.error("Botão com ID 'botaoGerarPdf' não encontrado no HTML.");
    }
});

function gerarPDF() {
    const elementoParaPdf = document.getElementById('pdf-content-area');
    const headerParaPdf = document.querySelector('.header-para-pdf');

    if (!elementoParaPdf) {
        console.error("Elemento com ID 'pdf-content-area' não encontrado.");
        alert("Erro: Não foi possível encontrar o conteúdo para gerar o PDF.");
        return;
    }
    if (!headerParaPdf) {
        console.error("Elemento '.header-para-pdf' não encontrado.");
        // Pode prosseguir, mas o PDF não terá o header azul.
    }

    // Mostrar o header do PDF para a captura
    if (headerParaPdf) {
        headerParaPdf.classList.remove('oculto-na-pagina');
        headerParaPdf.classList.add('mostrar-para-pdf');
    }

    const larguraDeCapturaPx = 900; // A max-width do seu conteúdo

    // Salvar estilos originais do container para restauração
    const larguraOriginalContainer = elementoParaPdf.style.width;
    const marginLeftOriginalContainer = elementoParaPdf.style.marginLeft;
    const marginRightOriginalContainer = elementoParaPdf.style.marginRight;

    // Forçar o container a ter a largura exata e centralização para a captura
    elementoParaPdf.style.width = larguraDeCapturaPx + 'px';
    elementoParaPdf.style.marginLeft = 'auto';
    elementoParaPdf.style.marginRight = 'auto';


    const options = {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#FFFFFF', // FORÇAR FUNDO BRANCO PARA O CANVAS
        width: larguraDeCapturaPx,
        windowWidth: larguraDeCapturaPx,
        height: elementoParaPdf.scrollHeight, // Captura toda a altura do conteúdo + paddings
        windowHeight: elementoParaPdf.scrollHeight,
        x: 0, // Captura a partir da borda esquerda do container redimensionado
        removeContainer: false
    };

    html2canvas(elementoParaPdf, options).then(canvas => {
        // Restaurar estilos do container
        elementoParaPdf.style.width = larguraOriginalContainer;
        elementoParaPdf.style.marginLeft = marginLeftOriginalContainer;
        elementoParaPdf.style.marginRight = marginRightOriginalContainer;

        // Ocultar o header do PDF novamente
        if (headerParaPdf) {
            headerParaPdf.classList.remove('mostrar-para-pdf');
            headerParaPdf.classList.add('oculto-na-pagina');
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
            if (currentPositionInImage >= scaledImgHeight - 5) break; // Pequena tolerância
        }

        pdf.save('Curriculo_Breno_Caldas.pdf');

    }).catch(error => {
        // Restaurar estilos do container em caso de erro
        elementoParaPdf.style.width = larguraOriginalContainer;
        elementoParaPdf.style.marginLeft = marginLeftOriginalContainer;
        elementoParaPdf.style.marginRight = marginRightOriginalContainer;

        if (headerParaPdf) {
            headerParaPdf.classList.remove('mostrar-para-pdf');
            headerParaPdf.classList.add('oculto-na-pagina');
        }
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
