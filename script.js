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
    const botaoGerar = document.getElementById('botaoGerarPdf'); // Referência ao botão

    if (!elementoCurriculo) {
        console.error("Elemento com ID 'conteudo-curriculo' não encontrado.");
        alert("Erro: Não foi possível encontrar o conteúdo do currículo para gerar o PDF.");
        return;
    }

    // Adiciona uma classe ao botão para ocultá-lo temporariamente (se ele estiver dentro do elementoCurriculo)
    // Neste exemplo, o botão está fora, então não precisamos ocultá-lo desta forma.
    // Se o botão estivesse DENTRO de 'conteudo-curriculo', você faria:
    // if (botaoGerar) botaoGerar.classList.add('ocultar-no-pdf');


    // Opções para html2canvas
    const options = {
        scale: 2, // Aumenta a resolução da imagem gerada
        useCORS: true, // Necessário se houver imagens de outras origens
        logging: true, // Ajuda a depurar problemas com html2canvas
        width: elementoCurriculo.scrollWidth, // Usa a largura total do conteúdo
        height: elementoCurriculo.scrollHeight, // Usa a altura total do conteúdo
        windowWidth: elementoCurriculo.scrollWidth,
        windowHeight: elementoCurriculo.scrollHeight
    };

    html2canvas(elementoCurriculo, options).then(canvas => {
        const imgData = canvas.toDataURL('image/png');

        // Inicializa jsPDF
        // A biblioteca jsPDF está disponível globalmente como `jspdf.jsPDF`
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt', // Pontos como unidade
            format: 'a4' // Formato A4
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calcula a proporção da imagem para caber na largura do PDF
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = imgProps.height / imgProps.width;
        const newImgHeight = pdfWidth * ratio;

        let position = 0; // Posição vertical para adicionar a imagem
        let heightLeft = newImgHeight; // Altura restante da imagem a ser adicionada

        // Adiciona a primeira parte da imagem
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, newImgHeight);
        heightLeft -= pdfHeight; // Subtrai a altura de uma página A4

        // Adiciona novas páginas se a imagem for mais alta que uma página A4
        while (heightLeft > 0) {
            position = position - pdfHeight; // Move a "janela de visualização" da imagem para cima
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, newImgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save('Curriculo_Breno_Caldas.pdf');

        // Reexibir o botão se ele foi oculto
        // if (botaoGerar) botaoGerar.classList.remove('ocultar-no-pdf');

    }).catch(error => {
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
        // Reexibir o botão se ele foi oculto, mesmo em caso de erro
        // if (botaoGerar) botaoGerar.classList.remove('ocultar-no-pdf');
    });
}
