// script2.js
// ===============================
// *Free PDF Generation with Watermark*
// ===============================

function generarPDFGratuito() {
    console.log("Generating FREE PDF with watermark...");

    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
        console.error("Error: jsPDF library is not loaded.");
        alert("Error generating PDF. Required library is not available.");
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

    // Sample document content (same as premium but with watermark)
    const documentContent = `DOCUMENTO PROFESIONAL PDF - VERSIÓN GRATUITA

Este es un documento PDF generado por el sistema SEMP en su versión gratuita.

NOTA: Esta versión incluye marca de agua. Para obtener la versión sin marca de agua, 
adquiere la versión Premium por solo $5.00 MXN.

CARACTERÍSTICAS DEL DOCUMENTO:
• Formato profesional de alta calidad
• Contenido estructurado y bien organizado  
• Compatible con todos los lectores de PDF
• Optimizado para impresión y visualización digital
• Marca de agua incluida (removible en versión Premium)

CONTENIDO PRINCIPAL:

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Mauris placerat eleifend leo, id finibus dolor tristique vel. Proin a tortor id massa finibus tincidunt. Suspendisse potenti. Nam non turpis eu mauris luctus eleifend vel ac diam. Aliquam erat volutpat.

SECCIÓN TÉCNICA:

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vivamus aliquet, enim a volutpat aliquet, lorem libero gravida felis, in malesuada enim sapien vel justo.

Etiam in elit ac nisl facilisis tincidunt. Suspendisse potenti. Ut ac nunc vel sapien blandit euismod. Nam vel nulla sit amet odio vestibulum luctus.

BENEFICIOS DE LA VERSIÓN PREMIUM:
• Sin marca de agua
• Mejor calidad de impresión
• Uso comercial permitido
• Soporte técnico incluido
• Actualizaciones gratuitas

CONCLUSIONES:

Este documento representa un ejemplo de contenido profesional de alta calidad que puede ser generado por nuestro sistema. Actualiza a la versión Premium para obtener todas las funcionalidades sin restricciones.`;

    const lineHeight = 6;
    const paragraphs = documentContent.split('\n').map(p => p.trim()).filter(p => p.length > 0);

    // Set font and generate content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    for (const paragraph of paragraphs) {
        if (paragraph.startsWith('DOCUMENTO PROFESIONAL PDF')) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
        } else if (paragraph.includes('CARACTERÍSTICAS') || paragraph.includes('CONTENIDO PRINCIPAL') || 
                   paragraph.includes('SECCIÓN TÉCNICA') || paragraph.includes('BENEFICIOS') || 
                   paragraph.includes('CONCLUSIONES') || paragraph.includes('NOTA:')) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
        } else {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
        }

        const textLines = doc.splitTextToSize(paragraph, contentWidth);
        const paragraphHeight = textLines.length * lineHeight;

        if (currentY + paragraphHeight + margin > pageHeight) {
            doc.addPage();
            currentY = margin;
        }

        doc.text(textLines, margin, currentY);
        currentY += paragraphHeight + 8; // Extra spacing between paragraphs
    }

    // 🎨 ADD WATERMARK BEFORE SAVING
    addWatermarkToDocument(doc);

    try {
        doc.save('SEMP-Gratuito.pdf');
        console.log("Free PDF generated with watermark");
        alert("¡PDF Gratuito generado con marca de agua!");
        
        // Show upgrade suggestion
        setTimeout(() => {
            if (confirm("¿Te gustaría obtener la versión Premium sin marca de agua por solo $5.00 MXN?")) {
                document.getElementById('payButton').scrollIntoView({ behavior: 'smooth' });
                document.getElementById('payButton').classList.add('pulse-animation');
                setTimeout(() => {
                    document.getElementById('payButton').classList.remove('pulse-animation');
                }, 2000);
            }
        }, 1000);
        
    } catch (error) {
        console.error("Error saving PDF:", error);
        alert("Error al guardar el PDF.");
    }
}

// Function to add watermark to the document
function addWatermarkToDocument(doc) {
    const pageCount = doc.getNumberOfPages();
    
    const watermarkConfig = {
        color: [255, 0, 0], // Red color
        opacity: 0.3,
        baseFontSize: 40,
        secondaryFontSize: 24,
        angle: 45,
        pageVerticalOffset: 10,
        pageHorizontalOffset: 8,
        lineSpacing: 15
    };

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.saveGraphicsState();
        
        // Set watermark properties
        doc.setGState(new doc.GState({ opacity: watermarkConfig.opacity }));
        doc.setTextColor(watermarkConfig.color[0], watermarkConfig.color[1], watermarkConfig.color[2]);
        doc.setFont('helvetica', 'bold');

        const currentPageWidth = doc.internal.pageSize.getWidth();
        const currentPageHeight = doc.internal.pageSize.getHeight();
        const xCenter = currentPageWidth / 2;
        const yCenter = currentPageHeight / 2;

        // Main watermark text
        doc.setFontSize(watermarkConfig.baseFontSize);
        doc.text('SEMP', xCenter, yCenter - 10, {
            angle: watermarkConfig.angle,
            align: 'center'
        });

        // Secondary watermark text
        doc.setFontSize(watermarkConfig.secondaryFontSize);
        doc.text('VERSIÓN GRATUITA', xCenter, yCenter + 10, {
            angle: watermarkConfig.angle,
            align: 'center'
        });

        // Website watermark
        doc.setFontSize(16);
        doc.text('www.semp-app.com', xCenter, yCenter + 25, {
            angle: watermarkConfig.angle,
            align: 'center'
        });

        // Corner watermarks for extra protection
        doc.setFontSize(12);
        doc.text('DEMO', 20, 30, {
            angle: watermarkConfig.angle,
            align: 'left'
        });

        doc.text('DEMO', currentPageWidth - 30, currentPageHeight - 20, {
            angle: watermarkConfig.angle,
            align: 'left'
        });

        doc.restoreGraphicsState();
    }
}

// Add pulse animation CSS dynamically
const style = document.createElement('style');
style.textContent = `
    .pulse-animation {
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(0, 123, 255, 0.6);
        }
        100% {
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
    }
`;
document.head.appendChild(style);
