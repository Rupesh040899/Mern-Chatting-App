const User = require('../models/User');

const getUsers = async (req, res) => {
  const search = req.query.search || '';
  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ],
  })
    .select('-password')
    .sort({ username: 1 });

  res.json(users);
};

const getCurrentUser = (req, res) => {
  res.json(req.user);
};

module.exports = { getUsers, getCurrentUser };
