import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminRecruitment() {
    const [recruitments, setRecruitments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // New Recruitment FormData
    const [formData, setFormData] = useState({
        title: '',
        department: 'Administration',
        type: 'Full-time',
        location: 'On-site',
        description: '',
        requirements: '',
        responsibilities: '',
        closingDate: '',
        requiredDocuments: 'CV\nCover Letter', // Default documents
        resort: 'global'
    });

    useEffect(() => {
        fetchRecruitments();
    }, []);

    const fetchRecruitments = async () => {
        try {
            const res = await api.get('/recruitments');
            setRecruitments(res.data);
        } catch (err) {
            console.error('Error fetching recruitments', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRecruitment = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                requirements: formData.requirements.split('\n').filter(r => r.trim() !== ''),
                responsibilities: formData.responsibilities.split('\n').filter(r => r.trim() !== ''),
                requiredDocuments: formData.requiredDocuments.split('\n').filter(d => d.trim() !== '')
            };
            await api.post('/recruitments', payload);
            setShowModal(false);
            setFormData({
                title: '',
                department: 'Administration',
                type: 'Full-time',
                location: 'On-site',
                description: '',
                requirements: '',
                responsibilities: '',
                closingDate: '',
                requiredDocuments: 'CV\nCover Letter',
                resort: 'global'
            });
            fetchRecruitments();
        } catch (err) {
            console.error('Recruitment creation error:', err);
            alert('Error creating recruitment: ' + (err.response?.data?.message || err.message));
        }
    };

    const deleteRecruitment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vacancy?')) return;
        try {
            await api.delete(`/recruitments/${id}`);
            fetchRecruitments();
        } catch (err) {
            alert('Error deleting recruitment');
        }
    };

    const toggleStatus = async (rec) => {
        try {
            const newStatus = rec.status === 'Open' ? 'Closed' : 'Open';
            await api.put(`/recruitments/${rec._id}`, { status: newStatus });
            fetchRecruitments();
        } catch (err) {
            alert('Error updating status');
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>Recruitment Management</h1>
                    <p>Post job vacancies and attract top talent professionally</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> Add New Vacancy
                </button>
            </div>

            <div className="admin-card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : recruitments.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No recruitment postings yet.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Department</th>
                                    <th>Type</th>
                                    <th>Closing Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recruitments.map(r => (
                                    <tr key={r._id}>
                                        <td><strong>{r.title}</strong></td>
                                        <td><span className="admin-badge-sm" style={{ background: '#f1f5f9', color: '#475569' }}>{r.department}</span></td>
                                        <td>{r.type}</td>
                                        <td>{new Date(r.closingDate).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => toggleStatus(r)}>
                                                {r.status === 'Open' ? 'Close' : 'Re-open'}
                                            </button>
                                            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ff4d4d', borderColor: '#ff4d4d' }} onClick={() => deleteRecruitment(r._id)}>
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

            {/* Create Recruitment Modal */}
            {showModal && (
                <div className="success-modal-overlay">
                    <div className="admin-card anim-pop-in" style={{ maxWidth: '650px', width: '90%', padding: '40px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                            <h2 style={{ color: 'var(--primary-green)' }}>Add New Job Vacancy</h2>
                            <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateRecruitment}>
                            <div className="form-field-wrapper">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>JOB TITLE</label>
                                <input className="form-control" placeholder="e.g. Front Office Manager" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-field-wrapper">
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>DEPARTMENT</label>
                                    <select className="form-control" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                        <option>Administration</option>
                                        <option>Front Office</option>
                                        <option>Food & Beverage</option>
                                        <option>Housekeeping</option>
                                        <option>Engineering</option>
                                        <option>Marketing & Sales</option>
                                        <option>Human Resources</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-field-wrapper">
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>JOB TYPE</label>
                                    <select className="form-control" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-field-wrapper">
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>LOCATION</label>
                                    <input className="form-control" placeholder="e.g. Kisumu" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                                <div className="form-field-wrapper">
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>CLOSING DATE</label>
                                    <input type="date" className="form-control" required value={formData.closingDate} onChange={e => setFormData({ ...formData, closingDate: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-field-wrapper">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>ROLE DESCRIPTION</label>
                                <textarea className="form-control" rows="3" placeholder="Brief overview of the role..." required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>

                            <div className="form-field-wrapper">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>KEY RESPONSIBILITIES (One per line)</label>
                                <textarea className="form-control" rows="4" placeholder="List the main tasks..." value={formData.responsibilities} onChange={e => setFormData({ ...formData, responsibilities: e.target.value })}></textarea>
                            </div>

                            <div className="form-field-wrapper">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>REQUIREMENTS & SKILLS (One per line)</label>
                                <textarea className="form-control" rows="4" placeholder="List qualifications, skills etc..." value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })}></textarea>
                            </div>

                            <div className="form-field-wrapper">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>REQUIRED DOCUMENTS FOR UPLOAD (One per line)</label>
                                <textarea className="form-control" rows="3" placeholder="e.g. CV&#10;Cover Letter&#10;Academic Certificates" value={formData.requiredDocuments} onChange={e => setFormData({ ...formData, requiredDocuments: e.target.value })}></textarea>
                                <small style={{ color: 'var(--text-light)', marginTop: '5px', display: 'block' }}>These will be shown as specific upload fields for candidates.</small>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontWeight: '800' }}>Publish Vacancy</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
