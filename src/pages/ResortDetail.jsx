import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getExcursions } from '../services/booking';
import '../pages/PageStyles.css';

const RESORT_DATA = {
    limuru: {
        name: 'Jumuia Conference & Country Home',
        location: 'Limuru, Kenya',
        image: '/images/resorts/limuru/limuru background.jpg',
        tagline: 'Serenity in the Limuru Highlands',
        description: 'Experience tranquility and breathtaking views at our country home, perfect for conferences, church events, retreats, and family getaways in the heart of Kenya\'s tea country.',
        highlights: [
            { icon: 'fas fa-mountain', title: 'Highland Scenery', desc: 'Lush greenery and cool mountain air.' },
            { icon: 'fas fa-coffee', title: 'Tea Plantations', desc: 'Surrounded by beautiful tea estates.' },
            { icon: 'fas fa-pray', title: 'Serene Retreats', desc: 'Perfect for prayer and meditation.' },
            { icon: 'fas fa-users', title: 'Group Hosting', desc: 'Excellent facilities for large groups.' }
        ],
        subPages: ['rooms', 'conference', 'gallery', 'virtual-tour', 'excursions', 'offers', 'feedback'],
        videoUrl: '/images/resorts/limuru/VID-20240219-WA0003.mp4'
    },
    kanamai: {
        name: 'Jumuia Conference & Beach Resort',
        location: 'Kanamai Coast, Kenya',
        heroImage: '/images/resorts/kanamai/front kanamai.jpg',
        tagline: 'Experience Coastal Serenity & Warm Hospitality',
        description: 'Set along the pristine shores of Kanamai, our beach resort offers a perfect blend of relaxation and productivity. With direct ocean access, two swimming pools, and state-of-the-art conference facilities, we cater to both holidaymakers and business delegates seeking a tranquil coastal retreat.',
        highlights: [
            { icon: 'fas fa-umbrella-beach', title: 'Private Beach', desc: 'Direct access to the pristine Kanamai shoreline.' },
            { icon: 'fas fa-swimming-pool', title: 'Dual Pools', desc: 'Two sparkling pools for adults and children.' },
            { icon: 'fas fa-sun', title: 'Coastal Sunsets', desc: 'Breathtaking views of the Indian Ocean horizon.' },
            { icon: 'fas fa-fish', title: 'Snorkeling Haven', desc: 'Discover vibrant marine life just off the coast.' }
        ],
        subPages: ['rooms', 'conference', 'gallery', 'virtual-tour', 'excursions', 'offers', 'feedback'],
        videoUrl: '/images/resorts/kanamai/KANAMAI TOUR.mp4'
    },
    kisumu: {
        name: 'Jumuia Hotel Kisumu',
        location: 'Jumuia hotel Kisumu',
        heroImage: '/images/resorts/kisumu/execcutive.jpg',
        tagline: 'HOSPITALITY WITH A CHRISTIAN TOUCH',
        description: 'Jumuia Hotel Kisumu enjoys a location in the city center adjacent to United Mall. The facility is a 13 minute drive from Kisumu International Airport and 10 minute drive from the famous Lake Victoria. Jumuia Hotel Kisumu is part Jumuia Hotel Chain, a subsidiary of the National Council of Churches of Kenya. The resort features 62 rooms with 6 well equipped conference rooms. Guests can relax by the poolside and enjoy snacks and meals from our restaurant.',
        highlights: [
            { icon: 'fas fa-city', title: 'City Center Hub', desc: 'Conveniently located near major business and shopping centers.' },
            { icon: 'fas fa-water', title: 'Lake Victoria Views', desc: 'Breathtaking views of Africa\'s largest fresh water lake.' },
            { icon: 'fas fa-laptop-house', title: 'Business Ready', desc: 'High-speed internet and modern workspaces in every room.' },
            { icon: 'fas fa-swimming-pool', title: 'Garden Pool', desc: 'A refreshing swimming pool set in our lush private gardens.' }
        ],
        subPages: ['rooms', 'conference', 'gallery', 'virtual-tour', 'excursions', 'offers', 'feedback'],
        videoUrl: '/images/resorts/kisumu/KISUMU TOUR.mp4'
    }
};

// ... component logic ...

