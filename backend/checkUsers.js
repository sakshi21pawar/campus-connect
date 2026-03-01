require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({}).select('-password');
  console.log(`Total users: ${users.length}`);
  users.forEach(u => {
    console.log(`
    Name:  ${u.name}
    Email: ${u.email}
    Branch: ${u.branch}
    Year:  ${u.year}
    connections: ${u.connections}
    sentRequests: ${u.sentRequests}
    receivedRequests: ${u.receivedRequests}
    `);
  });
  process.exit();
});