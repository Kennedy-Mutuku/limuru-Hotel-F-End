import { useState, useEffect } from 'react';
import Logo from '../common/Logo';

export default function AdminMobileHeader({ onMenuClick }) {
    return (
        <header className="admin-mobile-header">
            <div className="mobile-header-left">
                <button className="mobile-menu-toggle" onClick={onMenuClick}>
                    <i className="fas fa-bars"></i>
                </button>
                <div className="mobile-header-brand">
                    <Logo className="mobile-logo" />
                    <div className="mobile-brand-text">
                        <h3>Jumuia Resorts</h3>
                        <span>Admin Panel</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
