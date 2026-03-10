import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PROPERTY_NAMES = {
    limuru: 'Jumuia Limuru Country Home',
    kanamai: 'Jumuia Kanamai Beach Resort',
    kisumu: 'Jumuia Hotel Kisumu',
    all: 'All Properties',
};

// Pure SVG Bar Chart - no external dependencies
function BarChartSVG({ data, keys, colors, labels, height = 220 }) {
    if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '60px 0', color: '#ccc', fontSize: '0.85rem' }}>No data available</div>;

    const paddingL = 48, paddingB = 36, paddingT = 12, paddingR = 12;
    const maxVal = Math.max(...data.map(d => keys.reduce((s, k) => s + (d[k] || 0), 0)), 1);

    return (
        <svg width="100%" height={height} style={{ overflow: 'visible' }}>
            <g transform={`translate(${paddingL},${paddingT})`}>
                {/* Y axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map(f => {
                    const y = (height - paddingB - paddingT) * (1 - f);
                    const val = Math.round(maxVal * f);
                    return (
                        <g key={f}>
                            <line x1={0} y1={y} x2="96%" y2={y} stroke="#f1f5f9" strokeWidth={1} />
                            <text x={-6} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
                                {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                            </text>
                        </g>
                    );
                })}

                {/* Bars */}
                {data.map((d, i) => {
                    const totalBars = data.length;
                    const slotWidth = (100 / totalBars);
                    const barWidth = Math.min(slotWidth * 0.6, 30);
                    const xPercent = slotWidth * i + slotWidth * 0.5;
                    const chartH = height - paddingB - paddingT;
                    let stackY = chartH;

                    return (
                        <g key={i}>
                            {keys.map((k, ki) => {
                                const val = d[k] || 0;
                                const barH = (val / maxVal) * chartH;
                                stackY -= barH;
                                return (
                                    <rect
                                        key={ki}
                                        x={`${xPercent}%`}
                                        y={stackY}
                                        width={`${barWidth * 0.9}%`}
                                        height={barH}
                                        fill={colors[ki]}
                                        rx={ki === keys.length - 1 ? 3 : 0}
                                        transform={`translate(-${barWidth * 0.45}%, 0)`}
                                    >
                                        <title>{labels[ki]}: {val >= 1000 ? `KES ${val.toLocaleString()}` : val}</title>
                                    </rect>
                                );
                            })}
                            <text x={`${xPercent}%`} y={chartH + 18} textAnchor="middle" fontSize={9} fill="#94a3b8">{d.name}</text>
                        </g>
                    );
                })}
            </g>
        </svg>
    );
}

// Pure SVG Line/Area Chart
function AreaChartSVG({ data, keys, colors, labels, currency = false, height = 220 }) {
    if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '60px 0', color: '#ccc', fontSize: '0.85rem' }}>No data available</div>;

    const paddingL = 52, paddingB = 36, paddingT = 12, paddingR = 16;
    const W = 600; // internal viewBox width
    const H = height;
    const chartW = W - paddingL - paddingR;
    const chartH = H - paddingB - paddingT;

    const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k] || 0)), 1);

    const xPos = (i) => paddingL + (i / (data.length - 1)) * chartW;
    const yPos = (val) => paddingT + (1 - val / maxVal) * chartH;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} style={{ display: 'block' }}>
            <defs>
                {keys.map((k, ki) => (
                    <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors[ki]} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={colors[ki]} stopOpacity="0" />
                    </linearGradient>
                ))}
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
                const y = paddingT + (1 - f) * chartH;
                const val = maxVal * f;
                return (
                    <g key={f}>
                        <line x1={paddingL} y1={y} x2={W - paddingR} y2={y} stroke="#f1f5f9" strokeWidth={1} />
                        <text x={paddingL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
                            {currency ? (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)) : (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : Math.round(val))}
                        </text>
                    </g>
                );
            })}

            {/* Areas and Lines */}
            {keys.map((k, ki) => {
                const pts = data.map((d, i) => [xPos(i), yPos(d[k] || 0)]);
                const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
                const areaPath = `${linePath} L${xPos(data.length - 1)},${paddingT + chartH} L${xPos(0)},${paddingT + chartH} Z`;

                return (
                    <g key={k}>
                        <path d={areaPath} fill={`url(#grad_${k})`} />
                        <path d={linePath} fill="none" stroke={colors[ki]} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                        {pts.map((p, i) => (
                            <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={colors[ki]} stroke="white" strokeWidth={1.5}>
                                <title>{labels[ki]}: {currency ? `KES ${(data[i][k] || 0).toLocaleString()}` : (data[i][k] || 0)}</title>
                            </circle>
                        ))}
                    </g>
                );
            })}

            {/* X axis labels */}
            {data.map((d, i) => (
                <text key={i} x={xPos(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="#94a3b8">{d.name}</text>
            ))}
        </svg>
    );
}

