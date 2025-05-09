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
    const mainOriginal = document.getElementById('main-pagina-web');
    const copiaMainParaPdf = document.getElementById('main-content-pdf-copy');

    if (!areaDeCaptura || !mainOriginal || !copiaMainParaPdf) {
        console.error("Um ou mais elementos necessários para o PDF não foram encontrados.");
        alert("Erro ao preparar o conteúdo para o PDF.");
        return;
    }

    // 1. Clonar o conteúdo do main da página para a área de captura do PDF
    copiaMainParaPdf.innerHTML = mainOriginal.innerHTML;

    // 2. Tornar a área de captura visível (mas ainda fora da tela) para html2canvas
    areaDeCaptura.style.display = 'block';
    // O position absolute e left/top negativos já a mantêm fora da viewport.

    const larguraDeCapturaPx = 900; // A largura desejada para o conteúdo no PDF

    // 3. Aplicar largura à área de captura para que html2canvas use isso
    const larguraOriginalAreaCaptura = areaDeCaptura.style.width;
    areaDeCaptura.style.width = larguraDeCapturaPx + 'px';
    // Os filhos (.header-para-pdf e #main-content-pdf-copy) devem se ajustar a esta largura.
    // O .header-para-pdf não precisa de max-width e margin:auto se o pai já tem a largura certa.
    // O #main-content-pdf-copy também. Vamos remover max-width e margin:auto deles no CSS
    // quando estão dentro de #pdf-capture-area.

    const options = {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#FFFFFF', // FORÇAR FUNDO BRANCO PARA O CANVAS DO PDF
        width: larguraDeCapturaPx,       // Largura da captura
        windowWidth: larguraDeCapturaPx, // Simula janela desta largura
        x: 0, // Captura a partir da borda esquerda da areaDeCaptura (que tem 900px)
        // A altura será determinada pelo conteúdo clonado + header-para-pdf
        // O scrollHeight da areaDeCaptura agora deve ser o correto.
        height: areaDeCaptura.scrollHeight,
        windowHeight: areaDeCaptura.scrollHeight,
        removeContainer: false
    };

    html2canvas(areaDeCaptura, options).then(canvas => {
        // 4. Limpar e ocultar a área de captura
        copiaMainParaPdf.innerHTML = ''; // Limpa o conteúdo clonado
        areaDeCaptura.style.display = 'none';
        areaDeCaptura.style.width = larguraOriginalAreaCaptura; // Restaura largura original se houver

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
            if (currentPositionInImage >= scaledImgHeight - 5) break;
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
