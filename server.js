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
const { exec } = require('child_process');
const fs = require('fs');
const { v4: uuidV4 } = require('uuid');

app.use(cors());
app.use(express.json());
// app.use(express.static('build')); // Disabled to avoid ENOENT in dev

app.post('/execute', (req, res) => {
    const { language, code, input } = req.body;
    
    if (language === 'python') {
        const fileName = `${uuidV4()}.py`;
        fs.writeFileSync(fileName, code);
        
        exec(`python ${fileName}`, (error, stdout, stderr) => {
            fs.unlinkSync(fileName);
            if (error) {
                return res.json({ output: stderr || error.message });
            }
            res.json({ output: stdout });
        });
    } else if (language === 'javascript') {
        exec(`node -e ${JSON.stringify(code)}`, (error, stdout, stderr) => {
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
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
