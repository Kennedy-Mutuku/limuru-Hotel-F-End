import { useState } from 'react';
import api from '../services/api';

export default function ClaimModal({ offer, isOpen, onClose }) {
    const [formData, setFormData] = useState({
        guestName: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/offers/claim', {
                offerId: offer._id,
                resort: offer.resort,
                ...formData
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                setFormData({ guestName: '', email: '', phone: '', message: '' });
            }, 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit claim');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
            padding: '20px'
        }}>
            <div style={{
                background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px',
                overflow: 'hidden', animation: 'slideUp 0.4s ease', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{
                    background: 'var(--primary-green)', color: 'white', padding: '25px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>Claim Special Offer</h3>
                        <p style={{ margin: '5px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>{offer.title}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '30px' }}>
                    {success ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{
                                width: '70px', height: '70px', background: '#e8f5e9', color: '#2e7d32',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px', fontSize: '2rem'
                            }}>
                                <i className="fas fa-check"></i>
                            </div>
                            <h4 style={{ marginBottom: '10px' }}>Claim Submitted!</h4>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Thank you for your interest. Our team from {offer.resort === 'global' ? 'the resort' : offer.resort} will contact you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
                                <input
                                    required className="form-control" placeholder="Enter your name"
                                    style={{ padding: '12px' }}
                                    value={formData.guestName} onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Email</label>
                                    <input
                                        required type="email" className="form-control" placeholder="Email address"
                                        style={{ padding: '12px' }}
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Phone</label>
                                    <input
                                        required className="form-control" placeholder="Phone number"
                                        style={{ padding: '12px' }}
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Special Requests / Message</label>
                                <textarea
                                    className="form-control" placeholder="Any specific requirements?" rows="3"
                                    style={{ padding: '12px' }}
                                    value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="btn btn-primary"
                                style={{ padding: '15px', fontWeight: '700', letterSpacing: '1px', marginTop: '10px' }}
                            >
                                {loading ? 'Processing...' : 'CONFIRM CLAIM'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
