// controllers/stripe.controller.js
import dotenv from 'dotenv';
dotenv.config();
import Stripe from 'stripe';
import { guardarPedidoConDetalles } from '../models/pedidoModel.js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Falta STRIPE_SECRET_KEY en variables de entorno');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
    try {
        console.log('📥 Recibiendo solicitud de pago:', req.body);

        const { amount, payment_method_id, metadata } = req.body;

        // Validación de datos
        if (!amount || isNaN(amount) || amount < 50) {
            console.error('❌ Monto inválido recibido:', amount);
            return res.status(400).json({
                success: false,
                error: 'invalid_amount',
                message: 'El monto debe ser un número mayor a 0.50 USD'
            });
        }

        if (!payment_method_id) {
            console.error('❌ Falta payment_method_id');
            return res.status(400).json({
                success: false,
                error: 'missing_payment_method',
                message: 'Método de pago no proporcionado'
            });
        }

        // Crear intención de pago
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: 'usd',
            payment_method: payment_method_id,
            confirmation_method: 'manual',
            confirm: true,
            metadata: metadata || {},
            description: 'Compra en DevMart',
            return_url: `${process.env.FRONTEND_URL}/client/pages/gracias.html`
        });

        console.log('✅ Pago creado exitosamente:', paymentIntent.id);

        // Guardar pedido y detalles en la base de datos
        try {
            const productos = JSON.parse(metadata.productos);
            const user_id = parseInt(metadata.user_id);
            await guardarPedidoConDetalles(user_id, productos, amount / 100, paymentIntent.id);
        } catch (err) {
            console.error('Error guardando pedido en la base de datos:', err);
        }

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100
        });

    } catch (error) {
        console.error('💥 Error en Stripe (mensaje):', error.message);
        console.error('💥 Error completo:', error);

        res.status(500).json({
            success: false,
            error: error.type || 'payment_error',
            message: error.message || 'Error procesando el pago',
            details: error.raw || null
        });
    }
};
