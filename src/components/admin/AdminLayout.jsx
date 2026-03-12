import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminMobileHeader from './AdminMobileHeader';
import './AdminLayout.css';

export default function AdminLayout() {
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    if (loading) {
        return <div className="admin-loading"><div className="spinner"></div></div>;
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className={`admin-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <AdminMobileHeader onMenuClick={() => setSidebarOpen(true)} />
            
            {/* Sidebar Overlay for Mobile */}
            <div 
                className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} 
                onClick={() => setSidebarOpen(false)}
            ></div>

            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="admin-main">
                <Outlet />
            </div>
        </div>
    );
}
