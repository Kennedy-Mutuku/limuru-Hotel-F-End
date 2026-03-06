import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const PROPERTY_NAMES = {
    limuru: 'Jumuia Limuru Country Home',
    kanamai: 'Jumuia Kanamai Beach Resort',
    kisumu: 'Jumuia Hotel Kisumu',
    all: 'All Properties',
};

const CustomTooltip = ({ active, payload, label, title }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'white', padding: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                <p style={{ fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>{title || label}</p>
                {payload.map((entry, index) => (
                    <div key={index} style={{ color: entry.color, fontSize: '0.9rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color }}></div>
                        <strong>{entry.name}:</strong> KES {(entry.value || 0).toLocaleString()}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const isManager = user?.role === 'manager';
    const assignedBranch = isManager ? (user?.properties?.[0] || 'all') : 'all';

    const [stats, setStats] = useState(null);
    const [currentProperty, setCurrentProperty] = useState(assignedBranch);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadStats(); }, [currentProperty]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('/stats', { params: { resort: currentProperty } });
            setStats(res.data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
        setLoading(false);
    };

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // GM sees all properties; manager sees only their single branch
    const properties = isManager
        ? [assignedBranch]
        : ['all', 'limuru', 'kanamai', 'kisumu'];

    // For the performance table, show only the manager's branch or all 3 for GM
    const performanceProperties = isManager
        ? [assignedBranch]
        : ['limuru', 'kanamai', 'kisumu'];

    return (
        <div>
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}</h1>
                    <p style={{ color: 'var(--text-light)', marginBottom: '4px' }}>
                        {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {isManager && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'var(--light-green)', borderRadius: '20px',
                            padding: '5px 14px', marginTop: '6px'
                        }}>
                            <i className="fas fa-building" style={{ color: 'var(--primary-green)', fontSize: '0.85rem' }}></i>
                            <span style={{ color: 'var(--primary-green)', fontWeight: '600', fontSize: '0.9rem' }}>
                                {PROPERTY_NAMES[assignedBranch]} — Branch Admin Portal
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Property Filter — only for General Manager */}
            {!isManager && (
                <div className="property-selector">
                    {properties.map(prop => (
                        <button key={prop} className={`property-btn ${currentProperty === prop ? 'active' : ''}`}
                            onClick={() => setCurrentProperty(prop)}>
                            {prop === 'all' ? 'All Properties' : prop.charAt(0).toUpperCase() + prop.slice(1)}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon green"><i className="fas fa-money-bill-wave"></i></div>
                            <div className="stat-info">
                                <h3>KES {(stats?.global?.totalRevenue || 0).toLocaleString()}</h3>
                                <p>Total Revenue</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange"><i className="fas fa-calendar-check"></i></div>
                            <div className="stat-info">
                                <h3>{stats?.global?.totalBookings || 0}</h3>
                                <p>Total Bookings</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue"><i className="fas fa-bed"></i></div>
                            <div className="stat-info">
                                <h3>{stats?.global?.totalOccupancy || 0}%</h3>
                                <p>Occupancy Rate</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#9c27b0' }}><i className="fas fa-star"></i></div>
                            <div className="stat-info">
                                <h3>{stats?.global?.avgRating || 0}</h3>
                                <p>Average Rating</p>
                            </div>
                        </div>
                    </div>

                    {/* Performance Table */}
                    <div className="admin-card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ marginBottom: '16px', color: 'var(--primary-green)' }}>
                            {isManager
                                ? `${PROPERTY_NAMES[assignedBranch]} — Performance Overview`
                                : 'Property Performance Comparison'}
                        </h3>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Property</th>
                                        <th>Revenue</th>
                                        <th>Bookings</th>
                                        <th>Occupancy</th>
                                        <th>Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {performanceProperties.map(prop => {
                                        const ps = stats?.properties?.[prop] || {};
                                        return (
                                            <tr key={prop}>
                                                <td style={{ fontWeight: '600' }}>
                                                    <i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: 'var(--primary-green)', fontSize: '0.8rem' }}></i>
                                                    {PROPERTY_NAMES[prop]}
                                                </td>
                                                <td>KES {(ps.revenue || 0).toLocaleString()}</td>
                                                <td>{ps.bookings || 0}</td>
                                                <td>{ps.occupancy || 0}%</td>
                                                <td>
                                                    <span style={{ color: 'var(--primary-orange)' }}>{'★'.repeat(Math.round(ps.rating || 0))}</span>
                                                    {' '}{ps.rating || 0}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Comparative Revenue Dashboards Key */}
                    <div style={{
                        display: 'flex', justifyContent: 'center', gap: '30px',
                        background: 'white', padding: '15px 25px', borderRadius: '12px',
                        border: '1px solid #e2e8f0', marginBottom: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '15px', height: '15px', background: '#22440f', borderRadius: '3px' }}></div>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>Limuru Resort</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '15px', height: '15px', background: '#f3a435', borderRadius: '3px' }}></div>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>Kanamai Beach</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '15px', height: '15px', background: '#4338ca', borderRadius: '3px' }}></div>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>Hotel Kisumu</span>
                        </div>
                    </div>

                    {/* Comparative Revenue Dashboards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>

                        {/* DAILY CHART */}
                        <div className="admin-card" style={{ padding: '24px' }}>
                            <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary-green)', fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
                                Daily Growth <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 'normal' }}>(Last 14 Days)</span>
                            </h3>
                            <div style={{ height: '280px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats?.revenueHistory?.days || []} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                                        <YAxis tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={0} />
                                        <Tooltip content={<CustomTooltip title="Daily Revenue" />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                                        {(!isManager || (user?.properties?.includes('limuru'))) && <Line name="Limuru" type="monotone" dataKey="limuru" stroke="#22440f" strokeWidth={3} dot={{ r: 4, fill: '#22440f', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} connectNulls />}
                                        {(!isManager || (user?.properties?.includes('kanamai'))) && <Line name="Kanamai" type="monotone" dataKey="kanamai" stroke="#f3a435" strokeWidth={3} dot={{ r: 4, fill: '#f3a435', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} connectNulls />}
                                        {(!isManager || (user?.properties?.includes('kisumu'))) && <Line name="Kisumu" type="monotone" dataKey="kisumu" stroke="#4338ca" strokeWidth={3} dot={{ r: 4, fill: '#4338ca', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} connectNulls />}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* WEEKLY CHART */}
                        <div className="admin-card" style={{ padding: '24px' }}>
                            <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary-green)', fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
                                Weekly Trends <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 'normal' }}>(Last 8 Weeks)</span>
                            </h3>
                            <div style={{ height: '280px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats?.revenueHistory?.weeks || []} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                                        <YAxis tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={0} />
                                        <Tooltip content={<CustomTooltip title="Weekly Revenue" />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                                        {(!isManager || (user?.properties?.includes('limuru'))) && <Line name="Limuru" type="monotone" dataKey="limuru" stroke="#22440f" strokeWidth={3} dot={{ r: 4, fill: '#22440f', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} connectNulls />}
                                        {(!isManager || (user?.properties?.includes('kanamai'))) && <Line name="Kanamai" type="monotone" dataKey="kanamai" stroke="#f3a435" strokeWidth={3} dot={{ r: 4, fill: '#f3a435', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} connectNulls />}
                                        {(!isManager || (user?.properties?.includes('kisumu'))) && <Line name="Kisumu" type="monotone" dataKey="kisumu" stroke="#4338ca" strokeWidth={3} dot={{ r: 4, fill: '#4338ca', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} connectNulls />}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* MONTHLY CHART */}
                        <div className="admin-card" style={{ padding: '24px' }}>
                            <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary-green)', fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
                                Monthly Review <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 'normal' }}>(Last 6 Months)</span>
                            </h3>
                            <div style={{ height: '280px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats?.revenueHistory?.months || []} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                                        <YAxis tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={0} />
                                        <Tooltip content={<CustomTooltip title="Monthly Revenue" />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                                        {(!isManager || user?.properties?.includes('limuru')) && <Line name="Limuru" type="monotone" dataKey="limuru" stroke="#22440f" strokeWidth={3} dot={{ r: 5, fill: '#22440f', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} connectNulls />}
                                        {(!isManager || user?.properties?.includes('kanamai')) && <Line name="Kanamai" type="monotone" dataKey="kanamai" stroke="#f3a435" strokeWidth={3} dot={{ r: 5, fill: '#f3a435', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} connectNulls />}
                                        {(!isManager || user?.properties?.includes('kisumu')) && <Line name="Kisumu" type="monotone" dataKey="kisumu" stroke="#4338ca" strokeWidth={3} dot={{ r: 5, fill: '#4338ca', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} connectNulls />}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
