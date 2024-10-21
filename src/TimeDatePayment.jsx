    import React, { useContext, useEffect, useState } from 'react';
    import { BookingContext } from './BookingContext';
    import CustomCalendar from './CustomCalendar';
    import axios from 'axios';
    import { useNavigate, Link } from 'react-router-dom';
    import logo from './assets/emlogo.png'; // Adjust the path to your logo
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

        // Fetch booked times for the selected date
        useEffect(() => {
            const fetchBookedTimes = async () => {
                if (selectedDate) {
                    setLoading(true); // Show loading
                    try {
                        const response = await axios.post('https://vynceianoani.helioho.st/Balbuena/booked-times.php', { date: selectedDate });
                        setBookedTimes(response.data);
                    } catch (error) {
                        console.error('Error fetching booked times:', error);
                        setNotification('Failed to fetch booked times. Please try again.');
                        setShowNotificationCard(true);
                    } finally {
                        setLoading(false); // Hide loading
                    }
                }
            };

            fetchBookedTimes();
        }, [selectedDate]);
        const handleTimeSelect = async (time) => {
            try {
                // Format the time to 'HH:mm:ss'
                const formattedTime = time.includes('AM') || time.includes('PM') ? 
                    new Date(`1970-01-01 ${time}`).toLocaleTimeString('en-GB', { hour12: false }) : 
                    time; // 'HH:mm:ss'
        
                // Check availability via API
                const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
                const response = await fetch('https://vynceianoani.helioho.st/Balbuena/check-availability.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: formattedDate, time: formattedTime }),
                });
                const data = await response.json();
        
                if (data.status === 'available') {
                    // Set selectedTime in original format for visual match
                    setFormData({ ...formData, time });  // Save original `time` here
                    setSelectedTime(time);               // This matches the `time` in `map`
                    setNotification('');
                    setShowNotificationCard(false);
                } else {
                    setNotification(data.message);
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

        const handleNameChange = (e) => {
            const nameValue = e.target.value;
            setCustomerName(nameValue);
            setFormData({ ...formData, name: nameValue });
        };

        const handleSubmit = async (event) => {
            event.preventDefault();
            setLoading(true);
        
            // Convert date to 'YYYY-MM-DD' format
            const formattedDate = new Date(selectedDate).toISOString().split('T')[0]; // 'YYYY-MM-DD'
        
            // Convert time to 'HH:mm:ss' format
            const formattedTime = selectedTime.includes('AM') || selectedTime.includes('PM') ? 
                new Date(`1970-01-01 ${selectedTime}`).toLocaleTimeString('en-GB', { hour12: false }) : 
                selectedTime; // 'HH:mm:ss'
        
            const bookingData = {
                name: customerName,
                service: formData.service,
                date: formattedDate, // formatted date
                time: formattedTime,  // formatted time
                paymentMethod: selectedPaymentMethod,
                email: customerEmail,
                contactNo: customerContactNo,
                staffID: formData.staffID // Ensure you're passing the staffID
            };
        
            try {
                const response = await fetch('https://vynceianoani.helioho.st/Balbuena/submit-booking.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData),
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Response error:', errorData);
                    throw new Error(errorData.Error || 'An error occurred while submitting the booking');
                }
        
                const data = await response.json();
                console.log('Submitting with staffID:', formData.staffID);
                console.log('Booking submitted successfully:', data);
        
                setNotification('Booking submitted successfully!');
                navigate('/booking-done');
            } catch (error) {
                console.error('Error submitting booking:', error.message);
                setNotification('Error submitting booking. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        

        const handleBack = () => {
            navigate('/services-barber'); // Navigate back to the services page
        };

        const toggleMenu = () => {
            setIsMenuOpen(!isMenuOpen);
        };

        // Filter available times based on booked times
        const filteredAvailableTimes = availableTimes.filter(time => !bookedTimes.includes(time));

        // Close notification card
        const closeNotificationCard = () => {
            setShowNotificationCard(false);
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
                            <option value="pay_in_store">Pay in Store</option>
                        </select>
                    </div>

                    {/* Back and Submit buttons */}
                    <div className="button-container">
                        <button onClick={handleBack} className="back-button">
                            Back
                        </button>
                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <button onClick={handleSubmit} className="submitBooking-button" disabled={!selectedTime}>
                                Submit Booking
                            </button>
                        )}
                    </div>
                </div>
            </>
        );
    };

    export default TimeDatePayment;