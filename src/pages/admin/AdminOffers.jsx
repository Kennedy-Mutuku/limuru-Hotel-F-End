import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function AdminOffers() {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') || 'offers';

    const [offers, setOffers] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(tabParam);
    const [showForm, setShowForm] = useState(false);
    const [user, setUser] = useState(null);
    const [cropMode, setCropMode] = useState(false);
    const [originalImage, setOriginalImage] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        resort: '',
        price: '',
        discount: '',
        image: '',
        validUntil: ''
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        if (userData?.role === 'manager') {
            setFormData(prev => ({ ...prev, resort: userData.properties?.[0] || '' }));
        }
    }, []);

    useEffect(() => {
        setActiveTab(tabParam);
    }, [tabParam]);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'offers') {
                const res = await api.get('/offers');
                setOffers(res.data);
            } else {
                const res = await api.get('/offers/claims');
                setClaims(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send exactly what the backend expects
            const dataToSubmit = {
                title: formData.title,
                description: formData.description,
                resort: formData.resort,
                validUntil: formData.validUntil,
                price: formData.price || undefined,
                discount: formData.discount || undefined,
                image: formData.image || undefined
            };

            await api.post('/offers', dataToSubmit);
            setShowForm(false);
            setFormData({
                title: '',
                description: '',
                resort: user?.role === 'manager' ? user.properties?.[0] : '',
                price: '',
                discount: '',
                image: '',
                validUntil: ''
            });
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving offer');
        }
    };

    const deleteOffer = async (id) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            try {
                await api.delete(`/offers/${id}`);
                loadData();
            } catch (err) {
                alert('Failed to delete offer');
            }
        }
    };

    const updateClaimStatus = async (id, status) => {
        try {
            await api.put(`/offers/claims/${id}`, { status });
            loadData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#2e7d32';
            case 'contacted': return '#ed6c02';
            default: return '#0288d1';
        }
    };

    const headerTitle = activeTab === 'offers' ? 'Offer Postings' : 'Offer Claims';
    const headerSub = activeTab === 'offers' ? 'Manage promotional deals and strategic marketing' : 'Track and manage customer interests and redemptions';

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>{headerTitle}</h1>
                    <p>{headerSub}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ background: '#f0f2f0', padding: '5px', borderRadius: '12px', display: 'flex' }}>
                        <button
                            className={`btn ${activeTab === 'offers' ? 'btn-primary' : ''}`}
                            style={{ background: activeTab === 'offers' ? '' : 'transparent', color: activeTab === 'offers' ? '' : '#666', border: 'none', boxShadow: 'none' }}
                            onClick={() => handleTabChange('offers')}
                        >
                            Postings
                        </button>
                        <button
                            className={`btn ${activeTab === 'claims' ? 'btn-primary' : ''}`}
                            style={{ background: activeTab === 'claims' ? '' : 'transparent', color: activeTab === 'claims' ? '' : '#666', border: 'none', boxShadow: 'none' }}
                            onClick={() => handleTabChange('claims')}
                        >
                            Claims
                        </button>
                    </div>
                    {activeTab === 'offers' && (
                        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                            <i className={`fas fa-${showForm ? 'times' : 'plus'}`}></i> {showForm ? 'Close Form' : 'New Offer'}
                        </button>
                    )}
                </div>
            </div>

            {showForm && activeTab === 'offers' && (
                <div className="admin-card" style={{ animation: 'slideDown 0.3s ease', marginBottom: '30px', borderTop: '4px solid var(--primary-green)' }}>
                    <h3 style={{ marginBottom: '20px' }}><i className="fas fa-magic" style={{ marginRight: '10px' }}></i>Create Strategic Offer</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>Title *</label>
                            <input className="form-control" placeholder="e.g., Easter Family Weekend" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>Resort Visibility *</label>
                            <select
                                className="form-control"
                                value={formData.resort}
                                onChange={e => setFormData({ ...formData, resort: e.target.value })}
                                required
                                disabled={user?.role === 'manager'}
                            >
                                <option value="">Select Target</option>
                                <option value="global">Global (All Resorts)</option>
                                <option value="limuru">Limuru</option>
                                <option value="kanamai">Kanamai</option>
                                <option value="kisumu">Kisumu</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 3' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>Description *</label>
                            <textarea className="form-control" placeholder="Compelling description of the offer..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows="2"></textarea>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>Price (KES)</label>
                            <input type="number" className="form-control" placeholder="Starting price" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>Discount (%)</label>
                            <input type="number" className="form-control" placeholder="Percentage" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>Valid Until *</label>
                            <input type="date" className="form-control" value={formData.validUntil} onChange={e => setFormData({ ...formData, validUntil: e.target.value })} required />
                        </div>
                        <div style={{ gridColumn: 'span 3' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>Offer Banner (Optional)</label>

                            {cropMode && originalImage ? (
                                <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.8rem', marginBottom: '15px', color: '#666' }}>Adjust your image (Center Crop 1:1 Square)</p>
                                    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', border: '2px solid var(--primary-green)', borderRadius: '8px', overflow: 'hidden' }}>
                                        <canvas id="cropCanvas" style={{ maxWidth: '100%', display: 'block' }}></canvas>
                                    </div>
                                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => {
                                                const canvas = document.getElementById('cropCanvas');
                                                setFormData({ ...formData, image: canvas.toDataURL('image/jpeg', 0.8) });
                                                setCropMode(false);
                                            }}
                                        >
                                            Save Crop
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setCropMode(false)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => document.getElementById('imagePicker').click()}
                                    style={{
                                        border: '2px dashed #ddd', borderRadius: '12px', padding: '30px', textAlign: 'center',
                                        cursor: 'pointer', background: '#fcfcfc', transition: 'all 0.3s ease',
                                        position: 'relative', overflow: 'hidden'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-green)'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = '#ddd'}
                                >
                                    <input
                                        id="imagePicker"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                if (file.size > 10 * 1024 * 1024) return alert('Image too large. Please select an image under 10MB.');
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setOriginalImage(reader.result);
                                                    setCropMode(true);

                                                    // Initialize canvas for cropping
                                                    setTimeout(() => {
                                                        const canvas = document.getElementById('cropCanvas');
                                                        const ctx = canvas.getContext('2d');
                                                        const img = new Image();
                                                        img.onload = () => {
                                                            // Calculate 1:1 square crop
                                                            const targetAspect = 1;
                                                            let srcW = img.width;
                                                            let srcH = img.height;
                                                            let srcX = 0;
                                                            let srcY = 0;

                                                            if (srcW / srcH > targetAspect) {
                                                                srcW = srcH * targetAspect;
                                                                srcX = (img.width - srcW) / 2;
                                                            } else {
                                                                srcH = srcW / targetAspect;
                                                                srcY = (img.height - srcH) / 2;
                                                            }

                                                            canvas.width = 800;
                                                            canvas.height = 800;
                                                            ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, 800, 800);
                                                        };
                                                        img.src = reader.result;
                                                    }, 100);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    {formData.image ? (
                                        <div style={{ position: 'relative' }}>
                                            <img src={formData.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '10px' }} />
                                            <div style={{
                                                position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)',
                                                color: 'white', padding: '5px 10px', borderRadius: '20px', fontSize: '0.7rem'
                                            }}>Click to change</div>
                                        </div>
                                    ) : (
                                        <div style={{ color: '#999' }}>
                                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                                            <span>Click to upload banner (Auto-crops to 1:1 Square)</span>
                                            <p style={{ fontSize: '0.7rem', marginTop: '5px' }}>JPG, PNG or WEBP (Max 10MB)</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ gridColumn: 'span 3', display: 'flex', gap: '15px', marginTop: '10px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px' }}>Publish Offer</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-card" style={{ padding: '0' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : activeTab === 'offers' ? (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Offer Detail</th>
                                    <th>Target</th>
                                    <th>Price/Disc</th>
                                    <th>Validity</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offers.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No offers found</td></tr>
                                ) : offers.map(o => (
                                    <tr key={o._id}>
                                        <td>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <img src={o.image} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
                                                <div>
                                                    <div style={{ fontWeight: '700', color: 'var(--primary-green)' }}>{o.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase',
                                                background: o.resort === 'global' ? '#e3f2fd' : '#f1f8e9', color: o.resort === 'global' ? '#1565c0' : '#2e7d32'
                                            }}>
                                                {o.resort}
                                            </span>
                                        </td>
                                        <td>
                                            <div>{o.price ? `KES ${o.price.toLocaleString()}` : '-'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--primary-orange)', fontWeight: '700' }}>{o.discount ? `${o.discount}% OFF` : ''}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>{new Date(o.validUntil).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.7rem', color: new Date(o.validUntil) < new Date() ? 'red' : '#999' }}>
                                                {new Date(o.validUntil) < new Date() ? 'Expired' : 'Active'}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }} onClick={() => deleteOffer(o._id)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Ref ID</th>
                                    <th>Guest Portfolio</th>
                                    <th>Strategic Offer</th>
                                    <th>Target Property</th>
                                    <th>Current Status</th>
                                    <th style={{ textAlign: 'right' }}>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {claims.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#999' }}>No claims received yet</td></tr>
                                ) : claims.map(c => (
                                    <tr
                                        key={c._id}
                                        onClick={() => !c.isRead && api.put(`/offers/claims/${c._id}/read`).then(() => loadData())}
                                        style={{
                                            cursor: 'pointer',
                                            background: c.isRead ? 'transparent' : 'rgba(255, 121, 63, 0.05)',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {!c.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-orange)', flexShrink: 0 }}></div>}
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{
                                                        fontFamily: 'monospace', fontWeight: '800', color: 'var(--primary-orange)',
                                                        background: '#fff3e0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem',
                                                        border: '1px border #ffe0b2', width: 'fit-content'
                                                    }}>
                                                        #{c.claimId || `OLD-${c._id.substr(-4).toUpperCase()}`}
                                                    </span>
                                                    <span style={{ fontSize: '0.65rem', color: '#999', marginTop: '4px' }}>
                                                        {new Date(c.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ fontWeight: '800', color: '#2d3436', fontSize: '0.95rem' }}>{c.guestName}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#636e72' }}>
                                                    <i className="fas fa-phone-alt" style={{ fontSize: '0.65rem', color: 'var(--primary-green)' }}></i>
                                                    {c.phone}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#636e72' }}>
                                                    <i className="fas fa-envelope" style={{ fontSize: '0.65rem', color: 'var(--primary-green)' }}></i>
                                                    {c.email}
                                                </div>
                                                {c.message && (
                                                    <div style={{
                                                        fontSize: '0.7rem', background: '#f8f9fa', padding: '6px 10px',
                                                        borderRadius: '8px', marginTop: '4px', borderLeft: '3px solid #dee2e6',
                                                        color: '#495057', fontStyle: 'italic', maxWidth: '200px'
                                                    }}>
                                                        "{c.message}"
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <div style={{ position: 'relative' }}>
                                                    {c.offer?.image ? (
                                                        <img src={c.offer.image} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} alt="" />
                                                    ) : (
                                                        <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#f1f2f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <i className="fas fa-image" style={{ color: '#dfe4ea', fontSize: '1.5rem' }}></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '800', color: 'var(--primary-green)', fontSize: '0.9rem', marginBottom: '2px' }}>{c.offer?.title || 'Unknown Promotion'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#636e72', fontWeight: '500', marginBottom: '4px' }}>
                                                        {c.offer?.price ? `Value: KES ${c.offer.price.toLocaleString()}` : 'Bespoke Package'}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.7rem', color: '#999', lineHeight: '1.4',
                                                        maxWidth: '240px', overflow: 'hidden', display: '-webkit-box',
                                                        WebkitLineClamp: '2', WebkitBoxOrient: 'vertical'
                                                    }}>
                                                        {c.offer?.description || 'Strategic resort offering available for limited time.'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-green)' }}></div>
                                                <span style={{ textTransform: 'capitalize', fontWeight: '700', fontSize: '0.85rem' }}>{c.resort}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase',
                                                letterSpacing: '0.05em', background: `${getStatusColor(c.status)}15`, color: getStatusColor(c.status),
                                                border: `1px solid ${getStatusColor(c.status)}30`
                                            }}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <select
                                                className="form-control"
                                                value={c.status}
                                                onChange={(e) => updateClaimStatus(c._id, e.target.value)}
                                                style={{
                                                    padding: '8px', fontSize: '0.75rem', borderRadius: '10px',
                                                    cursor: 'pointer', width: '130px', fontWeight: '600',
                                                    border: '1px solid #e9ecef', background: '#fff'
                                                }}
                                            >
                                                <option value="pending">Pending Review</option>
                                                <option value="contacted">Customer Contacted</option>
                                                <option value="completed">Offer Redeemed</option>
                                            </select>
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
