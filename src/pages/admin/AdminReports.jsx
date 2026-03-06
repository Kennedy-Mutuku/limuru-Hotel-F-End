import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PROPERTY_NAMES = {
    limuru: 'Jumuia Limuru Country Home',
    kanamai: 'Jumuia Kanamai Beach Resort',
    kisumu: 'Jumuia Hotel Kisumu',
    all: 'All Properties',
};

const COLORS = ['#22440f', '#f3a435', '#2563eb', '#9333ea', '#ef4444'];

export default function AdminReports() {
    const { user } = useAuth();
    const isManager = user?.role === 'manager';
    const assignedBranch = isManager ? (user?.properties?.[0] || 'all') : 'all';

    const [reportData, setReportData] = useState(null);
    const [currentResort, setCurrentResort] = useState(assignedBranch);
    const [loading, setLoading] = useState(true);
    const reportRef = useRef();

    useEffect(() => {
        fetchReport();
    }, [currentResort]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get('/stats/report', { params: { resort: currentResort } });
            setReportData(res.data);
        } catch (err) {
            console.error('Error fetching report:', err);
        }
        setLoading(false);
    };

    const downloadPDF = async () => {
        const element = reportRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Jumuia_Resorts_Report_${currentResort}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) return <div className="admin-loading"><div className="spinner"></div></div>;

    return (
        <div className="admin-reports-container anim-fade-in">
            <div className="admin-page-header">
                <div>
                    <h1>Operational Reports</h1>
                    <p>Comprehensive analytics and performance data</p>
                </div>
                <button className="btn btn-primary" onClick={downloadPDF}>
                    <i className="fas fa-file-pdf"></i> Download PDF Report
                </button>
            </div>

            {!isManager && (
                <div className="property-selector" style={{ marginBottom: '30px' }}>
                    {['all', 'limuru', 'kanamai', 'kisumu'].map(prop => (
                        <button
                            key={prop}
                            className={`property-btn ${currentResort === prop ? 'active' : ''}`}
                            onClick={() => setCurrentResort(prop)}
                        >
                            {prop === 'all' ? 'All Resorts' : prop.charAt(0).toUpperCase() + prop.slice(1)}
                        </button>
                    ))}
                </div>
            )}

            <div ref={reportRef} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
                    <div>
                        <h2 style={{ color: 'var(--primary-green)', margin: 0 }}>{PROPERTY_NAMES[currentResort]}</h2>
                        <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Report Generated: {new Date().toLocaleString()}</span>
                    </div>
                    <img src="/logo-black.png" alt="Logo" style={{ height: '40px' }} />
                </div>

                {/* KPI Overview */}
                <div className="stats-grid" style={{ marginBottom: '30px' }}>
                    <div className="stat-card">
                        <div className="stat-icon green"><i className="fas fa-coins"></i></div>
                        <div className="stat-info">
                            <h3>KES {reportData?.bookings.reduce((acc, b) => acc + b.revenue, 0).toLocaleString()}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange"><i className="fas fa-users-viewfinder"></i></div>
                        <div className="stat-info">
                            <h3>{reportData?.bookings.reduce((acc, b) => acc + b.guests, 0)}</h3>
                            <p>Total Guest Footfall</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue"><i className="fas fa-gavel"></i></div>
                        <div className="stat-info">
                            <h3>{reportData?.tenders.total}</h3>
                            <p>Tender Postings</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#9c27b0' }}><i className="fas fa-star-half-alt"></i></div>
                        <div className="stat-info">
                            <h3>{reportData?.feedback.average.toFixed(1)} / 5</h3>
                            <p>Satisfaction Index</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
                    {/* Revenue Trend */}
                    <div className="admin-card">
                        <h3 className="card-title">Revenue Flow (12 Months)</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={reportData?.revenueTrend}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22440f" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#22440f" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="_id.month" tickFormatter={(m) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} />
                                    <YAxis tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="revenue" stroke="#22440f" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Feedback Distribution */}
                    <div className="admin-card">
                        <h3 className="card-title">Guest Satisfaction Breakdown</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={reportData?.feedback.distribution}
                                        dataKey="count"
                                        nameKey="_id"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                    >
                                        {reportData?.feedback.distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    {/* Procurement Table */}
                    <div className="admin-card">
                        <h3 className="card-title">Procurement & Bidding</h3>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Metric</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Total Bids Received</td>
                                        <td>{reportData?.tenders.bids.reduce((acc, b) => acc + b.count, 0)}</td>
                                    </tr>
                                    {reportData?.tenders.bids.map(b => (
                                        <tr key={b._id}>
                                            <td style={{ textTransform: 'capitalize' }}>Bids {b._id}</td>
                                            <td>{b.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Booking Status Breakdown */}
                    <div className="admin-card">
                        <h3 className="card-title">Booking Distribution</h3>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Volume</th>
                                        <th>Revenue (KES)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData?.bookings.map(b => (
                                        <tr key={b._id}>
                                            <td style={{ textTransform: 'capitalize' }}>
                                                <span className={`status-badge ${b._id}`}>{b._id}</span>
                                            </td>
                                            <td>{b.count}</td>
                                            <td>{b.revenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
