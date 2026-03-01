const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const protect = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// POST — Upload a resource
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, description, type, branch, year, subject, videoUrl } = req.body;

    // If type is video_link, use videoUrl. Otherwise use Cloudinary file URL
    const fileUrl = req.file ? req.file.path : '';

    if (type !== 'video_link' && !req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    if (type === 'video_link' && !videoUrl) {
      return res.status(400).json({ message: 'Please provide a video URL' });
    }

    const resource = new Resource({
      title,
      description,
      type,
      branch,
      year: Number(year),
      subject,
      fileUrl,
      videoUrl: videoUrl || '',
      uploadedBy: req.user.id,
    });

    await resource.save();
    res.status(201).json(resource);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET — Fetch all resources with optional filters
router.get('/', protect, async (req, res) => {
  try {
    const { branch, year, type, subject } = req.query;

    // Build filter object dynamically
    const filter = {};
    if (branch)  filter.branch  = branch;
    if (year)    filter.year    = Number(year);
    if (type)    filter.type    = type;
    if (subject) filter.subject = new RegExp(subject, 'i'); // case-insensitive search

    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name branch year') // get uploader name
      .sort({ createdAt: -1 }); // newest first

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE — Delete your own resource
router.delete('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    // Only uploader can delete
    if (resource.uploadedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;