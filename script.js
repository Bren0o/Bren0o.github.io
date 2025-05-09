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
    const elementoParaPdf = document.getElementById('pagina-container'); // Alvo da captura!

    if (!elementoParaPdf) {
        console.error("Elemento com ID 'pagina-container' não encontrado.");
        alert("Erro: Não foi possível encontrar o conteúdo principal para gerar o PDF.");
        return;
    }

    // Adiciona uma classe ao body para ocultar o botão de download durante a captura
    document.body.classList.add('gerando-pdf');

    const options = {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#E6E6E6', // Fundo do canvas
        // Permitir que html2canvas tente determinar as dimensões de #pagina-container
        // É crucial que #pagina-container e seus filhos (#header-pagina-web e #main-content)
        // estejam dimensionados corretamente com CSS para que a captura fique boa.
        // As opções width/height podem ser usadas se a detecção automática falhar.
        // width: elementoParaPdf.scrollWidth,
        // height: elementoParaPdf.scrollHeight,
        // windowWidth: elementoParaPdf.scrollWidth,
        // windowHeight: elementoParaPdf.scrollHeight
    };

    html2canvas(elementoParaPdf, options).then(canvas => {
        // Remove a classe após a captura
        document.body.classList.remove('gerando-pdf');

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf; // Certifique-se que jsPDF está carregado
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
        // Remove a classe em caso de erro também
        document.body.classList.remove('gerando-pdf');
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
