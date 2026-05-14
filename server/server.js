const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const socketHandler = require('./socket/socketHandler');

dotenv.config();
// connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Realtime chat backend is online.' });
});

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
  },
});

socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
