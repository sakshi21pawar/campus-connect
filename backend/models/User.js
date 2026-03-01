const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  branch:     { type: String, required: true },
  year:       { type: Number, required: true },
  profilePic: { type: String, default: '' },
  role:       { type: String, enum: ['student', 'club_admin'], default: 'student' },
  bio:        { type: String, default: '' },
  skills:     { type: [String], default: [] },
  linkedIn:   { type: String, default: '' },
  github:     { type: String, default: '' },

  // ✅ Connection system
  connections:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentRequests:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  receivedRequests:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);