// Pure SVG Donut Chart
function DonutChartSVG({ data, size = 180 }) {
    if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '40px 0', color: '#ccc', fontSize: '0.85rem' }}>No data</div>;

    const total = data.reduce((s, d) => s + d.value, 0);
    const cx = size / 2, cy = size / 2, R = size * 0.36, r = size * 0.22;
    let angle = -90;

    const slices = data.map(d => {
        const sweep = (d.value / total) * 360;
        const start = angle;
        angle += sweep;
        return { ...d, start, sweep };
    });

    const arc = (cx, cy, R, startDeg, sweepDeg) => {
        const start = (startDeg * Math.PI) / 180;
        const end = ((startDeg + sweepDeg) * Math.PI) / 180;
        const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
        const x2 = cx + R * Math.cos(end), y2 = cy + R * Math.sin(end);
        const large = sweepDeg > 180 ? 1 : 0;
        return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
    };

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((s, i) => {
                const outerArc = arc(cx, cy, R, s.start, s.sweep - 1);
                const innerArcRev = arc(cx, cy, r, s.start + s.sweep - 1, -(s.sweep - 1));
                const x1 = cx + R * Math.cos((s.start * Math.PI) / 180);
                const y1 = cy + R * Math.sin((s.start * Math.PI) / 180);
                const x2 = cx + r * Math.cos((s.start * Math.PI) / 180);
                const y2 = cy + r * Math.sin((s.start * Math.PI) / 180);
                const x3 = cx + r * Math.cos(((s.start + s.sweep - 1) * Math.PI) / 180);
                const y3 = cy + r * Math.sin(((s.start + s.sweep - 1) * Math.PI) / 180);
                const x4 = cx + R * Math.cos(((s.start + s.sweep - 1) * Math.PI) / 180);
                const y4 = cy + R * Math.sin(((s.start + s.sweep - 1) * Math.PI) / 180);
                const d = `${outerArc} L ${x4} ${y4} L ${x3} ${y3} ${innerArcRev} L ${x2} ${y2} L ${x1} ${y1} Z`;
                return (
                    <path key={i} d={d} fill={s.color}>
                        <title>{s.name}: KES {s.value.toLocaleString()} ({((s.value / total) * 100).toFixed(1)}%)</title>
                    </path>
                );
            })}
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize={11} fill="#666" fontWeight="600">Total</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize={10} fill="#333" fontWeight="700">
                {total >= 1000000 ? `${(total / 1000000).toFixed(1)}M` : `${(total / 1000).toFixed(0)}k`}
            </text>
        </svg>
    );
}

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

    const properties = isManager ? [assignedBranch] : ['all', 'limuru', 'kanamai', 'kisumu'];
    const performanceProperties = isManager ? [assignedBranch] : ['limuru', 'kanamai', 'kisumu'];
    const months = stats?.revenueHistory?.months || [];

    const pieData = [
        { name: 'Limuru', value: stats?.properties?.limuru?.revenue || 0, color: '#22440f' },
        { name: 'Kanamai', value: stats?.properties?.kanamai?.revenue || 0, color: '#f3a435' },
        { name: 'Kisumu', value: stats?.properties?.kisumu?.revenue || 0, color: '#4338ca' }
    ].filter(d => d.value > 0);

    return (
        <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <div className="admin-page-header">
                <div>
                    <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}</h1>
                    <p style={{ color: 'var(--text-light)', marginBottom: '4px' }}>
                        {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

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
                            <div className="stat-info"><p>Total Revenue</p><h3>KES {(stats?.global?.totalRevenue || 0).toLocaleString()}</h3></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange"><i className="fas fa-calendar-check"></i></div>
                            <div className="stat-info"><p>Total Bookings</p><h3>{stats?.global?.totalBookings || 0}</h3></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue"><i className="fas fa-id-badge"></i></div>
                            <div className="stat-info"><p>Pending Bookings</p><h3>{stats?.global?.pendingBookings || 0} New</h3></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#9c27b0' }}><i className="fas fa-star"></i></div>
                            <div className="stat-info"><p>Avg. Trust Score</p><h3>{stats?.global?.avgRating || 0} / 5</h3></div>
                        </div>
                    </div>

                    {/* Performance + Pie */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div className="admin-card">
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fas fa-chart-line" style={{ color: 'var(--primary-green)' }}></i> Performance Comparison
                            </h3>
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead><tr><th>Branch</th><th>Revenue</th><th>Bookings</th><th>Rating</th></tr></thead>
                                    <tbody>
                                        {performanceProperties.map(prop => (
                                            <tr key={prop}>
                                                <td style={{ fontWeight: '700' }}>{PROPERTY_NAMES[prop]}</td>
                                                <td style={{ fontWeight: '800', color: 'var(--primary-green)' }}>KES {(stats?.properties?.[prop]?.revenue || 0).toLocaleString()}</td>
                                                <td>{stats?.properties?.[prop]?.bookings || 0}</td>
                                                <td><div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-star" style={{ color: '#ffc107', fontSize: '0.8rem' }}></i>{stats?.properties?.[prop]?.rating || 0}</div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <h3 style={{ alignSelf: 'flex-start', marginBottom: '4px' }}>Revenue Distribution</h3>
                            <p style={{ alignSelf: 'flex-start', fontSize: '0.8rem', color: '#888', marginBottom: '16px' }}>All-time revenue by property</p>
                            <DonutChartSVG data={pieData} size={170} />
                            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '14px' }}>
                                {pieData.map(d => (
                                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }}></div> {d.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px' }}>

                        {/* Revenue Trend */}
                        <div className="admin-card" style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, marginBottom: '4px' }}>📈 Revenue Trend</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Monthly bookings & revenue (all time)</p>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                                {[{ color: '#16a34a', label: 'Revenue (KES)' }, { color: '#f97316', label: 'Bookings' }].map(l => (
                                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: '700', color: '#555' }}>
                                        <div style={{ width: '12px', height: '3px', background: l.color, borderRadius: '2px' }}></div>{l.label}
                                    </div>
                                ))}
                            </div>
                            <AreaChartSVG
                                data={months}
                                keys={['revenue', 'bookings']}
                                colors={['#16a34a', '#f97316']}
                                labels={['Revenue (KES)', 'Bookings']}
                                currency={false}
                                height={240}
                            />
                        </div>

                        {/* Ecosystem Activity */}
                        <div className="admin-card" style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, marginBottom: '4px' }}>🌐 Ecosystem Activity</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Applications, bids & claims by month</p>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                                {[
                                    { color: '#4338ca', label: 'Applications' },
                                    { color: '#9c27b0', label: 'Bids' },
                                    { color: '#0ea5e9', label: 'Claims' }
                                ].map(l => (
                                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: '700', color: '#555' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color }}></div>{l.label}
                                    </div>
                                ))}
                            </div>
                            <BarChartSVG
                                data={months}
                                keys={['applications', 'bids', 'claims']}
                                colors={['#4338ca', '#9c27b0', '#0ea5e9']}
                                labels={['Applications', 'Bids', 'Claims']}
                                height={240}
                            />
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
