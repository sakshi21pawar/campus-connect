const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const Club    = require('../models/Club');
const Announcement = require('../models/Announcement');
const { upload } = require('../config/cloudinary'); // ✅ import at top

// GET all clubs
router.get('/', protect, async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = branch
      ? { $or: [{ branch }, { branch: 'All' }] }
      : {};

    const clubs = await Club.find(filter)
      .populate('createdBy', 'name branch')
      .sort({ createdAt: -1 });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single club
router.get('/:id', protect, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('createdBy', 'name branch year');
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create club ✅ single route with upload
router.post('/', protect, upload.single('coverImage'), async (req, res) => {
  try {
    const { name, description, branch } = req.body;

    const exists = await Club.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (exists) return res.status(400).json({ message: 'Club name already exists' });

    const club = new Club({
      name,
      description,
      branch:     branch || 'All',
      coverImage: req.file ? req.file.path : '',
      createdBy:  req.user.id,
    });

    await club.save();
    res.status(201).json(club);
  } catch (err) {
    console.error(err); // ✅ log exact error
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE club
router.delete('/:id', protect, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    if (club.createdBy.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    await club.deleteOne();
    await Announcement.deleteMany({ club: req.params.id });
    res.json({ message: 'Club deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET announcements for a club
router.get('/:id/announcements', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find({ club: req.params.id })
      .populate('postedBy', 'name branch')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST announcement (only club creator)
router.post('/:id/announcements', protect, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    if (club.createdBy.toString() !== req.user.id)
      return res.status(401).json({ message: 'Only club admin can post announcements' });

    const { title, content, eventDate, venue } = req.body;

    const announcement = new Announcement({
      club:      req.params.id,
      title,
      content,
      eventDate: eventDate || null,
      venue:     venue || '',
      postedBy:  req.user.id,
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE announcement
router.delete('/:clubId/announcements/:annId', protect, async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    if (club.createdBy.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    await Announcement.findByIdAndDelete(req.params.annId);
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;