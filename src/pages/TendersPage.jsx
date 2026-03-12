import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import './PageStyles.css';

export default function TendersPage() {
    const location = useLocation();
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recruitments, setRecruitments] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [selectedTender, setSelectedTender] = useState(null);
    const [selectedRec, setSelectedRec] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 600);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchTenders();
        fetchRecruitments();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const hash = location.hash;
            if (hash) {
                const id = hash.replace('#', '');
                const element = document.getElementById(id);
                if (element) {
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            }
        };
        handleScroll();
    }, [location.hash]);

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

    const fetchRecruitments = async () => {
        try {
            const res = await api.get('/recruitments');
            setRecruitments(res.data.filter(r => r.status === 'Open'));
        } catch (err) {
            console.error('Error fetching recruitments', err);
        } finally {
            setLoadingRecs(false);
        }
    };

    return (
        <div className="tenders-page">
            <section className="page-hero" style={{ backgroundImage: "url('/images/join-us-hero.png')" }}>
                <div className="container">
                    <h1>Join Our Mission</h1>
                    <p>Building a legacy of Christian hospitality together through partnership and service.</p>
                </div>
            </section>

            <section id="tenders" className="container" style={{ padding: '80px 0' }}>
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

            <section id="recruitments" className="container" style={{ padding: '80px 0', borderTop: '1px solid #eee' }}>
                <div className="section-header">
                    <h2>Career Opportunities</h2>
                    <p>Join our team of dedicated professionals and grow with Jumuia Resorts.</p>
                </div>

                {loadingRecs ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : recruitments.length === 0 ? (
                    <div className="admin-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <i className="fas fa-briefcase" style={{ fontSize: '3rem', opacity: 0.2, display: 'block', marginBottom: '20px' }}></i>
                        <h3>No Active Vacancies</h3>
                        <p style={{ color: 'var(--text-light)' }}>There are currently no open recruitment opportunities. Please check back later.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                        {recruitments.map(r => (
                            <div key={r._id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #eee', transition: 'transform 0.3s', cursor: 'pointer' }} onClick={() => setSelectedRec(r)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'var(--light-orange)', color: 'var(--primary-orange)', padding: '4px 10px', borderRadius: '15px' }}>{r.department}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{r.type}</span>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--primary-green)' }}>{r.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', flex: 1, marginBottom: '20px', lineHeight: '1.6' }}>
                                    {r.description.substring(0, 150)}...
                                </p>
                                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Closing Date</div>
                                        <strong style={{ color: 'var(--primary-orange)' }}>{new Date(r.closingDate).toLocaleDateString()}</strong>
                                    </div>
                                    <button className="btn btn-outline" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {selectedTender && (
                <div className="success-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '10px' : '20px' }}>
                    <div className="admin-card anim-pop-in" style={{ 
                        maxWidth: '800px', 
                        width: '100%', 
                        maxHeight: '92vh', 
                        overflowY: 'auto', 
                        padding: isMobile ? '30px 20px' : '50px 40px', 
                        position: 'relative',
                        borderRadius: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <button onClick={() => setSelectedTender(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', fontSize: '1.2rem', cursor: 'pointer', color: '#999', zIndex: 10 }}>&times;</button>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
                            <div>
                                <div style={{ marginBottom: isMobile ? '20px' : '30px' }}>
                                    <span style={{ background: 'var(--primary-green)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', marginBottom: '12px', display: 'inline-block' }}>{selectedTender.category}</span>
                                    <h2 style={{ fontSize: isMobile ? '1.5rem' : '2.2rem', color: 'var(--primary-green)', marginBottom: '8px', lineHeight: '1.2' }}>{selectedTender.title}</h2>
                                    <p style={{ color: 'var(--text-light)', fontWeight: '600', fontSize: '0.85rem' }}>Reference: {selectedTender.referenceNumber}</p>
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
                                            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
                                                An official procurement document is available for this tender. Please review all terms and conditions carefully.
                                            </p>
                                            <button
                                                className="btn btn-outline"
                                                style={{ 
                                                    width: '100%', borderColor: 'var(--primary-orange)', color: 'var(--primary-orange)', 
                                                    fontWeight: '700', padding: '15px', borderRadius: '10px'
                                                }}
                                                onClick={() => {
                                                    const newWindow = window.open();
                                                    newWindow.document.write(`<iframe src="${selectedTender.tenderDocument}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                                                    newWindow.document.title = "Tender Official Document";
                                                }}
                                            >
                                                <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i> Read Full Tender Document (PDF)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ background: '#fff', border: '1px solid #eee', padding: isMobile ? '25px' : '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', marginTop: '20px' }}>
                                <i className="fas fa-file-signature" style={{ fontSize: '3rem', color: 'var(--primary-green)', marginBottom: '20px', opacity: 0.1 }}></i>
                                <h3 style={{ marginBottom: '15px', color: 'var(--primary-green)' }}>Application Portal</h3>
                                <p style={{ color: '#666', marginBottom: '30px', fontSize: '0.95rem' }}>
                                    To ensure a fair and streamlined procurement process, all applications for this tender are handled through our specialized secure application portal.
                                </p>
                                
                                <div style={{ background: '#f0fff4', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #c6f6d5' }}>
                                    <h4 style={{ color: '#2f855a', marginBottom: '10px', fontSize: '0.9rem' }}>Requirement Checklist</h4>
                                    <ul style={{ textAlign: 'left', fontSize: '0.85rem', color: '#48bb78', listStyle: 'none', padding: 0 }}>
                                        <li style={{ marginBottom: '5px' }}><i className="fas fa-check-circle"></i> Professional Proposal (PDF)</li>
                                        <li style={{ marginBottom: '5px' }}><i className="fas fa-check-circle"></i> Compliance Certificates</li>
                                        <li><i className="fas fa-check-circle"></i> Technical Qualifications</li>
                                    </ul>
                                </div>

                                {selectedTender.googleFormLink ? (
                                    <a 
                                        href={selectedTender.googleFormLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn btn-primary" 
                                        style={{ width: '100%', padding: '18px', fontWeight: '800', fontSize: '1.1rem', textDecoration: 'none', display: 'block' }}
                                    >
                                        Apply for Tender <i className="fas fa-external-link-alt" style={{ marginLeft: '10px', fontSize: '0.9rem' }}></i>
                                    </a>
                                ) : (
                                    <div style={{ color: '#888', fontStyle: 'italic', padding: '20px', background: '#f9f9f9', borderRadius: '10px' }}>
                                        Application portal link is currently being updated. Please check back shortly.
                                    </div>
                                )}
                                
                                <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                                    You will be redirected to our secure external portal.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Application Modal (Recruitment) */}
            {selectedRec && (
                <div className="success-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '10px' : '20px' }}>
                    <div className="admin-card anim-pop-in" style={{ 
                        maxWidth: '800px', 
                        width: '100%', 
                        maxHeight: '92vh', 
                        overflowY: 'auto', 
                        padding: isMobile ? '30px 20px' : '50px 40px', 
                        position: 'relative',
                        borderRadius: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <button onClick={() => setSelectedRec(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', fontSize: '1.2rem', cursor: 'pointer', color: '#999', zIndex: 10 }}>&times;</button>

                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <>
                                <div style={{ marginBottom: isMobile ? '25px' : '35px', textAlign: 'center' }}>
                                    <span style={{ background: 'var(--primary-orange)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', marginBottom: '12px', display: 'inline-block' }}>{selectedRec.department}</span>
                                    <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.8rem', color: 'var(--primary-green)', marginBottom: '10px', lineHeight: '1.1' }}>{selectedRec.title}</h2>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? '10px' : '20px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                        <span><i className="fas fa-clock"></i> {selectedRec.type}</span>
                                        <span><i className="fas fa-map-marker-alt"></i> {selectedRec.location}</span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '30px' }}>
                                    <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', borderLeft: '4px solid var(--primary-orange)', paddingLeft: '15px' }}>Role Description</h4>
                                    <p style={{ lineHeight: '1.8', color: '#555' }}>{selectedRec.description}</p>
                                </div>

                                {selectedRec.requirements?.length > 0 && (
                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', borderLeft: '4px solid var(--primary-orange)', paddingLeft: '15px' }}>Requirements & Qualifications</h4>
                                        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
                                            {selectedRec.requirements.map((req, i) => (
                                                <li key={i}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedRec.responsibilities?.length > 0 && (
                                    <div style={{ marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', borderLeft: '4px solid var(--primary-orange)', paddingLeft: '15px' }}>Key Responsibilities</h4>
                                        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
                                            {selectedRec.responsibilities.map((res, i) => (
                                                <li key={i}>{res}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                    <h4 style={{ marginBottom: '15px', color: 'var(--primary-green)' }}>Detailed Overview</h4>
                                    
                                    {selectedRec.jobDescriptionPdf && (
                                        <button 
                                            className="btn btn-outline"
                                            style={{ 
                                                width: '100%', borderColor: 'var(--primary-orange)', color: 'var(--primary-orange)', 
                                                fontWeight: '700', padding: '15px', borderRadius: '10px', marginBottom: '20px'
                                            }}
                                            onClick={() => {
                                                const newWindow = window.open();
                                                newWindow.document.write(`<iframe src="${selectedRec.jobDescriptionPdf}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                                                newWindow.document.title = "Job Description PDF";
                                            }}
                                        >
                                            <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i> Read Full Job Description (PDF)
                                        </button>
                                    )}

                                    <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #eee', marginBottom: '25px' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '700' }}>APPLICATION DEADLINE</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-orange)' }}>{new Date(selectedRec.closingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                    </div>

                                    {selectedRec.googleFormLink ? (
                                        <a 
                                            href={selectedRec.googleFormLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="btn btn-primary" 
                                            style={{ width: '100%', padding: '18px', fontWeight: '800', fontSize: '1.1rem', textDecoration: 'none', display: 'block' }}
                                        >
                                            Apply for Job <i className="fas fa-external-link-alt" style={{ marginLeft: '10px', fontSize: '0.9rem' }}></i>
                                        </a>
                                    ) : (
                                        <div style={{ color: '#888', fontStyle: 'italic', padding: '20px', background: '#f9f9f9', borderRadius: '10px' }}>
                                            Online application portal link is currently being updated.
                                        </div>
                                    )}
                                    
                                    <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                                        Closing date: {new Date(selectedRec.closingDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
