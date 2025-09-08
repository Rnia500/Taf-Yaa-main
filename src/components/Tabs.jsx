import React, { useState } from 'react';
import "./Tabs.css";

export default function Tabs() {
    const [activeTab, setActiveTab] = useState('tab1');

    return (
        <>
            <div className="tabs">
                <button className={activeTab === 'tab1' ? 'active' : ''} onClick={() => setActiveTab('tab1')}>Tab 1</button>
                <button className={activeTab === 'tab2' ? 'active' : ''} onClick={() => setActiveTab('tab2')}>Tab 2</button>
            </div>
            
            <div className="tab-content">
                {activeTab === 'tab1' && <p>Content of Tab 1</p>}
                {activeTab === 'tab2' && <p>Content of Tab 2</p>}
            </div>
        </>
    );
}