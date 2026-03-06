import { useState, useEffect } from 'react';
import api from '../services/api';
import ClaimModal from '../components/ClaimModal';
import './PageStyles.css';

export default function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [showClaimModal, setShowClaimModal] = useState(false);

    useEffect(() => {
        api.get('/offers?active=true').then(res => {
            setOffers(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleClaimClick = (offer) => {
        setSelectedOffer(offer);
        setShowClaimModal(true);
    };

    return (
        <>
            <section className="page-hero" style={{ backgroundImage: "url('/images/resorts/kanamai/front kanamai.jpg')" }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '20px' }}>Special Offers</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Value-packed deals for your next spiritual or leisure retreat</p>
                </div>
            </section>

            <section className="container" style={{ padding: '80px 0' }}>
                <div className="section-header" style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2.8rem' }}>Current Offers</h2>
                    <p>Exclusive promotions available across our properties</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : offers.length > 0 ? (
                    <div className="offers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                        {offers.map((offer) => (
                            <div className="offer-card" key={offer._id} style={{
                                background: 'white', borderRadius: '20px', overflow: 'hidden',
                                boxShadow: '0 15px 40px rgba(0,0,0,0.08)', transition: 'transform 0.3s'
                            }}>
                                <div className="offer-image" style={{
                                    backgroundImage: offer.image ? `url(${offer.image})` : 'none',
                                    backgroundColor: offer.image ? 'transparent' : '#f5f5f5',
                                    height: '250px',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {!offer.image && <i className="fas fa-image" style={{ fontSize: '3rem', color: '#ccc' }}></i>}
                                    {offer.discount && <span className="offer-badge" style={{
                                        position: 'absolute', top: '20px', right: '20px', background: 'var(--primary-orange)',
                                        color: 'white', padding: '8px 15px', borderRadius: '30px', fontWeight: '800', fontSize: '0.85rem'
                                    }}>{offer.discount}% OFF</span>}
                                    <div style={{
                                        position: 'absolute', bottom: 0, left: 0, padding: '10px 20px',
                                        background: 'rgba(27, 94, 32, 0.9)', color: 'white', fontSize: '0.75rem',
                                        fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'
                                    }}>
                                        <i className="fas fa-map-marker-alt" style={{ marginRight: '8px' }}></i>
                                        {offer.resort === 'global' ? 'All Resorts' : offer.resort}
                                    </div>
                                </div>
                                <div className="offer-content" style={{ padding: '30px' }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{offer.title}</h3>
                                    <p style={{ color: 'var(--text-light)', lineHeight: '1.7', marginBottom: '20px', fontSize: '0.95rem' }}>{offer.description}</p>


                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        {offer.price ? (
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', fontWeight: '700' }}>Price from</div>
                                                <div style={{ color: 'var(--primary-green)', fontWeight: '800', fontSize: '1.5rem' }}>KES {offer.price.toLocaleString()}</div>
                                            </div>
                                        ) : <div></div>}
                                        <button
                                            onClick={() => handleClaimClick(offer)}
                                            className="btn btn-primary"
                                            style={{ padding: '12px 25px', borderRadius: '12px', fontWeight: '700' }}
                                        >
                                            Claim Offer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8faf9', borderRadius: '30px', color: 'var(--text-light)' }}>
                        <i className="fas fa-tags" style={{ fontSize: '4rem', marginBottom: '20px', display: 'block', opacity: 0.2 }}></i>
                        <h3 style={{ color: '#999' }}>No Active Offers</h3>
                        <p>We are currently preparing new exciting deals. Please check back soon!</p>
                    </div>
                )}
            </section>

            {showClaimModal && (
                <ClaimModal
                    offer={selectedOffer}
                    isOpen={showClaimModal}
                    onClose={() => setShowClaimModal(false)}
                />
            )}
        </>
    );
}
