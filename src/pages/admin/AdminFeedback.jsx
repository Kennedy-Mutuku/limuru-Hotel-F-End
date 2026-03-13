import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './AdminFeedback.css';

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

    // Detail/Selection state
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

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

    const handleDeleteFeedback = async (id) => {
        if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
            try {
                await api.delete(`/feedback/${id}`);
                setSelectedFeedback(null);
                loadData();
            } catch (err) {
                console.error('Error deleting feedback', err);
                alert('Failed to delete feedback');
            }
        }
    };

    const handleDeleteMessage = async (id) => {
        if (window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
            try {
                await api.delete(`/messages/${id}`);
                setSelectedMessage(null);
                loadData();
            } catch (err) {
                console.error('Error deleting message', err);
                alert('Failed to delete inquiry');
            }
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
        <div className="admin-feedback-container">
            <div className="admin-page-header">
                <div>
                    <h1>Guest Communications</h1>
                    <p className="header-description">
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
                <div className="section-header-admin">
                    <i className="fas fa-star" style={{ color: 'var(--primary-orange)' }}></i>
                    <h2>Guest Feedback & Ratings</h2>
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFeedbacks.map(f => (
                                        <tr
                                            key={f._id}
                                            onClick={() => {
                                                setSelectedFeedback(f);
                                                if (!f.isRead) api.put(`/feedback/${f._id}/read`).then(() => loadData());
                                            }}
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
                                            <td style={{ maxWidth: '300px' }} className="text-truncate">{f.comment || f.message}</td>
                                            <td style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                                                {new Date(f.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <button 
                                                    className="delete-action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteFeedback(f._id);
                                                    }}
                                                    title="Delete Feedback"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
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
            <div className="messages-section-wrapper">
                <div className="section-header-admin">
                    <i className="fas fa-envelope" style={{ color: 'var(--primary-green)' }}></i>
                    <h2>Contact Us Inquiries</h2>
                </div>

                <div className={`messages-grid-context ${selectedMessage ? 'with-selection' : ''}`}>
                    <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
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
                                            className="admin-message-item"
                                            onClick={() => {
                                                setSelectedMessage(m);
                                                if (!m.isRead) api.put(`/feedback/${m._id}/read`).then(() => loadData());
                                                // On mobile, find the detail card and scroll to it if not visible
                                                if (window.innerWidth < 1024) {
                                                    setTimeout(() => {
                                                        const detail = document.getElementById('message-detail-view');
                                                        if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }, 100);
                                                }
                                            }}
                                            style={{
                                                background: isActive ? '#f8fafc' : (m.isRead ? 'white' : 'rgba(255, 121, 63, 0.05)'),
                                                borderLeft: isActive ? '5px solid var(--primary-green)' : (m.isRead ? '5px solid transparent' : '5px solid var(--primary-orange)'),
                                            }}
                                        >
                                            <div className="message-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
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

                                            <div className="message-item-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', maxWidth: '75%', flex: 1 }}>
                                                    <p className="text-truncate" style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: 0 }}>
                                                        {m.message}
                                                    </p>
                                                    <button 
                                                        className="delete-action-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMessage(m._id);
                                                        }}
                                                        style={{ padding: '6px', fontSize: '0.8rem' }}
                                                        title="Delete Inquiry"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>

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
                        <div id="message-detail-view" className="detail-view-card anim-fade-in sticky-detail">
                            <div className="detail-view-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '30px', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                                    <h2 style={{ margin: 0, color: 'var(--primary-green)', fontSize: '1.8rem', fontFamily: 'Playfair Display, serif', fontWeight: '700' }}>{selectedMessage.subject}</h2>
                                    <button className="close-detail-btn" onClick={() => setSelectedMessage(null)} style={{ background: '#f1f5f9', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '1.1rem', padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="detail-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', fontSize: '1rem' }}>
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

                            <div className="detail-message-body" style={{ background: '#f8fafc', padding: '35px', borderRadius: '15px', border: '1px solid #e2e8f0', marginBottom: '35px', minHeight: '220px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Message Details</div>
                                <p style={{ lineHeight: '1.9', margin: 0, whiteSpace: 'pre-wrap', color: '#1e293b', fontSize: '1.1rem' }}>{selectedMessage.message}</p>
                            </div>

                            <div className="detail-actions" style={{ display: 'flex', gap: '20px' }}>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '16px', borderRadius: '10px', fontSize: '1.1rem', fontWeight: '700' }} onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}>
                                    <i className="fas fa-paper-plane" style={{ marginRight: '12px' }}></i> Send Response via Email
                                </button>
                                <button 
                                    className="btn" 
                                    style={{ background: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffa39e', padding: '16px 25px', borderRadius: '10px', fontWeight: '700' }}
                                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                                >
                                    <i className="fas fa-trash-alt" style={{ marginRight: '8px' }}></i> Delete
                                </button>
                                <button className="btn btn-outline" style={{ padding: '16px 30px', borderRadius: '10px', fontWeight: '700' }} onClick={() => setSelectedMessage(null)}>Close</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section 3: Feedback Detail Modal */}
            {selectedFeedback && (
                <div className="admin-modal-overlay" onClick={() => setSelectedFeedback(null)}>
                    <div className="feedback-detail-modal" onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '25px', background: 'var(--primary-green)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: 'white!important', border: 'none' }}>Review Feedback</h3>
                            <button onClick={() => setSelectedFeedback(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div style={{ padding: '30px' }}>
                            <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: '700' }}>{selectedFeedback.name}</h4>
                                    <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>{selectedFeedback.email}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--primary-orange)', fontSize: '1.2rem', marginBottom: '5px' }}>
                                        {'★'.repeat(selectedFeedback.rating || 0)}{'☆'.repeat(5 - (selectedFeedback.rating || 0))}
                                    </div>
                                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{selectedFeedback.rating}/5 Rating</span>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Guest Comment</div>
                                <p style={{ margin: 0, lineHeight: '1.6', color: '#1e293b' }}>{selectedFeedback.comment || selectedFeedback.message || "No comment provided."}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div style={{ background: '#f1f5f9', padding: '12px 15px', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase' }}>Property</span>
                                    <strong style={{ fontSize: '0.9rem', color: 'var(--primary-green)' }}>{PROPERTY_NAMES[selectedFeedback.resort] || selectedFeedback.resort?.toUpperCase()}</strong>
                                </div>
                                <div style={{ background: '#f1f5f9', padding: '12px 15px', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase' }}>Submitted On</span>
                                    <strong style={{ fontSize: '0.9rem' }}>{new Date(selectedFeedback.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</strong>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button 
                                    className="btn" 
                                    style={{ flex: 1, background: '#ff4d4f', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                                    onClick={() => handleDeleteFeedback(selectedFeedback._id)}
                                >
                                    <i className="fas fa-trash-alt" style={{ marginRight: '8px' }}></i> Delete Permanently
                                </button>
                                <button className="btn btn-outline" style={{ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setSelectedFeedback(null)}>Dismiss</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
