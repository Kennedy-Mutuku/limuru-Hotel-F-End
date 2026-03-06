import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminTenders() {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTenderForBids, setSelectedTenderForBids] = useState(null);
    const [bids, setBids] = useState([]);
    const [loadingBids, setLoadingBids] = useState(false);

    // New Tender FormData
    const [formData, setFormData] = useState({
        title: '',
        category: 'Goods & Supplies',
        description: '',
        requirements: '', // Will split by newline
        closingDate: '',
        resort: 'global',
        tenderDocument: ''
    });

    const [uploadingPdf, setUploadingPdf] = useState(false);

    useEffect(() => {
        fetchTenders();
    }, []);

    const fetchTenders = async () => {
        try {
            const res = await api.get('/tenders');
            setTenders(res.data);
        } catch (err) {
            console.error('Error fetching tenders', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePdfUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF document.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File too large. Max 10MB allowed.');
            return;
        }

        setUploadingPdf(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, tenderDocument: reader.result });
            setUploadingPdf(false);
        };
        reader.readAsDataURL(file);
    };

    const handleCreateTender = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                requirements: formData.requirements.split('\n').filter(r => r.trim() !== '')
            };
            await api.post('/tenders', payload);
            setShowModal(false);
            setFormData({ title: '', category: 'Goods & Supplies', description: '', requirements: '', closingDate: '', resort: 'global', tenderDocument: '' });
            fetchTenders();
        } catch (err) {
            console.error('Tender creation error:', err);
            alert('Error creating tender: ' + (err.response?.data?.message || err.message));
        }
    };

    const viewBids = async (tender) => {
        setSelectedTenderForBids(tender);
        setLoadingBids(true);
        try {
            const res = await api.get(`/tenders/${tender._id}/bids`);
            setBids(res.data);
        } catch (err) {
            console.error('Error fetching bids', err);
        } finally {
            setLoadingBids(false);
        }
    };

    const awardBid = async (bidId) => {
        if (!window.confirm('Are you sure you want to award the tender to this bidder? This will notify them and close the tender.')) return;
        try {
            await api.patch(`/tenders/bids/${bidId}/status`, { status: 'Accepted' });
            // Refresh
            if (selectedTenderForBids) {
                const res = await api.get(`/tenders/${selectedTenderForBids._id}/bids`);
                setBids(res.data);
            }
            fetchTenders();
        } catch (err) {
            alert('Error awarding bid: ' + err.message);
        }
    };

    const deleteTender = async (id) => {
        if (!window.confirm('Delete this tender and all submitted bids?')) return;
        try {
            await api.delete(`/tenders/${id}`);
            fetchTenders();
        } catch (err) {
            alert('Error deleting tender');
        }
    };

    const openPdf = (data) => {
        const newWindow = window.open();
        newWindow.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
        newWindow.document.title = "Tender Document";
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>Tender Postings</h1>
                    <p>Invite service providers and manage procurement professionally</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> Create New Tender
                </button>
            </div>

            <div className="admin-card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : tenders.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No tenders created yet.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Ref Number</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Closing Date</th>
                                    <th>Document</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenders.map(t => (
                                    <tr key={t._id}>
                                        <td><strong>{t.referenceNumber}</strong></td>
                                        <td>{t.title}</td>
                                        <td><span className="admin-badge-sm" style={{ background: '#f1f5f9', color: '#475569' }}>{t.category}</span></td>
                                        <td>{new Date(t.closingDate).toLocaleDateString()}</td>
                                        <td>
                                            {t.tenderDocument ? (
                                                <button
                                                    onClick={() => openPdf(t.tenderDocument)}
                                                    style={{ border: 'none', background: 'none', color: 'var(--primary-orange)', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                                                >
                                                    <i className="fas fa-file-pdf"></i> View PDF
                                                </button>
                                            ) : (
                                                <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.8rem' }}>No PDF</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => viewBids(t)}>
                                                View Bids
                                            </button>
                                            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ff4d4d', borderColor: '#ff4d4d' }} onClick={() => deleteTender(t._id)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Tender Modal */}
            {showModal && (
                <div className="success-modal-overlay">
                    <div className="admin-card anim-pop-in" style={{ maxWidth: '600px', width: '90%', padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                            <h2 style={{ color: 'var(--primary-green)' }}>Create New Tender</h2>
                            <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateTender}>
                            <div className="form-field-wrapper">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>TENDER TITLE</label>
                                <input className="form-control" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-field-wrapper">
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>CATEGORY</label>
                                    <select className="form-control" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option>Goods & Supplies</option>
                                        <option>Works & Construction</option>
                                        <option>Professional Services</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-field-wrapper">
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>CLOSING DATE</label>
                                    <input type="date" className="form-control" required value={formData.closingDate} onChange={e => setFormData({ ...formData, closingDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-field-wrapper">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>DESCRIPTION</label>
                                <textarea className="form-control" rows="4" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div className="form-field-wrapper">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>MANDATORY REQUIREMENTS (One per line)</label>
                                <textarea className="form-control" rows="4" placeholder="e.g. Tax Compliance Certificate" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })}></textarea>
                            </div>

                            <div className="form-field-wrapper">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>UPLOAD TENDER DOCUMENT (PDF) *</label>
                                <div
                                    onClick={() => document.getElementById('pdfInput').click()}
                                    style={{
                                        border: '2px dashed #ddd', borderRadius: '10px', padding: '20px', textAlign: 'center',
                                        cursor: 'pointer', background: formData.tenderDocument ? '#f0fff4' : '#fafafa'
                                    }}
                                >
                                    <input type="file" id="pdfInput" accept=".pdf" style={{ display: 'none' }} onChange={handlePdfUpload} />
                                    {uploadingPdf ? (
                                        <div className="spinner-sm"></div>
                                    ) : formData.tenderDocument ? (
                                        <div style={{ color: 'var(--primary-green)', fontWeight: '700' }}>
                                            <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                                            PDF Encoded Successfully
                                        </div>
                                    ) : (
                                        <div style={{ color: '#666' }}>
                                            <i className="fas fa-file-pdf" style={{ fontSize: '1.5rem', marginBottom: '10px', display: 'block' }}></i>
                                            Click to select PDF document
                                        </div>
                                    )}
                                </div>
                                <small style={{ color: '#888', marginTop: '5px', display: 'block' }}>Providing a PDF document is mandatory for professional procurement.</small>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontWeight: '800' }} disabled={uploadingPdf}>Publish Tender Opportunity</button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Bids Modal */}
            {selectedTenderForBids && (
                <div className="success-modal-overlay">
                    <div className="admin-card anim-pop-in" style={{ maxWidth: '1000px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ color: 'var(--primary-green)', margin: 0 }}>Incoming Bids: {selectedTenderForBids.referenceNumber}</h2>
                                <p style={{ color: 'var(--text-light)', margin: 0 }}>Reviewing submissions for "{selectedTenderForBids.title}"</p>
                            </div>
                            <button onClick={() => setSelectedTenderForBids(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>

                        {loadingBids ? (
                            <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                        ) : bids.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>No bids submitted yet for this tender.</p>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Company/Bidder</th>
                                            <th>Bid Amount</th>
                                            <th>Proposal Document</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bids.map(b => (
                                            <tr key={b._id}>
                                                <td>
                                                    <strong>{b.companyName}</strong>
                                                    <br /><small>{b.contactPerson} | {b.phone}</small>
                                                    <br /><small>{b.email}</small>
                                                </td>
                                                <td><strong style={{ color: 'var(--primary-green)' }}>KES {b.bidAmount.toLocaleString()}</strong></td>
                                                <td>
                                                    {b.attachmentLink ? (
                                                        <button
                                                            onClick={() => openPdf(b.attachmentLink)}
                                                            style={{ border: 'none', background: 'none', color: 'var(--primary-orange)', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                                                        >
                                                            <i className="fas fa-file-pdf" style={{ marginRight: '6px' }}></i> View Proposal Letter
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#ccc', fontStyle: 'italic' }}>No document</span>
                                                    )}
                                                </td>
                                                <td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
                                                <td>
                                                    {b.status === 'Pending' && selectedTenderForBids.status === 'Open' && (
                                                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => awardBid(b._id)}>
                                                            Award Tender
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
            )}
        </div>
    );
}
