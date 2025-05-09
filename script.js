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
    const elementoParaPdf = document.getElementById('pagina-container-para-pdf');

    if (!elementoParaPdf) {
        console.error("Elemento com ID 'pagina-container-para-pdf' não encontrado.");
        alert("Erro: Não foi possível encontrar o conteúdo principal para gerar o PDF.");
        return;
    }

    // Para garantir que o html2canvas capture apenas o conteúdo visível e o padding,
    // e não alguma altura "esticada" por flexbox ou min-height do body.
    // Vamos temporariamente definir uma altura baseada no scrollHeight ANTES da captura.
    // const alturaOriginal = elementoParaPdf.style.height; // Salva altura original se houver
    // elementoParaPdf.style.height = elementoParaPdf.scrollHeight + 'px'; // Força a altura

    const options = {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#E6E6E6', // Fundo do canvas
        // Tentar ser mais explícito com a altura. scrollHeight deve incluir o padding.
        height: elementoParaPdf.scrollHeight,
        windowHeight: elementoParaPdf.scrollHeight // Simula uma janela com a altura do conteúdo
        // width: elementoParaPdf.scrollWidth, // Já deve estar ok
        // windowWidth: elementoParaPdfs.crollWidth
    };

    html2canvas(elementoParaPdf, options).then(canvas => {
        // Restaura a altura original se foi modificada
        // elementoParaPdf.style.height = alturaOriginal;

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight(); // Altura de uma página A4

        const imgProps = pdf.getImageProperties(imgData);
        // Altura da imagem capturada, redimensionada para a largura do PDF
        const scaledImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const scaledImgWidth = pdfWidth;

        let positionY = 0; // Posição Y atual na imagem original
        let remainingImgHeight = scaledImgHeight; // Altura da imagem original que ainda precisa ser adicionada ao PDF

        // Adiciona a primeira página (ou parte dela)
        // Quanto da imagem cabe na primeira página do PDF?
        let heightToDrawOnPage = Math.min(scaledImgHeight, pdfPageHeight);
        pdf.addImage(imgData, 'PNG', 0, 0, scaledImgWidth, scaledImgHeight, undefined, 'FAST');
        // O truque aqui é adicionar a imagem inteira, e deixar o jsPDF lidar com o corte entre páginas
        // se a imagem for maior que a página. No entanto, para controlar o "espaço creme",
        // precisamos garantir que a imagem capturada tenha a altura correta.

        // A lógica de múltiplas páginas do jsPDF com addImage pode ser complexa se a imagem
        // for apenas um pouco maior que a página.
        // Se a imagem capturada pelo html2canvas já tem a altura correta (conteúdo + padding creme),
        // e essa altura total for menor ou igual a uma página A4, ela deve caber.
        // Se for maior, o jsPDF tentará dividir.

        // Vamos simplificar a lógica de múltiplas páginas confiando que o jsPDF fará o melhor.
        // A chave é a altura da IMAGEM GERADA pelo html2canvas.
        // Se a imagem gerada pelo html2canvas for muito alta, ela será dividida.
        // Se ela tiver a altura correta (conteúdo + padding-bottom desejado), ela será adicionada como está.

        // Recalculando a lógica de múltiplas páginas para ser mais robusta
        // se a imagem capturada for realmente maior que uma página.
        if (scaledImgHeight > pdfPageHeight) {
            let-currentPositionInImage = 0;
            let pageCount = 0;
            while(currentPositionInImage < scaledImgHeight) {
                if (pageCount > 0) {
                    pdf.addPage();
                }
                // Para cada página, desenha uma "fatia" da imagem original (canvas)
                // O método addImage do jsPDF pode usar um canvas diretamente e especificar
                // as coordenadas x, y, largura, altura da fonte (canvas) e as coordenadas
                // x, y, largura, altura do destino (página PDF).
                // No entanto, já temos imgData.
                // A forma mais simples é adicionar a imagem inteira e se ela for maior,
                // o jsPDF a dividirá, mas o problema é que ele pode não terminar com o fundo creme.

                // Vamos tentar adicionar a imagem e, se ela for maior que a página,
                // a parte extra irá para a próxima. O problema é controlar o "final".
                // O ideal é que `scaledImgHeight` já seja a altura correta que queremos no PDF.

                // Adicionando a imagem na posição 0, 0 da página atual.
                // A imagem é cortada automaticamente pelo jsPDF se for maior que a página.
                // O que vai para a próxima página é o restante.
                pdf.addImage(imgData, 'PNG', 0, -currentPositionInImage, scaledImgWidth, scaledImgHeight);

                currentPositionInImage += pdfPageHeight;
                pageCount++;
                 if (currentPositionInImage >= scaledImgHeight) break; // Sai do loop se já desenhou tudo
            }
        } else {
            // A imagem cabe em uma única página
            // A chamada pdf.addImage() anterior já lidou com isso.
        }


        pdf.save('Curriculo_Breno_Caldas.pdf');

    }).catch(error => {
        // elementoParaPdf.style.height = alturaOriginal; // Restaura em caso de erro
        console.error("Erro ao gerar PDF com html2canvas:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    });
}
