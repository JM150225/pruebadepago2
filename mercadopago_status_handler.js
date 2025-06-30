// mercadopago_status_handler.js
// ===============================
// *Manejo de la simulación de estado de pago de Mercado Pago*
// Este script lee los parámetros de la URL para simular el resultado de un pago.
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const collectionStatus = urlParams.get('collection_status'); // MP a veces usa 'collection_status'

    const notificacionExito = document.getElementById('notificacionExito');
    const notificacionErrorPago = document.getElementById('notificacionErrorPago');
    const btnPremium = document.getElementById('btnPremium');

    // Asegúrate de que las notificaciones y el botón premium estén ocultos por defecto
    // Esto es especialmente importante para cuando la página se carga sin parámetros de estado
    if (notificacionExito) notificacionExito.style.display = 'none';
    if (notificacionErrorPago) notificacionErrorPago.style.display = 'none';
    if (btnPremium) btnPremium.style.display = 'none';

    // *** Lógica para simular el estado del pago ***
    if (status || collectionStatus) {
        console.log("Detectado parámetro 'status' o 'collection_status' en la URL.");
        console.log("Status:", status, "Collection Status:", collectionStatus);

        // Limpia la URL en el navegador para que no se vean los parámetros de prueba.
        // Esto es opcional y solo estético.
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        if (status === 'approved' || collectionStatus === 'approved') {
            // Simulación de pago exitoso
            console.log("Simulación: Pago APROBADO.");
            window.isPremiumUnlocked = true; // Desbloquea la variable global
            if (notificacionExito) notificacionExito.style.display = 'block'; // Muestra la notificación de éxito
            if (btnPremium) btnPremium.style.display = 'block'; // Muestra el botón de PDF Premium
            if (notificacionErrorPago) notificacionErrorPago.style.display = 'none'; // Asegúrate de que el error esté oculto

        } else if (status === 'rejected' || collectionStatus === 'rejected') {
            // Simulación de pago fallido
            console.warn("Simulación: Pago RECHAZADO.");
            window.isPremiumUnlocked = false; // Asegúrate de que esté bloqueado
            if (notificacionErrorPago) notificacionErrorPago.style.display = 'block'; // Muestra la notificación de error
            if (notificacionExito) notificacionExito.style.display = 'none'; // Asegúrate de que el éxito esté oculto
            if (btnPremium) btnPremium.style.display = 'none'; // Asegúrate de que el botón premium esté oculto

        } else if (status === 'pending' || collectionStatus === 'pending') {
            // Simulación de pago pendiente
            console.log("Simulación: Pago PENDIENTE.");
            alert("Mercado Pago: Tu pago está pendiente de confirmación. Por favor, revisa tu email.");
            window.isPremiumUnlocked = false;
            if (notificacionExito) notificacionExito.style.display = 'none';
            if (notificacionErrorPago) notificacionErrorPago.style.display = 'none';
            if (btnPremium) btnPremium.style.display = 'none';
        }
    } else {
        console.log("No se detectaron parámetros de estado de pago en la URL.");
    }
});