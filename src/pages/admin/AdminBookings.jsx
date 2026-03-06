import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PROPERTY_NAMES = {
    limuru: 'Jumuia Limuru Country Home',
    kanamai: 'Jumuia Kanamai Beach Resort',
    kisumu: 'Jumuia Hotel Kisumu',
};

const BOARD_LABELS = { bnb: 'Bed & Breakfast', hb: 'Half Board', fb: 'Full Board', conference: 'Conference' };
const PAYMENT_LABELS = { mpesa: 'M-Pesa', bank: 'Bank Transfer', 'pay-on-arrival': 'Pay on Arrival', card: 'Card' };
const ROOM_LABELS = {
    'standard-single': 'Standard Single', 'standard-double-twin': 'Standard Double/Twin',
    'junior-suite-single': 'Junior Suite Single', 'junior-suite-double': 'Junior Suite Double',
    'standard-room': 'Standard Room', 'deluxe-room': 'Deluxe Room', 'family-room': 'Family Room',
    'hostel-bed': 'Hostel Bed', 'cottage': 'Cottage', 'conference-delegate': 'Conference Delegate'
};

export default function AdminBookings() {
    const { user } = useAuth();
    const isManager = user?.role === 'manager';
    const assignedBranch = isManager ? (user?.properties?.[0] || null) : null;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [resortFilter, setResortFilter] = useState(assignedBranch || 'all');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => { loadBookings(); }, []);

    const loadBookings = async () => {
        try {
            const res = await api.get('/bookings');
            setBookings(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/bookings/${id}`, { status });
            loadBookings();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id, isPermanent) => {
        const msg = isPermanent
            ? "Are you sure you want to PERMANENTLY delete this booking? This cannot be undone."
            : "Are you sure you want to delete this booking? It will be hidden from your view but visible to the General Manager.";

        if (window.confirm(msg)) {
            try {
                await api.delete(`/bookings/${id}`);
                loadBookings();
            } catch (err) {
                alert(err.response?.data?.message || "Error deleting booking");
            }
        }
    };

    const filtered = bookings.filter(b => {
        const matchSearch = b.guestName?.toLowerCase().includes(search.toLowerCase()) || b.email?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || b.status === statusFilter;
        const effectiveResort = isManager ? assignedBranch : resortFilter;
        const matchResort = effectiveResort === 'all' || !effectiveResort || b.resort === effectiveResort;
        return matchSearch && matchStatus && matchResort;
    });

    const getNights = (b) => {
        if (b.nights) return b.nights;
        if (b.checkIn && b.checkOut) return Math.max(1, Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / (1000 * 60 * 60 * 24)));
        return '-';
    };

    const getBoardLabel = (b) => BOARD_LABELS[b.packageType] || b.packageType || '-';
    const getPaymentLabel = (b) => PAYMENT_LABELS[b.paymentMethod] || b.paymentMethod || '-';
    const getRoomLabel = (b) => ROOM_LABELS[b.roomType] || b.roomType?.replace(/-/g, ' ') || '-';
    const getCurrency = (b) => b.currency || 'KES';

    const statusColors = {
        pending: { bg: '#fff8e1', color: '#f57f17', icon: 'fas fa-clock' },
        confirmed: { bg: '#e8f5e9', color: '#2e7d32', icon: 'fas fa-check-circle' },
        completed: { bg: '#e3f2fd', color: '#1565c0', icon: 'fas fa-flag-checkered' },
        cancelled: { bg: '#fce4ec', color: '#c62828', icon: 'fas fa-times-circle' }
    };

    // Inline Styles
    const s = {
        detailCard: { background: '#f8faf9', border: '1px solid #e8ece5', borderRadius: '12px', padding: '18px' },
        detailLabel: { fontSize: '0.68rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600', marginBottom: '3px' },
        detailValue: { fontSize: '0.88rem', fontWeight: '600', color: '#333' },
        sectionTitle: { fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary-green)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
        badge: (bg, color) => ({ display: 'inline-flex', alignItems: 'center', gap: '5px', background: bg, color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700' })
    };

    return (
        <div>
            <div className="admin-page-header">
                <h1>Bookings Management</h1>
                <p style={{ color: 'var(--text-light)', marginBottom: '4px' }}>
                    {isManager ? `Showing bookings for ` : 'View and manage all resort bookings'}
                    {isManager && <strong style={{ color: 'var(--primary-green)' }}>{PROPERTY_NAMES[assignedBranch] || assignedBranch}</strong>}
                </p>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar">
                <div className="search-box">
                    <i className="fas fa-search" style={{ color: 'var(--text-light)' }}></i>
                    <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="filter-group">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                    </select>
                    {!isManager && (
                        <select value={resortFilter} onChange={e => setResortFilter(e.target.value)}>
                            <option value="all">All Resorts</option>
                            <option value="limuru">Limuru</option>
                            <option value="kanamai">Kanamai</option>
                            <option value="kisumu">Kisumu</option>
                        </select>
                    )}
                </div>
            </div>

            {/* Summary Bar */}
            <div style={{ display: 'flex', gap: '12px', padding: '0 0 16px 0', flexWrap: 'wrap' }}>
                {['pending', 'confirmed', 'completed', 'cancelled'].map(st => {
                    const count = filtered.filter(b => b.status === st).length;
                    const sc = statusColors[st];
                    return (
                        <div key={st} onClick={() => setStatusFilter(statusFilter === st ? 'all' : st)}
                            style={{ ...s.badge(sc.bg, sc.color), cursor: 'pointer', padding: '8px 16px', fontSize: '0.8rem', border: statusFilter === st ? `2px solid ${sc.color}` : '2px solid transparent', transition: 'all 0.2s' }}>
                            <i className={sc.icon}></i> {count} {st.charAt(0).toUpperCase() + st.slice(1)}
                        </div>
                    );
                })}
            </div>

            {/* Main Table */}
            <div className="admin-card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '30px' }}></th>
                                    <th style={{ width: '30px' }}>#</th>
                                    <th>Guest</th>
                                    {!isManager && <th>Resort</th>}
                                    <th>Received On</th>
                                    <th>Dates</th>
                                    <th>Room</th>
                                    <th>Board</th>
                                    <th>Guests</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0
                                    ? <tr><td colSpan={isManager ? 11 : 12} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                                        <i className="fas fa-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px', opacity: 0.3 }}></i>No bookings found
                                    </td></tr>
                                    : filtered.map((b, index) => {
                                        const isExpanded = expandedId === b._id;
                                        const sc = statusColors[b.status] || statusColors.pending;
                                        const nights = getNights(b);
                                        const cur = getCurrency(b);
                                        const guestTypeLabel = b.guestType === 'non-residential' ? 'Non-Res (USD)' : 'Residential';
                                        const totalChildren = parseInt(b.childrenCount) || b.childrenDetails?.length || 0;
                                        const totalAdults = parseInt(b.adults) || 1;
                                        const isDeleted = b.deletedByBranch;
                                        const rowStyle = isDeleted ? { background: '#fff1f1', borderLeft: '4px solid #cc0000' } : {};

                                        return (
                                            <>
                                                {/* ── Main Row ── */}
                                                <tr key={b._id} onClick={() => {
                                                    setExpandedId(isExpanded ? null : b._id);
                                                    if (!b.isRead) api.put(`/bookings/${b._id}/read`).then(() => loadBookings());
                                                }}
                                                    style={{ ...rowStyle, cursor: 'pointer', transition: 'background 0.2s', background: b.isRead ? rowStyle.background : 'rgba(255, 121, 63, 0.05)' }}>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                            {!b.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-orange)' }}></div>}
                                                            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`} style={{ fontSize: '0.7rem', color: '#bbb', transition: 'transform 0.2s' }}></i>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-green)', fontSize: '0.85rem' }}>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <strong style={{ fontSize: '0.88rem' }}>{b.guestName || `${b.firstName || ''} ${b.lastName || ''}`}</strong>
                                                        <br /><small style={{ color: 'var(--text-light)' }}>{b.email}</small>
                                                        {b.guestType && <><br /><small style={{ ...s.badge(b.guestType === 'non-residential' ? '#fff8f0' : '#edf7f0', b.guestType === 'non-residential' ? '#e67e22' : '#2e7d32'), fontSize: '0.62rem', padding: '2px 8px' }}>{guestTypeLabel}</small></>}
                                                    </td>
                                                    {!isManager && <td><span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{b.resort}</span></td>}
                                                    <td>
                                                        {b.createdAt ? (
                                                            <>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#333' }}>
                                                                    {new Date(b.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </div>
                                                                <div style={{ fontSize: '0.68rem', color: 'var(--primary-green)', fontWeight: '600' }}>
                                                                    <i className="fas fa-clock" style={{ marginRight: '3px', fontSize: '0.6rem' }}></i>
                                                                    {new Date(b.createdAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                </div>
                                                            </>
                                                        ) : <span style={{ color: '#ccc', fontSize: '0.75rem' }}>—</span>}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '0.82rem' }}>{new Date(b.checkIn).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</div>
                                                        <div style={{ fontSize: '0.68rem', color: '#aaa' }}>to {new Date(b.checkOut).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</div>
                                                        <div style={{ fontSize: '0.62rem', color: 'var(--primary-green)', fontWeight: '600' }}>{nights} night{nights > 1 ? 's' : ''}</div>
                                                    </td>
                                                    <td style={{ fontSize: '0.82rem' }}>{getRoomLabel(b)}</td>
                                                    <td>
                                                        <span style={{ fontSize: '0.75rem', background: '#f0f4ff', color: '#3949ab', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>
                                                            {getBoardLabel(b)}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '0.82rem', textAlign: 'center' }}>
                                                        {totalAdults}A{totalChildren > 0 ? ` + ${totalChildren}C` : ''}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#333' }}>{cur} {(b.totalAmount || 0).toLocaleString()}</div>
                                                        <div style={{ fontSize: '0.62rem', color: '#aaa' }}>{getPaymentLabel(b)}</div>
                                                    </td>
                                                    <td>
                                                        {isDeleted ? (
                                                            <span style={s.badge('#ffebee', '#c62828')}>
                                                                <i className="fas fa-trash-alt" style={{ fontSize: '0.6rem' }}></i> Deleted by Branch
                                                            </span>
                                                        ) : (
                                                            <span style={s.badge(sc.bg, sc.color)}><i className={sc.icon} style={{ fontSize: '0.6rem' }}></i> {b.status}</span>
                                                        )}
                                                    </td>
                                                    <td onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <select value={b.status} onChange={e => updateStatus(b._id, e.target.value)}
                                                            disabled={isDeleted}
                                                            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.78rem', background: isDeleted ? '#f5f5f5' : 'white', cursor: isDeleted ? 'not-allowed' : 'pointer' }}>
                                                            <option value="pending">Pending</option>
                                                            <option value="confirmed">Confirmed</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleDelete(b._id, !isManager)}
                                                            title={isManager ? "Delete Booking" : "Permanently Delete Booking"}
                                                            style={{
                                                                padding: '8px', borderRadius: '8px', border: '1px solid #ffcdd2',
                                                                background: 'white', color: '#c62828', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* ── Expandable Detail Row ── */}
                                                {isExpanded && (
                                                    <tr key={`${b._id}-detail`}>
                                                        <td colSpan={isManager ? 11 : 12} style={{ background: '#fafcfa', padding: '0', borderTop: 'none' }}>
                                                            <div style={{ padding: '24px 30px', borderTop: `2px solid ${isDeleted ? '#cc0000' : 'var(--primary-green)'}` }}>

                                                                {isDeleted && (
                                                                    <div style={{
                                                                        background: '#fff1f1', border: '1px solid #ffcdd2', borderRadius: '10px',
                                                                        padding: '12px 20px', marginBottom: '20px', display: 'flex',
                                                                        alignItems: 'center', gap: '12px', color: '#c62828'
                                                                    }}>
                                                                        <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.2rem' }}></i>
                                                                        <div>
                                                                            <strong>Soft Deleted Record:</strong> This booking was deleted by <strong>{b.deletedByAdminName || 'Branch Manager'}</strong> on {new Date(b.deletedAt).toLocaleString()}.
                                                                            It is hidden from the branch manager's view and stats but retained here for your final audit.
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

                                                                    {/* Guest Info Card */}
                                                                    <div style={s.detailCard}>
                                                                        <div style={s.sectionTitle}><i className="fas fa-user-circle"></i> Guest Information</div>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Full Name</div>
                                                                                <div style={s.detailValue}>{b.guestName || `${b.firstName || ''} ${b.lastName || ''}`}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Email</div>
                                                                                <div style={s.detailValue}>{b.email || '-'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Phone</div>
                                                                                <div style={s.detailValue}>{b.phone || '-'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Guest Type</div>
                                                                                <div style={s.detailValue}>
                                                                                    <span style={s.badge(b.guestType === 'non-residential' ? '#fff8f0' : '#edf7f0', b.guestType === 'non-residential' ? '#e67e22' : '#2e7d32')}>
                                                                                        <i className={b.guestType === 'non-residential' ? 'fas fa-globe-africa' : 'fas fa-flag'} style={{ fontSize: '0.6rem' }}></i>
                                                                                        {b.guestType === 'non-residential' ? 'Non-Residential (USD)' : 'Residential (KES)'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Stay Info Card */}
                                                                    <div style={s.detailCard}>
                                                                        <div style={s.sectionTitle}><i className="fas fa-bed"></i> Stay Details</div>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Resort</div>
                                                                                <div style={s.detailValue}>{PROPERTY_NAMES[b.resort] || b.resort}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Room Type</div>
                                                                                <div style={s.detailValue}>{getRoomLabel(b)}</div>
                                                                            </div>
                                                                            <div style={{ gridColumn: '1/-1' }}>
                                                                                <div style={s.detailLabel}><i className="fas fa-calendar-plus" style={{ marginRight: '4px', color: 'var(--primary-green)' }}></i>Booking Received</div>
                                                                                <div style={{ ...s.detailValue, display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                                                                    <span style={{ background: 'var(--light-green)', color: 'var(--primary-green)', padding: '4px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.88rem' }}>
                                                                                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                                                    </span>
                                                                                    <span style={{ background: '#f0f4ff', color: '#3949ab', padding: '4px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.88rem' }}>
                                                                                        <i className="fas fa-clock" style={{ marginRight: '5px', fontSize: '0.75rem' }}></i>
                                                                                        {b.createdAt ? new Date(b.createdAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : '—'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Check-in</div>
                                                                                <div style={s.detailValue}>{b.checkIn ? new Date(b.checkIn).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Check-out</div>
                                                                                <div style={s.detailValue}>{b.checkOut ? new Date(b.checkOut).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Nights</div>
                                                                                <div style={s.detailValue}>{nights}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Meal Plan</div>
                                                                                <div style={s.detailValue}>
                                                                                    <span style={{ background: '#f0f4ff', color: '#3949ab', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600' }}>
                                                                                        {getBoardLabel(b)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Guests & Children Card */}
                                                                    <div style={s.detailCard}>
                                                                        <div style={s.sectionTitle}><i className="fas fa-users"></i> Guests & Children</div>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: totalChildren > 0 ? '14px' : '0' }}>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Adults</div>
                                                                                <div style={s.detailValue}>{totalAdults}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Children</div>
                                                                                <div style={s.detailValue}>{totalChildren}</div>
                                                                            </div>
                                                                        </div>
                                                                        {/* Per-child details */}
                                                                        {b.childrenDetails && b.childrenDetails.length > 0 && (
                                                                            <div style={{ borderTop: '1px solid #e0e6dd', paddingTop: '12px' }}>
                                                                                {b.childrenDetails.map((child, ci) => {
                                                                                    const age = parseInt(child.age) || 0;
                                                                                    let policy = 'Adult rate';
                                                                                    let policyColor = '#c62828';
                                                                                    let policyBg = '#fce4ec';
                                                                                    if (age < 3) { policy = 'Free (under 3)'; policyColor = '#2e7d32'; policyBg = '#e8f5e9'; }
                                                                                    else if (age <= 12) {
                                                                                        policy = child.sharing ? '50% – sharing' : '75% – own room';
                                                                                        policyColor = '#e65100'; policyBg = '#fff3e0';
                                                                                    }
                                                                                    return (
                                                                                        <div key={ci} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: ci < b.childrenDetails.length - 1 ? '1px solid #eee' : 'none' }}>
                                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800' }}>{ci + 1}</div>
                                                                                                <div>
                                                                                                    <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>Child {ci + 1} — Age {age}</div>
                                                                                                    <div style={{ fontSize: '0.68rem', color: '#999' }}>{child.sharing !== false ? 'Sharing with parent' : 'Own room'}</div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <span style={s.badge(policyBg, policyColor)}>{policy}</span>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Payment & Total Card */}
                                                                    <div style={s.detailCard}>
                                                                        <div style={s.sectionTitle}><i className="fas fa-receipt"></i> Payment & Total</div>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Payment Method</div>
                                                                                <div style={s.detailValue}>{getPaymentLabel(b)}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div style={s.detailLabel}>Currency</div>
                                                                                <div style={s.detailValue}>{cur}</div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Itemized breakdown if available */}
                                                                        {b.breakdown && (
                                                                            <div style={{ borderTop: '1px solid #e0e6dd', paddingTop: '12px', marginBottom: '14px' }}>
                                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.82rem' }}>
                                                                                    <span style={{ color: '#666' }}>Room ({totalAdults} Adult{totalAdults > 1 ? 's' : ''} × {nights} night{nights > 1 ? 's' : ''})</span>
                                                                                    <span style={{ fontWeight: '600' }}>{cur} {(b.breakdown.adultTotal || 0).toLocaleString()}</span>
                                                                                </div>
                                                                                {b.breakdown.childItems && b.breakdown.childItems.map((ci, idx) => (
                                                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.78rem' }}>
                                                                                        <span style={{ color: '#888' }}>{ci.label} — {ci.policy}</span>
                                                                                        <span style={{ fontWeight: '600', color: ci.total === 0 ? '#2e7d32' : '#333' }}>{ci.total === 0 ? 'FREE' : `${cur} ${ci.total.toLocaleString()}`}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {/* Grand Total */}
                                                                        <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', borderRadius: '10px', padding: '16px', textAlign: 'center', color: 'white' }}>
                                                                            <div style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Total Amount</div>
                                                                            <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{cur} {(b.totalAmount || 0).toLocaleString()}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Special Requests */}
                                                                {b.specialRequests && (
                                                                    <div style={{ ...s.detailCard, marginTop: '16px' }}>
                                                                        <div style={s.sectionTitle}><i className="fas fa-comment-dots"></i> Special Requests</div>
                                                                        <p style={{ fontSize: '0.88rem', color: '#555', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>"{b.specialRequests}"</p>
                                                                    </div>
                                                                )}

                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
