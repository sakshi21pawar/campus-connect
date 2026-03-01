const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const User    = require('../models/User');
const { upload } = require('../config/cloudinary');

// GET my profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, branch, year, bio, skills, linkedIn, github } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, branch, year, bio, skills, linkedIn, github },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload profile picture
router.post('/profile/picture', protect, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: req.file.path },
      { new: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET all students (fixed route - must be ABOVE /:id)
router.get('/students', protect, async (req, res) => {
  try {
    const { branch, year, search } = req.query;
    const filter = { _id: { $ne: req.user.id } };
    if (branch) filter.branch = branch;
    if (year)   filter.year   = Number(year);
    if (search) filter.name   = new RegExp(search, 'i');

    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all users except me
router.get('/', protect, async (req, res) => {
  try {
    const { branch, year, search } = req.query;
    const filter = { _id: { $ne: req.user.id } };
    if (branch) filter.branch = branch;
    if (year)   filter.year   = Number(year);
    if (search) filter.name   = new RegExp(search, 'i');

    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET any student public profile — ⚠️ always keep /:id LAST
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST send connection request
router.post('/request/:id', protect, async (req, res) => {
  try {
    const toId   = req.params.id;
    const fromId = req.user.id;

    if (toId === fromId)
      return res.status(400).json({ message: "Can't connect with yourself" });

    const sender   = await User.findById(fromId);
    const receiver = await User.findById(toId);

    if (!receiver)
      return res.status(404).json({ message: 'User not found' });

    if (sender.connections.includes(toId))
      return res.status(400).json({ message: 'Already connected' });

    if (sender.sentRequests.includes(toId))
      return res.status(400).json({ message: 'Request already sent' });

    await User.findByIdAndUpdate(fromId, { $push: { sentRequests: toId } });
    await User.findByIdAndUpdate(toId,   { $push: { receivedRequests: fromId } });

    res.json({ message: 'Request sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST accept connection request
router.post('/accept/:id', protect, async (req, res) => {
  try {
    const fromId = req.params.id;
    const toId   = req.user.id;

    await User.findByIdAndUpdate(toId,   {
      $push: { connections: fromId },
      $pull: { receivedRequests: fromId }
    });
    await User.findByIdAndUpdate(fromId, {
      $push: { connections: toId },
      $pull: { sentRequests: toId }
    });

    res.json({ message: 'Request accepted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST reject connection request
router.post('/reject/:id', protect, async (req, res) => {
  try {
    const fromId = req.params.id;
    const toId   = req.user.id;

    await User.findByIdAndUpdate(toId,   { $pull: { receivedRequests: fromId } });
    await User.findByIdAndUpdate(fromId, { $pull: { sentRequests: toId } });

    res.json({ message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST cancel sent request
router.post('/cancel/:id', protect, async (req, res) => {
  try {
    const toId   = req.params.id;
    const fromId = req.user.id;

    await User.findByIdAndUpdate(fromId, { $pull: { sentRequests: toId } });
    await User.findByIdAndUpdate(toId,   { $pull: { receivedRequests: fromId } });

    res.json({ message: 'Request cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;