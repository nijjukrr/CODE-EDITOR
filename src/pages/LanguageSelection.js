import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { languages } from '../languages';

const LanguageSelection = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const location = useLocation();
    const username = location.state?.username || localStorage.getItem('username');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Popular');

    const categories = ['Popular', 'Programming', 'Web', 'Databases'];

    const filteredLanguages = languages.filter(lang => {
        const matchesSearch = lang.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All' || lang.category === activeTab;
        return matchesSearch && matchesTab;
    });

    const selectLanguage = (lang) => {
        navigate(`/editor/${roomId}`, {
            state: {
                username,
                language: lang.mode,
                languageName: lang.name
            },
        });
    };

    if (!username) {
        return <div className="loading" style={{ color: '#00d2ff' }}>INITIALIZING ENGINE...</div>;
    }

    return (
        <div className="selectionWrapper">
            <div className="selectionContainer">
                <div className="selectionHeaderArea">
                    <h1 style={{ textAlign: 'center', marginBottom: '15px' }}>
                        Nijju <span>Cyber-Engine</span>
                    </h1>
                    <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '40px', fontWeight: '800', letterSpacing: '1px' }}>
                        SELECT ENVIRONMENT TO START LINK
                    </p>
                </div>

                <div className="searchBarArea">
                    <input 
                        type="text" 
                        placeholder="Search environment name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="searchBox"
                    />
                    <div style={{ position: 'absolute', right: '30px', color: '#00d2ff', fontSize: '1.2rem' }}>⚡</div>
                </div>

                <div className="tabArea" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '50px' }}>
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveTab(cat)}
                            className={`tabBtn ${activeTab === cat ? 'active' : ''}`}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: '1px solid #1e293b',
                                background: activeTab === cat ? 'rgba(0, 210, 255, 0.1)' : 'rgba(0,0,0,0.3)',
                                color: activeTab === cat ? '#00d2ff' : '#94a3b8',
                                cursor: 'pointer',
                                fontWeight: '900',
                                fontSize: '11px',
                                letterSpacing: '1px',
                                transition: '0.3s'
                            }}
                        >
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="languageGrid">
                    {filteredLanguages.map((lang) => (
                        <div 
                            key={lang.name} 
                            className="languageCard" 
                            onClick={() => selectLanguage(lang)}
                        >
                            <div className="langName" style={{ color: '#fff', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.2px' }}>
                                {lang.name}
                            </div>
                            <div className="langIconMini" style={{ fontSize: '32px', color: lang.color }}>
                                {lang.icon}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LanguageSelection;
