// script.js
// ===============================
// *Main PDF Generation and MercadoPago Integration*
// ===============================

// Global variables
let isPremiumUnlocked = false;
let mercadoPagoInstance = null;

// Initialize MercadoPago when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize MercadoPago SDK
    try {
        mercadoPagoInstance = new MercadoPago('TEST-a3d2c9af-3dc4-4c86-9c64-0e8b55d08cd9', {
            locale: 'es-MX'
        });
        console.log('MercadoPago SDK initialized successfully');
    } catch (error) {
        console.error('Error initializing MercadoPago SDK:', error);
    }
});

// Show/Hide loader
function showLoader() {
    document.getElementById('loader').style.display = 'flex';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

// MercadoPago Payment Integration
async function initiateMercadoPagoPayment() {
    console.log('Initiating MercadoPago payment...');
    
    if (!mercadoPagoInstance) {
        alert('Error: MercadoPago no está disponible. Por favor, recarga la página.');
        return;
    }

    showLoader();
    
    try {
        // Create payment preference
        const preference = await createPaymentPreference();
        
        if (!preference || !preference.id) {
            throw new Error('No se pudo crear la preferencia de pago');
        }

        console.log('Preference created:', preference.id);
        
        // Create checkout
        const checkout = mercadoPagoInstance.checkout({
            preference: {
                id: preference.id
            },
            render: {
                container: '#mercadopago-button',
                label: 'Pagar con MercadoPago'
            }
        });

        // Show the MercadoPago button
        document.getElementById('mercadopago-button').style.display = 'block';
        document.getElementById('payButton').style.display = 'none';
        
        hideLoader();
        
    } catch (error) {
        console.error('Error creating MercadoPago payment:', error);
        hideLoader();
        alert('Error al procesar el pago: ' + error.message);
    }
}

// Create payment preference via backend
async function createPaymentPreference() {
    const currentUrl = window.location.origin + window.location.pathname;
    
    const preferenceData = {
        items: [{
            id: 'pdf_premium',
            title: 'PDF Premium - Sin marca de agua',
            description: 'Descarga del documento PDF sin marca de agua',
            quantity: 1,
            currency_id: 'MXN',
            unit_price: 5.00
        }],
        back_urls: {
            success: currentUrl + '?status=approved',
            failure: currentUrl + '?status=rejected',
            pending: currentUrl + '?status=pending'
        },
        auto_return: 'approved',
        external_reference: 'pdf_premium_' + Date.now(),
        notification_url: API_BASE_URL + '/webhook/mercadopago'
    };

    try {
        const response = await fetch(API_BASE_URL + '/create-preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferenceData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const preference = await response.json();
        return preference;
        
    } catch (error) {
        console.error('Error creating preference:', error);
        
        // Fallback: try to create preference directly (for development)
        if (window.location.hostname === 'localhost') {
            console.log('Fallback: Creating preference locally for development');
            return await createLocalPreference(preferenceData);
        }
        
        throw error;
    }
}

// Fallback function for local development
async function createLocalPreference(preferenceData) {
    // This is a simplified version for local testing
    // In production, this should always go through your backend
    return {
        id: 'test-preference-' + Date.now(),
        sandbox_init_point: '#'
    };
}

// Original PDF generation function
function generarPDF() {
    console.log("Generating PDF...");

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

    // Sample document content
    const documentContent = `DOCUMENTO PROFESIONAL PDF

Este es un documento PDF profesional generado por el sistema SEMP.

CARACTERÍSTICAS DEL DOCUMENTO:
• Formato profesional de alta calidad
• Contenido estructurado y bien organizado  
• Compatible con todos los lectores de PDF
• Optimizado para impresión y visualización digital

CONTENIDO PRINCIPAL:

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Mauris placerat eleifend leo, id finibus dolor tristique vel. Proin a tortor id massa finibus tincidunt. Suspendisse potenti. Nam non turpis eu mauris luctus eleifend vel ac diam. Aliquam erat volutpat.

SECCIÓN TÉCNICA:

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vivamus aliquet, enim a volutpat aliquet, lorem libero gravida felis, in malesuada enim sapien vel justo.

Etiam in elit ac nisl facilisis tincidunt. Suspendisse potenti. Ut ac nunc vel sapien blandit euismod. Nam vel nulla sit amet odio vestibulum luctus.

CONCLUSIONES:

Este documento representa un ejemplo de contenido profesional de alta calidad que puede ser generado por nuestro sistema. La versión premium ofrece contenido sin marca de agua para uso comercial y profesional.`;

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
                   paragraph.includes('SECCIÓN TÉCNICA') || paragraph.includes('CONCLUSIONES')) {
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

    try {
        doc.save('SEMP-Premium.pdf');
        console.log("PDF generated successfully");
        alert("¡Documento PDF generado exitosamente!");
    } catch (error) {
        console.error("Error saving PDF:", error);
        alert("Error al guardar el PDF.");
    }
}

// Premium PDF generation (without watermark)
function generarPDFPremium() {
    console.log("Attempting to generate Premium PDF...");

    if (!isPremiumUnlocked) {
        alert("¡Acceso denegado! El PDF Premium solo está disponible después de un pago exitoso.");
        console.warn("Attempted access to Premium PDF without unlocking.");
        return;
    }

    console.log("Generating Premium PDF (without watermark)...");
    generarPDF(); // Calls the main PDF generation function
}

// Utility function to reset payment state
function resetPaymentState() {
    isPremiumUnlocked = false;
    document.getElementById('notificacionExito').style.display = 'none';
    document.getElementById('notificacionErrorPago').style.display = 'none';
    document.getElementById('notificacionPendiente').style.display = 'none';
    document.getElementById('btnPremium').style.display = 'none';
    document.getElementById('mercadopago-button').style.display = 'none';
    document.getElementById('payButton').style.display = 'block';
}

// Function to validate payment on page load
async function validatePaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_id');
    const status = urlParams.get('status');
    
    if (paymentId && status) {
        showLoader();
        
        try {
            const response = await fetch(`${API_BASE_URL}/validate-payment/${paymentId}`);
            const paymentData = await response.json();
            
            if (paymentData.status === 'approved') {
                isPremiumUnlocked = true;
                showSuccessNotification();
            } else {
                showErrorNotification();
            }
            
        } catch (error) {
            console.error('Error validating payment:', error);
            // Fallback to URL parameter validation
            if (status === 'approved') {
                isPremiumUnlocked = true;
                showSuccessNotification();
            } else {
                showErrorNotification();
            }
        } finally {
            hideLoader();
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

function showSuccessNotification() {
    document.getElementById('notificacionExito').style.display = 'block';
    document.getElementById('btnPremium').style.display = 'block';
}

function showErrorNotification() {
    document.getElementById('notificacionErrorPago').style.display = 'block';
}

// Initialize payment validation on page load
document.addEventListener('DOMContentLoaded', function() {
    validatePaymentStatus();
});
