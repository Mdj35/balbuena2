import React, { useContext, useEffect, useState } from 'react';
import { BookingContext } from './BookingContext';
import CustomCalendar from './CustomCalendar';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from './assets/emlogo.png'; 
import jsPDF from 'jspdf'; 
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

    // Automatically fetch the staff name and service price on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                let updatedFormData = { ...formData };
    
                // Check if staffID is present to fetch staff name
                if (formData.staffID) {
                    // Fetch staff name using axios
                    const staffResponse = await axios.get(`https://vynceianoani.helioho.st/Balbuena/get-staff-name.php?staffID=${formData.staffID}`);
                    const staffName = staffResponse.data.name || 'Unknown Staff';
                    updatedFormData = { ...updatedFormData, staffName }; // Update formData with staffName
                }
    
                // Check if service is present to fetch service price
                if (formData.service) {
                    // Fetch service price using axios
                    const serviceResponse = await axios.get(`https://vynceianoani.helioho.st/Balbuena/get-service-price.php?service=${formData.service}`);
                    const servicePrice = serviceResponse.data.price || 0;
                    updatedFormData = { ...updatedFormData, servicePrice }; // Update formData with servicePrice
                }
    
                // Update the form data state
                setFormData(updatedFormData);
            } catch (error) {
                console.error('Error fetching staff name or service price:', error);
                setNotification('Failed to fetch staff name or service price. Please try again.');
                setShowNotificationCard(true);
            }
        };
    
        fetchData();
    }, [formData.staffID, formData.service, setFormData]);
    
    
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

    const generatePDFReceipt = (bookingData) => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Emperors Lounge Barbershop', 20, 20);
        doc.setFontSize(14);
        doc.text('Official Booking Receipt', 20, 30);

        doc.setFontSize(12);
        doc.text(`Customer Name: ${bookingData.name}`, 20, 50);
        doc.text(`Service Booked: ${bookingData.service}`, 20, 60);
        doc.text(`Date of Appointment: ${bookingData.date}`, 20, 70);
        doc.text(`Time of Appointment: ${bookingData.time}`, 20, 80);
        doc.text(`Assigned Barber: ${bookingData.staffName}`, 20, 90);

        doc.text(`Payment Method: ${bookingData.paymentMethod === 'pay_in_store' ? 'Pay in Store' : bookingData.paymentMethod}`, 20, 110);
        doc.text(`Customer Email: ${bookingData.email}`, 20, 120);
        doc.text(`Contact Number: ${bookingData.contactNo}`, 20, 130);
        doc.text(`Total Price: ₱${bookingData.servicePrice}`, 20, 140);

        doc.text('Thank you for choosing Emperors Lounge Barbershop!', 20, 160);
        doc.text('Please show this receipt to the counter upon arrival.', 20, 170);
        doc.text('If you have any questions or need to modify your booking, feel free to contact us.', 20, 180);

        doc.text('This receipt serves as confirmation of your booking.', 20, 200);

        doc.save('booking-receipt.pdf');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
        const formattedTime = selectedTime.includes('AM') || selectedTime.includes('PM')
            ? new Date(`1970-01-01 ${selectedTime}`).toLocaleTimeString('en-GB', { hour12: false })
            : selectedTime;

        const bookingData = {
            name: customerName,
            service: formData.service,
            date: formattedDate,
            time: formattedTime,
            paymentMethod: selectedPaymentMethod,
            email: customerEmail,
            contactNo: customerContactNo,
            staffID: formData.staffID,
            staffName:formData.staffName,
            servicePrice:formData.servicePrice
        };

        try {
            // Submit the booking data using axios
            const response = await axios.post('https://vynceianoani.helioho.st/Balbuena/submit-booking.php', bookingData);

            if (response.status !== 200) {
                throw new Error(response.data.message || 'Error occurred during booking submission.');
            }

            const data = response.data;

            setNotification('Booking submitted successfully!');

            generatePDFReceipt({ ...bookingData, staffName: formData.staffName, servicePrice: formData.servicePrice });

            setLoading(false);

            // Navigate to confirmation page
            navigate('/booking-done');
        } catch (error) {
            console.error('Error submitting booking:', error);
            setNotification('An error occurred. Please try again.');
            setLoading(false);
            setShowNotificationCard(true);
        }
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
                        <button onClick={handleSubmit} className="submit-button">
                            Submit
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default TimeDatePayment;
