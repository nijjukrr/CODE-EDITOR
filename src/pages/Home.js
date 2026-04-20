import React, { useState, useEffect } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Generated Secure Room ID');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('Credentials required to enter the matrix');
            return;
        }

        setIsJoining(true);
        localStorage.setItem('username', username);
        localStorage.setItem('roomId', roomId);

        setTimeout(() => {
            navigate(`/select/${roomId}`, {
                state: {
                    username,
                },
            });
        }, 800);
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className="homePageWrapper">
            <div className="animationContainer">
                <div className="characterCrop">
                    <img 
                        src="/assets/mascot.png" 
                        alt="Nijju Mascot" 
                        className="mascotImg"
                    />
                </div>
            </div>

            <div className="formWrapper">
                <div className="formHeader">
                    <h1 className="mainLabel" style={{ marginBottom: '1rem' }}>Enter Matrix</h1>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        Join a collaborative session in 80+ environments
                    </p>
                </div>

                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="joinBtn" onClick={joinRoom} disabled={isJoining}>
                        {isJoining ? 'INITIALIZING...' : 'START CODING'}
                    </button>

                    <div className="createInfo" style={{ marginTop: '1.5rem' }}>
                        <span style={{ color: '#64748b' }}>No access code? </span>
                        <a
                            onClick={createNewRoom}
                            href=""
                            style={{ color: '#00d2ff', textDecoration: 'none', fontWeight: '800' }}
                        >
                            Generate New
                        </a>
                    </div>
                </div>
            </div>

            <footer style={{ position: 'absolute', bottom: '30px', color: '#475569', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }}>
                POWERED BY &nbsp;
                <span style={{ color: '#00d2ff' }}>NIJJU ENGINE</span>
            </footer>
        </div>
    );
};

export default Home;
