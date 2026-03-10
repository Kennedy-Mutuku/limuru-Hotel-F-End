import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Logo from '../common/Logo';

export default function AdminSidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [counts, setCounts] = useState({});

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await api.get('/stats/counts');
                setCounts(res.data);
            } catch (err) {
                console.error('Error fetching sidebar counts:', err);
            }
        };

        fetchCounts();
        // Refresh every 30 seconds for real-time feel
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, []);

    const NAV_ITEMS = [
        {
            section: 'Main', items: [
                { to: '/admin/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
                { to: '/admin/bookings', icon: 'fas fa-calendar-check', label: 'Bookings', count: counts.bookings?.total, unread: counts.bookings?.unread },
                { to: '/admin/calendar', icon: 'fas fa-calendar-alt', label: 'Calendar' },
            ]
        },
        {
            section: 'Management', items: [
                { to: '/admin/offers', icon: 'fas fa-tags', label: 'Offer Postings', count: counts.offers },
                { to: '/admin/offers?tab=claims', icon: 'fas fa-hand-holding-usd', label: 'Offer Claims', count: counts.claims?.total, unread: counts.claims?.unread },
                { to: '/admin/content', icon: 'fas fa-edit', label: 'Content' },
                { to: '/admin/feedback', icon: 'fas fa-star', label: 'Feedback', count: counts.feedback?.total, unread: counts.feedback?.unread },
                { to: '/admin/tenders', icon: 'fas fa-gavel', label: 'Tender Postings', count: counts.tenders },
                { to: '/admin/tenders/bidders', icon: 'fas fa-users', label: 'Tender Bidders', count: counts.bids?.total, unread: counts.bids?.unread },
                { to: '/admin/recruitments', icon: 'fas fa-briefcase', label: 'Recruitment', count: counts.recruitments },
                { to: '/admin/recruitments/applications', icon: 'fas fa-id-card', label: 'Job Applications', count: counts.applications?.total, unread: counts.applications?.unread },
            ]
        },
        {
            section: 'Admin', items: [
                { to: '/admin/users', icon: 'fas fa-users', label: 'Users', count: counts.users },
                { to: '/admin/branch-managers', icon: 'fas fa-user-tie', label: 'Branch Managers', count: counts.managers },
                { to: '/admin/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
                { to: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' },
            ]
        },
    ];

    const getAccessibleItems = () => {
        if (!user) return [];
        if (user.role === 'general-manager') return NAV_ITEMS;
        if (user.role === 'manager') {
            return NAV_ITEMS.map(section => ({
                ...section,
                items: section.items.filter(item =>
                    !['Users', 'Branch Managers', 'Settings'].includes(item.label)
                )
            })).filter(section => section.items.length > 0);
        }
        // staff
        return NAV_ITEMS.map(section => ({
            ...section,
            items: section.items.filter(item =>
                ['Dashboard', 'Bookings', 'Feedback', 'Messages'].includes(item.label)
            )
        })).filter(section => section.items.length > 0);
    };

    const BRANCH_NAMES = {
        limuru: 'Limuru Branch',
        kanamai: 'Kanamai Branch',
        kisumu: 'Kisumu Branch',
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <Logo className="logo-img" />
                <h2>Jumuia Resorts</h2>
                <p>Admin Panel</p>
            </div>

            <div className="sidebar-user">
                <div className="user-name">{user?.name || 'Admin'}</div>
                <div className="user-role" style={{ textTransform: 'capitalize' }}>
                    {user?.role?.replace('-', ' ') || 'User'}
                </div>
                {user?.role === 'manager' && user?.properties?.[0] && (
                    <div style={{
                        marginTop: '8px', background: 'rgba(255,255,255,0.15)',
                        borderRadius: '12px', padding: '4px 10px',
                        fontSize: '0.75rem', fontWeight: '600',
                        color: 'white', display: 'inline-flex',
                        alignItems: 'center', gap: '5px'
                    }}>
                        <i className="fas fa-building" style={{ fontSize: '0.7rem' }}></i>
                        {BRANCH_NAMES[user.properties[0]] || user.properties[0]} Portal
                    </div>
                )}
            </div>


            <nav className="sidebar-nav">
                {getAccessibleItems().map((section) => (
                    <div key={section.section}>
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <NavLink key={item.to} to={item.to}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className={item.icon}></i>
                                        <span>{item.label}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {item.count > 0 && (
                                            <span style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                color: 'rgba(255,255,255,0.7)',
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                fontSize: '0.65rem',
                                                fontWeight: '800'
                                            }}>
                                                {item.count}
                                            </span>
                                        )}
                                        {item.unread > 0 && (
                                            <span
                                                className="pulse-badge"
                                                style={{
                                                    background: 'var(--primary-orange)',
                                                    color: 'white',
                                                    padding: '2px 8px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '800',
                                                    boxShadow: '0 2px 8px rgba(255, 121, 63, 0.4)'
                                                }}
                                            >
                                                {item.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        </aside>
    );
}
