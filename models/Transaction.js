const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['subscription', 'purchase'], required: true },
  userEmail: { type: String, required: true },
  artistEmail: { type: String }, // For artwork purchases
  amount: { type: Number, required: true },
  artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
  status: { type: String, default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
