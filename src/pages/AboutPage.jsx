import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PageStyles.css';
import './AboutPage.css';

export default function AboutPage() {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    const y = element.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }, 100);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [location.hash]);

    return (
        <>
            {/* 1. Hero Section */}
            <section className="about-page-hero" style={{ backgroundImage: "url('/images/resorts/limuru/limuru-front.jpeg')" }}>
                <div className="container">
                    <h1>About Us</h1>
                    <p>Learn more about Jumuia Resorts and our commitment to Christian hospitality</p>
                </div>
            </section>

            {/* 2. Main Overlapping Layout Container */}
            <section className="about-overlap-section container">
                <div className="about-content-card">

                    {/* Who We Are */}
                    <div className="about-section-header" id="who-we-are">
                        <h2>Who We Are</h2>
                    </div>
                    <p className="about-text">
                        Jumuia Resorts is a chain of Christian conference centers and hospitality facilities owned and operated by
                        the National Council of Churches of Kenya (NCCK). With three strategic locations across Kenya — Limuru,
                        Kanamai, and Kisumu — we offer a unique blend of Christian hospitality, modern conferencing facilities,
                        and leisure amenities.
                    </p>
                    <p className="about-text">
                        Our properties cater to a wide range of needs including corporate conferences, church retreats,
                        family getaways, youth camps, and individual leisure stays. We are committed to providing quality
                        service that reflects our core values of stewardship, integrity, professionalism, partnership,
                        and servanthood.
                    </p>

                    {/* Mission & Values */}
                    <div className="about-section-header" id="mission-values" style={{ marginTop: '50px' }}>
                        <h2>Our Mission & Values</h2>
                        <p>Guided by Christian principles, we are committed to excellence in hospitality</p>
                    </div>

                    <div className="mission-vision-grid">
                        <div className="mv-card">
                            <i className="fas fa-eye mv-icon"></i>
                            <h3>Our Vision</h3>
                            <p>To be a preferred Christian conferencing and youth centres in the region and beyond.</p>
                        </div>

                        <div className="mv-card">
                            <i className="fas fa-bullseye mv-icon"></i>
                            <h3>Our Mission</h3>
                            <p>To provide quality hospitality services for enhanced comfort and convenience.</p>
                        </div>
                    </div>

                    {/* Core Values */}
                    <div className="core-values-section">
                        <h3>Our Core Values & Motto</h3>
                        <div className="values-flex">
                            {['Stewardship', 'Integrity', 'Professionalism', 'Partnership', 'Servanthood'].map((val, idx) => (
                                <span key={idx} className="value-tag">
                                    {val}
                                </span>
                            ))}
                        </div>
                    </div>

                    <hr className="divider" />

                    {/* Why Choose Us */}
                    <div className="about-section-header" id="why-choose-us">
                        <h2>Why Choose Us</h2>
                    </div>

                    <div className="features-grid">
                        {[
                            { icon: 'fas fa-church', title: 'Christian Heritage', desc: 'Founded on Christian values and operated by NCCK, providing hospitality with a spiritual foundation.' },
                            { icon: 'fas fa-map-marked-alt', title: '3 Prime Locations', desc: 'Strategically located in Limuru, Kanamai coast, and Kisumu city to serve all regions of Kenya.' },
                            { icon: 'fas fa-award', title: 'Quality Service', desc: 'Committed to excellence in every aspect of hospitality, from accommodation to conferencing.' },
                            { icon: 'fas fa-handshake', title: 'Community Impact', desc: 'Contributing to community development through employment and social programs.' }
                        ].map((item, i) => (
                            <div key={i} className="feature-card">
                                <i className={`${item.icon} feature-icon`}></i>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>
        </>
    );
}
