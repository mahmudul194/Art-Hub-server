const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Transaction = require('../models/Transaction');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// @route POST /api/payments/create-checkout-session
// @desc Create a stripe checkout session for artwork purchase
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const { artworkId } = req.body;
    
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    if (artwork.isSold) {
      return res.status(400).json({ message: 'Artwork is already sold' });
    }

    if (artwork.artistId.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot buy your own artwork' });
    }

    // Check purchase limits
    const buyer = await User.findById(req.user.id);
    if (buyer.subscriptionTier !== 'premium' && buyer.purchasesRemaining <= 0) {
      return res.status(400).json({ message: 'Purchase limit reached. Please upgrade your subscription.' });
    }

    // Create Checkout Sessions from body params
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: artwork.title,
              images: [artwork.image],
            },
            unit_amount: artwork.price * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/dashboard/user?success=true&session_id={CHECKOUT_SESSION_ID}&artworkId=${artworkId}`,
      cancel_url: `${req.headers.origin}/artwork/${artworkId}?canceled=true`,
      metadata: {
        userId: req.user.id,
        userEmail: req.user.email,
        artworkId: artwork._id.toString(),
        artistId: artwork.artistId.toString(),
        artistName: artwork.artistName,
        type: 'purchase'
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route POST /api/payments/subscription
// @desc Create a stripe checkout session for subscription
router.post('/subscription', authMiddleware, async (req, res) => {
  try {
    const { tier } = req.body; // 'pro' or 'premium'
    
    let price = 0;
    if (tier === 'pro') price = 9.99;
    else if (tier === 'premium') price = 19.99;
    else return res.status(400).json({ message: 'Invalid subscription tier' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `ArtHub ${tier.charAt(0).toUpperCase() + tier.slice(1)} Subscription`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/dashboard/user?success=true&session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${req.headers.origin}/dashboard/user?canceled=true`,
      metadata: {
        userId: req.user.id,
        userEmail: req.user.email,
        type: 'subscription',
        tier: tier
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route POST /api/payments/success
// @desc Handle successful payment processing
router.post('/success', authMiddleware, async (req, res) => {
  try {
    const { session_id, artworkId, tier } = req.body;
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Check if transaction already exists
    const existingTx = await Transaction.findOne({ transactionId: session_id });
    if (existingTx) {
      return res.json({ message: 'Payment already processed' });
    }

    if (session.metadata.type === 'purchase') {
      const artwork = await Artwork.findById(artworkId);
      
      // Update Artwork to Sold
      artwork.isSold = true;
      await artwork.save();
      
      // Create Transaction
      const transaction = new Transaction({
        transactionId: session_id,
        type: 'purchase',
        userEmail: session.metadata.userEmail,
        artistEmail: artwork.artistName, // Not actual email here, but for display
        amount: session.amount_total / 100,
        artworkId: artwork._id
      });
      await transaction.save();
      
      // Decrement user purchases remaining if not premium
      const user = await User.findById(session.metadata.userId);
      if (user.subscriptionTier !== 'premium') {
        user.purchasesRemaining -= 1;
        await user.save();
      }

      console.log(`[DUMMY EMAIL] To: ${session.metadata.userEmail} | Subject: Order Confirmation | Body: Thank you for purchasing ${artwork.title} for $${session.amount_total / 100}!`);
      
      return res.json({ message: 'Purchase successful', transaction });
      
    } else if (session.metadata.type === 'subscription') {
      // Update User tier
      const user = await User.findById(req.user.id);
      user.subscriptionTier = tier;
      if (tier === 'pro') user.purchasesRemaining = 9;
      if (tier === 'premium') user.purchasesRemaining = 999999;
      await user.save();
      
      // Create Transaction
      const transaction = new Transaction({
        transactionId: session_id,
        type: 'subscription',
        userEmail: session.metadata.userEmail,
        amount: session.amount_total / 100
      });
      await transaction.save();
      
      console.log(`[DUMMY EMAIL] To: ${session.metadata.userEmail} | Subject: Subscription Upgraded | Body: You have successfully upgraded to the ${tier} tier!`);
      
      return res.json({ message: 'Subscription updated', transaction });
    }

    res.status(400).json({ message: 'Invalid payment type' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/payments/history
// @desc Get transaction history for current user/artist
router.get('/history', authMiddleware, async (req, res) => {
  try {
    let transactions;
    if (req.user.role === 'artist') {
      // Artists see their sales. They need to find artworks they own in transactions
      // To keep it simple, we could store artistId in Transaction. 
      // Instead, we populate artworkId.
      transactions = await Transaction.find({ type: 'purchase' })
        .populate({
          path: 'artworkId',
          match: { artistId: req.user.id }
        });
      transactions = transactions.filter(tx => tx.artworkId !== null);
    } else {
      transactions = await Transaction.find({ userEmail: req.user.email }).populate('artworkId');
    }
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/payments/check-purchase/:artworkId
// @desc Check if current user has purchased the artwork
router.get('/check-purchase/:artworkId', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      userEmail: req.user.email,
      artworkId: req.params.artworkId,
      type: 'purchase'
    });
    
    // Admins bypass the check in the comment route, so let's allow them here too for UI purposes,
    // or just return true if they have a transaction.
    const hasPurchased = !!transaction || req.user.role === 'admin';
    
    res.json({ hasPurchased });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
