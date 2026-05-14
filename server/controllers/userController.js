const { MOCK_USERS } = require('../config/mockData');

const getUsers = (req, res) => {
  const search = req.query.search || '';
  const regex = new RegExp(search, 'i');
  const users = MOCK_USERS
    .filter((u) => u._id !== req.user._id)
    .filter((u) => regex.test(u.username) || regex.test(u.email))
    .map(({ password, ...u }) => u);
  res.json(users);
};

const getCurrentUser = (req, res) => {
  res.json(req.user);
};

module.exports = { getUsers, getCurrentUser };
