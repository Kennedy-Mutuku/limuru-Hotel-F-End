import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminBids() {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBids();
    }, []);

    const fetchBids = async () => {
        try {
            const res = await api.get('/tenders/admin/all-bids');
            setBids(res.data);
        } catch (err) {
            console.error('Error fetching bids', err);
        } finally {
            setLoading(false);
        }
    };

    const awardBid = async (bid) => {
        if (!window.confirm(`Are you sure you want to award the tender "${bid.tender?.title}" to "${bid.companyName}"?`)) return;
        try {
            await api.patch(`/tenders/bids/${bid._id}/status`, { status: 'Accepted' });
            fetchBids();
        } catch (err) {
            alert('Error awarding bid: ' + err.message);
        }
    };

    const openPdf = (data) => {
        if (!data) return;
        const newWindow = window.open();
        newWindow.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
        newWindow.document.title = "Bid Proposal";
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="admin-page-header">
                <div>
                    <h1>Tender Bidders</h1>
                    <p>Review and award all incoming procurement bids professionally</p>
                </div>
            </div>

            <div className="admin-card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : bids.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
                        <i className="fas fa-users-slash" style={{ fontSize: '3rem', opacity: 0.2, display: 'block', marginBottom: '20px' }}></i>
                        <h3>No Bids Received</h3>
                        <p>Waiting for service providers to submit their proposals.</p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Bidder Detail</th>
                                    <th>Tender Ref / Title</th>
                                    <th>Bid Amount</th>
                                    <th>Proposal</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bids.map(b => (
                                    <tr
                                        key={b._id}
                                        onClick={() => !b.isRead && api.put(`/tenders/bids/${b._id}/read`).then(() => fetchBids())}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            background: b.isRead ? 'transparent' : 'rgba(255, 121, 63, 0.05)'
                                        }}
                                        className={b.isRead ? '' : 'unread-row'}
                                    >
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {!b.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-orange)', flexShrink: 0 }}></div>}
                                                <div>
                                                    <div style={{ fontWeight: '700', color: 'var(--primary-green)' }}>{b.companyName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{b.contactPerson} · {b.phone}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#888' }}>{b.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-orange)' }}>{b.tender?.referenceNumber || 'N/A'}</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{b.tender?.title || 'Unknown Tender'}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '800' }}>KES {(b.bidAmount || 0).toLocaleString()}</div>
                                        </td>
                                        <td>
                                            {b.attachmentLink ? (
                                                <button
                                                    onClick={() => openPdf(b.attachmentLink)}
                                                    style={{ border: 'none', background: 'none', color: 'var(--primary-orange)', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                                                >
                                                    <i className="fas fa-file-pdf"></i> View PDF
                                                </button>
                                            ) : (
                                                <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.75rem' }}>No Document</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {b.status === 'Pending' && (
                                                <button className="btn btn-primary" style={{ padding: '6px 15px', fontSize: '0.75rem' }} onClick={() => awardBid(b)}>
                                                    Award
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
