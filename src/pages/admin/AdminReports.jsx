import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PROPERTY_NAMES = {
    limuru: 'Jumuia Limuru Country Home',
    kanamai: 'Jumuia Kanamai Beach Resort',
    kisumu: 'Jumuia Hotel Kisumu',
    all: 'All Properties',
};

const STATUS_COLORS = {
    confirmed: '#16a34a', pending: '#f97316', cancelled: '#ef4444', completed: '#2563eb',
};

// ── SVG Area Chart (shared component) ─────────────────────────────────────
function AreaChartSVG({ data, keys, colors, labels, height = 200 }) {
    if (!data || data.length === 0)
        return <div style={{ textAlign: 'center', padding: '40px 0', color: '#ccc', fontSize: '0.85rem' }}>No trend data available</div>;
    const VW = 560, pL = 52, pB = 28, pT = 10, pR = 16;
    const chartW = VW - pL - pR, chartH = height - pB - pT;
    const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k] || 0)), 1);
    const xPos = i => pL + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const yPos = v => pT + (1 - v / maxVal) * chartH;
    return (
        <svg viewBox={`0 0 ${VW} ${height}`} width="100%" height={height} style={{ display: 'block' }}>
            <defs>
                {keys.map((k, ki) => (
                    <linearGradient key={k} id={`rg_${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors[ki]} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={colors[ki]} stopOpacity="0" />
                    </linearGradient>
                ))}
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
                const y = pT + (1 - f) * chartH;
                const val = maxVal * f;
                return (
                    <g key={f}>
                        <line x1={pL} y1={y} x2={VW - pR} y2={y} stroke="#f0f4f8" strokeWidth={1} />
                        <text x={pL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
                            {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : Math.round(val)}
                        </text>
                    </g>
                );
            })}
            {keys.map((k, ki) => {
                const pts = data.map((d, i) => [xPos(i), yPos(d[k] || 0)]);
                const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
                const area = `${line} L${xPos(data.length - 1)},${pT + chartH} L${xPos(0)},${pT + chartH} Z`;
                return (
                    <g key={k}>
                        <path d={area} fill={`url(#rg_${k})`} />
                        <path d={line} fill="none" stroke={colors[ki]} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                        {pts.map((p, i) => (
                            <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={colors[ki]} stroke="white" strokeWidth={1.5}>
                                <title>{labels[ki]}: {k === 'revenue' ? `KES ${(data[i][k] || 0).toLocaleString()}` : (data[i][k] || 0)}</title>
                            </circle>
                        ))}
                    </g>
                );
            })}
            {data.map((d, i) => (
                <text key={i} x={xPos(i)} y={height - 4} textAnchor="middle" fontSize={9} fill="#94a3b8">{d.name}</text>
            ))}
        </svg>
    );
}

// ── SVG Bar Chart ──────────────────────────────────────────────────────────
function BarChartSVG({ data, keys, colors, labels, height = 200 }) {
    if (!data || data.length === 0)
        return <div style={{ textAlign: 'center', padding: '40px 0', color: '#ccc', fontSize: '0.85rem' }}>No data available</div>;
    const VW = 520, pL = 44, pB = 28, pT = 10, pR = 16;
    const chartW = VW - pL - pR, chartH = height - pB - pT;
    const maxVal = Math.max(...data.map(d => keys.reduce((s, k) => s + (d[k] || 0), 0)), 1);
    const slotW = chartW / data.length;
    const barW = Math.min(slotW * 0.55, 48);
    return (
        <svg viewBox={`0 0 ${VW} ${height}`} width="100%" height={height} style={{ display: 'block' }}>
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
                const y = pT + (1 - f) * chartH;
                const val = Math.round(maxVal * f);
                return (
                    <g key={f}>
                        <line x1={pL} y1={y} x2={VW - pR} y2={y} stroke="#f0f4f8" strokeWidth={1} />
                        <text x={pL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
                            {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        </text>
                    </g>
                );
            })}
            {data.map((d, i) => {
                const cx = pL + slotW * i + slotW / 2, barX = cx - barW / 2;
                let top = pT + chartH;
                return (
                    <g key={i}>
                        {keys.map((k, ki) => {
                            const val = d[k] || 0;
                            const h = Math.max((val / maxVal) * chartH, val > 0 ? 2 : 0);
                            top -= h;
                            return <rect key={ki} x={barX} y={top} width={barW} height={h} fill={colors[ki]} rx={ki === keys.length - 1 && h > 4 ? 4 : 0}><title>{labels[ki]}: {val}</title></rect>;
                        })}
                        <text x={cx} y={pT + chartH + 16} textAnchor="middle" fontSize={9} fill="#94a3b8">{d.name}</text>
                    </g>
                );
            })}
        </svg>
    );
}

