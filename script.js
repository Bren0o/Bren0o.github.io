// script.js (O mesmo da última vez, que estava funcionando para o PDF branco e alinhado)

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
        console.error("Elementos para PDF não encontrados.");
        alert("Erro ao preparar PDF.");
        return;
    }

    copiaMainParaPdf.innerHTML = mainOriginal.innerHTML;
    areaDeCaptura.style.display = 'block';

    const larguraDeCapturaPx = 900;
    // A largura da areaDeCaptura já está 900px inline no HTML
    // areaDeCaptura.style.width = larguraDeCapturaPx + 'px'; // Reforçar se necessário

    const options = {
        scale: 1.5,
        useCORS: true,
        logging: false,
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

        let finalImgWidth = pdfWidth;
        let finalImgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (finalImgHeight > pdfPageHeight) {
            console.warn("Conteúdo excede uma página, redimensionando para caber na altura de uma página.");
            finalImgWidth = (imgProps.width * pdfPageHeight) / imgProps.height;
            finalImgHeight = pdfPageHeight;
        }

        const offsetX = (pdfWidth - finalImgWidth) / 2;
        const offsetY = 0;

        pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalImgWidth, finalImgHeight);
        pdf.save('Curriculo_Breno_Caldas.pdf');

    }).catch(error => {
        copiaMainParaPdf.innerHTML = '';
        areaDeCaptura.style.display = 'none';
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console.");
    });
}
