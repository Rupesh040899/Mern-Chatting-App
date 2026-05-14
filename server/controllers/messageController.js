const { MOCK_USERS, mockMessages } = require('../config/mockData');

const getUnreadCounts = (req, res) => {
  const currentUserId = req.user._id;
  const counts = {};
  mockMessages.forEach((m) => {
    if (m.receiverId._id === currentUserId && !m.seen) {
      const sid = m.senderId._id;
      counts[sid] = (counts[sid] || 0) + 1;
    }
  });
  res.json(counts);
};

const getMessages = (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;
  const messages = mockMessages.filter(
    (m) =>
      (m.senderId._id === currentUserId && m.receiverId._id === userId) ||
      (m.senderId._id === userId && m.receiverId._id === currentUserId)
  );
  // mark messages from userId → currentUser as seen
  mockMessages.forEach((m) => {
    if (m.senderId._id === userId && m.receiverId._id === currentUserId) {
      m.seen = true;
    }
  });
  res.json(messages);
};

const createMessage = (req, res) => {
  const { receiverId, text } = req.body;
  if (!receiverId || !text) {
    return res.status(400).json({ message: 'Invalid message payload.' });
  }
  const sender = MOCK_USERS.find((u) => u._id === req.user._id);
  const receiver = MOCK_USERS.find((u) => u._id === receiverId);
  if (!receiver) {
    return res.status(404).json({ message: 'Receiver not found.' });
  }
  const newMessage = {
    _id: `msg_${Date.now()}`,
    senderId: { _id: sender._id, username: sender.username, avatar: sender.avatar },
    receiverId: { _id: receiver._id, username: receiver.username, avatar: receiver.avatar },
    text,
    seen: false,
    createdAt: new Date().toISOString(),
  };
  mockMessages.push(newMessage);
  res.status(201).json(newMessage);
};

module.exports = { getUnreadCounts, getMessages, createMessage };
