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
    const areaDeCaptura = document.getElementById('pdf-capture-area');
    const mainOriginal = document.getElementById('main-pagina-web'); // Conteúdo da página
    const copiaMainParaPdf = document.getElementById('main-content-pdf-copy'); // Onde clonar dentro da área de captura
    const headerParaPdfVisivel = document.querySelector('#pdf-capture-area .header-conteudo-pdf'); // O header azul para o PDF

    if (!areaDeCaptura || !mainOriginal || !copiaMainParaPdf || !headerParaPdfVisivel) {
        console.error("Um ou mais elementos críticos para o PDF não foram encontrados. Verifique os IDs e classes.");
        alert("Erro ao preparar o conteúdo para o PDF. Verifique o console.");
        return;
    }

    // 1. Clonar o conteúdo do main da página para a área de captura do PDF
    copiaMainParaPdf.innerHTML = mainOriginal.innerHTML;

    // 2. Tornar a área de captura e seu header visíveis (mas fora da tela)
    areaDeCaptura.style.display = 'block';
    // O CSS de #pdf-capture-area já a posiciona fora da tela.

    const larguraDeCapturaPx = 900; // Largura desejada do conteúdo no PDF

    // 3. Aplicar largura à área de captura para que html2canvas use isso
    const larguraOriginalAreaCaptura = areaDeCaptura.style.width;
    areaDeCaptura.style.width = larguraDeCapturaPx + 'px';
    // Os filhos .header-para-pdf e #main-content-pdf-copy devem se ajustar a esta largura.

    const options = {
        scale: 1.5, // Tentar 1.5 para equilíbrio entre qualidade e tamanho
        useCORS: true,
        logging: true,
        backgroundColor: '#FFFFFF', // FUNDO DO CANVAS DO PDF SERÁ BRANCO
        width: larguraDeCapturaPx,
        windowWidth: larguraDeCapturaPx,
        x: 0,
        height: areaDeCaptura.scrollHeight, // Captura toda a altura calculada da área
        windowHeight: areaDeCaptura.scrollHeight,
        removeContainer: false
    };

    html2canvas(areaDeCaptura, options).then(canvas => {
        // 4. Limpar e ocultar a área de captura
        copiaMainParaPdf.innerHTML = '';
        areaDeCaptura.style.display = 'none';
        areaDeCaptura.style.width = larguraOriginalAreaCaptura;

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

        let scaledImgWidth = pdfWidth;
        let scaledImgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Lógica para tentar caber em uma página, se possível, ou permitir múltiplas
        if (scaledImgHeight > pdfPageHeight) {
            console.log("Conteúdo excede uma página, será dividido.");
            let currentPositionInImage = 0;
            let pageCount = 0;
            while(currentPositionInImage < scaledImgHeight) {
                if (pageCount > 0) {
                    pdf.addPage();
                }
                pdf.addImage(imgData, 'PNG', 0, -currentPositionInImage, scaledImgWidth, scaledImgHeight);
                currentPositionInImage += pdfPageHeight;
                pageCount++;
                if (currentPositionInImage >= scaledImgHeight - 5) break;
            }
        } else {
            // Cabe em uma página
            pdf.addImage(imgData, 'PNG', 0, 0, scaledImgWidth, scaledImgHeight);
        }

        pdf.save('Curriculo_Breno_Caldas.pdf');

    }).catch(error => {
        copiaMainParaPdf.innerHTML = '';
        areaDeCaptura.style.display = 'none';
        areaDeCaptura.style.width = larguraOriginalAreaCaptura;
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
