import React from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function MainLayout({ children }) {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <TopHeader />
                {children}
            </div>
        </div>
    );
}
