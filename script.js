// script.js

// Espera o DOM estar completamente carregado para adicionar o listener
document.addEventListener('DOMContentLoaded', function() {
    const botaoGerar = document.getElementById('botaoGerarPdf');
    if (botaoGerar) {
        botaoGerar.addEventListener('click', gerarPDF);
    } else {
        console.error("Botão com ID 'botaoGerarPdf' não encontrado.");
    }
});

function gerarPDF() {
    const elementoCurriculo = document.getElementById('conteudo-curriculo');
    // O botão de download da página web (#botaoGerarPdf) está FORA de #conteudo-curriculo,
    // então não precisamos nos preocupar em ocultá-lo para a captura do PDF.

    if (!elementoCurriculo) {
        console.error("Elemento com ID 'conteudo-curriculo' não encontrado.");
        alert("Erro: Não foi possível encontrar o conteúdo do currículo para gerar o PDF.");
        return;
    }

    // Opções para html2canvas
    const options = {
        scale: 2, // Aumenta a resolução da imagem gerada
        useCORS: true, // Necessário se houver imagens de outras origens
        logging: true, // Ajuda a depurar problemas com html2canvas
        backgroundColor: '#E6E6E6', // Define explicitamente o fundo do canvas para o creme
        // Tentar usar as dimensões de rolagem do elemento pode ser mais preciso
        width: elementoCurriculo.scrollWidth,
        height: elementoCurriculo.scrollHeight,
        windowWidth: elementoCurriculo.scrollWidth, // Ajuda com elementos que dependem da largura da janela
        windowHeight: elementoCurriculo.scrollHeight
    };

    html2canvas(elementoCurriculo, options).then(canvas => {
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
        // Calcula a altura da imagem redimensionada para caber na largura do PDF, mantendo a proporção
        const newImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const newImgWidth = pdfWidth; // A imagem ocupará toda a largura do PDF

        let position = 0;
        let heightLeft = newImgHeight;

        pdf.addImage(imgData, 'PNG', 0, position, newImgWidth, newImgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position -= pdfHeight; // Para a próxima página, a imagem é "puxada para cima"
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
