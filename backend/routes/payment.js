const express = require('express');
const router = express.Router();

// Always use demo mode unless explicitly configured
const DEMO_MODE = true; // Set to false only when you have real Stripe keys

// Stripe is optional - only load if configured
let stripe = null;

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr', productDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in smallest currency unit (paise for INR)
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        productName: productDetails?.name || 'Product',
        productId: productDetails?.id || 'N/A'
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

// Create checkout session (alternative to payment intent)
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, customerInfo, successUrl, cancelUrl } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided'
      });
    }

    // DEMO MODE - Simulate payment without Stripe
    if (DEMO_MODE) {
      console.log('🎭 DEMO MODE: Simulating payment processing...');
      console.log('Customer:', customerInfo);
      console.log('Items:', items);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate demo order ID
      const orderId = 'ORDER-' + Date.now();
      const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      
      // Store order in memory (in real app, this would be database)
      const order = {
        orderId,
        customerInfo,
        items,
        totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      console.log('✅ Demo order created:', orderId);
      
      // Return success with demo URL
      return res.json({
        success: true,
        demo: true,
        orderId,
        totalAmount,
        url: `${req.headers.origin}/success.html?orderId=${orderId}&amount=${totalAmount}&demo=true`
      });
    }

    // REAL STRIPE MODE
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
          description: item.description || '',
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${req.headers.origin}/success.html`,
      cancel_url: cancelUrl || `${req.headers.origin}/`,
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Checkout Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

// Verify payment status
router.get('/verify/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// Webhook endpoint for Stripe events (for production use)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      // TODO: Fulfill the order, update database, send confirmation email, etc.
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);
      // TODO: Handle failed payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
