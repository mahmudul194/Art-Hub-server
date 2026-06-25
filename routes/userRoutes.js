const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// @route GET /api/users/profile
// @desc Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route PUT /api/users/profile
// @desc Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/users/admin
// @desc Get all users (Admin only)
router.get('/admin', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route PUT /api/users/admin/:id/role
// @desc Change user role (Admin only)
router.put('/admin/:id/role', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/users/artists/top
// @desc Get top artists
router.get('/artists/top', async (req, res) => {
  try {
    const Artwork = require('../models/Artwork');
    
    // Find all users who are artists
    const artists = await User.find({ role: 'artist' }).select('-password');
    
    // Calculate sold count for each artist
    const artistsWithStats = await Promise.all(
      artists.map(async (artist) => {
        const soldCount = await Artwork.countDocuments({ artistId: artist._id, isSold: true });
        return {
          ...artist.toObject(),
          soldCount
        };
      })
    );
    
    // Sort by sold count descending and take top 3
    artistsWithStats.sort((a, b) => b.soldCount - a.soldCount);
    const topArtists = artistsWithStats.slice(0, 3);
    
    res.json(topArtists);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
