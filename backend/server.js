const express    = require('express');
const dotenv     = require('dotenv');
const cors       = require('cors');
const http       = require('http');
const { Server } = require('socket.io');
const connectDB  = require('./config/db');
const jwt        = require('jsonwebtoken');

dotenv.config();
connectDB();

const app    = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'https://campusconnect-iota-seven.vercel.app',
];

// ── Socket.io setup ───────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Map userId → socketId for direct messaging
const onlineUsers = new Map();

// Socket.io auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);

  io.emit('onlineUsers', Array.from(onlineUsers.keys()));

  socket.on('sendMessage', async ({ receiverId, text }) => {
    try {
      const Message = require('./models/Message');
      const User    = require('./models/User');

      const sender = await User.findById(userId);
      if (!sender.connections.map(c => c.toString()).includes(receiverId)) return;

      const msg = await Message.create({
        sender:   userId,
        receiver: receiverId,
        text:     text.trim(),
      });

      const populated = await msg.populate([
        { path: 'sender',   select: 'name profilePic' },
        { path: 'receiver', select: 'name profilePic' },
      ]);

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', populated);
        io.to(receiverSocketId).emit('newMessageNotification', {
          from:   populated.sender,
          text:   populated.text,
          chatId: userId,
        });
      }

      socket.emit('receiveMessage', populated);

    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('markRead', async ({ senderId }) => {
    try {
      const Message = require('./models/Message');
      await Message.updateMany(
        { sender: senderId, receiver: userId, read: false },
        { $set: { read: true } }
      );
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messagesRead', { by: userId });
      }
    } catch (err) { console.error(err); }
  });

  socket.on('typing', ({ receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit('userTyping', { from: userId });
  });

  socket.on('stopTyping', ({ receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit('userStopTyping', { from: userId });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});

// ── Express Middleware ────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/clubs',     require('./routes/clubs'));
app.use('/api/ai',        require('./routes/ai'));
app.use('/api/chat',      require('./routes/chat'));

app.get('/api/test', (req, res) => res.json({ message: 'Backend is running!' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server + Socket.io running on port ${PORT}`);
});