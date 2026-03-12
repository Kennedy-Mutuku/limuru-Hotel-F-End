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
        resort: 'global',
        googleFormLink: '',
        jobDescriptionPdf: ''
    });

    const [uploadingPdf, setUploadingPdf] = useState(false);

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
                resort: 'global',
                googleFormLink: '',
                jobDescriptionPdf: ''
            });
            fetchRecruitments();
        } catch (err) {
            console.error('Recruitment creation error:', err);
            alert('Error creating recruitment: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 30MB limit
        if (file.size > 30 * 1024 * 1024) {
            alert('File too large. Maximum size is 30MB.');
            return;
        }

        setUploadingPdf(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, jobDescriptionPdf: reader.result }));
            setUploadingPdf(false);
        };
        reader.onerror = () => {
            alert('Error reading file. Please try again.');
            setUploadingPdf(false);
        };
        reader.readAsDataURL(file);
    };

    const openPdf = (data) => {
        const newWindow = window.open();
        newWindow.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
        newWindow.document.title = "Job Description PDF";
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
                                    <th>Job Description</th>
                                    <th>Application Link</th>
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
                                            {r.jobDescriptionPdf ? (
                                                <button 
                                                    onClick={() => openPdf(r.jobDescriptionPdf)}
                                                    style={{ border: 'none', background: 'none', color: 'var(--primary-green)', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                                                >
                                                    <i className="fas fa-file-pdf"></i> View PDF
                                                </button>
                                            ) : (
                                                <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.8rem' }}>No PDF</span>
                                            )}
                                        </td>
                                        <td>
                                            {r.googleFormLink ? (
                                                <a
                                                    href={r.googleFormLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'var(--primary-orange)', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none' }}
                                                >
                                                    <i className="fas fa-external-link-alt"></i> Form Link
                                                </a>
                                            ) : (
                                                <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.8rem' }}>No Link</span>
                                            )}
                                        </td>
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

                            <div className="form-field-wrapper">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>GOOGLE FORM LINK (Application Redirect)</label>
                                <input 
                                    className="form-control" 
                                    placeholder="https://docs.google.com/forms/d/..." 
                                    value={formData.googleFormLink} 
                                    onChange={e => setFormData({ ...formData, googleFormLink: e.target.value })} 
                                />
                                <small style={{ color: '#888', marginTop: '5px', display: 'block' }}>Candidates will be redirected to this link when they click "Apply".</small>
                            </div>

                            <div className="form-field-wrapper">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>JOB DESCRIPTION PDF (Official Document)</label>
                                <div 
                                    onClick={() => document.getElementById('jobPdf').click()}
                                    style={{ 
                                        border: '2px dashed #ddd', borderRadius: '10px', padding: '20px', textAlign: 'center', 
                                        cursor: 'pointer', background: formData.jobDescriptionPdf ? '#f0fff4' : '#fafafa',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <input 
                                        type="file" 
                                        id="jobPdf" 
                                        accept=".pdf" 
                                        style={{ display: 'none' }} 
                                        onChange={handleFileChange} 
                                    />
                                    {uploadingPdf ? (
                                        <div style={{ color: 'var(--primary-green)', fontWeight: '700' }}>
                                            <i className="fas fa-spinner fa-spin"></i> Processing...
                                        </div>
                                    ) : formData.jobDescriptionPdf ? (
                                        <div style={{ color: 'var(--primary-green)', fontWeight: '700' }}>
                                            <i className="fas fa-check-circle"></i> Document Attached (Max 30MB)
                                        </div>
                                    ) : (
                                        <div style={{ color: '#666' }}>
                                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'block' }}></i>
                                            Click to upload job description PDF (Max 30MB)
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontWeight: '800' }} disabled={uploadingPdf}>
                                {uploadingPdf ? 'Processing PDF...' : 'Publish Vacancy'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
