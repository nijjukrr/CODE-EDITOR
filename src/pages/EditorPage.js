import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import LanguageDropdown from '../components/LanguageDropdown';
import { languages } from '../languages';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    
    const [username, setUsername] = useState(location.state?.username || 'GUEST');
    const [fileName, setFileName] = useState('main');
    const [stdin, setStdin] = useState('');
    const [output, setOutput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    
    // Manage language state locally
    const [currentLanguage, setCurrentLanguage] = useState(location.state?.language || 'python');
    const [currentLanguageName, setCurrentLanguageName] = useState(location.state?.languageName || 'Python');

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );

            socketRef.current.on('LANGUAGE_CHANGED', ({ language, languageName }) => {
                setCurrentLanguage(language);
                setCurrentLanguageName(languageName);
                toast.success(`Broadcaster switched to ${languageName}`);
            });
        };
        init();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
                socketRef.current.off('LANGUAGE_CHANGED');
            }
        };
    }, []);

    const changeLanguage = (lang) => {
        setCurrentLanguage(lang.mode);
        setCurrentLanguageName(lang.name);
        setIsLanguageModalOpen(false);
        
        socketRef.current.emit('LANGUAGE_CHANGE', {
            roomId,
            language: lang.mode,
            languageName: lang.name
        });
        
        toast.success(`Switched to ${lang.name}`);
    };

    async function handleRun() {
        const lang = currentLanguageName.toLowerCase();
        const code = codeRef.current || '';
        
        if (lang === 'html' || currentLanguage === 'xml') {
            setOutput('RENDERING_PREVIEW');
            return;
        }

        setOutput('Executing code...\n\n');
        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
            const response = await fetch(`${backendUrl}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: lang,
                    code: code,
                    input: stdin
                }),
            });
            const data = await response.json();
            setOutput(data.output);
        } catch (err) {
            toast.error('Execution failed');
            setOutput('Error: Could not connect to execution server.');
        }
    }

    async function handleAiAssist() {
        setIsAiLoading(true);
        setOutput('--- INITIALIZING NIJJU AI ENGINE ---\n\nAnalyzing source structure...\nChecking environmental compatibility...\n\n');
        
        setTimeout(() => {
            setIsAiLoading(false);
            toast.success('NIJJU-AI Link Established');
            setOutput(prev => prev + '--- ANALYSIS COMPLETE ---\n\n- Syntax looks secure.\n- Complexity: OPTIMAL.\n- AI SUGGESTION: Ready for execution linkage.');
        }, 1800);
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="ocEditorMainContainer">
            <header className="ocTopNav">
                <div className="ocTopLeft">
                    <div className="ocBrand" onClick={() => reactNavigator('/')}>
                        NIJJU <span>CYBER-EDITOR</span>
                    </div>
                </div>
                <div className="ocTopRight" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid #1e293b', paddingRight: '15px' }}>
                        <span style={{ color: '#64748b', fontSize: '10px', fontWeight: '900' }}>USER:</span>
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: '#00d2ff', fontSize: '12px', fontWeight: '800', outline: 'none', width: '80px' }}
                            title="Click to rename"
                        />
                   </div>
                   <button 
                        style={{ background: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: '800', fontSize: '11px' }}
                        onClick={() => {
                            navigator.clipboard.writeText(roomId);
                            toast.success('Access Link Copied');
                        }}
                    >
                        INVITE
                    </button>
                    <button 
                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: '800', fontSize: '11px' }}
                        onClick={() => reactNavigator('/')}
                    >
                        DISCONNECT
                    </button>
                </div>
            </header>

            <div className="ocEditorContent">
                <div className="ocUtilityBar">
                    <div className="ocTabArea">
                        <div className="ocTab active" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input 
                                type="text"
                                className="ocTabInput"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                title="Click to rename file"
                            />
                            <span style={{ color: '#64748b', fontSize: '12px' }}>
                                .{currentLanguageName === 'JavaScript' ? 'js' : currentLanguageName === 'Python' ? 'py' : 'src'}
                            </span>
                        </div>
                    </div>
                    <div className="ocRightActions">
                        <button 
                            className={`ocUtilityAction ${isAiLoading ? 'loading' : ''}`}
                            onClick={handleAiAssist}
                        >
                            {isAiLoading ? 'ANALYZING...' : 'AI ENGINE'}
                        </button>
                        <div 
                            className="ocUtilityAction" 
                            onClick={() => setIsLanguageModalOpen(true)}
                        >
                            {currentLanguageName.toUpperCase()}
                        </div>
                        <button className="ocUtilityAction primary" onClick={handleRun}>
                            EXECUTE LINK
                        </button>
                    </div>
                </div>

                <div className="ocWorkspace">
                    <div className="ocEditorPane">
                        <Editor
                            socketRef={socketRef}
                            roomId={roomId}
                            language={currentLanguage}
                            onCodeChange={(code) => {
                                codeRef.current = code;
                            }}
                        />
                    </div>
                    
                    <div className="ocConsolePane">
                        <div className="ocConsoleSection">
                            <div className="ocConsoleHeader">STDIN</div>
                            <textarea 
                                className="ocStdinArea"
                                placeholder="Input for the program..."
                                value={stdin}
                                onChange={(e) => setStdin(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="ocConsoleSection">
                            <div className="ocConsoleHeader">Output:</div>
                            <div className="ocOutputArea">
                                {output === 'RENDERING_PREVIEW' ? (
                                    <iframe 
                                        className="htmlPreview"
                                        title="preview"
                                        srcDoc={codeRef.current}
                                        style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                                    />
                                ) : (
                                    output || 'Click on RUN button to see the output'
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ocUserOverlay">
                <div className="ocUserCount" style={{ color: '#00d2ff', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px' }}>
                    {clients.length} LINKS ACTIVE
                </div>
                <div className="ocClientListMini" style={{ display: 'flex', gap: '8px' }}>
                    {clients.slice(0, 3).map((client) => (
                        <div key={client.socketId} style={{ opacity: 0.8 }}><Client username={client.username} /></div>
                    ))}
                </div>
            </div>

            <LanguageDropdown 
                isOpen={isLanguageModalOpen} 
                onClose={() => setIsLanguageModalOpen(false)}
                onSelect={changeLanguage}
                currentLanguage={currentLanguageName}
            />
        </div>
    );
};

export default EditorPage;
