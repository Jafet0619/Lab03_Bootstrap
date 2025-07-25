import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const pagoStripe = async (req, res) => {
    const { paymentMethodId, amount, currency, description, customerEmail, metadata } = req.body;

    // Validación básica
    if (!paymentMethodId || !amount) {
        return res.status(400).json({ 
            success: false,
            error: 'missing_parameters',
            message: 'Falta paymentMethodId o amount' 
        });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convertir a centavos
            currency: currency || 'usd',
            payment_method: paymentMethodId,
            confirm: true,
            description: description || 'Compra en Tienda Virtual',
            receipt_email: customerEmail,
            metadata: metadata || {}
        });

        // Éxito - Guardar en tu DB (ejemplo)
        // await savePaymentToDB(paymentIntent.id, amount, 'completed');

        res.json({ 
            success: true,
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            status: paymentIntent.status
        });

    } catch (err) {
        console.error('Error en pago Stripe:', err);
        
        // Manejo específico de errores
        let errorType = 'payment_failed';
        if (err.type === 'StripeCardError') {
            errorType = 'card_declined';
        }

        res.status(500).json({ 
            success: false, 
            error: errorType,
            message: err.message || 'Error procesando el pago',
            declineCode: err.code // Código específico de Stripe
        });
    }
};