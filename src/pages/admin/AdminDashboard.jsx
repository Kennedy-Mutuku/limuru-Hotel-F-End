import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PROPERTY_NAMES = {
    limuru: 'Jumuia Limuru Country Home',
    kanamai: 'Jumuia Kanamai Beach Resort',
    kisumu: 'Jumuia Hotel Kisumu',
    all: 'All Properties',
};

// ── Pure SVG Bar Chart ─────────────────────────────────────────────────────
// Uses a fixed viewBox so bars always have consistent visual width (max 48px)
// regardless of how many data points exist.
function BarChartSVG({ data, keys, colors, labels, height = 220 }) {
    if (!data || data.length === 0)
        return <div style={{ textAlign: 'center', padding: '60px 0', color: '#ccc', fontSize: '0.85rem' }}>No data available</div>;

    const VW = 520, pL = 44, pB = 32, pT = 10, pR = 16;
    const chartW = VW - pL - pR;
    const chartH = height - pB - pT;
    const maxVal = Math.max(...data.map(d => keys.reduce((s, k) => s + (d[k] || 0), 0)), 1);
    const slotW = chartW / data.length;
    const barW = Math.min(slotW * 0.55, 48); // cap at 48px so bars aren't giant when few data points

    return (
        <svg viewBox={`0 0 ${VW} ${height}`} width="100%" height={height} style={{ display: 'block' }}>
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
                const y = pT + (1 - f) * chartH;
                const val = Math.round(maxVal * f);
                return (
                    <g key={f}>
                        <line x1={pL} y1={y} x2={VW - pR} y2={y} stroke="#f0f4f8" strokeWidth={1} />
                        <text x={pL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
                            {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        </text>
                    </g>
                );
            })}

            {/* Stacked bars + X labels */}
            {data.map((d, i) => {
                const cx = pL + slotW * i + slotW / 2;
                const barX = cx - barW / 2;
                let top = pT + chartH; // start from bottom

                return (
                    <g key={i}>
                        {keys.map((k, ki) => {
                            const val = d[k] || 0;
                            const h = Math.max((val / maxVal) * chartH, val > 0 ? 2 : 0);
                            top -= h;
                            return (
                                <rect key={ki} x={barX} y={top} width={barW} height={h}
                                    fill={colors[ki]} rx={ki === keys.length - 1 && h > 4 ? 4 : 0}>
                                    <title>{labels[ki]}: {val}</title>
                                </rect>
                            );
                        })}
                        <text x={cx} y={pT + chartH + 18} textAnchor="middle" fontSize={10} fill="#94a3b8">{d.name}</text>
                    </g>
                );
            })}
        </svg>
    );
}

// ── Pure SVG Area/Line Chart ───────────────────────────────────────────────
function AreaChartSVG({ data, keys, colors, labels, height = 220 }) {
    if (!data || data.length === 0)
        return <div style={{ textAlign: 'center', padding: '60px 0', color: '#ccc', fontSize: '0.85rem' }}>No data available</div>;

    const VW = 560, pL = 52, pB = 32, pT = 10, pR = 16;
    const chartW = VW - pL - pR;
    const chartH = height - pB - pT;
    const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k] || 0)), 1);

    const xPos = i => pL + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const yPos = v => pT + (1 - v / maxVal) * chartH;

    return (
        <svg viewBox={`0 0 ${VW} ${height}`} width="100%" height={height} style={{ display: 'block' }}>
            <defs>
                {keys.map((k, ki) => (
                    <linearGradient key={k} id={`ag_${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors[ki]} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={colors[ki]} stopOpacity="0" />
                    </linearGradient>
                ))}
            </defs>

            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
                const y = pT + (1 - f) * chartH;
                const val = maxVal * f;
                return (
                    <g key={f}>
                        <line x1={pL} y1={y} x2={VW - pR} y2={y} stroke="#f0f4f8" strokeWidth={1} />
                        <text x={pL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
                            {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : Math.round(val)}
                        </text>
                    </g>
                );
            })}

            {/* Areas + Lines */}
            {keys.map((k, ki) => {
                const pts = data.map((d, i) => [xPos(i), yPos(d[k] || 0)]);
                const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
                const area = `${line} L${xPos(data.length - 1)},${pT + chartH} L${xPos(0)},${pT + chartH} Z`;
                return (
                    <g key={k}>
                        <path d={area} fill={`url(#ag_${k})`} />
                        <path d={line} fill="none" stroke={colors[ki]} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                        {pts.map((p, i) => (
                            <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={colors[ki]} stroke="white" strokeWidth={1.5}>
                                <title>{labels[ki]}: {k === 'revenue' ? `KES ${(data[i][k] || 0).toLocaleString()}` : (data[i][k] || 0)}</title>
                            </circle>
                        ))}
                    </g>
                );
            })}

            {/* X labels */}
            {data.map((d, i) => (
                <text key={i} x={xPos(i)} y={height - 6} textAnchor="middle" fontSize={10} fill="#94a3b8">{d.name}</text>
            ))}
        </svg>
    );
}

