const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  club:      { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  title:     { type: String, required: true, trim: true },
  content:   { type: String, required: true },
  eventDate: { type: Date, default: null },   // optional event date
  venue:     { type: String, default: '' },   // optional venue
  postedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);