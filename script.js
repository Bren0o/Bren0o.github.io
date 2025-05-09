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
    const elementoCurriculo = document.getElementById('conteudo-curriculo');
    // O botão #botaoGerarPdf está FORA de #conteudo-curriculo, então não precisamos ocultá-lo aqui.

    if (!elementoCurriculo) {
        console.error("Elemento com ID 'conteudo-curriculo' não encontrado.");
        alert("Erro: Não foi possível encontrar o conteúdo do currículo para gerar o PDF.");
        return;
    }

    // Adiciona um padding temporário para evitar cortes nas bordas durante a captura
    // e garante que o fundo seja incluído.
    const estiloOriginalElemento = elementoCurriculo.style.cssText;
    elementoCurriculo.style.padding = "20px"; // Adiciona padding geral
    elementoCurriculo.style.width = "calc(100% - 40px)"; // Ajusta a largura por causa do padding


    const options = {
        scale: 2,
        useCORS: true,
        logging: true,
        // Tentar definir explicitamente a largura e altura baseada no conteúdo renderizado
        // para ajudar com o dimensionamento correto.
        // No entanto, html2canvas é melhor em detectar isso automaticamente se o elemento
        // estiver bem definido e não tiver overflows "estranhos".
        // Vamos deixar html2canvas tentar detectar a largura/altura do elemento
        // que já tem o padding aplicado.
        // windowWidth: elementoCurriculo.scrollWidth + 40, // Adiciona o padding de volta
        // windowHeight: elementoCurriculo.scrollHeight + 40,
        backgroundColor: '#E6E6E6', // Define a cor de fundo do canvas
    };

    html2canvas(elementoCurriculo, options).then(canvas => {
        // Restaura o estilo original do elemento após a captura
        elementoCurriculo.style.cssText = estiloOriginalElemento;

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
        const ratio = imgProps.height / imgProps.width;
        let newImgHeight = pdfWidth * ratio; // Altura da imagem redimensionada para caber na largura do PDF
        let newImgWidth = pdfWidth;

        // Se a imagem for muito "larga" para sua altura após redimensionamento (conteúdo muito horizontal)
        // Isso é menos provável para um currículo, mas como uma verificação.
        if (newImgHeight > pdfHeight && (imgProps.width / imgProps.height) > (pdfWidth / pdfHeight) ) {
             newImgHeight = pdfHeight;
             newImgWidth = newImgHeight * (imgProps.width / imgProps.height);
        }


        let position = 0;
        let heightLeft = newImgHeight;

        pdf.addImage(imgData, 'PNG', 0, position, newImgWidth, newImgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = position - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, newImgWidth, newImgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save('Curriculo_Breno_Caldas.pdf');

    }).catch(error => {
        // Restaura o estilo original do elemento em caso de erro também
        elementoCurriculo.style.cssText = estiloOriginalElemento;

        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
