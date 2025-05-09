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
    const elementoParaPdf = document.getElementById('pagina-container-para-pdf'); // ALVO DA CAPTURA

    if (!elementoParaPdf) {
        console.error("Elemento com ID 'pagina-container-para-pdf' não encontrado.");
        alert("Erro: Não foi possível encontrar o conteúdo principal para gerar o PDF.");
        return;
    }

    // Não precisamos mais adicionar/remover classes do body para ocultar o botão,
    // pois o botão original está fora da área de captura.

    const options = {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#E6E6E6', // Fundo do canvas deve ser o creme
        // Deixar html2canvas tentar as dimensões. O #pagina-container-para-pdf
        // contém o .header-conteudo-pdf e o main#main-content.
        // O padding-bottom do #pagina-container-para-pdf deve criar o espaço creme.
        // É importante que o #pagina-container-para-pdf não tenha altura fixa via CSS,
        // para que sua altura se ajuste ao conteúdo + padding.
        height: elementoParaPdf.scrollHeight, // Tentar forçar a altura de rolagem
        windowHeight: elementoParaPdf.scrollHeight // Para consistência
    };

    html2canvas(elementoParaPdf, options).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);

        const newImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const newImgWidth = pdfWidth;

        let position = 0;
        let heightLeft = newImgHeight;

        pdf.addImage(imgData, 'PNG', 0, position, newImgWidth, newImgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position -= pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, newImgWidth, newImgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save('Curriculo_Breno_Caldas.pdf');

    }).catch(error => {
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
