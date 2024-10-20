import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Import your images directly
import background1 from './assets/background1.png';
import team from './assets/team.png';
import barber1 from './assets/b1.jpg';
import barber2 from './assets/b2.jpg';
import barber3 from './assets/b3.jpg';
import mobileIcon from './assets/mobile.png';
import mailIcon from './assets/mail.png';
import facebookIcon from './assets/facebook.png';
import instagramIcon from './assets/instagram.png';
import downbg from './assets/downbg.png';
import logo from './assets/emlogo.png'; // Import your logo image

// Import service images
import haircutImg from './assets/Haircut.png';
import shampooImg from './assets/Shampoo.png';
import ubAndAmImg from './assets/ub&am.png';
import hotTowelImg from './assets/Hottowel.png';
import blowDryImg from './assets/Blowdry.png';

const Homepage = () => {
    const handleScroll = (event, id) => {
        event.preventDefault();
        const targetElement = document.getElementById(id);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div>
            <Header onNavClick={handleScroll} />
            {/* Move the BOOK APPOINTMENT button here, outside the Header */}
            <div className="appointment-button-container">
                <Link to="/services-barber">
                    <button className="create-button">BOOK APPOINTMENT</button>
                </Link>
            </div>
            <Services />
            <Team />
            <About />
            <Footer />
        </div>
    );
};

const Header = ({ onNavClick }) => {
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsSticky(scrollY > 100); // Adjust this value as needed
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <header
            id="home"
            className={`section header ${isSticky ? 'sticky-nav' : ''}`}
            style={{
                backgroundImage: `url(${background1})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                position: 'relative',
                minHeight: '100vh',
                color: 'white',
                textAlign: 'center',
            }}
        >
            <nav className={`nav ${isSticky ? 'sticky' : ''}`}>
                <Link to="/" className="logo-link">
                    <img src={logo} alt="Logo" className="nav-logo" />
                </Link>
                <Link 
                    to="/" 
                    className="nav-link" 
                    onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 100);
                    }}
                >
                    HOME
                </Link>
                <Link to="#about" className="nav-link" onClick={(e) => onNavClick(e, 'about')}>ABOUT US</Link>
                <Link to="#services" className="nav-link" onClick={(e) => onNavClick(e, 'services')}>SERVICES</Link>
            </nav>
        </header>
    );
};


const Services = () => (
    <section id="services" className="section services">
        <h2 className="services-title">
            Emperor <span className="highlight">Signature</span> Haircut
        </h2>
        <div className="service-list">
            {serviceData.map((service, index) => (
                <Service key={index} service={service} />
            ))}
        </div>
    </section>
);

const Service = ({ service }) => (
    <div className="service">
        <img src={service.image} alt={service.name} />
        <p>{service.name}</p>
    </div>
);

const serviceData = [
    { name: 'Haircut', image: haircutImg },
    { name: 'Shampoo', image: shampooImg },
    { name: 'Upper Back & Arm Massage', image: ubAndAmImg },
    { name: 'Hot Towel', image: hotTowelImg },
    { name: 'Blow Dry', image: blowDryImg },
];

const Team = () => (
    <section
        id="team"
        className="section team"
        style={{
            backgroundImage: `url(${team})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            position: 'relative',
            minHeight: '100vh',
            color: 'white',
            textAlign: 'center',
        }}
    >
        <div className="profile-container">
            <div className="profile">
                <div className="profile-circle">
                    <img src={barber1} alt="Barber 1" />
                </div>
                <h5>Karl</h5>
            </div>

            <div className="profile">
                <div className="profile-circle">
                    <img src={barber2} alt="Barber 2" />
                </div>
                <h5>Ham</h5>
            </div>

            <div className="profile">
                <div className="profile-circle">
                    <img src={barber3} alt="Barber 3" />
                </div>
                <h5>Benjie</h5>
            </div>
        </div>
    </section>
);

const About = () => (
    <section
        id="about"
        className="section about"
        style={{
            backgroundImage: `url(${downbg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            position: 'relative',
            minHeight: '100vh',
            color: '#333',
            textAlign: 'left',
        }}
    >
        <div className="about-container">
            <div className="about-content">
                <h2>About Us</h2>
                <p className="about-text">
                    Emperors Lounge & Barbershop: Where Comfort Meets Quality. Immerse Yourself in an Inviting Atmosphere Where Excellence and Client Happiness Are Our Top Priorities. Indulge in the Emperor's Signature Haircut, a Luxurious Experience That Leaves You Feeling Refreshed, Rejuvenated, and Ready to Conquer the World. Classic or Modern, We're Here to Ensure Your Hair Journey Is Nothing Short of Extraordinary.
                </p>
            </div>
            <div className="contact-content">
                <h2>Contact Us</h2>
                <p>
                    <img src={mobileIcon} alt="Phone" className="contact-icon" />
                    0926 695 9395
                </p>
                <p>
                    <img src={mailIcon} alt="Email" className="contact-icon" />
                    emperorsbarbersph@gmail.com
                </p>
                <p>
                    <img src={facebookIcon} alt="Facebook" className="contact-icon" />
                    emperorsbarbershopph
                </p>
                <p>
                    <img src={instagramIcon} alt="Instagram" className="contact-icon" />
                    emperorsbarbersph
                </p>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="footer">
        <p>© 2024 Emperors Lounge & Barbershop. All rights reserved.</p>
    </footer>
);

export default Homepage;
