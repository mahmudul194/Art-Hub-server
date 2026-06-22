const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// @route GET /api/artworks
// @desc Get all artworks with filtering, sorting, pagination
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    
    let query = { isSold: false }; // Only show unsold by default for browsing
    
    // Search by title or artistName
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by price
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Sorting
    let sortOptions = { createdAt: -1 }; // Newest default
    if (sort === 'priceLowHigh') sortOptions = { price: 1 };
    if (sort === 'priceHighLow') sortOptions = { price: -1 };
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const artworks = await Artwork.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
      
    const total = await Artwork.countDocuments(query);
    
    res.json({ artworks, total, totalPages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/artworks/featured
// @desc Get latest 6 artworks for home page
router.get('/featured', async (req, res) => {
  try {
    const artworks = await Artwork.find({ isSold: false }).sort({ createdAt: -1 }).limit(6);
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/artworks/:id
// @desc Get single artwork
router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route POST /api/artworks
// @desc Create artwork (Artist only)
router.post('/', authMiddleware, roleMiddleware('artist', 'admin'), async (req, res) => {
  try {
    const { title, description, price, category, image } = req.body;
    
    const newArtwork = new Artwork({
      title,
      artistId: req.user.id,
      artistName: req.user.name,
      description,
      price,
      category,
      image
    });
    
    const savedArtwork = await newArtwork.save();
    res.status(201).json(savedArtwork);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route PUT /api/artworks/:id
// @desc Update artwork (Owner Artist only)
router.put('/:id', authMiddleware, roleMiddleware('artist', 'admin'), async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    // Check if artist owns the artwork, or if user is admin
    if (artwork.artistId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedArtwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedArtwork);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route DELETE /api/artworks/:id
// @desc Delete artwork (Owner Artist or Admin)
router.delete('/:id', authMiddleware, roleMiddleware('artist', 'admin'), async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    if (artwork.artistId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artwork removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
