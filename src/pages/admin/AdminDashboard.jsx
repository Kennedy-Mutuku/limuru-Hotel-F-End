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
    revenue: 'var(--primary-green)',
    bookings: 'var(--primary-orange)',
    applications: '#4338ca',
    bids: '#9c27b0',
    claims: '#0ea5e9',
    limuru: '#22440f',
    kanamai: '#f3a435',
    kisumu: '#4338ca'
};

const CustomTooltip = ({ active, payload, label, title, isCurrency }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'white', padding: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                <p style={{ fontWeight: '800', marginBottom: '12px', color: 'var(--text-main)', fontSize: '0.9rem' }}>{title || label}</p>
                {payload.map((entry, index) => (
                    <div key={index} style={{ color: entry.color || entry.fill, fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '20px', background: entry.color || entry.fill }}></div>
                            <span>{entry.name}:</span>
                        </div>
                        <span style={{ fontWeight: '700' }}>
                            {entry.dataKey.includes('revenue') ? `KES ${(entry.value || 0).toLocaleString()}` : entry.value}
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

    // Prepare Pie Data for Revenue Share
    const latestMonth = stats?.revenueHistory?.months[stats.revenueHistory.months.length - 1] || {};
    const pieData = [
        { name: 'Limuru', value: latestMonth.limuru_revenue || 0, color: COLORS.limuru },
        { name: 'Kanamai', value: latestMonth.kanamai_revenue || 0, color: COLORS.kanamai },
        { name: 'Kisumu', value: latestMonth.kisumu_revenue || 0, color: COLORS.kisumu }
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

            {/* Selector */}
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
                    {/* Stats Grid */}
                    <div className="stats-grid">
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
                                <p>Jobs Applied</p>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        {/* PERFORMANCE TABLE */}
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

                        {/* REVENUE SHARE PIE */}
                        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <h3 style={{ alignSelf: 'flex-start', marginBottom: '10px' }}>Revenue Distribution</h3>
                            <p style={{ alignSelf: 'flex-start', fontSize: '0.8rem', color: '#888', marginBottom: '20px' }}>Contribution by property (Current Period)</p>
                            <div style={{ height: '220px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip />
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
                        </div>
                    </div>

                    {/* MAIN ANALYTICS GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>

                        {/* GROWTH CHART (DUAL AXIS) */}
                        <div className="admin-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Daily Growth</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Revenue vs Booking Velocity (14 Days)</p>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS.revenue }}></div> Revenue
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS.bookings }}></div> Bookings
                                    </div>
                                </div>
                            </div>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats?.revenueHistory?.days || []}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.1} />
                                                <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${v / 1000}k`} />
                                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip content={<CustomTooltip title="Daily Performance" />} />
                                        <Area yAxisId="left" type="monotone" name="Revenue" dataKey="revenue" stroke={COLORS.revenue} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                        <Line yAxisId="right" type="step" name="Bookings" dataKey="bookings" stroke={COLORS.bookings} strokeWidth={2} dot={{ r: 3 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* ECOSYSTEM ACTIVITY (BARS) */}
                        <div className="admin-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Ecosystem Activity</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Applications, Bids & Claims (8 Weeks)</p>
                                </div>
                                <Legend payload={[
                                    { value: 'Apps', type: 'rect', color: COLORS.applications },
                                    { value: 'Bids', type: 'rect', color: COLORS.bids },
                                    { value: 'Claims', type: 'rect', color: COLORS.claims }
                                ]} wrapperStyle={{ fontSize: '0.7rem', fontWeight: '700' }} />
                            </div>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.revenueHistory?.weeks || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip content={<CustomTooltip title="Weekly Interactions" />} />
                                        <Bar name="Applications" dataKey="applications" stackId="a" fill={COLORS.applications} radius={[0, 0, 0, 0]} />
                                        <Bar name="Tender Bids" dataKey="bids" stackId="a" fill={COLORS.bids} />
                                        <Bar name="Offer Claims" dataKey="claims" stackId="a" fill={COLORS.claims} radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
