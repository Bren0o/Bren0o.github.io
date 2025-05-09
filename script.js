// script.js (SEM MUDANÇAS RECENTES NECESSÁRIAS PARA ESTE PROBLEMA ESPECÍFICO DE ALINHAMENTO)

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
    const headerParaPdf = document.querySelector('.header-para-pdf');

    if (!elementoCurriculo) {
        console.error("Elemento com ID 'conteudo-curriculo' não encontrado.");
        alert("Erro: Não foi possível encontrar o conteúdo do currículo para gerar o PDF.");
        return;
    }
    if (!headerParaPdf) {
        console.error("Elemento com classe '.header-para-pdf' não encontrado. O título não aparecerá no PDF.");
    }

    // Tornar o header do PDF visível para a captura
    if (headerParaPdf) {
        headerParaPdf.classList.remove('oculto-na-pagina');
        headerParaPdf.classList.add('mostrar-para-pdf');
    }

    const options = {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#E6E6E6',
        // Permitir que o html2canvas determine as dimensões do #conteudo-curriculo
        // que agora tem o headerParaPdf visível e ambos os filhos (header e main)
        // são dimensionados por max-width e margin: auto.
    };

    html2canvas(elementoCurriculo, options).then(canvas => {
        if (headerParaPdf) {
            headerParaPdf.classList.remove('mostrar-para-pdf');
            headerParaPdf.classList.add('oculto-na-pagina');
        }

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
        if (headerParaPdf) {
            headerParaPdf.classList.remove('mostrar-para-pdf');
            headerParaPdf.classList.add('oculto-na-pagina');
        }
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
