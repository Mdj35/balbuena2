import React, { useContext, useEffect, useState } from 'react';
import { BookingContext } from './BookingContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from './assets/emlogo.png';
import './ServicesBarber.css';

const ServicesBarber = () => {
    const { formData, setFormData } = useContext(BookingContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [barbers, setBarbers] = useState([]); // State to hold barbers
    const [selectedServices, setSelectedServices] = useState([]); // State for selected services
    const [selectedBarber, setSelectedBarber] = useState(''); // State for selected barber

    useEffect(() => {
        const fetchBarbers = async () => {
            try {
                const response = await axios.get('https://vynceianoani.helioho.st/Balbuena/staff.php'); // Adjust the endpoint as needed
                setBarbers(response.data);
                console.log('Barbers loaded:', response.data); // Debug log
            } catch (error) {
                console.error('Error fetching barbers:', error);
            }
        };

        fetchBarbers();
    }, []);

    const handleAddService = () => {
        setSelectedServices([...selectedServices, '']); // Add a new empty service
    };

    const handleRemoveService = (index) => {
        setSelectedServices((prev) => prev.filter((_, i) => i !== index));
    };

    const handleServiceChange = (index, value) => {
        const updatedServices = [...selectedServices];
        updatedServices[index] = value;
        setSelectedServices(updatedServices);
    };

    const handleNext = async () => {
        if (!selectedBarber) {
            alert('Please select a barber.');
            return;
        }
        if (selectedServices.some((service) => !service)) {
            alert('Please select all services.');
            return;
        }

        try {
            const updatedServices = await Promise.all(
                selectedServices.map(async (service) => {
                    const response = await axios.get(`https://vynceianoani.helioho.st/Balbuena/service.php?serviceType=${service}`);
                    if (response.data.length === 0) {
                        throw new Error(`Service "${service}" is not available.`);
                    }
                    const selectedService = response.data[0];

                    return {
                        serviceID: selectedService.serviceID,
                        staffID: selectedBarber,
                        serviceName: selectedService.serviceType,
                        servicePrice: selectedService.servicePrice,
                    };
                })
            );

            setFormData((prevFormData) => ({
                ...prevFormData,
                services: updatedServices,
            }));

            console.log('Updated Form Data:', updatedServices);
            navigate('/customer-details');
        } catch (error) {
            console.error('Error fetching service:', error);
            alert(error.message || 'Failed to fetch service information. Please try again.');
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <Link to="/" style={{ position: 'absolute', top: '45px', left: '73px' }}>
                <img src={logo} alt="Logo" style={{ width: '55px', height: 'auto' }} />
            </Link>

            <div className="hamburger" onClick={toggleMenu}>
                <div className={isMenuOpen ? 'bar bar1 open' : 'bar bar1'}></div>
                <div className={isMenuOpen ? 'bar bar2 open' : 'bar bar2'}></div>
                <div className={isMenuOpen ? 'bar bar3 open' : 'bar bar3'}></div>
            </div>

            {isMenuOpen && (
                <div className="menu">
                    <Link to="/">Home</Link>
                    <Link to="/about">About Us</Link>
                    <Link to="/services">Services</Link>
                </div>
            )}

            <div className="container">
                <h2>Choose Services and Barber</h2>
                <div className="formGroup">
                    <label>Barber</label>
                    <select
                        value={selectedBarber}
                        onChange={(e) => setSelectedBarber(e.target.value)}
                        className="dropdown"
                    >
                        <option value="" disabled>
                            Choose a barber
                        </option>
                        {barbers.map((barber) => (
                            <option key={barber.staffID} value={barber.staffID}>
                                {barber.staffName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="scrollable-container">
                    {selectedServices.map((service, index) => (
                        <div key={index} className="serviceEntry">
                            <div className="formGroup">
                                <label>Service</label>
                                <select
                                    value={service}
                                    onChange={(e) => handleServiceChange(index, e.target.value)}
                                    className="dropdown"
                                >
                                    <option value="" disabled>
                                        Select a service
                                    </option>
                                    <option value="haircut">Haircut - ₱400</option>
                                    <option value="shampoo">Shampoo - ₱450</option>
                                    <option value="massage">Massage - ₱500</option>
                                    <option value="hot towel">Hot Towel - ₱400</option>
                                    <option value="blow dry">Blow Dry - ₱500</option>
                                </select>
                            </div>
                            <button onClick={() => handleRemoveService(index)}>Remove</button>
                        </div>
                    ))}
                </div>

                <button onClick={handleAddService}>Add Another Service</button>
                <div className="buttonGroup">
                    <button onClick={handleBack}>Back</button>
                    <button onClick={handleNext}>Next</button>
                </div>
            </div>
        </>
    );
};

export default ServicesBarber;
