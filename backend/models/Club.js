const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  branch:      { type: String, default: 'All' },
  coverImage:  { type: String, default: '' }, // ✅ new
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);