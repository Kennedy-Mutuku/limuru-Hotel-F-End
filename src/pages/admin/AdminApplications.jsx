import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await api.get('/applications');
            setApplications(res.data);
        } catch (err) {
            console.error('Error fetching applications', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/applications/${id}/status`, { status });
            fetchApplications();
        } catch (err) {
            alert('Error updating status: ' + err.message);
        }
    };

    const openDocument = (data, label) => {
        if (!data) return;
        const newWindow = window.open();
        newWindow.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
        newWindow.document.title = label || "Document";
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="admin-page-header">
                <div>
                    <h1>Job Applications</h1>
                    <p>Review candidate responses and uploaded documents professionally</p>
                </div>
            </div>

            <div className="admin-card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : applications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
                        <i className="fas fa-user-slash" style={{ fontSize: '3rem', opacity: 0.2, display: 'block', marginBottom: '20px' }}></i>
                        <h3>No Applications Received</h3>
                        <p>Waiting for candidates to apply for open vacancies.</p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>#</th>
                                    <th>Candidate Detail</th>
                                    <th>Vacancy / Department</th>
                                    <th>Documents</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app, index) => (
                                    <tr
                                        key={app._id}
                                        onClick={() => !app.isRead && api.put(`/applications/${app._id}/read`).then(() => fetchApplications())}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            background: app.isRead ? 'transparent' : 'rgba(255, 121, 63, 0.05)'
                                        }}
                                        className={app.isRead ? '' : 'unread-row'}
                                    >
                                        <td style={{ fontWeight: '700', color: '#888' }}>{index + 1}.</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {!app.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-orange)', flexShrink: 0 }}></div>}
                                                <div>
                                                    <div style={{ fontWeight: '800', color: 'var(--primary-green)', fontSize: '1rem', marginBottom: '4px' }}>{app.candidateName}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#444', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                                        <i className="fas fa-phone-alt" style={{ fontSize: '0.7rem', color: 'var(--primary-orange)' }}></i> {app.candidatePhone}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <i className="fas fa-envelope" style={{ fontSize: '0.7rem', color: 'var(--primary-orange)' }}></i> {app.candidateEmail}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{app.recruitmentId?.title || 'Unknown Vacancy'}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#999' }}>{app.recruitmentId?.department}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                {app.documents.map((doc, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDocument(doc.fileLink, doc.label);
                                                        }}
                                                        style={{
                                                            border: 'none',
                                                            background: 'rgba(255, 121, 63, 0.1)',
                                                            color: 'var(--primary-orange)',
                                                            cursor: 'pointer',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            textAlign: 'left',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700'
                                                        }}
                                                    >
                                                        <i className="fas fa-file-pdf" style={{ marginRight: '5px' }}></i> {doc.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <select
                                                className="form-control"
                                                style={{ padding: '4px', fontSize: '0.75rem', width: 'auto' }}
                                                value={app.status}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateStatus(app._id, e.target.value);
                                                }}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Reviewed">Reviewed</option>
                                                <option value="Shortlisted">Shortlisted</option>
                                                <option value="Rejected">Rejected</option>
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
