const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Transaction = require('../models/Transaction');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// All routes require admin
router.use(authMiddleware, roleMiddleware('admin'));

// @route GET /api/admin/analytics
// @desc Get analytics data for dashboard
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalArtists = await User.countDocuments({ role: 'artist' });
    const totalArtworksSold = await Artwork.countDocuments({ isSold: true });
    
    // Revenue calculations
    const transactions = await Transaction.find();
    const totalRevenue = transactions.reduce((acc, tx) => acc + tx.amount, 0);
    
    // Artworks by category for pie chart
    const artworksByCategory = await Artwork.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalUsers,
      totalArtists,
      totalArtworksSold,
      totalRevenue,
      artworksByCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/admin/transactions
// @desc Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('artworkId').sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
