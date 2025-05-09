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
    // const headerParaPdfOculto = document.querySelector('#pdf-capture-area .header-para-pdf'); // Já está no HTML da área de captura

    if (!areaDeCaptura || !mainOriginal || !copiaMainParaPdf) {
        console.error("Elementos para PDF não encontrados.");
        alert("Erro ao preparar PDF.");
        return;
    }

    // 1. Clonar conteúdo do main visível para a área de captura
    copiaMainParaPdf.innerHTML = mainOriginal.innerHTML;

    // 2. Preparar área de captura (já está fora da tela, mas garantimos display block)
    areaDeCaptura.style.display = 'block';
    // A largura de 900px já está inline no HTML, mas podemos reforçar:
    // areaDeCaptura.style.width = '900px'; // Garante a largura do container de captura

    const options = {
        scale: 1.5, // Tentar 1.5 para equilíbrio qualidade/tamanho da imagem
        useCORS: true,
        logging: false, // Desabilitar logging excessivo se tudo estiver ok
        backgroundColor: '#FFFFFF', // FUNDO DO CANVAS GERADO PELO HTML2CANVAS SERÁ BRANCO
        width: 900, // Largura da captura
        windowWidth: 900, // Simula janela desta largura
        // A altura será baseada no conteúdo do areaDeCaptura
        height: areaDeCaptura.scrollHeight,
        windowHeight: areaDeCaptura.scrollHeight,
        x: 0, // Captura a partir da borda esquerda da areaDeCaptura
        removeContainer: false
    };

    html2canvas(areaDeCaptura, options).then(canvas => {
        // 3. Limpar e ocultar área de captura
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

        // Se a imagem, após ser escalada para a largura do PDF,
        // ainda for mais alta que a página do PDF, redimensiona para caber na altura.
        if (finalImgHeight > pdfPageHeight) {
            console.warn("Conteúdo capturado é mais alto que uma página A4. Redimensionando para caber na altura.");
            finalImgWidth = (imgProps.width * pdfPageHeight) / imgProps.height;
            finalImgHeight = pdfPageHeight;
        }

        // Centralizar a imagem na página do PDF
        const offsetX = (pdfWidth - finalImgWidth) / 2;
        const offsetY = 0; // Começa do topo

        pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalImgWidth, finalImgHeight);
        pdf.save('Curriculo_Breno_Caldas.pdf');

    }).catch(error => {
        copiaMainParaPdf.innerHTML = '';
        areaDeCaptura.style.display = 'none';
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
