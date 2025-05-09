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
    // O .header-para-pdf já está dentro da areaDeCaptura no HTML

    if (!areaDeCaptura || !mainOriginal || !copiaMainParaPdf) {
        console.error("Elementos para PDF não encontrados.");
        alert("Erro ao preparar PDF.");
        return;
    }

    // 1. Clonar conteúdo
    copiaMainParaPdf.innerHTML = mainOriginal.innerHTML;

    // 2. Tornar área de captura visível (já está fora da tela pelo CSS inline)
    areaDeCaptura.style.display = 'block';

    // A largura de 900px está definida inline no HTML para #pdf-capture-area
    // Se precisar reforçar ou mudar:
    // areaDeCaptura.style.width = '900px';

    const options = {
        scale: 1.5, // Tentar com 1.5
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF', // FUNDO DO CANVAS SERÁ BRANCO
        width: 900, // Força a largura da área de renderização do html2canvas
        windowWidth: 900,
        // A altura será baseada no scrollHeight da areaDeCaptura
        height: areaDeCaptura.scrollHeight,
        windowHeight: areaDeCaptura.scrollHeight,
        x: 0,
        removeContainer: false
    };

    html2canvas(areaDeCaptura, options).then(canvas => {
        copiaMainParaPdf.innerHTML = ''; // Limpa
        areaDeCaptura.style.display = 'none'; // Oculta novamente

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

        let finalImgWidth = pdfWidth; // Imagem ocupa a largura da página PDF
        let finalImgHeight = (imgProps.height * pdfWidth) / imgProps.width; // Mantém proporção

        // Se, após escalar para a largura do PDF, a imagem for mais alta que UMA página PDF,
        // então redimensiona para caber na altura de UMA página, ajustando a largura.
        if (finalImgHeight > pdfPageHeight) {
            console.warn("Conteúdo excede uma página, redimensionando para caber na altura de uma página.");
            finalImgWidth = (imgProps.width * pdfPageHeight) / imgProps.height;
            finalImgHeight = pdfPageHeight;
        }

        const offsetX = (pdfWidth - finalImgWidth) / 2; // Centraliza se ficou mais estreita
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
