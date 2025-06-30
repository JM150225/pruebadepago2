// mercadopago_status_handler.js
// ===============================
// *MercadoPago Payment Status Handler*
// Enhanced version with real payment validation
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    handlePaymentReturn();
});

// Main function to handle payment return from MercadoPago
async function handlePaymentReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const paymentId = urlParams.get('payment_id');
    const collectionId = urlParams.get('collection_id');
    const externalReference = urlParams.get('external_reference');
    const paymentType = urlParams.get('payment_type');

    // Get UI elements
    const notificacionExito = document.getElementById('notificacionExito');
    const notificacionErrorPago = document.getElementById('notificacionErrorPago');
    const notificacionPendiente = document.getElementById('notificacionPendiente');
    const btnPremium = document.getElementById('btnPremium');

    // Hide all notifications by default
    hideAllNotifications();

    // If no payment parameters, exit early
    if (!status && !paymentId && !collectionId) {
        console.log("No payment parameters detected in URL.");
        return;
    }

    console.log("Payment return parameters detected:", {
        status,
        paymentId,
        collectionId,
        externalReference,
        paymentType
    });

    // Show loader while processing
    showLoader();

    try {
        // Validate payment with backend if payment ID is available
        let validatedStatus = status;
        
        if (paymentId || collectionId) {
            const paymentToValidate = paymentId || collectionId;
            validatedStatus = await validatePaymentWithBackend(paymentToValidate);
        }

        // Process payment status
        await processPaymentStatus(validatedStatus, {
            paymentId: paymentId || collectionId,
            externalReference,
            paymentType
        });

    } catch (error) {
        console.error('Error processing payment return:', error);
        // Fallback to URL parameter status
        await processPaymentStatus(status, {
            paymentId: paymentId || collectionId,
            externalReference,
            paymentType
        });
    } finally {
        hideLoader();
        // Clean URL parameters for better UX
        cleanUrlParameters();
    }
}

// Validate payment status with backend
async function validatePaymentWithBackend(paymentId) {
    try {
        console.log(`Validating payment ${paymentId} with backend...`);
        
        const response = await fetch(`${API_BASE_URL}/validate-payment/${paymentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Backend validation failed: ${response.status}`);
        }

        const paymentData = await response.json();
        console.log('Backend validation result:', paymentData);
        
        return paymentData.status;

    } catch (error) {
        console.error('Backend validation error:', error);
        throw error;
    }
}

// Process payment status and update UI
async function processPaymentStatus(status, paymentDetails) {
    console.log(`Processing payment status: ${status}`);

    switch (status) {
        case 'approved':
        case 'accredited':
            handleApprovedPayment(paymentDetails);
            break;

        case 'rejected':
        case 'cancelled':
            handleRejectedPayment(paymentDetails);
            break;

        case 'pending':
        case 'in_process':
        case 'in_mediation':
            handlePendingPayment(paymentDetails);
            break;

        default:
            console.warn(`Unknown payment status: ${status}`);
            handleUnknownStatus(paymentDetails);
    }
}