// ── SVG Donut Chart ────────────────────────────────────────────────────────
function DonutChartSVG({ data, size = 160 }) {
    if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '40px 0', color: '#ccc' }}>No data</div>;
    const cx = size / 2, cy = size / 2, R = size * 0.38, r = size * 0.24;
    const total = data.reduce((s, d) => s + d.value, 0);
    let angle = -90;
    const pt = (deg, rad) => ({ x: cx + rad * Math.cos((deg * Math.PI) / 180), y: cy + rad * Math.sin((deg * Math.PI) / 180) });
    return (
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', margin: '8px auto 0' }}>
            {data.map((seg, i) => {
                const sweep = (seg.value / total) * 360;
                const end = angle + sweep - 0.5;
                const o1 = pt(angle, R), o2 = pt(end, R), i1 = pt(end, r), i2 = pt(angle, r);
                const large = sweep > 180 ? 1 : 0;
                const d = `M${o1.x},${o1.y} A${R},${R},0,${large},1,${o2.x},${o2.y} L${i1.x},${i1.y} A${r},${r},0,${large},0,${i2.x},${i2.y} Z`;
                angle += sweep;
                return <path key={i} d={d} fill={seg.color}><title>{seg.name}: {seg.value} ({((seg.value / total) * 100).toFixed(1)}%)</title></path>;
            })}
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize={9} fill="#999">Total</text>
            <text x={cx} y={cy + 9} textAnchor="middle" fontSize={12} fill="#1e293b" fontWeight="800">{total}</text>
        </svg>
    );
}

