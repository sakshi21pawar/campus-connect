const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String, default: '' },
  type:         { type: String, enum: ['notes', 'question_paper', 'assignment', 'video_link'], required: true },
  branch:       { type: String, required: true },
  year:         { type: Number, required: true },
  subject:      { type: String, required: true, trim: true },
  fileUrl:      { type: String, default: '' },  // Cloudinary URL for files
  videoUrl:     { type: String, default: '' },  // YouTube URL for video links
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);