// ── Pure SVG Donut Chart ───────────────────────────────────────────────────
// Centered via margin: auto on the SVG and explicit viewBox so it scales properly.
function DonutChartSVG({ data }) {
    if (!data || data.length === 0)
        return <div style={{ textAlign: 'center', padding: '40px 0', color: '#ccc', fontSize: '0.85rem' }}>No data</div>;

    const SIZE = 200, cx = 100, cy = 100, R = 72, r = 46;
    const total = data.reduce((s, d) => s + d.value, 0);
    let angle = -90;

    const pt = (deg, radius) => ({
        x: cx + radius * Math.cos((deg * Math.PI) / 180),
        y: cy + radius * Math.sin((deg * Math.PI) / 180),
    });

    return (
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} style={{ display: 'block', margin: '8px auto 0' }}>
            {data.map((seg, i) => {
                const sweep = (seg.value / total) * 360;
                const end = angle + sweep - 0.5;
                const o1 = pt(angle, R), o2 = pt(end, R);
                const i1 = pt(end, r), i2 = pt(angle, r);
                const large = sweep > 180 ? 1 : 0;
                const d = `M${o1.x},${o1.y} A${R},${R},0,${large},1,${o2.x},${o2.y} L${i1.x},${i1.y} A${r},${r},0,${large},0,${i2.x},${i2.y} Z`;
                angle += sweep;
                return (
                    <path key={i} d={d} fill={seg.color}>
                        <title>{seg.name}: KES {seg.value.toLocaleString()} ({((seg.value / total) * 100).toFixed(1)}%)</title>
                    </path>
                );
            })}
            <text x={cx} y={cy - 7} textAnchor="middle" fontSize={10} fill="#999" fontWeight="500">Total</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize={14} fill="#1e293b" fontWeight="800">
                {total >= 1000000 ? `${(total / 1000000).toFixed(1)}M` : `${(total / 1000).toFixed(0)}k`}
            </text>
        </svg>
    );
}

// ── Dashboard Component ────────────────────────────────────────────────────
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
    const perfProps = isManager ? [assignedBranch] : ['limuru', 'kanamai', 'kisumu'];
    const months = stats?.revenueHistory?.months || [];

    const pieData = [
        { name: 'Limuru', value: stats?.properties?.limuru?.revenue || 0, color: '#22440f' },
        { name: 'Kanamai', value: stats?.properties?.kanamai?.revenue || 0, color: '#f3a435' },
        { name: 'Kisumu', value: stats?.properties?.kisumu?.revenue || 0, color: '#4338ca' }
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
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                </div>
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

                    {/* Performance Table + Revenue Donut */}
                    <div className="perf-grid-row">
                        <div className="admin-card">
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fas fa-chart-line" style={{ color: 'var(--primary-green)' }}></i> Performance Comparison
                            </h3>
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead><tr><th>Branch</th><th>Revenue</th><th>Bookings</th><th>Rating</th></tr></thead>
                                    <tbody>
                                        {perfProps.map(prop => (
                                            <tr key={prop}>
                                                <td style={{ fontWeight: '700' }}>{PROPERTY_NAMES[prop]}</td>
                                                <td style={{ fontWeight: '800', color: 'var(--primary-green)' }}>
                                                    KES {(stats?.properties?.[prop]?.revenue || 0).toLocaleString()}
                                                </td>
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

                        {/* Donut Card */}
                        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '4px' }}>Revenue Distribution</h3>
                            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '12px' }}>All-time revenue by property</p>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <DonutChartSVG data={pieData} />
                                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '14px' }}>
                                    {pieData.map(d => (
                                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }}></div>
                                            {d.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="charts-grid-row">

                        {/* Revenue Trend */}
                        <div className="admin-card" style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '14px' }}>
                                <h3 style={{ margin: 0, marginBottom: '3px' }}>📈 Revenue Trend</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Monthly bookings & revenue (all time)</p>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                {[{ c: '#16a34a', lbl: 'Revenue (KES)' }, { c: '#f97316', lbl: 'Bookings' }].map(l => (
                                    <div key={l.lbl} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: '700', color: '#555' }}>
                                        <div style={{ width: '12px', height: '3px', background: l.c, borderRadius: '2px' }}></div>{l.lbl}
                                    </div>
                                ))}
                            </div>
                            <AreaChartSVG data={months} keys={['revenue', 'bookings']}
                                colors={['#16a34a', '#f97316']} labels={['Revenue (KES)', 'Bookings']} height={240} />
                        </div>

                        {/* Guest Interactions */}
                        <div className="admin-card" style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '14px' }}>
                                <h3 style={{ margin: 0, marginBottom: '3px', color: 'var(--primary-green)' }}>💬 Guest Interactions</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Live tracking of inquiries, feedback, and offer claims</p>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                {[
                                    { c: '#4338ca', lbl: 'Direct Inquiries' }, 
                                    { c: '#f59e0b', lbl: 'Guest Feedback' }, 
                                    { c: '#0ea5e9', lbl: 'Offer Claims' }
                                ].map(l => (
                                    <div key={l.lbl} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: '700', color: '#555' }}>
                                        <div style={{ width: '14px', height: '3px', background: l.c, borderRadius: '2px' }}></div>{l.lbl}
                                    </div>
                                ))}
                            </div>
                            <AreaChartSVG 
                                data={months} 
                                keys={['inquiries', 'feedback', 'claims']}
                                colors={['#4338ca', '#f59e0b', '#0ea5e9']} 
                                labels={['Direct Inquiries', 'Guest Feedback', 'Offer Claims']} 
                                height={240} 
                            />
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
