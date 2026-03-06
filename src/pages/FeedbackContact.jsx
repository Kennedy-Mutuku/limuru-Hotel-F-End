import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import './PageStyles.css';
import './ContactPage.css';

export default function FeedbackContact() {
    const location = useLocation();

    // Feedback Form State
    const [feedbackData, setFeedbackData] = useState({ name: '', email: '', resort: '', rating: 0, comment: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackStatus, setFeedbackStatus] = useState(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [showRatingError, setShowRatingError] = useState(false);

    // Contact Form State
    const [contactData, setContactData] = useState({ firstName: '', lastName: '', email: '', phone: '', resort: '', subject: '', message: '' });
    const [contactStatus, setContactStatus] = useState(null);
    const [contactLoading, setContactLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);

    // Scroll to section based on hash
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location]);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (feedbackData.rating === 0) {
            setShowRatingError(true);
            return;
        }
        setShowRatingError(false);
        setFeedbackLoading(true);
        try {
            await api.post('/feedback', feedbackData);
            setFeedbackStatus({ type: 'success', text: 'Thank you! Your feedback has been submitted successfully.' });
            setFeedbackData({ name: '', email: '', resort: '', rating: 0, comment: '' });
            setHoverRating(0);
        } catch (err) {
            setFeedbackStatus({ type: 'error', text: err.response?.data?.message || 'Failed to submit feedback.' });
        }
        setFeedbackLoading(false);
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactLoading(true);
        setContactStatus(null);
        try {
            await api.post('/messages', {
                ...contactData,
                phone: contactData.phone || 'Not provided'
            });
            setShowSuccessModal(true);
            setContactData({ firstName: '', lastName: '', email: '', phone: '', resort: '', subject: '', message: '' });
        } catch (err) {
            setContactStatus({ type: 'error', text: err.response?.data?.message || 'Failed to send message.' });
        }
        setContactLoading(false);
    };

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContactData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="feedback-contact-page">
            <section className="page-hero" style={{ backgroundImage: "url('/images/resorts/kisumu/resort1.jpg')" }}>
                <div className="container">
                    <h1>Guest Communications</h1>
                    <p>Tell us about your experience or get in touch with our team</p>
                </div>
            </section>

            {/* Part 1: Feedback Section */}
            <section id="feedback" className="container" style={{ padding: '80px 0 40px' }}>
                <div className="section-header">
                    <h2>Share Your Experience</h2>
                    <p>Your feedback helps us maintain the highest standards of Christian hospitality.</p>
                </div>

                <div className="feedback-form-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <form onSubmit={handleFeedbackSubmit}>
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div className="form-field-wrapper" style={{ marginBottom: 0 }}>
                                <input
                                    className="form-control"
                                    placeholder="Your Name *"
                                    value={feedbackData.name}
                                    onChange={e => setFeedbackData({ ...feedbackData, name: e.target.value })}
                                    required
                                />
                                <i className="fas fa-user field-icon"></i>
                            </div>
                            <div className="form-field-wrapper" style={{ marginBottom: 0 }}>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email Address *"
                                    value={feedbackData.email}
                                    onChange={e => setFeedbackData({ ...feedbackData, email: e.target.value })}
                                    required
                                />
                                <i className="fas fa-envelope field-icon"></i>
                            </div>
                        </div>

                        <div className="form-field-wrapper">
                            <select
                                className="form-control"
                                value={feedbackData.resort}
                                onChange={e => setFeedbackData({ ...feedbackData, resort: e.target.value })}
                                required
                            >
                                <option value="">Select Resort *</option>
                                <option value="limuru">Jumuia Limuru Country Home</option>
                                <option value="kanamai">Jumuia Kanamai Beach Resort</option>
                                <option value="kisumu">Jumuia Hotel Kisumu</option>
                            </select>
                            <i className="fas fa-hotel field-icon"></i>
                        </div>

                        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                            <label style={{ display: 'block', marginBottom: '15px', fontWeight: '700', color: 'var(--primary-green)', fontSize: '1.1rem' }}>
                                How would you rate your stay?
                            </label>
                            <div className="star-rating-container" onMouseLeave={() => setHoverRating(0)} style={{ justifyContent: 'center' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <i
                                        key={star}
                                        className={`fas fa-star star-icon ${star <= (hoverRating || feedbackData.rating) ? 'active' : ''}`}
                                        style={{ fontSize: '2rem', margin: '0 8px', cursor: 'pointer' }}
                                        onClick={() => {
                                            setFeedbackData({ ...feedbackData, rating: star });
                                            setShowRatingError(false);
                                        }}
                                        onMouseEnter={() => setHoverRating(star)}
                                    />
                                ))}
                            </div>
                            {showRatingError && <div className="rating-error-text" style={{ marginTop: '10px' }}>Please select a star rating.</div>}
                        </div>

                        <div className="form-field-wrapper">
                            <textarea
                                className="form-control"
                                placeholder="Write your review here... *"
                                rows="5"
                                value={feedbackData.comment}
                                onChange={e => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                                required
                            ></textarea>
                        </div>

                        {feedbackStatus && (
                            <div className={`alert alert-${feedbackStatus.type}`} style={{ marginBottom: '20px' }}>
                                {feedbackStatus.text}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontWeight: '700' }} disabled={feedbackLoading}>
                            {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </form>
                </div>
            </section>

            <hr className="container" style={{ opacity: 0.1 }} />

            {/* Part 2: Contact Section */}
            <section id="contact" className="contact-page-wrapper" style={{ paddingTop: '60px' }}>
                <div className="container" style={{ marginBottom: '40px' }}>
                    <div className="section-header">
                        <h2>Direct Inquiries</h2>
                        <p>Have a specific request or question? Our team is here to assist you.</p>
                    </div>
                </div>

                <div className="container contact-grid">
                    <div className="contact-form-card">
                        <h3>Send Us a Message</h3>
                        {contactStatus && contactStatus.type === 'error' && (
                            <div className="contact-alert error">
                                <i className="fas fa-exclamation-circle"></i> {contactStatus.text}
                            </div>
                        )}
                        <form onSubmit={handleContactSubmit}>
                            <div className="form-grid">
                                <div className="input-float">
                                    <input type="text" name="firstName" required value={contactData.firstName} onChange={handleContactChange} placeholder=" " />
                                    <label>First Name *</label>
                                </div>
                                <div className="input-float">
                                    <input type="text" name="lastName" required value={contactData.lastName} onChange={handleContactChange} placeholder=" " />
                                    <label>Last Name *</label>
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="input-float">
                                    <input type="email" name="email" required value={contactData.email} onChange={handleContactChange} placeholder=" " />
                                    <label>Email Address *</label>
                                </div>
                                <div className="input-float">
                                    <input type="tel" name="phone" value={contactData.phone} onChange={handleContactChange} placeholder=" " />
                                    <label>Phone Number</label>
                                </div>
                            </div>
                            <div className="form-grid full">
                                <div className="input-float">
                                    <select name="resort" value={contactData.resort} onChange={handleContactChange}>
                                        <option value="">General Inquiry (No specific resort)</option>
                                        <option value="kanamai">Jumuia Conference & Beach Resort, Kanamai</option>
                                        <option value="limuru">Jumuia Conference & Country Home, Limuru</option>
                                        <option value="kisumu">Jumuia Hotel Kisumu</option>
                                    </select>
                                    <label>Select Resort (Optional)</label>
                                </div>
                                <div className="input-float">
                                    <select name="subject" required value={contactData.subject} onChange={handleContactChange}>
                                        <option value="">Select a subject...</option>
                                        <option value="reservation">Room Reservation</option>
                                        <option value="conference">Conference & Events</option>
                                        <option value="wedding">Weddings & Honeymoons</option>
                                        <option value="feedback">Feedback / Compliment</option>
                                        <option value="other">Other Inquiry</option>
                                    </select>
                                    <label>Subject *</label>
                                </div>
                                <div className="input-float">
                                    <textarea name="message" required value={contactData.message} onChange={handleContactChange} placeholder=" "></textarea>
                                    <label>Your Message *</label>
                                </div>
                            </div>
                            <button type="submit" className="contact-submit-btn" disabled={contactLoading}>
                                {contactLoading ? <span>Sending...</span> : <span><i className="fas fa-paper-plane" style={{ marginRight: '8px' }}></i> Send Message</span>}
                            </button>
                        </form>
                    </div>

                    <div className="contact-info-wrapper">
                        <div className="info-card-modern">
                            <div className="info-icon-box"><i className="fas fa-phone-alt"></i></div>
                            <div className="info-text-modern">
                                <h4>Call Us Directly</h4>
                                <p><a href="tel:+254759423589">+254 759 423589</a></p>
                            </div>
                        </div>
                        <div className="info-card-modern">
                            <div className="info-icon-box"><i className="fas fa-envelope-open-text"></i></div>
                            <div className="info-text-modern">
                                <h4>Email Support</h4>
                                <p><a href="mailto:info@resortjumuia.com">info@resortjumuia.com</a></p>
                            </div>
                        </div>
                        <div className="info-card-modern" style={{ background: 'var(--primary-green)', color: 'white' }}>
                            <div className="info-icon-box" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}><i className="fas fa-clock"></i></div>
                            <div className="info-text-modern">
                                <h4 style={{ color: 'white' }}>24/7 Availability</h4>
                                <p style={{ color: 'rgba(255,255,255,0.9)' }}>Our resort receptions are always open.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="success-modal-overlay">
                    <div className="success-modal-content anim-pop-in">
                        <div className="success-icon-wrapper"><i className="fas fa-check"></i></div>
                        <h2>Message Sent!</h2>
                        <p>Our team will get back to you shortly.</p>
                        <button className="success-confirm-btn" onClick={() => setShowSuccessModal(false)}>Okay</button>
                    </div>
                </div>
            )}
        </div>
    );
}