export function ResortOverview() {
    const { resort } = useParams();
    const data = RESORT_DATA[resort];
    if (!data) return null;

    const backgroundImage = data.heroImage || data.image;

    return (
        <div style={{ animation: 'fadeIn 0.8s ease' }}>
            {/* ─── RICH HERO ─── */}
            <section style={{
                background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${backgroundImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                padding: '120px 0 100px',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '3.5rem', color: 'white', marginBottom: '20px', fontFamily: "'Playfair Display', serif", fontWeight: '700', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{data.tagline}</h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 50px', opacity: 0.95, lineHeight: '1.6' }}>{data.description}</p>



                    {data.highlights && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', flexWrap: 'wrap', marginTop: '60px' }}>
                            {data.highlights.map((h, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(5px)', padding: '12px 25px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <i className={h.icon} style={{ color: 'var(--primary-orange)' }}></i>
                                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{h.title || h.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ─── OVERVIEW CONTENT ─── */}
            <section style={{ padding: '100px 0' }}>
                <div className="container">
                    <div className="resort-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '80px', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '2.8rem', marginBottom: '30px', color: 'var(--primary-green)' }}>Discover {data.name}</h2>
                            {resort === 'limuru' && (
                                <>
                                    <p style={{ color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1.15rem', marginBottom: '30px' }}>
                                        For over three decades, Jumuia Limuru Country Home has been the preferred destination for those seeking tranquility and professional hosting service. Our resort combines the rustic charm of the highlands with modern comforts to provide an unforgettable experience.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        {[
                                            'Professional conferencing with 5 session halls',
                                            'Quiet and prayerful environment for retreats',
                                            'Exquisite dining with local and international cuisines',
                                            'Hostel-style accommodation for groups available',
                                            'Lush green gardens for weddings and events',
                                            'Christian values with excellent customer care'
                                        ].map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <i className="fas fa-check-circle" style={{ color: 'var(--primary-green)' }}></i>
                                                <span style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {resort === 'kanamai' && (
                                <>
                                    <p style={{ color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1.15rem', marginBottom: '30px' }}>
                                        Jumuia Kanamai Beach Resort offers a unique blend of coastal charm and modern amenities. Set along the pristine shores of the Indian Ocean, our resort provides a tranquil escape for families, groups, and corporate delegates alike.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        {[
                                            'Direct access to Kanamai Beach',
                                            'Large freshwater swimming pool with kids section',
                                            'Sea-facing conference halls and pavillions',
                                            'Delicious coastal seafood & international cuisine',
                                            'Extensive grounds for team building',
                                            'Quiet environment for spiritual retreats'
                                        ].map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <i className="fas fa-check-circle" style={{ color: 'var(--primary-green)' }}></i>
                                                <span style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {resort === 'kisumu' && (
                                <>
                                    <p style={{ color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1.15rem', marginBottom: '30px' }}>
                                        Positioned near the shores of Lake Victoria, Jumuia Hotel Kisumu is the perfect base for exploring the Lakeside City. We offer premium hospitality services with a dedicated focus on comfort, convenience, and Christian values.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        {[
                                            'Scenic views of Lake Victoria',
                                            'State-of-the-art conference facilities',
                                            'Refreshing garden swimming pool',
                                            'Central location near business hubs',
                                            'Youth centre and group hosting facilities',
                                            'Hospitality with a Christian touch'
                                        ].map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <i className="fas fa-check-circle" style={{ color: 'var(--primary-green)' }}></i>
                                                <span style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {resort !== 'limuru' && resort !== 'kanamai' && resort !== 'kisumu' && (
                                <p style={{ color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1.15rem' }}>{data.description}</p>
                            )}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '100%', height: '100%', background: 'var(--primary-orange)', borderRadius: '20px', zIndex: -1 }}></div>
                            <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }}>
                                {resort === 'limuru' && <img src="/images/resorts/limuru/limuru-front.jpeg" alt="Resort Front" style={{ width: '100%', height: 'auto', display: 'block' }} />}
                                {resort === 'kanamai' && <img src="/images/resorts/kanamai/kanamai-overview.jpg" alt="Kanamai Beach" style={{ width: '100%', height: 'auto', display: 'block' }} />}
                                {resort === 'kisumu' && <img src="/images/resorts/kisumu/kisumu night view.jpeg" alt="Kisumu Night View" style={{ width: '100%', height: 'auto', display: 'block' }} />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── KISUMU-SPECIFIC: Pool, Grounds & Policies ─── */}
            {resort === 'kisumu' && (
                <section style={{ padding: '80px 0', background: '#f9faf8' }}>
                    <div className="container">
                        {/* Swimming Pool & Event Grounds */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' }}>
                            {/* Swimming Pool Card */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                                <div style={{ height: '220px', background: "url('/images/resorts/kisumu/swimming pool kisumu.jpg') center/cover", position: 'relative' }}>
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: 'white' }}>
                                        <h3 style={{ color: 'white', margin: 0 }}><i className="fas fa-swimming-pool" style={{ marginRight: '10px' }}></i>Swimming Pool</h3>
                                    </div>
                                </div>
                                <div style={{ padding: '25px' }}>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                        <div style={{ flex: 1, background: 'var(--primary-green)', color: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '5px' }}>ADULTS</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>KES 350</div>
                                        </div>
                                        <div style={{ flex: 1, background: 'var(--primary-orange)', color: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '5px' }}>CHILDREN (Under 10)</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>KES 300</div>
                                        </div>
                                    </div>
                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-green)', marginBottom: '10px' }}>Pool Policy</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                        <li style={{ marginBottom: '5px' }}><i className="fas fa-clock" style={{ color: 'var(--primary-orange)', marginRight: '8px', width: '16px' }}></i>Open daily: 8:00 AM – 6:00 PM</li>
                                        <li style={{ marginBottom: '5px' }}><i className="fas fa-tshirt" style={{ color: 'var(--primary-orange)', marginRight: '8px', width: '16px' }}></i>Appropriate swimming costume required</li>
                                        <li style={{ marginBottom: '5px' }}><i className="fas fa-child" style={{ color: 'var(--primary-orange)', marginRight: '8px', width: '16px' }}></i>Children must be accompanied by a parent/guardian</li>
                                        <li><i className="fas fa-shield-alt" style={{ color: 'var(--primary-orange)', marginRight: '8px', width: '16px' }}></i>Management reserves right to admission</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Lush Event Grounds Card */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                                <div style={{ height: '220px', background: "url('/images/resorts/kisumu/kisumu-res.jpg') center/cover", position: 'relative' }}>
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: 'white' }}>
                                        <h3 style={{ color: 'white', margin: 0 }}><i className="fas fa-tree" style={{ marginRight: '10px' }}></i>Lush Grounds for Events</h3>
                                    </div>
                                </div>
                                <div style={{ padding: '25px' }}>
                                    <p style={{ color: 'var(--text-light)', lineHeight: '1.7', marginBottom: '15px' }}>
                                        Our beautifully landscaped grounds are available for outdoor events, team building activities, weddings, and corporate functions at competitive rates.
                                    </p>
                                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                                        {['Outdoor weddings & receptions', 'Corporate team building', 'Garden parties & celebrations', 'Contact us for custom event pricing'].map((item, idx) => (
                                            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <i className="fas fa-check-circle" style={{ color: 'var(--primary-green)', fontSize: '0.85rem' }}></i>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Hotel Policies */}
                        <div style={{ background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                            <div style={{ background: 'var(--primary-green)', color: 'white', padding: '18px 25px' }}>
                                <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}><i className="fas fa-file-contract" style={{ marginRight: '10px' }}></i>Hotel Policies</h3>
                            </div>
                            <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                                {/* Child Policy */}
                                <div>
                                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fas fa-child" style={{ color: 'var(--primary-orange)' }}></i> Child Policy
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: '1.8' }}>
                                        <li>• Children below 3 years sharing the same room with parents at <strong>no extra cost</strong></li>
                                        <li>• Children 3–12 years sharing room with 1 or 2 adults at <strong>50%</strong> of payable room rate (max 2 children)</li>
                                        <li>• Children 3–12 years in their own room at <strong>75%</strong> of payable room rate (max 2 children)</li>
                                    </ul>
                                </div>
                                {/* Day Room Policy */}
                                <div>
                                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fas fa-sun" style={{ color: 'var(--primary-orange)' }}></i> Day Room Policy
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: '1.8' }}>
                                        <li>• Room held after 12 noon to 6pm will be charged <strong>75%</strong> of your rate</li>
                                        <li>• Room held after 6pm will be charged <strong>full rate</strong></li>
                                    </ul>
                                </div>
                                {/* Extra Bed Policy */}
                                <div>
                                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fas fa-bed" style={{ color: 'var(--primary-orange)' }}></i> Extra Bed Policy
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: '1.8' }}>
                                        <li>• Extra bed for adults will be charged at <strong>40%</strong> of the twin/double room rate</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

export function ResortRooms() {
    const { resort } = useParams();
    const rooms = {
        limuru: [
            { name: 'Standard Room Single', type: 'standard-single', price: '4,450', image: '/images/resorts/limuru/standard-room.jpg', features: ['Single Bed', 'WiFi', 'Tea/Coffee', 'En-suite Bath'], bnb: '4,450', hb: '5,300', fb: '6,100', usd_bnb: '60', usd_hb: '65', usd_fb: '70' },
            { name: 'Standard Room Double', type: 'standard-double', price: '7,850', image: '/images/resorts/limuru/standard-room.jpg', features: ['Double Bed', 'WiFi', 'Tea/Coffee', 'En-suite Bath'], bnb: '7,850', hb: '9,000', fb: '10,100', usd_bnb: '95', usd_hb: '105', usd_fb: '115' },
            { name: 'Executive Single', type: 'executive-single', price: '5,600', image: '/images/resorts/limuru/deluxe-room.jpg', features: ['King Bed', 'Sitting Area', 'High-speed WiFi', 'Premium Amenities'], bnb: '5,600', hb: '6,700', fb: '7,500', usd_bnb: '80', usd_hb: '85', usd_fb: '90' },
            { name: 'Executive Double', type: 'executive-double', price: '9,000', image: '/images/resorts/limuru/deluxe-room.jpg', features: ['King Bed', 'Sitting Area', 'High-speed WiFi', 'Premium Amenities'], bnb: '9,000', hb: '10,100', fb: '11,200', usd_bnb: '110', usd_hb: '120', usd_fb: '130' },
            { name: 'Studio Suite Single', type: 'studio-suite-single', price: '11,200', image: '/images/resorts/limuru/executive-suite.jpg', features: ['Living Area', 'Kitchenette', 'Modern Decor', 'DSTV'], bnb: '11,200', hb: '12,350', fb: '13,450', usd_bnb: '135', usd_hb: '145', usd_fb: '155' },
            { name: 'Studio Suite Double', type: 'studio-suite-double', price: '14,200', image: '/images/resorts/limuru/executive-suite.jpg', features: ['Living Area', 'Kitchenette', 'Modern Decor', 'DSTV'], bnb: '14,200', hb: '15,600', fb: '16,950', usd_bnb: '165', usd_hb: '180', usd_fb: '195' },
            { name: 'Hostel Accommodation', type: 'hostel-accommodation', price: '1,500', image: '/images/resorts/limuru/hostel.jpg', features: ['Bunk Beds', 'Shared Bath', 'Budget Friendly', 'Group Ideal'] }
        ],
        kanamai: [
            { name: 'Standard Single', type: 'standard-single', price: '4,000', image: '/images/resorts/kanamai/Single Room.jpg', features: ['Single Bed', 'WiFi', 'Ocean Breeze', 'En-suite Bath'], bnb: '4,000', hb: '4,900', fb: '6,000' },
            { name: 'Standard Twin PPS', type: 'standard-twin', price: '3,000', image: '/images/resorts/kanamai/Standard Twin Room.jpg', features: ['Two Single Beds', 'Tea/Coffee', 'WiFi', 'Desk Space'], bnb: '3,000', hb: '3,900', fb: '4,900' },
            { name: 'Double Room', type: 'standard-double', price: '6,500', image: '/images/resorts/kanamai/Ocean Front Double.jpg', features: ['Double Bed', 'Ocean View', 'AC', 'Premium Linen'], bnb: '6,500', hb: '8,000', fb: '9,500' },
            { name: 'Ocean Front Single', type: 'ocean-front-single', price: '4,500', image: '/images/resorts/kanamai/Single Room.jpg', features: ['Single Bed', 'Ocean Front', 'WiFi', 'AC'], bnb: '4,500', hb: '5,400', fb: '6,400' },
            { name: 'Ocean Front Double', type: 'ocean-front-double', price: '7,000', image: '/images/resorts/kanamai/Ocean Front Double.jpg', features: ['Double Bed', 'Ocean Front', 'AC', 'Premium Linen'], bnb: '7,000', hb: '8,500', fb: '10,000' },
            { name: 'Hostel Accommodation', type: 'hostel-bed-only', price: '2,000', image: '/images/resorts/kanamai/hostel.jpg', features: ['Bunk Beds', 'Shared Facilities', 'Great for Groups'], bnb: '2,000', hb: '2,000', fb: '2,000' }
        ],
        kisumu: [
            { name: 'Standard Single', price: '5,500', image: '/images/resorts/kisumu/standard double.jpg', features: ['Single Bed', 'En-suite Bath', 'WiFi', 'Work Desk'], bnb: '5,500', hb: '6,500', fb: '7,500', usd_bnb: '66', usd_hb: '76', usd_fb: '86' },
            { name: 'Standard Double/Twin', price: '7,500', image: '/images/resorts/kisumu/standard double.jpg', features: ['Double/Twin Beds', 'AC', 'WiFi', 'En-suite Bath'], bnb: '7,500', hb: '9,500', fb: '11,500', usd_bnb: '96', usd_hb: '118', usd_fb: '142' },
            { name: 'Junior Suite Single', price: '8,000', image: '/images/resorts/kisumu/suites-thumb_suites_suitess.jpg', features: ['Queen Bed', 'Sitting Area', 'Premium Amenities', 'WiFi'], bnb: '8,000', hb: '9,000', fb: '10,000', usd_bnb: '89', usd_hb: '100', usd_fb: '110' },
            { name: 'Junior Suite Double', price: '9,000', image: '/images/resorts/kisumu/execcutive.jpg', features: ['King Bed', 'Living Area', 'Mini Bar', 'VIP Amenities'], bnb: '9,000', hb: '11,000', fb: '13,000', usd_bnb: '100', usd_hb: '110', usd_fb: '122' }
        ]
    };

    return (
        <section className="container" style={{ padding: '60px 0' }}>
            <div className="section-header"><h2>Rooms & Accommodation</h2><p>Choose the perfect room for your stay</p></div>

            {/* Detailed UI: Meal Package Legend */}
            {(resort === 'kisumu' || resort === 'kanamai' || resort === 'limuru') && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginBottom: '35px' }}>
                    {[
                        { icon: 'fas fa-coffee', label: 'B&B', desc: 'Bed & Breakfast', color: 'var(--primary-green)' },
                        { icon: 'fas fa-utensils', label: 'Half Board', desc: 'Breakfast + Dinner', color: 'var(--primary-orange)' },
                        { icon: 'fas fa-concierge-bell', label: 'Full Board', desc: 'All Meals Included', color: '#8B4513' }
                    ].map((pkg, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 18px', borderRadius: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
                            <i className={pkg.icon} style={{ color: pkg.color, fontSize: '1rem' }}></i>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--text-dark)' }}>{pkg.label}</div>
                                <div style={{ fontSize: '0.7rem', color: '#999' }}>{pkg.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                {(rooms[resort] || []).map((room, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s' }}>
                        {/* Room Image */}
                        {room.image && (
                            <div style={{ position: 'relative' }}>
                                <img src={room.image} alt={room.name || room.type} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                {room.image && (
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary-green)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.5px' }}>
                                        FROM KES {room.price}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '8px', fontSize: '1.15rem' }}>{room.name || room.type}</h3>

                            {/* Features as compact pills */}
                            {room.features && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
                                    {room.features.map((feature, idx) => (
                                        <span key={idx} style={{ background: '#f0f9f4', color: 'var(--primary-green)', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: '600' }}>
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Advanced Rate Cards */}
                            {(resort === 'kisumu' || resort === 'kanamai' || resort === 'limuru') && room.bnb && (
                                <div style={{ flex: 1 }}>
                                    {/* Residential Rates */}
                                    <div style={{ marginBottom: '12px', border: '2px solid var(--primary-green)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ background: 'var(--primary-green)', color: 'white', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <i className="fas fa-flag" style={{ fontSize: '0.75rem' }}></i>
                                            <span style={{ fontWeight: '700', fontSize: '0.78rem', letterSpacing: '0.5px' }}>RESIDENTIAL RATES (KES)</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', padding: '10px 0' }}>
                                            <div style={{ borderRight: '1px solid #eee' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#999', marginBottom: '3px' }}><i className="fas fa-coffee" style={{ marginRight: '3px' }}></i>B&B</div>
                                                <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-dark)' }}>{room.bnb}</div>
                                            </div>
                                            <div style={{ borderRight: '1px solid #eee' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#999', marginBottom: '3px' }}><i className="fas fa-utensils" style={{ marginRight: '3px' }}></i>Half Board</div>
                                                <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-dark)' }}>{room.hb}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.65rem', color: '#999', marginBottom: '3px' }}><i className="fas fa-concierge-bell" style={{ marginRight: '3px' }}></i>Full Board</div>
                                                <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-dark)' }}>{room.fb}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Non-Residential Rates (Only for Kisumu as of now) */}
                                    {room.usd_bnb && (
                                        <div style={{ marginBottom: '15px', border: '2px solid var(--primary-orange)', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ background: 'var(--primary-orange)', color: 'white', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <i className="fas fa-globe-africa" style={{ fontSize: '0.75rem' }}></i>
                                                <span style={{ fontWeight: '700', fontSize: '0.78rem', letterSpacing: '0.5px' }}>NON-RESIDENTIAL RATES (USD)</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', padding: '10px 0' }}>
                                                <div style={{ borderRight: '1px solid #eee' }}>
                                                    <div style={{ fontSize: '0.65rem', color: '#999', marginBottom: '3px' }}><i className="fas fa-coffee" style={{ marginRight: '3px' }}></i>B&B</div>
                                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-dark)' }}>${room.usd_bnb}</div>
                                                </div>
                                                <div style={{ borderRight: '1px solid #eee' }}>
                                                    <div style={{ fontSize: '0.65rem', color: '#999', marginBottom: '3px' }}><i className="fas fa-utensils" style={{ marginRight: '3px' }}></i>Half Board</div>
                                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-dark)' }}>${room.usd_hb}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', color: '#999', marginBottom: '3px' }}><i className="fas fa-concierge-bell" style={{ marginRight: '3px' }}></i>Full Board</div>
                                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-dark)' }}>${room.usd_fb}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Child Policy Quick Tip */}
                                    <div style={{ background: '#fff9f0', border: '1px solid #ffe0b2', borderRadius: '8px', padding: '10px 12px', marginBottom: '15px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <i className="fas fa-child" style={{ color: 'var(--primary-orange)', marginTop: '2px', fontSize: '0.85rem' }}></i>
                                        <div style={{ fontSize: '0.72rem', color: '#8B6914', lineHeight: '1.5' }}>
                                            {resort === 'kanamai' ? (
                                                <><strong>Kids:</strong> Free 3 yrs & below · 50% (4–11 sharing) · 75% (4–11 own room)</>
                                            ) : (
                                                <><strong>Kids:</strong> Free under 3 yrs · 50% (3–12 sharing) · 75% (3–12 own room)</>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dual Booking Buttons for resorts with currency distinction, single button for Kanamai */}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                        {resort === 'kanamai' ? (
                                            <Link
                                                to="/#quick-book"
                                                state={{ resort, roomType: room.type || room.name, nationality: 'kenyan', packageType: (room.type?.startsWith('hostel') ? 'hostel' : 'bnb'), autoScroll: true }}
                                                className="btn"
                                                style={{
                                                    flex: 1, padding: '12px 10px', textAlign: 'center', fontWeight: '700',
                                                    fontSize: '0.85rem', borderRadius: '10px', background: 'var(--primary-green)',
                                                    color: 'white', border: 'none', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', gap: '8px', textDecoration: 'none',
                                                    boxShadow: '0 4px 12px rgba(39, 110, 54, 0.15)'
                                                }}
                                            >
                                                <i className="fas fa-calendar-check"></i> Book Now
                                            </Link>
                                        ) : (
                                            <>
                                                <Link
                                                    to="/#quick-book"
                                                    state={{ resort, roomType: room.type || room.name, nationality: 'kenyan', autoScroll: true }}
                                                    className="btn"
                                                    style={{
                                                        flex: 1, padding: '11px 8px', textAlign: 'center', fontWeight: '700',
                                                        fontSize: '0.75rem', borderRadius: '8px', background: 'var(--primary-green)',
                                                        color: 'white', border: 'none', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', gap: '5px', textDecoration: 'none'
                                                    }}
                                                >
                                                    <i className="fas fa-flag"></i> Book Residential
                                                </Link>
                                                <Link
                                                    to="/#quick-book"
                                                    state={{ resort, roomType: room.type || room.name, nationality: 'intl', autoScroll: true }}
                                                    className="btn"
                                                    style={{
                                                        flex: 1, padding: '11px 8px', textAlign: 'center', fontWeight: '700',
                                                        fontSize: '0.75rem', borderRadius: '8px', background: 'var(--primary-orange)',
                                                        color: 'white', border: 'none', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', gap: '5px', textDecoration: 'none'
                                                    }}
                                                >
                                                    <i className="fas fa-globe-africa"></i> Book Non-Residential
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Fallback simple layout */}
                            {resort !== 'kisumu' && resort !== 'kanamai' && resort !== 'limuru' && (!room.bnb) && (
                                <>
                                    <p style={{ color: 'var(--primary-orange)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '10px' }}>KES {room.price}<span style={{ fontSize: '0.85rem', fontWeight: '400', color: 'var(--text-light)' }}> / night (B&B)</span></p>
                                    {room.features && (
                                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '15px' }}>
                                            {room.features.map((feature, idx) => (
                                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                                    <i className="fas fa-check-circle" style={{ color: 'var(--primary-orange)', fontSize: '0.9rem' }}></i>
                                                    <span style={{ fontSize: '0.95rem' }}>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <div style={{ marginTop: 'auto' }}>
                                        <Link to="/#quick-book" state={{ resort, roomType: room.type || room.name, packageType: 'bnb', nationality: 'kenyan', autoScroll: true }} className="btn btn-primary" style={{ width: '100%', padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                                            <i className="fas fa-calendar-check" style={{ marginRight: '8px' }}></i>Book This Room
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Limuru: Extra Information & Policies Panel */}
            {resort === 'limuru' && (
                <div style={{ marginTop: '40px', background: '#fdfcf7', border: '1px solid #e8ece5', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <div style={{ background: 'var(--primary-green)', color: 'white', padding: '15px 25px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}><i className="fas fa-book-open" style={{ marginRight: '10px' }}></i>Important Policies & Information</h3>
                    </div>
                    <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                        {/* Additional Charges */}
                        <div>
                            <h4 style={{ color: 'var(--primary-orange)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                <i className="fas fa-plus-circle"></i> Additional Charges
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: '1.7' }}>
                                <li>• Children 4 years & below - <strong>Free</strong> (Sharing with parents)</li>
                                <li>• Children from 5 to 11 years sharing with parents <strong>50% Adult Rate</strong></li>
                                <li>• Children from 5 to 11 years exclusive use of room <strong>75% Adult Rate</strong></li>
                                <li>• Extra Bed - <strong>40%</strong> of the Room rate</li>
                            </ul>
                        </div>

                        {/* Note */}
                        <div>
                            <h4 style={{ color: 'var(--primary-orange)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                <i className="fas fa-exclamation-triangle"></i> Note
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: '1.7' }}>
                                <li>• Rates inclusive of statutory taxes</li>
                                <li>• Rates subject to change without notice</li>
                                <li>• Check-in time <strong>12.00 Noon</strong>. Check-out <strong>10:00 AM</strong></li>
                                <li>• Day Room charges <strong>75%</strong> of the applicable room charge</li>
                            </ul>
                        </div>

                        {/* Cancellation Policy */}
                        <div>
                            <h4 style={{ color: 'var(--primary-orange)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                <i className="fas fa-ban"></i> Cancellation Policy
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: '1.7' }}>
                                <strong style={{ color: '#555' }}>30 - 20 Days:</strong> <span>15% Value of the booking</span>
                                <strong style={{ color: '#555' }}>20 - 10 Days:</strong> <span>30% Value of the booking</span>
                                <strong style={{ color: '#555' }}>10 - 0 Days:</strong> <span>100% Value of the booking</span>
                                <strong style={{ color: '#555' }}>No Show:</strong> <span>100% Value of the booking</span>
                            </div>
                        </div>

                        {/* Games Facilities */}
                        <div style={{ background: '#f5f9f5', padding: '20px', borderRadius: '10px', border: '1px solid #d4e3d4' }}>
                            <h4 style={{ color: 'var(--primary-green)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                <i className="fas fa-volleyball-ball"></i> Games Facilities Available
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: '1.6', margin: 0 }}>
                                Football, Volley Ball, Basket Ball, Hand Ball, Lawn Tennis, Field Track Events, Tug of War, Darts Board.
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </section>
    );
}

export function ResortConference() {
    const { resort } = useParams();
    const conferenceFacilities = resort === 'limuru' ? [
        { name: 'Plenary Hall', capacity: '500 pax', image: '/images/resorts/limuru/main-hall.jpg', desc: 'Large hall suitable for major conferences, conventions, and large gatherings.' },
        { name: 'Conference Room A', capacity: '100 pax', image: '/images/resorts/limuru/conference-hall-2.jpg', desc: 'Medium-sized room, ideal for workshops, seminars, and corporate meetings.' },
        { name: 'Boardroom', capacity: '20 pax', image: '/images/resorts/limuru/boardroom.jpg', desc: 'Intimate setting for executive meetings, strategic discussions, and private sessions.' },
        { name: 'Breakout Rooms', capacity: '30 pax each', image: '/images/resorts/limuru/breakout-room.jpg', desc: 'Flexible spaces for smaller group discussions, training sessions, or parallel workshops.' }
    ] : resort === 'kanamai' ? [
        { name: 'Main Ocean Hall', capacity: '200 pax', image: '/images/resorts/kanamai/conferences h.jpeg', desc: 'Conference hall with stunning ocean views and modern equipment.' },
        { name: 'Beachfront Pavilion', capacity: '150 pax', image: '/images/resorts/kanamai/best conference.jpeg', desc: 'Perfect for open-air workshops and team building events.' },
        { name: 'Coastal Meeting Room', capacity: '50 pax', image: '/images/resorts/kanamai/conference h2.jpeg', desc: 'Ideal for medium-sized corporate meetings and seminars.' }
    ] : resort === 'kisumu' ? [
        { name: 'Victoria Hall', capacity: '300 pax', image: '/images/resorts/kisumu/Kisumu conference hall.jpeg', desc: 'Grand hall with modern AV setup and lakeside views.' },
        { name: 'Nyanza Suite', capacity: '80 pax', image: '/images/resorts/kisumu/conference hall.jpg', desc: 'Versatile space for workshops and corporate training.' },
        { name: 'Lake View Boardroom', capacity: '15 pax', image: '/images/resorts/kisumu/conference.jpg', desc: 'High-level executive boardroom with privacy and comfort.' }
    ] : [];

    return (
        <section className="container" style={{ padding: '60px 0' }}>
            <div className="section-header"><h2>Conference Facilities</h2><p>Modern meeting spaces for every occasion</p></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                {conferenceFacilities.map((facility, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 'var(--radius)', padding: '25px', boxShadow: 'var(--shadow)' }}>
                        {facility.image && <img src={facility.image} alt={facility.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius)', marginBottom: '15px' }} />}
                        <i className="fas fa-users" style={{ fontSize: '2rem', color: 'var(--primary-orange)', marginBottom: '15px', display: 'block' }}></i>
                        <h3 style={{ marginBottom: '10px' }}>{facility.name}</h3>
                        <p style={{ color: 'var(--text-light)' }}>{facility.desc}</p>
                        {facility.capacity && <p style={{ marginTop: '10px', fontWeight: '600' }}>Capacity: {facility.capacity}</p>}
                    </div>
                ))}
            </div>

            {/* Limuru-specific: Conference Package Pricing */}
            {resort === 'limuru' && (
                <div style={{ marginTop: '40px', background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--primary-green)', color: 'white', padding: '18px 25px' }}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}><i className="fas fa-tag" style={{ marginRight: '10px' }}></i>Limuru Conference Packages</h3>
                    </div>
                    <div style={{ padding: '25px' }}>
                        <h4 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-orange)', fontSize: '1.2rem' }}>Full Board Conference & Accommodation</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                            {[
                                { title: 'Single Standard Room', kes: '6,750', usd: '85', desc: 'Per person per day' },
                                { title: 'Twin Room (Sharing)', kes: '5,850', usd: '75', desc: 'Per person per day' },
                                { title: 'Single Executive Room', kes: '7,850', usd: '95', desc: 'Per person per day' }
                            ].map((pkg, i) => (
                                <div key={i} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '10px', fontSize: '0.95rem' }}>{pkg.title}</h4>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-orange)', marginBottom: '3px' }}>KES {pkg.kes}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '5px' }}>USD {pkg.usd}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '15px' }}>{pkg.desc}</div>
                                    <div style={{ marginTop: 'auto' }}>
                                        <Link to="/#quick-book" state={{ resort, packageType: 'conference', autoScroll: true, nationality: 'kenyan' }} className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.8rem', fontWeight: '600' }}>
                                            <i className="fas fa-calendar-alt" style={{ marginRight: '5px' }}></i> Book Package
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h4 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-orange)', fontSize: '1.2rem', paddingTop: '20px', borderTop: '1px solid #eee' }}>Day Conference Packages</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                            {[
                                { title: 'Full Day Conference', kes: '2,600', usd: '35', desc: 'Per person' },
                                { title: 'Half Day Conference', kes: '2,200', usd: '30', desc: 'Per person' }
                            ].map((pkg, i) => (
                                <div key={i} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', background: '#fdfdfd' }}>
                                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '10px', fontSize: '0.95rem' }}>{pkg.title}</h4>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-orange)', marginBottom: '3px' }}>KES {pkg.kes}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '5px' }}>USD {pkg.usd}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '15px' }}>{pkg.desc}</div>
                                    <div style={{ marginTop: 'auto' }}>
                                        <Link to="/#quick-book" state={{ resort, packageType: 'conference-day', autoScroll: true, nationality: 'kenyan' }} className="btn btn-secondary" style={{ width: '100%', padding: '10px', fontSize: '0.8rem', fontWeight: '600' }}>
                                            <i className="fas fa-calendar-alt" style={{ marginRight: '5px' }}></i> Book Package
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Kisumu-specific: Conference Package Pricing */}
            {resort === 'kisumu' && (
                <div style={{ marginTop: '40px', background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--primary-green)', color: 'white', padding: '18px 25px' }}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}><i className="fas fa-tag" style={{ marginRight: '10px' }}></i>Kisumu Conference Packages</h3>
                    </div>
                    <div style={{ padding: '25px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                            {[
                                { title: 'Jumuia Corporate', kes: '7,900', usd: '86', desc: 'Per person' },
                                { title: 'Jumuia Executive', kes: '8,515', usd: '108', desc: 'Per person' },
                                { title: 'Full Day Conference', kes: '2,500', usd: '33', desc: 'Per person' },
                                { title: 'Half Day Conference', kes: '2,000', usd: '27', desc: 'Per person' }
                            ].map((pkg, i) => (
                                <div key={i} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '10px', fontSize: '0.95rem' }}>{pkg.title}</h4>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-orange)', marginBottom: '3px' }}>KES {pkg.kes}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>USD {pkg.usd}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '15px' }}>{pkg.desc}</div>
                                    <div style={{ marginTop: 'auto' }}>
                                        <Link to="/#quick-book" state={{ resort, packageType: 'conference', autoScroll: true, nationality: 'kenyan' }} className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.8rem', fontWeight: '600' }}>
                                            <i className="fas fa-calendar-alt" style={{ marginRight: '5px' }}></i> Book Package
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Kanamai-specific: Conference Package Pricing */}
            {resort === 'kanamai' && (
                <div style={{ marginTop: '40px', background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--primary-orange)', color: 'white', padding: '18px 25px' }}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}><i className="fas fa-tag" style={{ marginRight: '10px' }}></i>Kanamai Conference Rates</h3>
                    </div>
                    <div style={{ padding: '25px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {[
                                { title: 'Full Board (Single Standard)', price: '7,500', type: 'conference-single-standard', desc: 'Per Day' },
                                { title: 'Full Board (Twin Sharing)', price: '6,000', type: 'conference-twin-sharing', desc: 'Per Person Per Day' },
                                { title: 'Full Board (Single Executive)', price: '8,000', type: 'conference-single-executive', desc: 'Per Person Per Day' },
                                { title: 'Full Day Conference Package', price: '2,500', type: 'conference-full-day', desc: 'Per Person' },
                                { title: 'Half Day Conference Package', price: '2,250', type: 'conference-half-day', desc: 'Per Person' }
                            ].map((pkg, i) => (
                                <div key={i} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', background: '#fdfdfd' }}>
                                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '10px', fontSize: '0.95rem', lineHeight: '1.4' }}>{pkg.title}</h4>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-orange)', marginBottom: '5px' }}>KES {pkg.price}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '20px', fontWeight: '500' }}>{pkg.desc}</div>
                                    <div style={{ marginTop: 'auto' }}>
                                        <Link to="/#quick-book" state={{ resort, roomType: pkg.type, packageType: 'conference', nationality: 'kenyan', autoScroll: true }} className="btn btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '0.85rem', fontWeight: '700', borderRadius: '8px' }}>
                                            <i className="fas fa-calendar-check" style={{ marginRight: '8px' }}></i> Book Conference
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Kanamai-specific: Hostel Rates */}
            {resort === 'kanamai' && (
                <div style={{ marginTop: '40px', background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--primary-green)', color: 'white', padding: '18px 25px' }}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}><i className="fas fa-bed" style={{ marginRight: '10px' }}></i>Kanamai Hostel Rates</h3>
                    </div>
                    <div style={{ padding: '25px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {[
                                { title: 'Students / Kids Minimum Requirements 20 Pax', price: '3,500', type: 'hostel-students', desc: 'Per Person' },
                                { title: 'Adult Groups', price: '4,000', type: 'hostel-adult-groups', desc: 'Per Person' },
                                { title: 'Hostel With Catering Per Night / Bed Only', price: '1,500', type: 'hostel-bed-only', desc: 'Per Person' },
                                { title: 'Hire Of Kitchen And 2 Staff (20 - 50 Pax)', price: '15,000', type: 'hostel-kitchen-hire', desc: 'Per Day' },
                                { title: 'Hostel Bed and Breakfast', price: '2,000', type: 'hostel-bnb', desc: 'Per Person' }
                            ].map((pkg, i) => (
                                <div key={i} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', background: '#fdfdfd' }}>
                                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '10px', fontSize: '0.95rem', lineHeight: '1.4' }}>{pkg.title}</h4>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-orange)', marginBottom: '5px' }}>KES {pkg.price}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '20px', fontWeight: '500' }}>{pkg.desc}</div>
                                    <div style={{ marginTop: 'auto' }}>
                                        <Link to="/#quick-book" state={{ resort, roomType: pkg.type, packageType: 'hostel', nationality: 'kenyan', autoScroll: true }} className="btn btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '0.85rem', fontWeight: '700', borderRadius: '8px' }}>
                                            <i className="fas fa-calendar-check" style={{ marginRight: '8px' }}></i> Book Hostel
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export function ResortGallery() {
    const { resort } = useParams();
    const images = resort === 'limuru' ? [
        { url: '/images/resorts/limuru/limuru-front.jpeg', title: 'Main Entrance' },
        { url: '/images/resorts/limuru/limuru background.jpg', title: 'Limuru Highlands' },
        { url: '/images/resorts/limuru/limuru grounds.jpg', title: 'Lush Gardens' },
        { url: '/images/resorts/limuru/standard-room.jpg', title: 'Standard Room' },
        { url: '/images/resorts/limuru/deluxe-room.jpg', title: 'Executive Room' },
        { url: '/images/resorts/limuru/main-hall.jpg', title: 'Plenary Hall' },
        { url: '/images/resorts/limuru/main-restaurant.jpg', title: 'Grand Dining' },
        { url: '/images/resorts/limuru/fireside-lounge.jpg', title: 'Fireside Lounge' },
        { url: '/images/resorts/limuru/night view.jpg', title: 'Resort at Night' }
    ] : resort === 'kanamai' ? [
        { url: '/images/resorts/kanamai/front kanamai.jpg', title: 'Resort Entrance' },
        { url: '/images/resorts/kanamai/beach view.jpg', title: 'Pristine Beach' },
        { url: '/images/resorts/kanamai/aerial swimming.jpg', title: 'Swimming Pool Ariel' },
        { url: '/images/resorts/kanamai/aerial view.jpg', title: 'Aerial Resort View' },
        { url: '/images/resorts/kanamai/dinning.jpg', title: 'Coastal Dining' },
        { url: '/images/resorts/kanamai/kanamai chef.jpg', title: 'Our Culinary Team' },
        { url: '/images/resorts/kanamai/Standard Twin Room.jpg', title: 'Standard Twin Room' },
        { url: '/images/resorts/kanamai/Ocean Front Double.jpg', title: 'Ocean Front Suite' },
        { url: '/images/resorts/kanamai/Kanamai swimming-pool.jpg', title: 'Lush Pool Garden' },
        { url: '/images/resorts/kanamai/kanamai beach.jpg', title: 'Beach Activities' }
    ] : resort === 'kisumu' ? [
        { url: '/images/resorts/kisumu/kisumu-res.jpg', title: 'Hotel Exterior' },
        { url: '/images/resorts/kisumu/lake victoria.webp', title: 'Lake Victoria' },
        { url: '/images/resorts/kisumu/swimming pool kisumu.jpg', title: 'Garden Pool' },
        { url: '/images/resorts/kisumu/execcutive.jpg', title: 'Executive Suite' },
        { url: '/images/resorts/kisumu/Kisumu conference hall.jpeg', title: 'Grand Conference Hall' },
        { url: '/images/resorts/kisumu/kisumu night view.jpeg', title: 'Kisumu City Lights' },
        { url: '/images/resorts/kisumu/standard double.jpg', title: 'Standard Double' },
        { url: '/images/resorts/kisumu/museum.jpg', title: 'Kisumu Museum' },
        { url: '/images/resorts/kisumu/impala sanctuary.jpg', title: 'Wildlife Sanctuary' }
    ] : [];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', padding: '60px 0' }}>
            <div className="container">
                <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Photo Gallery</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {images.map((img, i) => (
                        <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', height: '250px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                            <img src={img.url} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ResortVirtualTour() {
    const { resort } = useParams();
    const data = RESORT_DATA[resort];

    if (!data?.videoUrl) {
        return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h2>Virtual Tour Coming Soon</h2></div>;
    }

    return (
        <section className="container" style={{ padding: '60px 0' }}>
            <div className="section-header">
                <h2>Virtual Tour</h2>
                <p>Experience {data.name} through an immersive video tour</p>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <div style={{ background: 'var(--primary-green)', color: 'white', padding: '15px 25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-video"></i>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>Resort Video Tour</h3>
                </div>
                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                    <video
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        <source src={data.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div style={{ padding: '25px', borderTop: '1px solid #eee' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ marginBottom: '5px' }}><i className="fas fa-info-circle"></i> Tour Information</h4>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>This virtual tour showcases our facilities, rooms, and surroundings. Experience the atmosphere of Jumuia Resorts from the comfort of your home.</p>
                        </div>
                        <a href={data.videoUrl} download={`Jumuia-${resort}-Tour.mp4`} className="btn btn-secondary">
                            <i className="fas fa-download"></i> Download Tour
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function ResortExcursions() {
    const { resort } = useParams();
    const excursions = getExcursions(resort);

    return (
        <section className="container" style={{ padding: '60px 0' }}>
            <div className="section-header"><h2>Excursions & Activities</h2><p>Explore the best of the area</p></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                {excursions.map((ex, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                        <img src={ex.image} alt={ex.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        <div style={{ padding: '20px' }}>
                            <h3 style={{ marginBottom: '10px' }}>{ex.label}</h3>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '15px' }}>{ex.desc}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <span style={{ fontWeight: '700', color: 'var(--primary-orange)' }}>KES {ex.price?.toLocaleString()}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}><i className="far fa-clock"></i> {ex.duration}</span>
                            </div>
                            <Link
                                to="/#quick-book"
                                state={{ resort, excursionId: ex.id, autoScroll: true }}
                                className="btn-excursion"
                            >
                                <i className="far fa-calendar-check"></i>
                                Book This Excursion
                                <i className="fas fa-chevron-right" style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.7 }}></i>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function ResortOffers() {
    const { resort } = useParams();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [showClaimModal, setShowClaimModal] = useState(false);

    useEffect(() => {
        api.get(`/offers?resort=${resort}&active=true`).then(res => {
            setOffers(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [resort]);

    const handleClaimClick = (offer) => {
        setSelectedOffer(offer);
        setShowClaimModal(true);
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', padding: '60px 0' }}>
            <div className="container">
                <div className="section-header" style={{ marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2.5rem' }}>Special Resort Offers</h2>
                    <p>Exclusive deals specifically for {resort.charAt(0).toUpperCase() + resort.slice(1)}</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : offers.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
                        {offers.map((offer) => (
                            <div key={offer._id} style={{
                                background: 'white', borderRadius: '15px', overflow: 'hidden',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column'
                            }}>
                                <div style={{
                                    backgroundImage: offer.image ? `url(${offer.image})` : 'none',
                                    backgroundColor: offer.image ? 'transparent' : '#f5f5f5',
                                    height: '220px',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {!offer.image && <i className="fas fa-image" style={{ fontSize: '2.5rem', color: '#ccc' }}></i>}
                                    {offer.discount && <div style={{
                                        position: 'absolute', top: '15px', right: '15px', background: 'var(--primary-orange)',
                                        color: 'white', padding: '6px 12px', borderRadius: '20px', fontWeight: '800', fontSize: '0.8rem'
                                    }}>{offer.discount}% OFF</div>}
                                </div>
                                <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>{offer.title}</h3>
                                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>{offer.description}</p>


                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        {offer.price && <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary-green)' }}>KES {offer.price.toLocaleString()}</div>}
                                        <button
                                            onClick={() => handleClaimClick(offer)}
                                            className="btn"
                                            style={{
                                                background: 'var(--primary-green)', color: 'white', padding: '10px 20px',
                                                borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700'
                                            }}
                                        >
                                            Claim Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)', background: '#fcfcfc', borderRadius: '20px' }}>
                        <i className="fas fa-bullhorn" style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.2 }}></i>
                        <p>No resort-specific offers available right now.</p>
                        <a href="/offers" className="btn btn-secondary" style={{ marginTop: '15px' }}>View Global Offers</a>
                    </div>
                )}

                {showClaimModal && (
                    <ClaimModal
                        offer={selectedOffer}
                        isOpen={showClaimModal}
                        onClose={() => setShowClaimModal(false)}
                    />
                )}
            </div>
        </div>
    );
}

export function ResortFeedback() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', padding: '80px 0', background: '#fcfcfc' }}>
            <div className="container" style={{ maxWidth: '700px' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Guest Feedback</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '30px' }}>Your experience matters to us. Please share your thoughts.</p>
                    <form>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Full Name</label>
                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="John Doe" />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Rating</label>
                            <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                <option>5 - Excellent</option>
                                <option>4 - Very Good</option>
                                <option>3 - Good</option>
                                <option>2 - Fair</option>
                                <option>1 - Poor</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Comments</label>
                            <textarea style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '120px' }} placeholder="How was your stay?"></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px' }}>Submit Feedback</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default function ResortDetail() {
    const { resort } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const data = RESORT_DATA[resort];
    const [activeSection, setActiveSection] = useState('overview');

    // Scroll to top when resort changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [resort]);

    // Handle initial scroll if navigating to a specific sub-route
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const activeTab = pathParts.length > 3 ? pathParts[3] : 'overview';

        // Let React render first
        setTimeout(() => {
            const element = document.getElementById(activeTab);
            if (element) {
                // Determine a sensible offset based on header height
                const headerOffset = 180;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                setActiveSection(activeTab);
            }
        }, 100);
    }, [location.pathname]);

    // Use Intersection Observer for active scroll spy highlighting
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['overview', 'rooms', 'conference', 'excursions', 'offers', 'gallery', 'virtual-tour', 'feedback'];
            const scrollPosition = window.scrollY + 200; // Offset for header

            let current = 'overview';
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && element.offsetTop <= scrollPosition) {
                    current = section;
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e, sectionId, path) => {
        e.preventDefault();

        // Update the URL without reloading page so links still work visually
        const newPath = path === '' ? `/resorts/${resort}` : `/resorts/${resort}/${path}`;
        window.history.pushState(null, '', newPath);

        const sectionIdToScroll = sectionId === '' ? 'overview' : sectionId;
        const element = document.getElementById(sectionIdToScroll);

        if (element) {
            const headerOffset = 180;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setActiveSection(sectionIdToScroll);
        }
    };

    if (!data) return <div style={{ padding: '100px', textAlign: 'center' }}>Resort not found</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#fff' }}>
            {/* ─── STICKY RESORT HEADER CONTAINER ─── */}
            <div className="resort-sticky-container">
                {/* ─── TOP BAR (Double Header Part 1) ─── */}
                <div style={{
                    background: 'rgba(34, 68, 15, 0.98)',
                    color: 'white',
                    padding: '8px 0',
                    fontSize: '0.85rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to="/resorts" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                            <i className="fas fa-arrow-left"></i>
                            <span>Back <span className="compact-hide">to Jumuia Resorts Home</span></span>
                        </Link>
                        <div style={{ display: 'flex', gap: '20px' }} className="compact-hide">
                            <span style={{ opacity: 0.9 }}><i className="fas fa-phone-alt" style={{ marginRight: '5px' }}></i> 0741 574 828</span>
                            <span style={{ opacity: 0.9 }}><i className="fas fa-envelope" style={{ marginRight: '5px' }}></i> reservations@jumuiaresorts.org</span>
                        </div>
                    </div>
                </div>

                {/* ─── MAIN HEADER (Double Header Part 2) ─── */}
                <header className="resort-header">
                    <div className="container">
                        <div className="resort-branding-row">
                            <img src="/images/Jumuia-Resorts.svg" alt="Logo" />
                            <div className="resort-identity-centered">
                                <h2>{data.name}</h2>
                                <span className="location-tag">{data.location}</span>
                            </div>
                            <Link to="/#quick-book" state={{ resort: resort, nationality: 'kenyan', autoScroll: true }} className="btn btn-primary" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>
                                Book Now
                            </Link>
                        </div>

                        <nav className="resort-nav">
                            {[
                                { path: '', id: 'overview', label: 'Home' },
                                { path: 'rooms', id: 'rooms', label: 'Rooms & Rates' },
                                { path: 'conference', id: 'conference', label: 'Conference' },
                                { path: 'excursions', id: 'excursions', label: 'Excursions' },
                                { path: 'offers', id: 'offers', label: 'Offers' },
                                { path: 'gallery', id: 'gallery', label: 'Gallery' },
                                { path: 'virtual-tour', id: 'virtual-tour', label: 'Virtual Tour' },
                                { path: 'feedback', id: 'feedback', label: 'Feedback' }
                            ].map(link => {
                                const sectionId = link.path || 'overview';
                                return (
                                    <a
                                        key={link.id}
                                        href={`#${link.id}`}
                                        onClick={(e) => scrollToSection(e, link.id, link.path)}
                                        className={`resort-nav-link ${activeSection === sectionId ? 'active' : ''}`}
                                    >
                                        {link.label}
                                    </a>
                                );
                            })}
                        </nav>
                    </div>
                </header>
            </div>

            {/* ─── MAIN CONTENT SCROLLING SECTIONS ─── */}
            <main>
                <div id="overview"><ResortOverview /></div>
                <div id="rooms"><ResortRooms /></div>
                <div id="conference"><ResortConference /></div>
                <div id="excursions"><ResortExcursions /></div>
                <div id="offers"><ResortOffers /></div>
                <div id="gallery"><ResortGallery /></div>
                <div id="virtual-tour"><ResortVirtualTour /></div>
                <div id="feedback"><ResortFeedback /></div>
            </main>
        </div>
    );
}

// ... original sub-components remain defined above ...
