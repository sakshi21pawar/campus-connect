const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');
const Message  = require('../models/Message');
const User     = require('../models/User');

// GET /api/chat/conversations
// Returns list of all users I've chatted with + last message + unread count
router.get('/conversations', protect, async (req, res) => {
  try {
    const myId = req.user.id;

    // Find all messages where I am sender or receiver
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }]
    })
    .sort({ createdAt: -1 })
    .populate('sender',   'name profilePic')
    .populate('receiver', 'name profilePic');

    // Build conversation map — one entry per unique partner
    const convMap = new Map();
    for (const msg of messages) {
      const partner = msg.sender._id.toString() === myId
        ? msg.receiver
        : msg.sender;
      const partnerId = partner._id.toString();
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, {
          user:        partner,
          lastMessage: msg,
          unread:      0,
        });
      }
      // Count unread messages sent TO me by this partner
      if (msg.receiver._id.toString() === myId && !msg.read) {
        convMap.get(partnerId).unread += 1;
      }
    }

    res.json(Array.from(convMap.values()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/:userId
// Returns full message history between me and userId
router.get('/:userId', protect, async (req, res) => {
  try {
    const myId     = req.user.id;
    const otherId  = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId,    receiver: otherId },
        { sender: otherId, receiver: myId    },
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender',   'name profilePic')
    .populate('receiver', 'name profilePic');

    // Mark messages sent to me as read
    await Message.updateMany(
      { sender: otherId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/chat/send
// Send a message (REST fallback; primary via Socket.io)
router.post('/send', protect, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text?.trim())
      return res.status(400).json({ message: 'receiverId and text required' });

    // Only allow messaging between connected users
    const me = await User.findById(req.user.id);
    if (!me.connections.map(c => c.toString()).includes(receiverId))
      return res.status(403).json({ message: 'You are not connected with this user' });

    const msg = await Message.create({
      sender:   req.user.id,
      receiver: receiverId,
      text:     text.trim(),
    });

    const populated = await msg.populate(['sender', 'receiver']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/unread/count
// Total unread message count for navbar badge
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      read:     false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;