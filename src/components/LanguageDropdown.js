import React, { useState } from 'react';
import { languages } from '../languages';

const LanguageDropdown = ({ isOpen, onClose, onSelect, currentLanguage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    if (!isOpen) return null;

    const categories = ['All', 'Programming languages', 'Web languages', 'Database languages', 'Other languages'];

    const filteredLanguages = languages.filter(lang => {
        const matchesSearch = lang.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'All' || lang.category === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="ocModalOverlay" onClick={onClose}>
            <div className="ocLanguageModal" onClick={e => e.stopPropagation()}>
                <div className="ocModalHeader">
                    <h3>Select Language</h3>
                    <button className="ocCloseBtn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="ocModalSearch">
                    <input 
                        type="text" 
                        placeholder="Search language..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="ocModalTabs">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            className={`ocTabBtn ${activeTab === cat ? 'active' : ''}`}
                            onClick={() => setActiveTab(cat)}
                            style={{
                                background: activeTab === cat ? 'rgba(0, 210, 255, 0.1)' : 'rgba(0,0,0,0.4)',
                                color: activeTab === cat ? '#00d2ff' : '#64748b',
                                border: '1px solid ' + (activeTab === cat ? 'rgba(0, 210, 255, 0.3)' : '#1e293b'),
                                fontWeight: '900',
                                fontSize: '11px',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {cat === 'All' ? 'ALL' : cat.split(' ')[0].toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="ocModalGridContainer">
                    <div className="ocModalGrid">
                        {filteredLanguages.map((lang) => (
                            <div 
                                key={lang.name} 
                                className={`ocGridItem ${currentLanguage === lang.name ? 'selected' : ''}`}
                                onClick={() => {
                                    onSelect(lang);
                                    onClose();
                                }}
                            >
                                <div className="ocGridIcon" style={{ color: lang.color }}>
                                    {lang.icon}
                                </div>
                                <span className="ocGridName">{lang.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LanguageDropdown;
