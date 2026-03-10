import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

const PROPERTY_NAMES = {
    limuru: 'Jumuia Limuru Country Home',
    kanamai: 'Jumuia Kanamai Beach Resort',
    kisumu: 'Jumuia Hotel Kisumu',
    all: 'All Properties',
};

const COLORS = {
    revenue: '#16a34a',
    bookings: '#f97316',
    applications: '#4338ca',
    bids: '#9c27b0',
    claims: '#0ea5e9',
    limuru: '#22440f',
    kanamai: '#f3a435',
    kisumu: '#4338ca'
};

const CustomRevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'white', padding: '14px 18px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', borderRadius: '12px', minWidth: '180px' }}>
                <p style={{ fontWeight: '800', marginBottom: '10px', color: '#1e293b', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>{label}</p>
                {payload.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color || entry.fill }} />
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{entry.name}</span>
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>
                            {entry.dataKey === 'revenue' ? `KES ${(entry.value || 0).toLocaleString()}` : entry.value}
                        </span>
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

    const properties = isManager
        ? [assignedBranch]
        : ['all', 'limuru', 'kanamai', 'kisumu'];

    const performanceProperties = isManager
        ? [assignedBranch]
        : ['limuru', 'kanamai', 'kisumu'];

    const months = stats?.revenueHistory?.months || [];

    // Pie data: use total property revenue (always has data)
    const pieData = [
        { name: 'Limuru', value: stats?.properties?.limuru?.revenue || 0, color: COLORS.limuru },
        { name: 'Kanamai', value: stats?.properties?.kanamai?.revenue || 0, color: COLORS.kanamai },
        { name: 'Kisumu', value: stats?.properties?.kisumu?.revenue || 0, color: COLORS.kisumu }
    ].filter(d => d.value > 0);

    return (
        <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}</h1>
                    <p style={{ color: 'var(--text-light)', marginBottom: '4px' }}>
                        {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Property Selector */}
            {!isManager && (
                <div className="property-selector" style={{ marginBottom: '25px' }}>
                    {properties.map(prop => (
                        <button key={prop} className={`property-btn ${currentProperty === prop ? 'active' : ''}`}
                            onClick={() => setCurrentProperty(prop)}>
                            {prop === 'all' ? 'Ecosystem View' : prop.charAt(0).toUpperCase() + prop.slice(1)}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="stats-grid" style={{ marginBottom: '24px' }}>
                        <div className="stat-card">
                            <div className="stat-icon green"><i className="fas fa-wallet"></i></div>
                            <div className="stat-info">
                                <p>Total Revenue</p>
                                <h3>KES {(stats?.global?.totalRevenue || 0).toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange"><i className="fas fa-calendar-check"></i></div>
                            <div className="stat-info">
                                <p>Total Bookings</p>
                                <h3>{stats?.global?.totalBookings || 0}</h3>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue"><i className="fas fa-id-badge"></i></div>
                            <div className="stat-info">
                                <p>Pending Bookings</p>
                                <h3>{stats?.global?.pendingBookings || 0} New</h3>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#9c27b0' }}><i className="fas fa-star"></i></div>
                            <div className="stat-info">
                                <p>Avg. Trust Score</p>
                                <h3>{stats?.global?.avgRating || 0} / 5</h3>
                            </div>
                        </div>
                    </div>

                    {/* Performance + Pie Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div className="admin-card">
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fas fa-chart-line" style={{ color: 'var(--primary-green)' }}></i>
                                Performance Comparison
                            </h3>
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Branch</th>
                                            <th>Revenue</th>
                                            <th>Bookings</th>
                                            <th>Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performanceProperties.map(prop => (
                                            <tr key={prop}>
                                                <td style={{ fontWeight: '700' }}>{PROPERTY_NAMES[prop]}</td>
                                                <td style={{ fontWeight: '800', color: 'var(--primary-green)' }}>KES {(stats?.properties?.[prop]?.revenue || 0).toLocaleString()}</td>
                                                <td>{stats?.properties?.[prop]?.bookings || 0}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <i className="fas fa-star" style={{ color: '#ffc107', fontSize: '0.8rem' }}></i>
                                                        {stats?.properties?.[prop]?.rating || 0}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Revenue Donut */}
                        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <h3 style={{ alignSelf: 'flex-start', marginBottom: '4px' }}>Revenue Distribution</h3>
                            <p style={{ alignSelf: 'flex-start', fontSize: '0.8rem', color: '#888', marginBottom: '16px' }}>All-time revenue by property</p>
                            {pieData.length > 0 ? (
                                <>
                                    <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie data={pieData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                </Pie>
                                                <Tooltip formatter={(val) => [`KES ${val.toLocaleString()}`, '']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                                        {pieData.map(d => (
                                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }}></div>
                                                {d.name}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ color: '#aaa', fontSize: '0.85rem' }}>No revenue data yet</div>
                            )}
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>

                        {/* REVENUE TREND CHART */}
                        <div className="admin-card" style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, marginBottom: '4px' }}>📈 Revenue Trend</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Monthly bookings & revenue (all time)</p>
                            </div>
                            <div style={{ height: '280px', width: '100%', overflow: 'hidden' }}>
                                {months.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={months} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                                            <defs>
                                                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.bookings} stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor={COLORS.bookings} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={40} />
                                            <Tooltip content={<CustomRevenueTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: '0.75rem', fontWeight: '600', paddingTop: '10px' }} />
                                            <Area type="monotone" name="Revenue (KES)" dataKey="revenue" stroke={COLORS.revenue} strokeWidth={2.5} fill="url(#gradRevenue)" dot={{ r: 3, fill: COLORS.revenue }} activeDot={{ r: 5 }} />
                                            <Area type="monotone" name="Bookings" dataKey="bookings" stroke={COLORS.bookings} strokeWidth={2.5} fill="url(#gradBookings)" dot={{ r: 3, fill: COLORS.bookings }} activeDot={{ r: 5 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc', flexDirection: 'column', gap: '10px' }}>
                                        <i className="fas fa-chart-area" style={{ fontSize: '2.5rem', opacity: 0.3 }}></i>
                                        <span style={{ fontSize: '0.85rem' }}>No booking data found</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ECOSYSTEM ACTIVITY CHART */}
                        <div className="admin-card" style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, marginBottom: '4px' }}>🌐 Ecosystem Activity</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Applications, bids & claims by month</p>
                            </div>
                            <div style={{ height: '280px', width: '100%', overflow: 'hidden' }}>
                                {months.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={months} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} width={30} />
                                            <Tooltip content={<CustomRevenueTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: '0.75rem', fontWeight: '600', paddingTop: '10px' }} />
                                            <Bar name="Applications" dataKey="applications" stackId="eco" fill={COLORS.applications} radius={[0, 0, 0, 0]} />
                                            <Bar name="Tender Bids" dataKey="bids" stackId="eco" fill={COLORS.bids} />
                                            <Bar name="Offer Claims" dataKey="claims" stackId="eco" fill={COLORS.claims} radius={[5, 5, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc', flexDirection: 'column', gap: '10px' }}>
                                        <i className="fas fa-chart-bar" style={{ fontSize: '2.5rem', opacity: 0.3 }}></i>
                                        <span style={{ fontSize: '0.85rem' }}>No ecosystem activity data</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
