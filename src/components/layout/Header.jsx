import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';
import './Header.css';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenus, setMobileMenus] = useState({ about: false, feedback: false });

    const toggleMobileMenu = (e, menu) => {
        if (window.innerWidth <= 600) {
            e.preventDefault();
            setMobileMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
        } else {
            setMenuOpen(false);
        }
    };
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

                <button className={`mobile-menu-btn ${menuOpen ? 'menu-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
                    <i className={menuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
                </button>

                <div className={`mobile-overlay ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(false)}></div>
                <nav className={`main-nav ${menuOpen ? 'active' : ''}`}>
                    <NavLink to="/" end onClick={handleHomeClick}>Home</NavLink>
                    {/* About Us Dropdown */}
                    <div className={`nav-dropdown ${mobileMenus.about ? 'mobile-expanded' : ''}`}>
                        <NavLink to="/about" className="dropdown-trigger" onClick={(e) => toggleMobileMenu(e, 'about')}>
                            About Us <i className={`fas fa-chevron-${mobileMenus.about ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', marginLeft: '4px' }}></i>
                        </NavLink>
                        <div className="dropdown-menu">
                            <Link to="/about#who-we-are" onClick={() => setMenuOpen(false)}>Who We Are</Link>
                            <Link to="/about#mission-values" onClick={() => setMenuOpen(false)}>Mission & Values</Link>
                            <Link to="/about#why-choose-us" onClick={() => setMenuOpen(false)}>Why Choose Us</Link>
                        </div>
                    </div>

                    {/* Resorts Dropdown */}
                    <div className="nav-dropdown mobile-always-expanded">
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
                    <div className={`nav-dropdown ${mobileMenus.feedback ? 'mobile-expanded' : ''}`}>
                        <NavLink to="/feedback" className="dropdown-trigger" onClick={(e) => toggleMobileMenu(e, 'feedback')}>
                            Feedback <i className={`fas fa-chevron-${mobileMenus.feedback ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', marginLeft: '4px' }}></i>
                        </NavLink>
                        <div className="dropdown-menu">
                            <Link to="/feedback#feedback" onClick={() => setMenuOpen(false)}>Guest Feedback</Link>
                            <Link to="/feedback#contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
                        </div>
                    </div>

                    {/* Join Us Dropdown */}
                    <div className="nav-dropdown mobile-always-expanded">
                        <NavLink to="/tenders" className="dropdown-trigger" onClick={() => setMenuOpen(false)}>
                            Join Us <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', marginLeft: '4px' }}></i>
                        </NavLink>
                        <div className="dropdown-menu">
                            <Link to="/tenders#tenders" onClick={() => setMenuOpen(false)}>Tenders</Link>
                            <Link to="/tenders#recruitments" onClick={() => setMenuOpen(false)}>Recruitments</Link>
                        </div>
                    </div>



                    <NavLink to="/admin/login" className="btn btn-secondary login-btn" onClick={() => setMenuOpen(false)}>Log In</NavLink>
                    <Link to="/#quick-book" className="btn btn-primary nav-book-btn" onClick={() => setMenuOpen(false)}>Book Now</Link>
                </nav>
            </div>
        </header>
    );
}