// Handle approved payment
function handleApprovedPayment(paymentDetails) {
    console.log("Payment APPROVED - Unlocking premium features");
    
    // Unlock premium features
    window.isPremiumUnlocked = true;
    
    // Update UI
    const notificacionExito = document.getElementById('notificacionExito');
    const btnPremium = document.getElementById('btnPremium');
    
    if (notificacionExito) {
        notificacionExito.style.display = 'block';
        notificacionExito.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    if (btnPremium) {
        btnPremium.style.display = 'block';
    }

    // Store premium status in localStorage for session persistence
    localStorage.setItem('semp_premium_unlocked', 'true');
    localStorage.setItem('semp_payment_id', paymentDetails.paymentId || '');
    localStorage.setItem('semp_unlock_timestamp', Date.now().toString());

    // Analytics or tracking (if needed)
    trackPaymentSuccess(paymentDetails);

    // Show celebration effect
    showCelebrationEffect();
}

// Handle rejected payment
function handleRejectedPayment(paymentDetails) {
    console.warn("Payment REJECTED");
    
    // Ensure premium is locked
    window.isPremiumUnlocked = false;
    
    // Update UI
    const notificacionErrorPago = document.getElementById('notificacionErrorPago');
    
    if (notificacionErrorPago) {
        notificacionErrorPago.style.display = 'block';
        notificacionErrorPago.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Clear any stored premium status
    localStorage.removeItem('semp_premium_unlocked');
    localStorage.removeItem('semp_payment_id');
    localStorage.removeItem('semp_unlock_timestamp');

    // Show payment retry options after a delay
    setTimeout(() => {
        showPaymentRetryOptions();
    }, 3000);
}

// Handle pending payment
function handlePendingPayment(paymentDetails) {
    console.log("Payment PENDING");
    
    // Keep premium locked for now
    window.isPremiumUnlocked = false;
    
    // Update UI
    const notificacionPendiente = document.getElementById('notificacionPendiente');
    
    if (notificacionPendiente) {
        notificacionPendiente.style.display = 'block';
        notificacionPendiente.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Store pending payment info for later verification
    localStorage.setItem('semp_pending_payment', paymentDetails.paymentId || '');
    localStorage.setItem('semp_pending_timestamp', Date.now().toString());

    // Set up periodic check for payment confirmation
    setupPendingPaymentCheck(paymentDetails.paymentId);
}

// Handle unknown status
function handleUnknownStatus(paymentDetails) {
    console.warn("Unknown payment status - treating as error");
    handleRejectedPayment(paymentDetails);
}

// Hide all notification elements
function hideAllNotifications() {
    const notifications = [
        'notificacionExito',
        'notificacionErrorPago', 
        'notificacionPendiente'
    ];
    
    notifications.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });

    const btnPremium = document.getElementById('btnPremium');
    if (btnPremium) {
        btnPremium.style.display = 'none';
    }
}

// Clean URL parameters
function cleanUrlParameters() {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    console.log("URL parameters cleaned");
}

// Show celebration effect for successful payment
function showCelebrationEffect() {
    // Create confetti or similar celebration effect
    const celebration = document.createElement('div');
    celebration.innerHTML = '🎉';
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4rem;
        z-index: 1001;
        animation: celebrate 2s ease-out forwards;
        pointer-events: none;
    `;
    
    // Add celebration animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes celebrate {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        document.body.removeChild(celebration);
        document.head.removeChild(style);
    }, 2000);
}

// Track payment success for analytics
function trackPaymentSuccess(paymentDetails) {
    console.log('Payment successful:', paymentDetails);
    
    // Here you could send analytics data to your preferred service
    // Example: Google Analytics, Mixpanel, etc.
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
            transaction_id: paymentDetails.paymentId,
            value: 5.00,
            currency: 'MXN',
            items: [{
                item_id: 'pdf_premium',
                item_name: 'PDF Premium',
                category: 'Digital Product',
                quantity: 1,
                price: 5.00
            }]
        });
    }
}

// Show payment retry options
function showPaymentRetryOptions() {
    const retryMessage = document.createElement('div');
    retryMessage.className = 'notification warning';
    retryMessage.innerHTML = `
        <i class="fas fa-redo"></i>
        <div>
            <strong>¿Quieres intentar de nuevo?</strong>
            <p>Puedes intentar realizar el pago nuevamente o contactar con soporte si el problema persiste.</p>
            <button onclick="location.reload()" class="btn btn-premium" style="margin-top: 10px; padding: 8px 16px; font-size: 0.9rem;">
                Intentar de nuevo
            </button>
        </div>
    `;
    
    const container = document.querySelector('.container');
    const errorNotification = document.getElementById('notificacionErrorPago');
    
    if (container && errorNotification) {
        container.insertBefore(retryMessage, errorNotification.nextSibling);
        
        // Remove after 10 seconds
        setTimeout(() => {
            if (retryMessage.parentNode) {
                retryMessage.parentNode.removeChild(retryMessage);
            }
        }, 10000);
    }
}

// Setup periodic check for pending payments
function setupPendingPaymentCheck(paymentId) {
    if (!paymentId) return;
    
    let checkCount = 0;
    const maxChecks = 10; // Check for 5 minutes (30s intervals)
    
    const checkInterval = setInterval(async () => {
        checkCount++;
        
        try {
            const status = await validatePaymentWithBackend(paymentId);
            
            if (status === 'approved') {
                clearInterval(checkInterval);
                handleApprovedPayment({ paymentId });
                hideAllNotifications();
            } else if (status === 'rejected') {
                clearInterval(checkInterval);
                handleRejectedPayment({ paymentId });
                hideAllNotifications();
            }
            
        } catch (error) {
            console.error('Error checking pending payment:', error);
        }
        
        // Stop checking after max attempts
        if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            console.log('Stopped checking pending payment status');
        }
        
    }, 30000); // Check every 30 seconds
}

// Check for stored premium status on page load
function checkStoredPremiumStatus() {
    const isPremiumStored = localStorage.getItem('semp_premium_unlocked');
    const unlockTimestamp = localStorage.getItem('semp_unlock_timestamp');
    
    if (isPremiumStored === 'true' && unlockTimestamp) {
        const unlockTime = parseInt(unlockTimestamp);
        const currentTime = Date.now();
        const hoursPassed = (currentTime - unlockTime) / (1000 * 60 * 60);
        
        // Premium access expires after 24 hours for security
        if (hoursPassed < 24) {
            window.isPremiumUnlocked = true;
            const btnPremium = document.getElementById('btnPremium');
            if (btnPremium) {
                btnPremium.style.display = 'block';
            }
            console.log('Premium status restored from storage');
        } else {
            // Expired - clear storage
            localStorage.removeItem('semp_premium_unlocked');
            localStorage.removeItem('semp_payment_id');
            localStorage.removeItem('semp_unlock_timestamp');
            console.log('Premium status expired - cleared storage');
        }
    }
}

// Initialize stored status check
document.addEventListener('DOMContentLoaded', function() {
    checkStoredPremiumStatus();
});
