const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Transaction = require('../models/Transaction');
const { authMiddleware } = require('../middleware/authMiddleware');

// @route POST /api/comments/:artworkId
// @desc Add comment to artwork (Must have purchased)
router.post('/:artworkId', authMiddleware, async (req, res) => {
  try {
    const { comment } = req.body;
    
    // Check if user has purchased this artwork
    const transaction = await Transaction.findOne({
      userEmail: req.user.email,
      artworkId: req.params.artworkId,
      type: 'purchase'
    });
    
    if (!transaction && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You must purchase this artwork to comment.' });
    }
    
    const newComment = new Comment({
      artworkId: req.params.artworkId,
      userId: req.user.id,
      comment
    });
    
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route GET /api/comments/:artworkId
// @desc Get comments for artwork
router.get('/:artworkId', async (req, res) => {
  try {
    const comments = await Comment.find({ artworkId: req.params.artworkId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route DELETE /api/comments/:id
// @desc Delete comment (Owner or Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
