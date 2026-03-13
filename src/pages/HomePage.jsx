import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BookingForm from '../components/common/BookingForm';
import './HomePage.css';

export default function HomePage() {
    const location = useLocation();
    const [selectedResort, setSelectedResort] = useState(null);

    useEffect(() => {
        if (location.hash === '#quick-book') {
            const element = document.getElementById('quick-book');
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location.hash]);

    return (
        <>
            {/* Hero Section */}
            <section className="hero" id="home">
                <div className="container">
                    <div className="hero-content">
                        <h1>Hospitality With A Christian Touch</h1>
                        <p className="tagline">Christian Values with Great Zeal to Customer Satisfaction</p>
                        <p className="description">
                            Jumuia Resorts offers a distinctive mixed business model across our three ideal
                            locations, providing comprehensive solutions for conferencing, accommodation, youth centres, leisure
                            getaways, meetings, and weekend retreats. Perfect for business travellers, honeymooners, family
                            getaways, religious events, or just a weekend escape.
                        </p>
                        <a href="#resorts" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '15px 40px' }}>
                            Explore Our Resorts
                        </a>
                    </div>
                </div>
            </section>

            {/* Vision & Mission Section */}
            <section className="vision-mission">
                <div className="container">
                    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                        <div className="section-header">
                            <h2>Our Vision & Mission</h2>
                            <p>Guided by Christian principles, we are committed to excellence in hospitality</p>
                        </div>
                        <div className="vm-grid">
                            <div className="vision-card">
                                <i className="fas fa-eye vm-icon"></i>
                                <h3>Our Vision</h3>
                                <p>To be a preferred Christian conferencing and youth centres in the region and beyond.</p>
                            </div>
                            <div className="mission-card">
                                <i className="fas fa-bullseye vm-icon"></i>
                                <h3>Our Mission</h3>
                                <p>To provide quality hospitality services for enhanced comfort and convenience.</p>
                            </div>
                        </div>

                        {/* Core Values */}
                        <div className="core-values-card">
                            <h3>Our Core Values & Motto</h3>
                            <div className="values-tags">
                                <span className="value-tag">Stewardship</span>
                                <span className="value-tag">Integrity</span>
                                <span className="value-tag">Professionalism</span>
                                <span className="value-tag">Partnership</span>
                                <span className="value-tag">Servanthood</span>
                            </div>
                            <div className="motto-banner">
                                <p>
                                    <i className="fas fa-quote-left" style={{ marginRight: '10px', color: 'var(--primary-orange)' }}></i>
                                    Hospitality with a Christian touch
                                    <i className="fas fa-quote-right" style={{ marginLeft: '10px', color: 'var(--primary-orange)' }}></i>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Resorts Section */}
            <section className="container resorts-section-pad" id="resorts">
                <div className="section-header">
                    <h2>Our Resorts</h2>
                    <p>Choose from our three unique properties, each offering distinct experiences and amenities</p>
                </div>
                <div className="resorts-grid">
                    <ResortCard
                        name="Jumuia Conference & Beach Resort"
                        location="Kanamai Coast, Kenya"
                        description="Breathtaking beachfront location with conference facilities, swimming pools, and coastal adventure activities for the perfect getaway."
                        image="/images/gallery/kanamai home.jpeg"
                        features={['Beachfront', 'Swimming Pool', 'Water Sports', 'Beach Events']}
                        link="/resorts/kanamai"
                        resort="kanamai"
                        onBookNow={(r) => setSelectedResort({ value: r, ts: Date.now() })}
                    />
                    <ResortCard
                        name="Jumuia Hotel Kisumu"
                        location="Kisumu, Kenya"
                        description="Experience urban comfort and convenience, perfect for business travel, conferences, and events at the center of Kisumu city."
                        image="/images/resorts/kisumu/resort1.jpg"
                        features={['City Center', 'Swimming Pool', 'Hostel Rooms', 'Restaurant & Dining']}
                        link="/resorts/kisumu"
                        resort="kisumu"
                        onBookNow={(r) => setSelectedResort({ value: r, ts: Date.now() })}
                    />
                    <ResortCard
                        name="Jumuia Conference & Country Home"
                        location="Limuru, Kenya"
                        description="Nestled in the serene Limuru highlands, perfect for conferences, retreats, and church events with breathtaking views and tranquil surroundings."
                        image="/images/resorts/limuru/limuru-front.jpeg"
                        features={['Conference Facilities', 'Hostel Accommodation', 'Religious Events', 'Nature Walks']}
                        link="/resorts/limuru"
                        resort="limuru"
                        onBookNow={(r) => setSelectedResort({ value: r, ts: Date.now() })}
                    />
                </div>
            </section>

            {/* Services Section */}
            <section className="services-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Our Services</h2>
                        <p>Comprehensive hospitality solutions for every need</p>
                    </div>
                    <div className="services-grid">
                        {[
                            { icon: 'fas fa-building', title: 'Conference Facilities', desc: 'Modern, well-equipped conference rooms for all your business and religious events.' },
                            { icon: 'fas fa-bed', title: 'Accommodation', desc: 'Comfortable rooms ranging from standard to deluxe, suites and hostel-style options.' },
                            { icon: 'fas fa-utensils', title: 'Dining & Catering', desc: 'Exquisite cuisine with diverse menu options for all dietary preferences.' },
                            { icon: 'fas fa-swimming-pool', title: 'Recreation', desc: 'Swimming pools, nature walks, beach activities and more across our properties.' },
                            { icon: 'fas fa-church', title: 'Religious Events', desc: 'Special facilities and services for retreats, church conferences and spiritual events.' },
                            { icon: 'fas fa-users', title: 'Youth Centres', desc: 'Dedicated youth centres with programs for team building and character development.' }
                        ].map((service, i) => (
                            <div className="service-card" key={i}>
                                <i className={`${service.icon} service-icon`}></i>
                                <h3>{service.title}</h3>
                                <p>{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Booking Section */}
            <section className="booking-section" id="quick-book">
                <div className="container">
                    <div className="section-header">
                        <h2>Book Your Stay</h2>
                        <p>Complete your booking at your preferred Jumuia Resort below.</p>
                    </div>
                    <BookingForm initialResort={selectedResort} />
                </div>
            </section>
        </>
    );
}

function ResortCard({ name, location, description, image, features, link, resort, onBookNow }) {
    return (
        <div className="resort-card">
            <div className="resort-img-wrapper">
                <img 
                    src={image} 
                    alt={name} 
                    className="resort-img" 
                    loading="lazy" 
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </div>
            <div className="resort-content">
                <h3>{name}</h3>
                <div className="resort-location">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{location}</span>
                </div>
                <p>{description}</p>
                <div className="resort-features">
                    {features.map((f, i) => <span className="feature-tag" key={i}>{f}</span>)}
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                    <Link to={link} className="btn btn-primary">Explore Resort</Link>
                    <a
                        href="#quick-book"
                        className="btn btn-secondary"
                        onClick={() => onBookNow(resort)}
                    >
                        Book Now
                    </a>
                </div>
            </div>
        </div>
    );
}
