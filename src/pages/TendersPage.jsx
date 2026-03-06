import { useState, useEffect } from 'react';
import api from '../services/api';
import './PageStyles.css';

export default function TendersPage() {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTender, setSelectedTender] = useState(null);
    const [bidData, setBidData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        bidAmount: '',
        attachmentLink: ''
    });
    const [bidStatus, setBidStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    useEffect(() => {
        fetchTenders();
    }, []);

    const fetchTenders = async () => {
        try {
            const res = await api.get('/tenders');
            setTenders(res.data.filter(t => t.status === 'Open'));
        } catch (err) {
            console.error('Error fetching tenders', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBidLetterUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload your bid letter in PDF format.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File too large. Max 10MB allowed.');
            return;
        }

        setUploadingPdf(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setBidData({ ...bidData, attachmentLink: reader.result });
            setUploadingPdf(false);
        };
        reader.readAsDataURL(file);
    };

    const handleBidSubmit = async (e) => {
        e.preventDefault();

        if (!bidData.attachmentLink) {
            alert('Please upload your official bid letter (PDF).');
            return;
        }

        setSubmitting(true);
        setBidStatus(null);
        try {
            await api.post('/tenders/bid', {
                ...bidData,
                tenderId: selectedTender._id
            });
            setBidStatus({ type: 'success', message: 'Bid submitted successfully! Our procurement team will review your proposal.' });
            setBidData({ companyName: '', contactPerson: '', email: '', phone: '', bidAmount: '', attachmentLink: '' });
            setTimeout(() => {
                setSelectedTender(null);
                setBidStatus(null);
            }, 3000);
        } catch (err) {
            setBidStatus({ type: 'error', message: err.response?.data?.message || 'Failed to submit bid.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="tenders-page">
            <section className="page-hero" style={{ backgroundImage: "url('/images/resorts/limuru/resort3.jpg')" }}>
                <div className="container">
                    <h1>Procurement Opportunities</h1>
                    <p>Partner with Jumuia Resorts in delivering excellence</p>
                </div>
            </section>

            <section className="container" style={{ padding: '80px 0' }}>
                <div className="section-header">
                    <h2>Open Tenders</h2>
                    <p>Browse our current procurement opportunities and submit your professional bid.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : tenders.length === 0 ? (
                    <div className="admin-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <i className="fas fa-folder-open" style={{ fontSize: '3rem', opacity: 0.2, display: 'block', marginBottom: '20px' }}></i>
                        <h3>No Open Tenders</h3>
                        <p style={{ color: 'var(--text-light)' }}>There are currently no open procurement opportunities. Please check back later.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                        {tenders.map(t => (
                            <div key={t._id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #eee', transition: 'transform 0.3s', cursor: 'pointer' }} onClick={() => setSelectedTender(t)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'var(--light-green)', color: 'var(--primary-green)', padding: '4px 10px', borderRadius: '15px' }}>{t.category}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Ref: {t.referenceNumber}</span>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--primary-green)' }}>{t.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', flex: 1, marginBottom: '20px', lineHeight: '1.6' }}>
                                    {t.description.substring(0, 150)}...
                                </p>
                                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Closing Date</div>
                                        <strong style={{ color: 'var(--primary-orange)' }}>{new Date(t.closingDate).toLocaleDateString()}</strong>
                                    </div>
                                    <button className="btn btn-outline" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Application Modal */}
            {selectedTender && (
                <div className="success-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="admin-card anim-pop-in" style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '40px', position: 'relative' }}>
                        <button onClick={() => setSelectedTender(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#ccc' }}>&times;</button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }}>
                            <div>
                                <div style={{ marginBottom: '30px' }}>
                                    <span style={{ background: 'var(--primary-green)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '15px', display: 'inline-block' }}>{selectedTender.category}</span>
                                    <h2 style={{ fontSize: '2rem', color: 'var(--primary-green)', marginBottom: '10px' }}>{selectedTender.title}</h2>
                                    <p style={{ color: 'var(--text-light)', fontWeight: '600' }}>Reference: {selectedTender.referenceNumber}</p>
                                </div>

                                <div style={{ marginBottom: '30px' }}>
                                    <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', borderLeft: '4px solid var(--primary-orange)', paddingLeft: '15px' }}>Description</h4>
                                    <p style={{ lineHeight: '1.8', color: '#555' }}>{selectedTender.description}</p>
                                </div>

                                {selectedTender.requirements?.length > 0 && (
                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', borderLeft: '4px solid var(--primary-orange)', paddingLeft: '15px' }}>Mandatory Requirements</h4>
                                        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
                                            {selectedTender.requirements.map((req, i) => (
                                                <li key={i}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <i className="fas fa-clock" style={{ fontSize: '1.5rem', color: 'var(--primary-orange)' }}></i>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '700' }}>SUBMISSION DEADLINE</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>{new Date(selectedTender.closingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                    </div>
                                    {selectedTender.tenderDocument && (
                                        <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                            <button
                                                className="btn btn-outline"
                                                style={{ width: '100%', borderColor: 'var(--primary-orange)', color: 'var(--primary-orange)', fontWeight: '700' }}
                                                onClick={() => {
                                                    const newWindow = window.open();
                                                    newWindow.document.write(`<iframe src="${selectedTender.tenderDocument}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                                                    newWindow.document.title = "Tender Document";
                                                }}
                                            >
                                                <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i> View Official Tender Document
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ background: '#fff', border: '1px solid #eee', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginBottom: '25px', textAlign: 'center', color: 'var(--primary-green)' }}>Application Portal</h3>
                                {bidStatus && (
                                    <div className={`alert alert-${bidStatus.type}`} style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
                                        {bidStatus.message}
                                    </div>
                                )}
                                <form onSubmit={handleBidSubmit}>
                                    <div className="form-field-wrapper">
                                        <input className="form-control" placeholder="Company Name *" required value={bidData.companyName} onChange={e => setBidData({ ...bidData, companyName: e.target.value })} />
                                    </div>
                                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="form-field-wrapper">
                                            <input className="form-control" placeholder="Contact Person *" required value={bidData.contactPerson} onChange={e => setBidData({ ...bidData, contactPerson: e.target.value })} />
                                        </div>
                                        <div className="form-field-wrapper">
                                            <input className="form-control" placeholder="Phone *" required value={bidData.phone} onChange={e => setBidData({ ...bidData, phone: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-field-wrapper">
                                        <input type="email" className="form-control" placeholder="Email Address *" required value={bidData.email} onChange={e => setBidData({ ...bidData, email: e.target.value })} />
                                    </div>
                                    <div className="form-field-wrapper">
                                        <input type="number" className="form-control" placeholder="Bid Amount (KES) *" required value={bidData.bidAmount} onChange={e => setBidData({ ...bidData, bidAmount: e.target.value })} />
                                        <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '5px' }}>Include total project cost inclusive of all taxes.</small>
                                    </div>
                                    <div className="form-field-wrapper">
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>OFFICIAL BID LETTER (PDF) *</label>
                                        <div
                                            onClick={() => document.getElementById('bidLetter').click()}
                                            style={{
                                                border: '2px dashed #ddd', borderRadius: '10px', padding: '20px', textAlign: 'center',
                                                cursor: 'pointer', background: bidData.attachmentLink ? '#f0fff4' : '#fafafa',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-orange)'}
                                            onMouseOut={e => e.currentTarget.style.borderColor = '#ddd'}
                                        >
                                            <input type="file" id="bidLetter" accept=".pdf" style={{ display: 'none' }} onChange={handleBidLetterUpload} />
                                            {uploadingPdf ? (
                                                <div className="spinner-sm" style={{ margin: '0 auto' }}></div>
                                            ) : bidData.attachmentLink ? (
                                                <div style={{ color: 'var(--primary-green)', fontWeight: '700' }}>
                                                    <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                                                    Document Attached
                                                </div>
                                            ) : (
                                                <div style={{ color: '#666' }}>
                                                    <i className="fas fa-file-pdf" style={{ fontSize: '1.5rem', marginBottom: '10px', display: 'block' }}></i>
                                                    Click to upload professional bid letter
                                                </div>
                                            )}
                                        </div>
                                        <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '10px' }}>Upload your formal proposal letter in PDF format (Max 10MB).</small>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontWeight: '800', marginTop: '10px' }} disabled={submitting || uploadingPdf}>
                                        {submitting ? 'Submitting Application...' : 'Confirm Submission'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
