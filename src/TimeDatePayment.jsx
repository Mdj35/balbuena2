import React, { useContext, useEffect, useState } from 'react';
import { BookingContext } from './BookingContext';
import CustomCalendar from './CustomCalendar';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from './assets/emlogo.png'; 
import './CreateBook.css';

const TimeDatePayment = () => {
    const { formData, setFormData } = useContext(BookingContext);
    const [availableTimes] = useState([
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
        '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
    ]);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notification, setNotification] = useState('');
    const [showNotificationCard, setShowNotificationCard] = useState(false);
    const navigate = useNavigate();

    // State for additional fields
    const [customerName, setCustomerName] = useState(formData.name || '');
    const [selectedDate, setSelectedDate] = useState(formData.date || '');
    const [selectedTime, setSelectedTime] = useState(formData.time || '');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(formData.paymentMethod || '');
    const [customerEmail, setCustomerEmail] = useState(formData.email || '');
    const [customerContactNo, setCustomerContactNo] = useState(formData.contactNo || '');
    const [queuePosition, setQueuePosition] = useState(null);


    // Automatically fetch the staff name and service price on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                let updatedFormData = { ...formData };
    
                // Check if staffID is present to fetch staff name
                if (formData.staffID) {
                    // Fetch staff name using axios
                    const staffResponse = await axios.get(
                        `https://vynceianoani.helioho.st/Balbuena/get-staff-name.php?staffID=${formData.staffID}`
                    );
                    const staffName = staffResponse.data.name || 'Unknown Staff';
                    updatedFormData = { ...updatedFormData, staffName }; // Update formData with staffName
                }
    
                // Check if service is present to fetch service price
                if (formData.service) {
                    // Fetch service price using axios
                    const serviceResponse = await axios.get(
                        `https://vynceianoani.helioho.st/Balbuena/get-service-price.php?service=${formData.service}`
                    );
                    const servicePrice = serviceResponse.data.price || 0;
                    updatedFormData = { ...updatedFormData, servicePrice }; // Update formData with servicePrice
                }
    
                // Update the form data state
                setFormData(updatedFormData);
    
                // Fetch queue position
                if (formData.services?.length) {
                    await fetchQueuePosition();
                }
            } catch (error) {
                console.error('Error fetching staff name, service price, or queue position:', error);
                setNotification(
                    'Failed to fetch staff name, service price, or queue position. Please try again.'
                );
                setShowNotificationCard(true);
            }
        };
    
        fetchData();
    }, [formData.staffID, formData.service, formData.services, setFormData]);
    
    
    // Fetch booked times for the selected date
    useEffect(() => {
        const fetchBookedTimes = async () => {
            if (selectedDate) {
                setLoading(true); 
                try {
                    const response = await axios.post('https://vynceianoani.helioho.st/Balbuena/booked-times.php', { date: selectedDate });
                    setBookedTimes(response.data);
                } catch (error) {
                    console.error('Error fetching booked times:', error);
                    setNotification('Failed to fetch booked times. Please try again.');
                    setShowNotificationCard(true);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBookedTimes();
    }, [selectedDate]);
    
    
    const fetchQueuePosition = async () => {
        try {
            const response = await axios.post(
                'https://vynceianoani.helioho.st/Balbuena/get-queue-position.php',
                { services: formData.services }
            );
    
            if (response.status === 200) {
                const positions = response.data.positions; // Assuming the response contains a `positions` array
                const updatedServices = formData.services.map((service, index) => ({
                    ...service,
                    queuePosition: positions[index], // Map each service's queue position
                }));
                
                // Update the form data state
                const updatedFormData = { ...formData, services: updatedServices };
                setFormData(updatedFormData);
    
                // Save queue positions to local storage
                localStorage.setItem('queuePositions', JSON.stringify(updatedServices));
            } else {
                setNotification('Failed to fetch queue positions.');
                setShowNotificationCard(true);
            }
        } catch (error) {
            console.error('Error fetching queue positions:', error);
            setNotification('An error occurred while fetching queue positions.');
            setShowNotificationCard(true);
        }
    };
    
    
    
    // Fetch queue position when services are selected
    useEffect(() => {
        if (formData.services?.length) {
        }
    }, [formData.services]);
    const handleTimeSelect = async (time) => {
        try {
            const formattedTime = time.includes('AM') || time.includes('PM')
                ? new Date(`1970-01-01 ${time}`).toLocaleTimeString('en-GB', { hour12: false })
                : time;

            const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
            const response = await axios.post('https://vynceianoani.helioho.st/Balbuena/check-availability.php', {
                date: formattedDate,
                time: formattedTime,
            });

            if (response.data.status === 'available') {
                setFormData({ ...formData, time });
                setSelectedTime(time);
                setNotification('');
                setShowNotificationCard(false);
            } else {
                setNotification(response.data.message);
                setShowNotificationCard(true);
            }
        } catch (error) {
            console.error('Error checking for duplicate booking:', error);
            setNotification('An error occurred. Please try again.');
            setShowNotificationCard(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'contactNo') {
            setCustomerContactNo(value);
        }
    };

    const handleBack = () => {
        navigate('/services-barber');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const filteredAvailableTimes = availableTimes.filter(time => !bookedTimes.includes(time));

    const closeNotificationCard = () => {
        setShowNotificationCard(false);
    };

  

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
    
        // Set form data with selected date and time
        const updatedFormData = {
            ...formData,
            date: selectedDate,
            time: selectedTime,
            contactNo: customerContactNo, // Ensure contact number is included
            paymentMethod: selectedPaymentMethod,
        };
    
        // Save to state
        setFormData(updatedFormData);
    
        // Store contact number and payment method in local storage
        localStorage.setItem('contactNo', customerContactNo);
        localStorage.setItem('paymentMethod', selectedPaymentMethod);
    
        // Display notification and navigate
        setNotification('Booking information reviewed successfully!');
        navigate('/billing-interface');
    };
    
    
    

    return (
        <>
            <Link to="/" style={{ position: 'absolute', top: '45px', left: '73px' }}>
                <img src={logo} alt="Logo" style={{ width: '55px', height: 'auto' }} />
            </Link>

            <div className="hamburger" onClick={toggleMenu}>
                <div className={isMenuOpen ? "bar bar1 open" : "bar bar1"}></div>
                <div className={isMenuOpen ? "bar bar2 open" : "bar bar2"}></div>
                <div className={isMenuOpen ? "bar bar3 open" : "bar bar3"}></div>
            </div>

            {isMenuOpen && (
                <div className="menu">
                    <Link to="/">Home</Link>
                    <Link to="/about">About Us</Link>
                    <Link to="/services">Services</Link>
                </div>
            )}

            <div className="timeDatePayment-container" aria-live="polite">
                {/* Date selection */}
                <div className="formGroup">
                    <label style={{ color: 'white' }}>Date</label>
                    <CustomCalendar selectedDate={selectedDate} onDateChange={(date) => {
                        setFormData({ ...formData, date });
                        setSelectedDate(date);
                    }} />
                </div>
                <div className="formGroup">
    <label style={{ color: 'white' }}>Queue Positions</label>
    {formData.services?.length > 0 ? (
        formData.services.map((service, index) => {
            // Extract and format queuePosition
            let queuePositionDisplay = 'Loading...';

            if (service.queuePosition !== undefined) {
                if (typeof service.queuePosition === 'object') {
                    // Convert object to a readable string format
                    queuePositionDisplay = Object.entries(service.queuePosition)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                } else {
                    queuePositionDisplay = service.queuePosition; // Assume string or number
                }
            }

            return (
                <div key={index} className="queue-item" style={{ marginBottom: '10px', color: 'white' }}>
                    <strong>Service:</strong> {service.serviceName} <br />
                    <strong>Queue Position:</strong> {queuePositionDisplay}
                </div>
            );
        })
    ) : (
        <div style={{ color: 'white' }}>No services selected</div>
    )}
</div>





                {/* Time selection */}
                <div className="time-grid">
                    {loading ? (
                        <div>Loading available times...</div>
                    ) : (
                        filteredAvailableTimes.length > 0 ? (
                            filteredAvailableTimes.map((time) => (
                                <div
                                    key={time}
                                    className={`time-slot ${selectedTime === time ? 'selected' : ''}`}  // Ensure `selectedTime` is compared directly with `time`
                                    onClick={() => handleTimeSelect(time)}
                                >
                                    {time}
                                </div>
                            ))
                        ) : (
                            <div className="no-available-times">No available times for this date.</div>
                        )
                    )}
                </div>

                {/* Notification Card */}
                {showNotificationCard && (
                    <div className="notification-card">
                        <div className="notification-message">{notification}</div>
                        <button className="notification-button" onClick={closeNotificationCard}>OK</button>
                    </div>
                )}

                {/* Contact Number */}
                <div className="formGroup">
                    <label style={{ color: 'white' }}>Contact Number</label>
                    <input
                        type="tel"
                        name="contactNo"
                        value={customerContactNo}
                        onChange={handleInputChange}
                        placeholder="Enter your contact number"
                        required
                        className="input-field"
                    />
                </div>

                {/* Payment Method */}
                <div className="formGroup">
                    <label style={{ color: 'white' }}>Payment Method</label>
                    <select
                        name="paymentMethod"
                        value={selectedPaymentMethod}
                        onChange={(e) => {
                            handleInputChange(e);
                            setSelectedPaymentMethod(e.target.value);
                        }}
                        className="dropdown"
                        required
                    >
                        <option value="" disabled>Select Payment Method</option>
                        <option value="Pay in Store">Pay in Store</option>
                    </select>
                </div>

                {/* Back and Submit buttons */}
                <div className="formGroup">
    <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Confirm Booking'}
    </button>
</div>

{/* Notification card */}
{showNotificationCard && (
    <div className="notificationCard">
        <p>{notification}</p>
        <button onClick={closeNotificationCard}>Close</button>
    </div>
)}

{/* Back button */}
<div className="formGroup">
    <button onClick={handleBack}>Back to Services</button>
</div>

            </div>
        </>
    );
};

export default TimeDatePayment;