// ── Main Reports Component ─────────────────────────────────────────────────
export default function AdminReports() {
    const { user } = useAuth();
    const isManager = user?.role === 'manager';
    const assignedBranch = isManager ? (user?.properties?.[0] || 'all') : 'all';

    const [report, setReport] = useState(null);
    const [stats, setStats] = useState(null);
    const [currentResort, setCurrentResort] = useState(assignedBranch);
    const [loading, setLoading] = useState(true);
    const reportRef = useRef();

    useEffect(() => { fetchAll(); }, [currentResort]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [r, s] = await Promise.all([
                api.get('/stats/report', { params: { resort: currentResort } }),
                api.get('/stats', { params: { resort: currentResort } }),
            ]);
            setReport(r.data);
            setStats(s.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const downloadPDF = () => {
        window.print();
    };

    if (loading) return <div className="admin-loading"><div className="spinner"></div></div>;

    // Summaries
    const totalRevenue = report?.bookings?.reduce((a, b) => a + b.revenue, 0) || 0;
    const totalBookings = report?.bookings?.reduce((a, b) => a + b.count, 0) || 0;
    const months = stats?.revenueHistory?.months || [];

    const bookingDonutData = (report?.bookings || []).map((b, i) => ({
        name: b._id, value: b.count,
        color: STATUS_COLORS[b._id] || ['#22440f', '#f3a435', '#4338ca', '#9c27b0'][i % 4]
    }));

    const ratingDonutData = (report?.feedback?.distribution || []).map((f, i) => ({
        name: `${f._id} Stars`, value: f.count,
        color: ['#FFD700', '#FFA500', '#22c55e', '#ef4444', '#94a3b8'][i % 5]
    }));

    const pieData = [
        { name: 'Limuru', value: stats?.properties?.limuru?.revenue || 0, color: '#22440f' },
        { name: 'Kanamai', value: stats?.properties?.kanamai?.revenue || 0, color: '#f3a435' },
        { name: 'Kisumu', value: stats?.properties?.kisumu?.revenue || 0, color: '#4338ca' }
    ].filter(d => d.value > 0);

    const generatedAt = new Date().toLocaleString('en-KE', { dateStyle: 'full', timeStyle: 'short' });

    return (
        <div className="anim-fade-in" style={{ paddingBottom: '40px' }}>
            {/* Page Header */}
            <div className="admin-page-header" style={{ marginBottom: '20px' }}>
                <div>
                    <h1>📊 Operational Reports</h1>
                    <p style={{ color: 'var(--text-light)' }}>Comprehensive analytics, charts &amp; booking data</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={fetchAll} title="Refresh">
                        <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                    <button className="btn btn-primary" onClick={downloadPDF}>
                        <i className="fas fa-print"></i> Print / Save PDF
                    </button>
                </div>
            </div>

            {/* Property Filter */}
            {!isManager && (
                <div className="property-selector" style={{ marginBottom: '28px' }}>
                    {['all', 'limuru', 'kanamai', 'kisumu'].map(prop => (
                        <button key={prop} className={`property-btn ${currentResort === prop ? 'active' : ''}`}
                            onClick={() => setCurrentResort(prop)}>
                            {prop === 'all' ? 'All Resorts' : prop.charAt(0).toUpperCase() + prop.slice(1)}
                        </button>
                    ))}
                </div>
            )}

            {/* ── PRINTABLE REPORT BODY ────────────────────────────────── */}
            <div ref={reportRef}>

                {/* Report Header Banner */}
                <div className="admin-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #22440f 0%, #3a7d20 100%)', color: 'white', borderRadius: '16px', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.75, marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>Jumuia Resorts — Official Report</div>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>{PROPERTY_NAMES[currentResort]}</h2>
                        <div style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: '6px' }}>Generated: {generatedAt}</div>
                    </div>
                    <div style={{ textAlign: 'right', opacity: 0.9 }}>
                        <div style={{ fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Period</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>All Time</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="stats-grid" style={{ marginBottom: '24px' }}>
                    <div className="stat-card">
                        <div className="stat-icon green"><i className="fas fa-coins"></i></div>
                        <div className="stat-info"><p>Total Revenue</p><h3>KES {totalRevenue.toLocaleString()}</h3></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange"><i className="fas fa-calendar-check"></i></div>
                        <div className="stat-info"><p>Total Bookings</p><h3>{totalBookings}</h3></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue"><i className="fas fa-envelope-open-text"></i></div>
                        <div className="stat-info"><p>Guest Inquiries</p><h3>{report?.communications?.total || 0}</h3></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#9c27b0' }}><i className="fas fa-star"></i></div>
                        <div className="stat-info"><p>Avg. Guest Rating</p><h3>{(report?.feedback?.average || 0).toFixed(1)} / 5</h3></div>
                    </div>
                </div>

                {/* ── SECTION 1: Revenue Charts ── */}
                <div style={{ marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid var(--primary-green)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <i className="fas fa-chart-area" style={{ color: 'var(--primary-green)' }}></i>
                    <h3 style={{ margin: 0 }}>Revenue Analytics</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px', marginTop: '16px' }}>
                    {/* Monthly Revenue Trend */}
                    <div className="admin-card" style={{ padding: '22px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <h4 style={{ margin: 0, marginBottom: '3px' }}>📈 Monthly Revenue &amp; Bookings Trend</h4>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>All-time historical data grouped by month</p>
                        </div>
                        <div style={{ display: 'flex', gap: '14px', marginBottom: '10px' }}>
                            {[{ c: '#16a34a', lbl: 'Revenue (KES)' }, { c: '#f97316', lbl: 'Bookings' }].map(l => (
                                <div key={l.lbl} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: '700', color: '#555' }}>
                                    <div style={{ width: '12px', height: '3px', background: l.c, borderRadius: '2px' }}></div>{l.lbl}
                                </div>
                            ))}
                        </div>
                        <AreaChartSVG data={months} keys={['revenue', 'bookings']} colors={['#16a34a', '#f97316']} labels={['Revenue (KES)', 'Bookings']} height={220} />
                    </div>

                    {/* Revenue by Property donut */}
                    <div className="admin-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ margin: 0, marginBottom: '4px' }}>🍩 Revenue by Property</h4>
                        <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#888' }}>Distribution across all resorts</p>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <DonutChartSVG data={pieData.map(d => ({ ...d, value: d.value }))} size={150} />
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
                                {pieData.map(d => (
                                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: '700' }}>
                                        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: d.color }}></div>
                                        <span>{d.name}</span>
                                        <span style={{ color: '#888' }}>KES {d.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 2: Guest Communications ── */}
                <div style={{ marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #4338ca', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <i className="fas fa-comments" style={{ color: '#4338ca' }}></i>
                    <h3 style={{ margin: 0 }}>Guest Communication Trends</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px', marginTop: '16px' }}>
                    <div className="admin-card" style={{ padding: '22px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <h4 style={{ margin: 0, marginBottom: '3px' }}>💬 Inquiries, Feedback &amp; Claims by Month</h4>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>Live tracking of guest engagement and responsiveness</p>
                        </div>
                        <div style={{ display: 'flex', gap: '14px', marginBottom: '10px' }}>
                            {[
                                { c: '#4338ca', lbl: 'Guest Inquiries' }, 
                                { c: '#f59e0b', lbl: 'Guest Feedback' }, 
                                { c: '#0ea5e9', lbl: 'Offer Claims' }
                            ].map(l => (
                                <div key={l.lbl} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: '700', color: '#555' }}>
                                    <div style={{ width: '14px', height: '3px', background: l.c, borderRadius: '2px' }}></div>{l.lbl}
                                </div>
                            ))}
                        </div>
                        <AreaChartSVG 
                            data={months} 
                            keys={['inquiries', 'feedback', 'claims']} 
                            colors={['#4338ca', '#f59e0b', '#0ea5e9']} 
                            labels={['Guest Inquiries', 'Guest Feedback', 'Offer Claims']} 
                            height={220} 
                        />
                    </div>

                    <div className="admin-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ margin: 0, marginBottom: '4px' }}>📊 Engagement &amp; Analytics</h4>
                        <p style={{ margin: '0 0 14px', fontSize: '0.78rem', color: '#888' }}>Inquiry status and offer conversions</p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '9px 4px', color: '#555' }}>Total Inquiries Received</td>
                                    <td style={{ padding: '9px 4px', fontWeight: '800', textAlign: 'right' }}>{report?.communications?.total || 0}</td>
                                </tr>
                                {(report?.communications?.status || []).map(s => (
                                    <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '9px 4px', color: '#555', textTransform: 'capitalize' }}>Inquiries — {s._id}</td>
                                        <td style={{ padding: '9px 4px', fontWeight: '700', textAlign: 'right' }}>{s.count}</td>
                                    </tr>
                                ))}
                                <tr style={{ borderBottom: '1px solid #f1f5f9', marginTop: '10px' }}>
                                    <td style={{ padding: '9px 4px', color: '#555' }}>Total Feedbacks</td>
                                    <td style={{ padding: '9px 4px', fontWeight: '800', textAlign: 'right' }}>{report?.feedback?.distribution?.reduce((a, b) => a + b.count, 0) || 0}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '9px 4px', color: '#555' }}>Active Offers</td>
                                    <td style={{ padding: '9px 4px', fontWeight: '800', textAlign: 'right' }}>{report?.offers?.total || 0}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '9px 4px', color: '#555' }}>Offer Claims Confirmed</td>
                                    <td style={{ padding: '9px 4px', fontWeight: '800', textAlign: 'right' }}>
                                        {report?.offers?.claims?.find(c => c._id === 'confirmed')?.count || 0}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── SECTION 3: Booking Breakdown ── */}
                <div style={{ marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #f97316', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <i className="fas fa-calendar-alt" style={{ color: '#f97316' }}></i>
                    <h3 style={{ margin: 0 }}>Booking Breakdown</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', marginTop: '16px' }}>
                    {/* Status Distribution donut */}
                    <div className="admin-card" style={{ padding: '22px' }}>
                        <h4 style={{ margin: '0 0 16px' }}>Booking Status Distribution</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                            <DonutChartSVG data={bookingDonutData} size={150} />
                            <div style={{ flex: 1 }}>
                                {(report?.bookings || []).map((b, i) => (
                                    <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLORS[b._id] || '#94a3b8' }}></div>
                                            <span style={{ fontSize: '0.83rem', textTransform: 'capitalize', fontWeight: '600' }}>{b._id}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{b.count}</div>
                                            <div style={{ fontSize: '0.72rem', color: '#888' }}>KES {b.revenue.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Revenue per status table */}
                    <div className="admin-card" style={{ padding: '22px' }}>
                        <h4 style={{ margin: '0 0 16px' }}>Revenue by Booking Status</h4>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr><th>Status</th><th>Bookings</th><th>Revenue (KES)</th><th>Avg / Booking</th></tr>
                                </thead>
                                <tbody>
                                    {(report?.bookings || []).map(b => (
                                        <tr key={b._id}>
                                            <td>
                                                <span className={`status-badge ${b._id}`}>{b._id}</span>
                                            </td>
                                            <td style={{ fontWeight: '700' }}>{b.count}</td>
                                            <td style={{ fontWeight: '800', color: 'var(--primary-green)' }}>{b.revenue.toLocaleString()}</td>
                                            <td style={{ color: '#888' }}>{b.count ? Math.round(b.revenue / b.count).toLocaleString() : '—'}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: '#f8fafc', fontWeight: '800' }}>
                                        <td><strong>TOTAL</strong></td>
                                        <td><strong>{totalBookings}</strong></td>
                                        <td><strong>KES {totalRevenue.toLocaleString()}</strong></td>
                                        <td><strong>{totalBookings ? Math.round(totalRevenue / totalBookings).toLocaleString() : '—'}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 4: Branch Performance ── */}
                <div style={{ marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #22c55e', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <i className="fas fa-building" style={{ color: '#22c55e' }}></i>
                    <h3 style={{ margin: 0 }}>Branch Performance</h3>
                </div>

                <div className="admin-card" style={{ marginTop: '16px', marginBottom: '24px', padding: '22px' }}>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr><th>Property</th><th>Revenue (KES)</th><th>Bookings</th><th>Avg. Rating</th><th>Est. Occupancy</th></tr>
                            </thead>
                            <tbody>
                                {['limuru', 'kanamai', 'kisumu'].map(prop => {
                                    const p = stats?.properties?.[prop];
                                    return (
                                        <tr key={prop}>
                                            <td style={{ fontWeight: '700' }}>{PROPERTY_NAMES[prop]}</td>
                                            <td style={{ fontWeight: '800', color: 'var(--primary-green)' }}>{(p?.revenue || 0).toLocaleString()}</td>
                                            <td>{p?.bookings || 0}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <i key={s} className="fas fa-star" style={{ fontSize: '0.7rem', color: s <= Math.round(p?.rating || 0) ? '#ffc107' : '#e2e8f0' }}></i>
                                                    ))}
                                                    <span style={{ marginLeft: '4px', fontSize: '0.8rem', fontWeight: '700' }}>{p?.rating || 0}</span>
                                                </div>
                                            </td>
                                            <td>{p?.occupancy || 0}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── SECTION 5: Guest Satisfaction ── */}
                <div style={{ marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <i className="fas fa-smile" style={{ color: '#f59e0b' }}></i>
                    <h3 style={{ margin: 0 }}>Guest Satisfaction</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
                    <div className="admin-card" style={{ padding: '22px' }}>
                        <h4 style={{ margin: '0 0 16px' }}>Rating Distribution</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <DonutChartSVG data={ratingDonutData} size={140} />
                            <div style={{ flex: 1 }}>
                                {(report?.feedback?.distribution || []).sort((a, b) => b._id - a._id).map(f => (
                                    <div key={f._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <i key={s} className="fas fa-star" style={{ fontSize: '0.65rem', color: s <= f._id ? '#ffc107' : '#e2e8f0' }}></i>
                                            ))}
                                        </div>
                                        <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', borderRadius: '4px', background: '#ffc107', width: `${((f.count / (report?.feedback?.distribution?.reduce((a, x) => a + x.count, 0) || 1)) * 100).toFixed(0)}%` }}></div>
                                        </div>
                                        <span style={{ fontSize: '0.78rem', fontWeight: '700', minWidth: '22px', textAlign: 'right' }}>{f.count}</span>
                                    </div>
                                ))}
                                <div style={{ marginTop: '14px', padding: '10px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#888' }}>Overall Average</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#22440f' }}>{(report?.feedback?.average || 0).toFixed(2)}<span style={{ fontSize: '0.8rem', color: '#888' }}> / 5</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card" style={{ padding: '22px' }}>
                        <h4 style={{ margin: '0 0 16px' }}>Summary Metrics</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                            <tbody>
                                {[
                                    { label: 'Total Revenue', val: `KES ${totalRevenue.toLocaleString()}`, color: '#16a34a' },
                                    { label: 'Total Bookings', val: totalBookings, color: '#f97316' },
                                    { label: 'Guest Inquiries', val: report?.communications?.total || 0, color: '#4338ca' },
                                    { label: 'Inquiry Status', val: `${report?.communications?.status?.find(s => s._id === 'responded')?.count || 0} Responded`, color: '#9c27b0' },
                                    { label: 'Active Offers', val: report?.offers?.total || 0, color: '#0ea5e9' },
                                    { label: 'Offer Claims', val: report?.offers?.claims?.reduce((a, b) => a + b.count, 0) || 0, color: '#22c55e' },
                                    { label: 'Avg. Rating', val: `${(report?.feedback?.average || 0).toFixed(2)} / 5`, color: '#f59e0b' },
                                    { label: 'Review Count', val: report?.feedback?.distribution?.reduce((a, f) => a + f.count, 0) || 0, color: '#ef4444' },
                                ].map(row => (
                                    <tr key={row.label} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '9px 6px', color: '#555', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.color, flexShrink: 0 }}></div>
                                            {row.label}
                                        </td>
                                        <td style={{ padding: '9px 6px', fontWeight: '800', textAlign: 'right', color: row.color }}>{row.val}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <strong style={{ color: '#22440f' }}>Jumuia Resorts</strong> · Christian Hospitality &amp; Conference Centers · Report generated {generatedAt}
                </div>

            </div>
        </div>
    );
}
