import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PROPERTY_NAMES = {
    limuru: 'Jumuia Limuru Country Home',
    kanamai: 'Jumuia Kanamai Beach Resort',
    kisumu: 'Jumuia Hotel Kisumu',
};

export default function AdminFeedback() {
    const { user } = useAuth();
    const isManager = user?.role === 'manager';
    const assignedBranch = isManager ? (user?.properties?.[0] || null) : null;

    // Unified State
    const [feedbacks, setFeedbacks] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(assignedBranch || 'all');

    // Messages specific state
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [feedRes, msgRes] = await Promise.all([
                api.get('/feedback'),
                api.get('/messages')
            ]);

            setFeedbacks(feedRes.data);

            const sortedMsgs = msgRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setMessages(sortedMsgs);
        } catch (err) {
            console.error('Error loading data', err);
        } finally {
            setLoading(false);
        }
    };

    // Filters
    const effectiveFilter = isManager ? assignedBranch : filter;

    // Filtered Feedbacks
    const filteredFeedbacks = (!effectiveFilter || effectiveFilter === 'all')
        ? feedbacks
        : feedbacks.filter(f => f.resort === effectiveFilter);

    // Filtered Messages
    const filteredMessages = (!effectiveFilter || effectiveFilter === 'all')
        ? messages
        : messages.filter(m => {
            if (effectiveFilter === 'general') return !m.resort || m.resort === '';
            return m.resort === effectiveFilter;
        });

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>Guest Communications</h1>
                    <p style={{ color: 'var(--text-light)', marginBottom: isManager ? '6px' : '0' }}>
                        {isManager
                            ? <>Showing guest activity for <strong style={{ color: 'var(--primary-green)' }}>{PROPERTY_NAMES[assignedBranch]}</strong></>
                            : 'Monitor guest reviews, feedback ratings, and direct contact inquiries in one place.'
                        }
                    </p>
                </div>
            </div>

            {/* Resort filter (Global across both sections) */}
            {!isManager && (
                <div className="admin-toolbar" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'flex-start' }}>
                    <div className="filter-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', display: 'block', color: 'var(--text-light)' }}>Filter by Property</label>
                        <select value={filter} onChange={e => { setFilter(e.target.value); setSelectedMessage(null); }} style={{ minWidth: '200px' }}>
                            <option value="all">All Properties</option>
                            <option value="limuru">Limuru</option>
                            <option value="kanamai">Kanamai</option>
                            <option value="kisumu">Kisumu</option>
                            <option value="general">General Inquiry</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Section 1: Feedback */}
            <div style={{ marginBottom: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <i className="fas fa-star" style={{ color: 'var(--primary-orange)' }}></i>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-green)' }}>Guest Feedback & Ratings</h2>
                </div>

                <div className="admin-card">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                    ) : filteredFeedbacks.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                            No feedback found{isManager ? ` for ${PROPERTY_NAMES[assignedBranch]}` : ''} under this filter.
                        </p>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Guest</th>
                                        {!isManager && <th>Resort</th>}
                                        <th>Rating</th>
                                        <th>Feedback</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFeedbacks.map(f => (
                                        <tr
                                            key={f._id}
                                            onClick={() => !f.isRead && api.put(`/feedback/${f._id}/read`).then(() => loadData())}
                                            style={{
                                                cursor: 'pointer',
                                                background: f.isRead ? 'transparent' : 'rgba(255, 121, 63, 0.05)',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {!f.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-orange)', flexShrink: 0 }}></div>}
                                                    <div>
                                                        <strong>{f.name}</strong>
                                                        <br /><small style={{ color: 'var(--text-light)' }}>{f.email}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            {!isManager && (
                                                <td style={{ textTransform: 'capitalize' }}>
                                                    <span className="status-badge confirmed">{f.resort}</span>
                                                </td>
                                            )}
                                            <td>
                                                <span style={{ color: 'var(--primary-orange)', fontSize: '1rem' }}>
                                                    {'★'.repeat(f.rating || 0)}{'☆'.repeat(5 - (f.rating || 0))}
                                                </span>
                                                <span style={{ marginLeft: '6px', fontWeight: '600', fontSize: '0.85rem' }}>{f.rating}/5</span>
                                            </td>
                                            <td style={{ maxWidth: '300px', lineHeight: '1.5' }}>{f.comment || f.message}</td>
                                            <td style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                                                {new Date(f.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Section 2: Messages */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <i className="fas fa-envelope" style={{ color: 'var(--primary-green)' }}></i>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-green)' }}>Contact Us Inquiries</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1.1fr 0.9fr' : '1fr', gap: '24px', alignItems: 'start' }}>
                    <div className="admin-card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--gray-border)' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                        ) : filteredMessages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-light)' }}>
                                <i className="fas fa-inbox" style={{ display: 'block', fontSize: '2.5rem', marginBottom: '15px', opacity: 0.2 }}></i>
                                <h3 style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)' }}>No messages found</h3>
                            </div>
                        ) : (
                            <div className="admin-message-list">
                                {filteredMessages.map(m => {
                                    const fullName = m.firstName ? `${m.firstName} ${m.lastName}` : (m.name || 'Anonymous Guest');
                                    const isActive = selectedMessage?._id === m._id;
                                    return (
                                        <div
                                            key={m._id}
                                            onClick={() => {
                                                setSelectedMessage(m);
                                                if (!m.isRead) api.put(`/feedback/${m._id}/read`).then(() => loadData());
                                            }}
                                            style={{
                                                padding: '22px 30px',
                                                borderBottom: '1px solid #f1f5f9',
                                                cursor: 'pointer',
                                                background: isActive ? '#f8fafc' : (m.isRead ? 'white' : 'rgba(255, 121, 63, 0.05)'),
                                                transition: 'all 0.2s',
                                                borderLeft: isActive ? '5px solid var(--primary-green)' : (m.isRead ? '5px solid transparent' : '5px solid var(--primary-orange)'),
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                <div>
                                                    <h4 style={{ margin: 0, color: isActive ? 'var(--primary-green)' : 'var(--text-main)', fontSize: '1.1rem', fontWeight: '700' }}>{fullName}</h4>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px' }}>
                                                        <i className="far fa-calendar-alt" style={{ marginRight: '6px' }}></i>
                                                        {new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                                {m.resort ? (
                                                    <span className="admin-badge-sm" style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                                                        {m.resort.toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <span className="admin-badge-sm" style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                                                        GENERAL
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#334155', marginBottom: '10px' }}>{m.subject}</div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: 0, maxWidth: '75%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {m.message}
                                                </p>

                                                <button
                                                    className="view-detail-btn"
                                                    style={{
                                                        background: isActive ? 'var(--primary-green)' : 'transparent',
                                                        border: `1px solid ${isActive ? 'var(--primary-green)' : '#cbd5e1'}`,
                                                        color: isActive ? 'white' : 'var(--text-light)',
                                                        padding: '6px 14px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '700',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <span>View Detail</span>
                                                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {selectedMessage && (
                        <div className="admin-card anim-fade-in" style={{ position: 'sticky', top: '20px', alignSelf: 'start', padding: '35px', border: '1px solid var(--gray-border)', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '30px', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                                    <h2 style={{ margin: 0, color: 'var(--primary-green)', fontSize: '1.8rem', fontFamily: 'Playfair Display, serif', fontWeight: '700' }}>{selectedMessage.subject}</h2>
                                    <button onClick={() => setSelectedMessage(null)} style={{ background: '#f1f5f9', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '1.1rem', padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', fontSize: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--light-green)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sender</div>
                                            <strong style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>{selectedMessage.firstName ? `${selectedMessage.firstName} ${selectedMessage.lastName}` : (selectedMessage.name || 'Anonymous')}</strong>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f1f5f9', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                            <i className="fas fa-hotel"></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resort</div>
                                            <strong style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>{selectedMessage.resort ? selectedMessage.resort.toUpperCase() : 'GENERAL INQUIRY'}</strong>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f1f5f9', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</div>
                                            <a href={`mailto:${selectedMessage.email}`} style={{ color: 'var(--primary-green)', textDecoration: 'none', fontWeight: '700', fontSize: '1.05rem' }}>{selectedMessage.email}</a>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f1f5f9', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                            <i className="fas fa-phone"></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</div>
                                            <a href={`tel:${selectedMessage.phone}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: '700', fontSize: '1.05rem' }}>{selectedMessage.phone}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '35px', borderRadius: '15px', border: '1px solid #e2e8f0', marginBottom: '35px', minHeight: '220px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Message Details</div>
                                <p style={{ lineHeight: '1.9', margin: 0, whiteSpace: 'pre-wrap', color: '#1e293b', fontSize: '1.1rem' }}>{selectedMessage.message}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '16px', borderRadius: '10px', fontSize: '1.1rem', fontWeight: '700' }} onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}>
                                    <i className="fas fa-paper-plane" style={{ marginRight: '12px' }}></i> Send Response via Email
                                </button>
                                <button className="btn btn-outline" style={{ padding: '16px 30px', borderRadius: '10px', fontWeight: '700' }} onClick={() => setSelectedMessage(null)}>Close</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
