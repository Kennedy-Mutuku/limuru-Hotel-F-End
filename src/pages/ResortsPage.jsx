import { Link } from 'react-router-dom';
import './PageStyles.css';

export default function ResortsPage() {
    const resorts = [
        {
            name: 'Jumuia Conference & Country Home',
            location: 'Limuru, Kenya',
            slug: 'limuru',
            image: '/images/resorts/limuru/limuru-front.jpeg',
            description: 'Nestled in the serene Limuru highlands, our conference and country home offers breathtaking views, tranquil surroundings, and comprehensive conferencing facilities. Perfect for retreats, church events, and family getaways.',
            features: ['Conference Facilities', 'Hostel Accommodation', 'Chapel', 'Nature Walks', 'Campfire Area', 'Dining Hall']
        },
        {
            name: 'Jumuia Conference & Beach Resort',
            location: 'Kanamai Coast, Kenya',
            slug: 'kanamai',
            image: '/images/resorts/kanamai/front kanamai.jpg',
            description: 'A breathtaking beachfront resort along the Kenyan coast. Enjoy modern conference facilities, swimming pools, and coastal adventure activities. Ideal for both corporate events and leisure vacations.',
            features: ['Beach Access', 'Swimming Pool', 'Conference Rooms', 'Water Sports', 'Restaurant', 'Cottages']
        },
        {
            name: 'Jumuia Hotel Kisumu',
            location: 'Kisumu, Kenya',
            slug: 'kisumu',
            image: '/images/resorts/kisumu/resort1.jpg',
            description: 'Located in the heart of Kisumu city, our hotel offers urban comfort with modern amenities. Perfect for business travelers, conference attendees, and city explorers looking for quality accommodation.',
            features: ['City Center', 'Swimming Pool', 'Conference Hall', 'Restaurant', 'Hostel Wing', 'Ample Parking']
        }
    ];

    return (
        <>
            <section className="page-hero" style={{ backgroundImage: "url('/images/resorts/kanamai/front kanamai.jpg')" }}>
                <div className="container"><h1>Our Resorts</h1><p>Discover unique experiences across our three properties</p></div>
            </section>

            <section className="container resorts-listing-section">
                {resorts.map((resort, i) => (
                    <div key={resort.slug} className={`resort-listing-item ${i % 2 !== 0 ? 'alternate' : ''}`}>
                        <div className="resort-image-wrapper">
                            <img src={resort.image} alt={resort.name} />
                        </div>
                        <div className="resort-text-wrapper">
                            <div className="resort-text-content">
                                <h2>{resort.name}</h2>
                                <p className="resort-location">
                                    <i className="fas fa-map-marker-alt"></i> {resort.location}
                                </p>
                                <p className="resort-description">{resort.description}</p>
                                <div className="resort-features">
                                    {resort.features.map((f, j) => <span key={j} className="feature-tag">{f}</span>)}
                                </div>
                                <div className="resort-actions">
                                    <Link to={`/resorts/${resort.slug}`} className="btn btn-primary">Explore Resort</Link>
                                    <Link to="/" state={{ resort: resort.slug, autoScroll: true }} className="btn btn-secondary btn-sm">Book Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </>
    );
}
