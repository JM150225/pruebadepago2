// server.js
// ===============================
// *MercadoPago Backend Integration Server*
// Node.js backend for handling MercadoPago operations
// ===============================

const express = require('express');
const cors = require('cors');
const mercadopago = require('mercadopago');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Configure MercadoPago
mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-1234567890123456-070123-abcdef1234567890abcdef1234567890-123456789'
});

// Middleware
app.use(cors({
    origin: ['http://localhost:5000', 'https://your-github-pages-url.github.io'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'MercadoPago PDF Backend'
    });
});

// Create payment preference
app.post('/create-preference', async (req, res) => {
    try {
        console.log('Creating payment preference...');
        console.log('Request body:', req.body);

        const { items, back_urls, external_reference, notification_url } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Items are required and must be a non-empty array'
            });
        }

        // Create preference object
        const preference = {
            items: items.map(item => ({
                id: item.id || 'pdf_premium',
                title: item.title || 'PDF Premium',
                description: item.description || 'Premium PDF without watermark',
                quantity: parseInt(item.quantity) || 1,
                currency_id: item.currency_id || 'MXN',
                unit_price: parseFloat(item.unit_price) || 5.00
            })),
            back_urls: back_urls || {
                success: 'http://localhost:5000?status=approved',
                failure: 'http://localhost:5000?status=rejected',
                pending: 'http://localhost:5000?status=pending'
            },
            auto_return: 'approved',
            external_reference: external_reference || `pdf_premium_${Date.now()}`,
            notification_url: notification_url,
            statement_descriptor: 'SEMP PDF Premium',
            binary_mode: false,
            expires: true,
            expiration_date_from: new Date().toISOString(),
            expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: [],
                installments: 1
            },
            shipments: {
                mode: 'not_specified'
            }
        };

        console.log('Creating preference with data:', JSON.stringify(preference, null, 2));

        // Create preference with MercadoPago
        const response = await mercadopago.preferences.create(preference);
        
        console.log('MercadoPago response:', response.body);

        if (response.body && response.body.id) {
            res.json({
                id: response.body.id,
                init_point: response.body.init_point,
                sandbox_init_point: response.body.sandbox_init_point,
                external_reference: response.body.external_reference
            });
        } else {
            throw new Error('Invalid response from MercadoPago');
        }

    } catch (error) {
        console.error('Error creating preference:', error);
        res.status(500).json({
            error: 'Failed to create payment preference',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Validate payment status
app.get('/validate-payment/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        console.log(`Validating payment: ${paymentId}`);

        if (!paymentId) {
            return res.status(400).json({
                error: 'Payment ID is required'
            });
        }

        // Get payment information from MercadoPago
        const payment = await mercadopago.payment.findById(paymentId);
        
        console.log('Payment data:', payment.body);

        if (payment.body) {
            const paymentData = payment.body;
            
            res.json({
                id: paymentData.id,
                status: paymentData.status,
                status_detail: paymentData.status_detail,
                external_reference: paymentData.external_reference,
                transaction_amount: paymentData.transaction_amount,
                currency_id: paymentData.currency_id,
                payment_method: paymentData.payment_method_id,
                date_created: paymentData.date_created,
                date_approved: paymentData.date_approved,
                valid: paymentData.status === 'approved'
            });
        } else {
            throw new Error('Payment not found');
        }

    } catch (error) {
        console.error('Error validating payment:', error);
        res.status(404).json({
            error: 'Payment not found or validation failed',
            details: error.message
        });
    }
});

// MercadoPago webhook endpoint
app.post('/webhook/mercadopago', async (req, res) => {
    try {
        console.log('MercadoPago webhook received:', req.body);

        const { action, data } = req.body;

        if (action === 'payment.created' || action === 'payment.updated') {
            const paymentId = data.id;
            
            console.log(`Processing payment ${paymentId} for action: ${action}`);

            // Get full payment details
            const payment = await mercadopago.payment.findById(paymentId);
            
            if (payment.body) {
                const paymentData = payment.body;
                console.log('Payment status:', paymentData.status);
                
                // Here you could:
                // 1. Update your database
                // 2. Send notifications
                // 3. Log the transaction
                // 4. Update user permissions
                
                if (paymentData.status === 'approved') {
                    console.log('Payment approved - user should have premium access');
                    // Additional processing for approved payments
                }
            }
        }

        // Always respond OK to MercadoPago
        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        // Still respond OK to avoid retries
        res.status(200).json({ received: true, error: error.message });
    }
});

// Get payment methods (optional endpoint for frontend)
app.get('/payment-methods', async (req, res) => {
    try {
        const paymentMethods = await mercadopago.payment_methods.listAll();
        res.json(paymentMethods.body);
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({
            error: 'Failed to fetch payment methods',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('CORS enabled for frontend');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Server terminated');
    process.exit(0);
});
