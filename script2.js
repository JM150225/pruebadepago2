// script2.js (o watermarked-pdf-generator.js)
// ===============================
// *Generación del Documento PDF con marca de agua*
// ===============================

function generarPDFGratuito() {
    console.log("Generando PDF GRATUITO con marca de agua...");

    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
        console.error("Error: La librería jsPDF no está cargada.");
        alert("Error al generar el PDF. La librería necesaria no está disponible.");
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'letter'
    });

    const margin = 10;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    let currentY = margin;

    const loremIpsumText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

    Mauris placerat eleifend leo, id finibus dolor tristique vel. Proin a tortor id massa finibus tincidunt. Suspendisse potenti. Nam non turpis eu mauris luctus eleifend vel ac diam. Aliquam erat volutpat. Praesent congue, orci vel vulputate cursus, nisl enim scelerisque libero, vel placerat enim mauris vel quam. Vivamus sit amet odio at nisl dapibus dapibus. Cras sit amet odio vel massa vehicula feugiat.

    Fusce varius, arcu vitae eleifend fermentum, erat nisi fringilla magna, nec iaculis libero velit id tortor. Donec euismod nulla id eros ultrices, sit amet volutpat lacus blandit. Sed auctor, lectus a viverra malesuada, enim quam posuere libero, quis malesuada lacus ipsum sit amet purus. Nam vel semper odio. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec id sapien in leo eleifend consequat.

    Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla facilisi. Sed non risus at sapien eleifend rhoncus. Integer feugiat, mauris vel aliquam bibendum, sem ex laoreet mauris, vitae dignissim leo felis a justo. Proin tristique leo sit amet libero efficitur, vel vulputate felis commodo. Suspendisse potenti. Integer tincidunt libero eu odio feugiat, id feugiat metus accumsan.

    Curabitur vitae diam non odio scelerisque fringilla. Nam euismod, arcu in ultrices tempor, sapien turpis consectetur nisi, ac ullamcorper orci libero id metus. Maecenas sed lectus a velit facilisis varius. Ut eget lacus sit amet odio consectetur consectetur. Morbi aliquet, justo ac ultrices feugiat, nisl odio venenatis ipsum, eu ultrices velit enim vel lacus. Sed quis metus nec neque lacinia feugiat.

    Donec consequat velit nec diam ultrices, sit amet tempor nisl eleifend. Quisque ac tortor a erat cursus ullamcorper. Vestibulum in arcu euismod, luctus nunc vel, interdum sapien. Nullam eget massa non eros tincidunt fermentum. Aliquam erat volutpat. Sed et magna sit amet mauris vehicula dictum. Aliquam nec arcu id arcu dignissim malesuada. Aenean eu ex nec urna vehicula efficitur.

    Phasellus nec sem vitae velit consequat posuere. In hac habitasse platea dictumst. Quisque vel velit a leo auctor malesuada. Nunc malesuada metus vel libero varius, vel cursus ipsum interdum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vivamus aliquet, enim a volutpat aliquet, lorem libero gravida felis, in malesuada enim sapien vel justo.

    Etiam in elit ac nisl facilisis tincidunt. Suspendisse potenti. Ut ac nunc vel sapien blandit euismod. Nam vel nulla sit amet odio vestibulum luctus. Proin sit amet nulla a nisi luctus fringilla. Aliquam ac magna in risus tincidunt interdum. Sed vel sapien quis turpis aliquam interdum. Integer vitae lectus sit amet orci ullamcorper hendrerit.

    Donec at odio sit amet libero consequat fermentum. Suspendisse potenti. Mauris nec tortor in libero fringilla rhoncus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nunc tincidunt ipsum non nisi consequat, at facilisis nunc feugiat. Sed euismod, justo vel ultrices scelerisque, sapien libero dignissim felis, non dignissim enim sem vel nisi. Nulla facilisi.

    Quisque vel velit a leo auctor malesuada. Nunc malesuada metus vel libero varius, vel cursus ipsum interdum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vivamus aliquet, enim a volutpat aliquet, lorem libero gravida felis, in malesuada enim sapien vel justo.`;

    const lineHeight = 7;
    const paddingBottom = 3;
    const paragraphs = loremIpsumText.split('\n').map(p => p.trim()).filter(p => p.length > 0);

    doc.setFontSize(8);

    for (const paragraph of paragraphs) {
        const textLines = doc.splitTextToSize(paragraph, contentWidth);
        const paragraphHeight = textLines.length * lineHeight;

        if (currentY + paragraphHeight + margin > pageHeight) {
            doc.addPage();
            currentY = margin;
        }

        doc.text(textLines, margin, currentY);
        currentY += paragraphHeight + paddingBottom;
    }

    // 🎨 AGREGAR MARCA DE AGUA ANTES DE GUARDAR
    const pageCount = doc.getNumberOfPages();
    const watermarkConfig = {
        color: [255, 0, 0],
        opacity: 0.7,
        baseFontSize: 53,
        secondarySizeRatio: 0.8,
        angle: 45,
        pageVerticalOffset: 10,
        pageHorizontalOffset: 8,
        lineSpacingX: 0,
        lineSpacingY: 15
    };

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: watermarkConfig.opacity }));
        doc.setTextColor(watermarkConfig.color[0], watermarkConfig.color[1], watermarkConfig.color[2]);
        doc.setFont(undefined, 'bold');

        const currentPageWidth = doc.internal.pageSize.getWidth();
        const currentPageHeight = doc.internal.pageSize.getHeight();
        const xAnchor = (currentPageWidth / 2) + watermarkConfig.pageHorizontalOffset;
        const yAnchor = (currentPageHeight / 2) + watermarkConfig.pageVerticalOffset;

        doc.setFontSize(watermarkConfig.baseFontSize);
        doc.text('SEMP by Creative-JM', xAnchor, yAnchor, {
            angle: watermarkConfig.angle,
            align: 'center'
        });

        const secondaryFontSize = watermarkConfig.baseFontSize * watermarkConfig.secondarySizeRatio;
        doc.setFontSize(secondaryFontSize);
        const secondLineX = xAnchor + watermarkConfig.lineSpacingX;
        const secondLineY = yAnchor + watermarkConfig.lineSpacingY;
        doc.text('www.semp-app.com', secondLineX, secondLineY, {
            angle: watermarkConfig.angle,
            align: 'center'
        });

        doc.restoreGraphicsState();
    }

    try {
        doc.save('SEMP-Gratuito.pdf');
        console.log("PDF gratuito generado con marca de agua");
        alert("¡PDF Gratuito generado con marca de agua!");
    } catch (e) {
        console.error("Error al guardar el PDF:", e);
        alert("Hubo un error al intentar guardar el PDF.");
    }
}