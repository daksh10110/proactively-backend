import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
});

app.use(cors());
app.use(express.json());

const PORT = 4000;
const LOCK_TIMEOUT = 15000; // 15 seconds
const roomsKey = (formId: string) => `room:${formId}`;
const lockKey = (formId: string, fieldId: string) => `lock:${formId}:${fieldId}`;

/**
 * Get Room Status
 */
app.get('/room-status/:formId', async (req, res) => {
  const formId = req.params.formId.trim();
  const key = roomsKey(formId);
  const isOpenRaw = await redis.hget(key, 'isOpen');
  
  const isOpen = isOpenRaw?.trim().toLowerCase() === 'true';
  res.json({ formId, isOpen });
});
/**
 * Open Room
 */
app.post('/open-room/:formId', async (req, res) => {
  const { formId } = req.params;
  await redis.hset(roomsKey(formId), 'isOpen', 'true');
  res.json({ message: `Room ${formId} opened.` });
  return;
});

/**
 * Close Room and Auto-submit (simulate by printing)
 */
app.post('/close-room/:formId', async (req, res) => {
  const { formId } = req.params;
  await redis.hset(roomsKey(formId), 'isOpen', 'false');

  const currentState = await redis.hgetall(`formdata:${formId}`);
  console.log(`Auto-submitting form ${formId}:`, currentState);

  res.json({ message: `Room ${formId} closed and data submitted.` });
  return;
});

/**
 * Real-time logic
 */
io.on('connection', (socket) => {
  socket.on('join_room', async (formId) => {
    const roomStatus = await redis.hget(roomsKey(formId), 'isOpen');
    if (roomStatus !== 'true') {
      socket.emit('room_closed');
      return;
    }

    socket.join(formId);
    socket.data.formId = formId;
    socket.data.userId = socket.id;

    const users = await redis.smembers(`active_users:${formId}`);
    await redis.sadd(`active_users:${formId}`, socket.id);
    io.to(formId).emit('user_count', users.length + 1);
  });

  socket.on('leave_room', async (formId) => {
    socket.leave(formId);
    await redis.srem(`active_users:${formId}`, socket.id);
    const users = await redis.smembers(`active_users:${formId}`);
    io.to(formId).emit('user_count', users.length);
  });

  socket.on('lock_field', async ({ formId, fieldId }) => {
    const key = lockKey(formId, fieldId);
    const current = await redis.get(key);
    if (!current || current === socket.id) {
      await redis.set(key, socket.id, 'PX', LOCK_TIMEOUT);
      io.to(formId).emit('lock_update', { fieldId, lockedBy: socket.id });

      // auto-unlock
      setTimeout(async () => {
        const stillLockedBy = await redis.get(key);
        if (stillLockedBy === socket.id) {
          await redis.del(key);
          io.to(formId).emit('lock_update', { fieldId, lockedBy: null });
        }
      }, LOCK_TIMEOUT);
    }
  });

  socket.on('field_update', async ({ formId, fieldId, value }) => {
    const key = lockKey(formId, fieldId);
    const owner = await redis.get(key);
    if (owner === socket.id) {
      await redis.hset(`formdata:${formId}`, fieldId, value);
      io.to(formId).emit('field_update', { fieldId, value });
    }
  });

  socket.on('unlock_field', async ({ formId, fieldId }) => {
    const key = lockKey(formId, fieldId);
    const owner = await redis.get(key);
    if (owner === socket.id) {
      await redis.del(key);
      io.to(formId).emit('lock_update', { fieldId, lockedBy: null });
    }
  });

  socket.on('disconnect', async () => {
    const formId = socket.data.formId;
    if (!formId) return;

    await redis.srem(`active_users:${formId}`, socket.id);
    const users = await redis.smembers(`active_users:${formId}`);
    io.to(formId).emit('user_count', users.length);
  });
});

server.listen(PORT, () => {
  console.log(`Room Service running on http://localhost:${PORT}`);
});
