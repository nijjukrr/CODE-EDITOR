const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "https://codeers-room-collab.vercel.app",
        methods: ["GET", "POST"]
    }
});

const cors = require('cors');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const { v4: uuidV4 } = require('uuid');

app.use(cors());
app.use(express.json());
// app.use(express.static('build')); // Disabled to avoid ENOENT in dev

// Security: Enforce strict limits on code input to prevent memory exhaustion / DoS
const MAX_CODE_LENGTH = 50000;
const EXEC_TIMEOUT = 5000;
const EXEC_MAX_BUFFER = 1024 * 1024; // 1MB buffer limit

app.post('/execute', (req, res) => {
    const { language, code, input } = req.body || {};

    if (!language || typeof language !== 'string') {
        return res.status(400).json({ output: 'Invalid request: language must be a string.' });
    }

    if (typeof code !== 'string') {
        return res.status(400).json({ output: 'Invalid request: code must be a string.' });
    }

    if (code.length > MAX_CODE_LENGTH) {
        return res.status(413).json({ output: `Payload too large: code exceeds limit of ${MAX_CODE_LENGTH} characters.` });
    }

    const execOptions = { timeout: EXEC_TIMEOUT, maxBuffer: EXEC_MAX_BUFFER };

    if (language === 'python') {
        const filePath = path.join(os.tmpdir(), `${uuidV4()}.py`);
        fs.writeFile(filePath, code, (err) => {
            if (err) {
                return res.status(500).json({ output: 'Failed to create execution context.' });
            }
            // Use execFile instead of exec to avoid shell interpolation / command injection
            execFile('python', [filePath], execOptions, (error, stdout, stderr) => {
                fs.unlink(filePath, () => {});
                if (error) {
                    return res.json({ output: stderr || error.message });
                }
                res.json({ output: stdout });
            });
        });
    } else if (language === 'javascript') {
        // Use execFile with node -e to execute JS safely without shell expansion
        execFile('node', ['-e', code], execOptions, (error, stdout, stderr) => {
            if (error) {
                return res.json({ output: stderr || error.message });
            }
            res.json({ output: stdout });
        });
    } else {
        res.json({ output: `Execution for ${language} is coming soon!` });
    }
});

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}

module.exports = { app, server };
