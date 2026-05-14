const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  const { username, email, password, avatar } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }

  const existingEmail    = await User.findOne({ email });
  const existingUsername = await User.findOne({ username });

  if (existingEmail)    return res.status(400).json({ message: 'Email already in use.' });
  if (existingUsername) return res.status(400).json({ message: 'Username already taken.' });

  const salt           = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    avatar: avatar || '/default-avatar.svg',
  });

  return res.status(201).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isOnline: user.isOnline,
    },
    token: generateToken(user._id),
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

  return res.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isOnline: user.isOnline,
    },
    token: generateToken(user._id),
  });
};

module.exports = { registerUser, loginUser };
