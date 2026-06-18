const Message = require('../models/Message');

const getUnreadCounts = async (req, res) => {
  const currentUserId = req.user._id;
  const unread = await Message.find({ receiverId: currentUserId, seen: false });

  const counts = {};
  unread.forEach((m) => {
    const sid = m.senderId.toString();
    counts[sid] = (counts[sid] || 0) + 1;
  });

  res.json(counts);
};

const getMessages = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  const messages = await Message.find({
    $or: [
      { senderId: currentUserId, receiverId: userId },
      { senderId: userId, receiverId: currentUserId },
    ],
  })
    .populate('senderId', 'username avatar')
    .populate('receiverId', 'username avatar')
    .sort({ createdAt: 1 });

  // mark messages from userId → current user as seen
  await Message.updateMany(
    { senderId: userId, receiverId: currentUserId, seen: false },
    { $set: { seen: true } }
  );

  res.json(messages);
};

const createMessage = async (req, res) => {
  const { receiverId, text } = req.body;
  if (!receiverId || !text) {
    return res.status(400).json({ message: 'Invalid message payload.' });
  }

  let message = await Message.create({
    senderId: req.user._id,
    receiverId,
    text,
  });

  message = await message.populate('senderId', 'username avatar');
  message = await message.populate('receiverId', 'username avatar');

  res.status(201).json(message);
};

module.exports = { getUnreadCounts, getMessages, createMessage };
