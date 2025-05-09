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

    copiaMainParaPdf.innerHTML = mainOriginal.innerHTML;
    areaDeCaptura.style.display = 'block';

    const larguraDeCapturaPx = 900;
    const larguraOriginalAreaCaptura = areaDeCaptura.style.width;
    areaDeCaptura.style.width = larguraDeCapturaPx + 'px';

    const options = {
        scale: 2, // Manter a escala para boa qualidade da captura inicial
        useCORS: true,
        logging: true,
        backgroundColor: '#FFFFFF',
        width: larguraDeCapturaPx,
        windowWidth: larguraDeCapturaPx,
        height: areaDeCaptura.scrollHeight,
        windowHeight: areaDeCaptura.scrollHeight,
        x: 0,
        removeContainer: false
    };

    html2canvas(areaDeCaptura, options).then(canvas => {
        copiaMainParaPdf.innerHTML = '';
        areaDeCaptura.style.display = 'none';
        areaDeCaptura.style.width = larguraOriginalAreaCaptura;

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4' // Formato da página do PDF
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight(); // Altura útil de uma página A4
        const imgProps = pdf.getImageProperties(imgData);

        // Calcular dimensões da imagem para caber na LARGURA do PDF, mantendo proporção
        let scaledImgWidth = pdfWidth;
        let scaledImgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // VERIFICAR SE A ALTURA ESCALADA EXCEDE A ALTURA DA PÁGINA DO PDF
        if (scaledImgHeight > pdfPageHeight) {
            console.warn("Conteúdo capturado é mais alto que uma página A4. Redimensionando para caber...");
            // Se for mais alto, recalcular a LARGURA para caber na ALTURA da página, mantendo proporção
            scaledImgWidth = (imgProps.width * pdfPageHeight) / imgProps.height;
            scaledImgHeight = pdfPageHeight; // Força a altura a ser a da página
        }

        // Centralizar a imagem na página do PDF se ela for mais estreita que a página
        let offsetX = (pdfWidth - scaledImgWidth) / 2;
        if (offsetX < 0) offsetX = 0; // Garante que não seja negativo

        // Adicionar a imagem UMA ÚNICA VEZ, redimensionada para caber
        pdf.addImage(imgData, 'PNG', offsetX, 0, scaledImgWidth, scaledImgHeight);

        // REMOVER a lógica de múltiplas páginas
        /*
        let currentPositionInImage = 0;
        let pageCount = 0;
        while(currentPositionInImage < scaledImgHeight) {
            // ...
        }
        */

        pdf.save('Curriculo_Breno_Caldas.pdf');

    }).catch(error => {
        copiaMainParaPdf.innerHTML = '';
        areaDeCaptura.style.display = 'none';
        areaDeCaptura.style.width = larguraOriginalAreaCaptura;
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
