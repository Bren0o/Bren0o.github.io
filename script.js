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
    const elementoParaPdf = document.getElementById('pagina-container-para-pdf');
    const headerConteudoPdf = document.querySelector('.header-conteudo-pdf'); // Seleciona o header do PDF

    if (!elementoParaPdf) {
        console.error("Elemento com ID 'pagina-container-para-pdf' não encontrado.");
        alert("Erro: Não foi possível encontrar o conteúdo principal para gerar o PDF.");
        return;
    }
    if (!headerConteudoPdf) {
        console.error("Elemento com classe '.header-conteudo-pdf' não encontrado. O título não aparecerá no PDF como esperado.");
        // Continuar mesmo assim, mas o PDF não terá o header azul.
    }

    // Tornar o header do PDF visível ANTES da captura
    if (headerConteudoPdf) {
        headerConteudoPdf.classList.remove('oculto-na-pagina');
        headerConteudoPdf.classList.add('mostrar-para-pdf');
    }

    const options = {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#E6E6E6',
        height: elementoParaPdf.scrollHeight,
        windowHeight: elementoParaPdf.scrollHeight
    };

    html2canvas(elementoParaPdf, options).then(canvas => {
        // Ocultar o header do PDF novamente APÓS a captura
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

        let currentPositionInImage = 0; // Posição Y na imagem original para a fatia atual
        let pageCount = 0;

        while(currentPositionInImage < scaledImgHeight) {
            if (pageCount > 0) {
                pdf.addPage();
            }
            // Adiciona a "fatia" da imagem. O jsPDF lida com o corte se a imagem for maior que a página.
            // O -currentPositionInImage é para "puxar" a imagem para cima nas páginas subsequentes.
            pdf.addImage(imgData, 'PNG', 0, -currentPositionInImage, scaledImgWidth, scaledImgHeight);
            
            currentPositionInImage += pdfPageHeight;
            pageCount++;
            // Pequena tolerância para evitar páginas em branco se a altura for quase exata
            if (currentPositionInImage >= scaledImgHeight - 10) break;
        }

        pdf.save('Curriculo_Breno_Caldas.pdf');

    }).catch(error => {
        // Ocultar o header do PDF em caso de erro também
        if (headerConteudoPdf) {
            headerConteudoPdf.classList.remove('mostrar-para-pdf');
            headerConteudoPdf.classList.add('oculto-na-pagina');
        }
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
