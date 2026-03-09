import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';
import './Header.css';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleHomeClick = (e) => {
        setMenuOpen(false);
        if (location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="site-header">
            <div className="header-top">
                <div className="container header-top-content">
                    <div className="slogan">Hospitality With A Christian Touch</div>
                    <div className="header-top-actions">
                        <a href="tel:+254759423589" className="header-top-link">
                            <i className="fas fa-phone"></i>
                            <span>+254 759 423589</span>
                        </a>
                        <a href="mailto:info@resortjumuia.com" className="header-top-link">
                            <i className="fas fa-envelope"></i>
                            <span>info@resortjumuia.com</span>
                        </a>
                    </div>
                </div>
            </div>

            <div className="container header-container">
                <Link to="/" className="logo">
                    <Logo className="logo-img" />
                    <div className="logo-text">
                        <h1>Jumuia Resorts</h1>
                        <p>Christian Hospitality & Conference Centres</p>
                    </div>
                </Link>

                <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    <i className={menuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
                </button>

                <nav className={`main-nav ${menuOpen ? 'active' : ''}`}>
                    <NavLink to="/" end onClick={handleHomeClick}>Home</NavLink>
                    {/* About Us Dropdown */}
                    <div className="nav-dropdown">
                        <NavLink to="/about" className="dropdown-trigger" onClick={() => setMenuOpen(false)}>
                            About Us <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', marginLeft: '4px' }}></i>
                        </NavLink>
                        <div className="dropdown-menu">
                            <Link to="/about#who-we-are" onClick={() => setMenuOpen(false)}>Who We Are</Link>
                            <Link to="/about#mission-values" onClick={() => setMenuOpen(false)}>Mission & Values</Link>
                            <Link to="/about#why-choose-us" onClick={() => setMenuOpen(false)}>Why Choose Us</Link>
                        </div>
                    </div>

                    {/* Resorts Dropdown */}
                    <div className="nav-dropdown">
                        <NavLink to="/resorts" className="dropdown-trigger" onClick={() => setMenuOpen(false)}>
                            Our Resorts <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', marginLeft: '4px' }}></i>
                        </NavLink>
                        <div className="dropdown-menu">
                            <Link to="/resorts/kanamai" onClick={() => setMenuOpen(false)}>Kanamai Beach Resort</Link>
                            <Link to="/resorts/kisumu" onClick={() => setMenuOpen(false)}>Jumuia hotel Kisumu</Link>
                            <Link to="/resorts/limuru" onClick={() => setMenuOpen(false)}>Limuru Country Home</Link>
                        </div>
                    </div>

                    <NavLink to="/services" onClick={() => setMenuOpen(false)}>Services</NavLink>
                    <NavLink to="/offers" onClick={() => setMenuOpen(false)}>Offers</NavLink>

                    {/* Feedback & Contact Dropdown */}
                    <div className="nav-dropdown">
                        <NavLink to="/feedback" className="dropdown-trigger" onClick={() => setMenuOpen(false)}>
                            Feedback <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', marginLeft: '4px' }}></i>
                        </NavLink>
                        <div className="dropdown-menu">
                            <Link to="/feedback#feedback" onClick={() => setMenuOpen(false)}>Guest Feedback</Link>
                            <Link to="/feedback#contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
                        </div>
                    </div>

                    <NavLink to="/tenders" onClick={() => setMenuOpen(false)}>Tenders</NavLink>

                    {/* Mobile-Only CTA - Hidden on Desktop via CSS */}
                    <div className="mobile-only-cta">
                        <Link to="/#quick-book" className="btn btn-primary" onClick={() => setMenuOpen(false)} style={{ width: '100%', textAlign: 'center' }}>Book Now</Link>
                    </div>

                    <NavLink to="/admin/login" className="btn btn-secondary login-btn" onClick={() => setMenuOpen(false)}>Log In</NavLink>
                    <Link to="/#quick-book" className="btn btn-primary nav-book-btn" onClick={() => setMenuOpen(false)}>Book Now</Link>
                </nav>
            </div>
        </header>
    );
}
