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
    const [selectedServices, setSelectedServices] = useState([]); // State for selected services and barbers

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
        setSelectedServices([
            ...selectedServices,
            { service: '', barber: '' }, // Add a new empty service-barber pair
        ]);
    };

    const handleRemoveService = (index) => {
        setSelectedServices((prev) => prev.filter((_, i) => i !== index));
    };

    const handleServiceChange = (index, name, value) => {
        const updatedServices = [...selectedServices];
        updatedServices[index][name] = value;
        setSelectedServices(updatedServices);
    };

    const handleNext = async () => {
        if (selectedServices.some(({ service, barber }) => !service || !barber)) {
            alert('Please select a service and a barber for each entry.');
            return;
        }
    
        try {
            const updatedServices = await Promise.all(
                selectedServices.map(async ({ service, barber }) => {
                    const serviceResponse = await axios.get(`https://vynceianoani.helioho.st/Balbuena/service.php?serviceType=${service}`);
                    if (serviceResponse.data.length === 0) {
                        throw new Error(`Service "${service}" is not available.`);
                    }
                    const selectedService = serviceResponse.data[0];
    
                    // Fetch the barber's staff details to get the staff name
                    const barberDetails = barbers.find(b => b.staffID === barber);
                    const staffName = barberDetails ? barberDetails.staffName : '';
    
                    return {
                        serviceID: selectedService.serviceID,
                        staffID: barber,
                        staffName, // Add the staff name here
                        serviceName: selectedService.serviceType,
                        servicePrice: selectedService.servicePrice, // Include price in the service data
                    };
                })
            );
    
            // Update formData with selected services, barbers, and their names
            setFormData((prevFormData) => ({
                ...prevFormData,
                services: updatedServices, // Store multiple services in formData
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
    <h2>Choose Services and Barbers</h2>
    
    {/* Scrollable container for service entries */}
    <div className="scrollable-container">
        {selectedServices.map((serviceEntry, index) => (
            <div key={index} className="serviceEntry">
                <div className="formGroup">
                    <label>Service</label>
                    <select
                        value={serviceEntry.service || ''}
                        onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
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
                <div className="formGroup">
                    <label>Barber</label>
                    <select
                        value={serviceEntry.barber || ''}
                        onChange={(e) => handleServiceChange(index, 'barber', e.target.value)}
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
