import React, { useContext, useEffect, useState } from 'react';
import { BookingContext } from './BookingContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf'; 
import './BillingInterface.css';

const BillingInterface = () => {
    const { formData } = useContext(BookingContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Add this useEffect for fetching staff names


    // Validate formData on load
   useEffect(() => {
    const validateAndFetchStaffNames = async () => {
        // Validation logic
        if (
            !formData ||
            !formData.services ||
            formData.services.length === 0 || // Ensure at least one service is selected
            !formData.name ||
            !formData.email ||
            !formData.date ||
            !formData.time
        ) {
            alert('Invalid booking data. Please ensure all fields are filled and at least one service is selected.');
            navigate('/services-barber'); // Redirect to the appropriate page
            return; // Stop further execution
        }

        // Fetch staff names
        try {
            if (formData.services && formData.services.length > 0) {
                // Clone the services array to update names without mutating original state directly
                const updatedServices = await Promise.all(
                    formData.services.map(async (service) => {
                        if (service.staffID) {
                            const response = await axios.post(
                                'https://vynceianoani.helioho.st/Balbuena/api.php',
                                { staffID: service.staffID }
                            );

                            // Assume API returns { staffName: "Name of the Staff" }
                            if (response.data && response.data.staffName) {
                                return {
                                    ...service,
                                    staffName: response.data.staffName,
                                };
                            }
                        }
                        return service; // Return the service as-is if no staffID or API fails
                    })
                );

                // Update formData with fetched staff names
                formData.services = updatedServices;
            }
        } catch (error) {
            console.error('Error fetching staff names:', error);
        }
    };

    validateAndFetchStaffNames();
}, [formData, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            // Calculate the total price for all selected services
            const totalPrice = formData.services.reduce(
                (acc, service) => acc + parseFloat(service.servicePrice || 0),
                0
            );

            // Update formData with calculated totalPrice
            const updatedFormData = {
                ...formData,
                totalPrice,
            };

            // Submit booking data
            const response = await axios.post(
                'https://vynceianoani.helioho.st/Balbuena/submit-booking.php',
                updatedFormData
            );

            if (response.status === 200) {
                alert('Payment Confirmed!');
                generatePDFReceipt(updatedFormData);
                navigate('/booking-done'); // Redirect after successful submission
            } else {
                throw new Error(response.data.message || 'Unexpected error during booking submission.');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    const generatePDFReceipt = (updatedFormData) => {
        const doc = new jsPDF();
    
        // Title Section
        doc.setFontSize(16);
        doc.text('Emperors Lounge Barbershop', 20, 20);
        doc.setFontSize(14);
        doc.text('Official Booking Receipt', 20, 30);
    
        // Customer Information
        doc.setFontSize(12);
        doc.text(`Customer Name: ${updatedFormData.name}`, 20, 50);
    
        // Function to format queue position
        const formatQueuePosition = (queuePosition) => {
            if (queuePosition === undefined) return 'Loading...';
            if (typeof queuePosition === 'object') {
                return Object.entries(queuePosition)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
            }
            return queuePosition; // Assume string or number
        };
    
        // Services Section
        let yOffset = 60; // Start position for services
        updatedFormData.services.forEach((service, index) => {
            // Bullet point for the service
            doc.circle(15, yOffset - 2, 1, 'F'); // Small filled circle for bullet
    
            // Add service details
            doc.text(`Service ${index + 1}: ${service.serviceName}`, 20, yOffset);
            doc.text(`Barber:${service.staffName}  ${service.staffID}`, 30, yOffset + 10); // Indented details
    
            // Properly format and display queue position
            const queuePosition = formatQueuePosition(service.queuePosition);
            doc.text(`Queue Position: ${queuePosition}`, 30, yOffset + 30);
    
            // Increment yOffset for the next service block
            yOffset += 40;
        });
    
        // Booking Details Section
        yOffset += 10; // Add spacing before next section
        doc.text(`Date of Appointment: ${updatedFormData.date}`, 20, yOffset);
        doc.text(`Time of Appointment: ${updatedFormData.time}`, 20, yOffset + 10);
    
        // Payment Information Section
        yOffset += 30; // Add spacing before payment details
        doc.text(
            `Payment Method: ${
                updatedFormData.paymentMethod === 'pay_in_store' ? 'Pay in Store' : updatedFormData.paymentMethod
            }`,
            20,
            yOffset
        );
        doc.text(`Customer Email: ${updatedFormData.email}`, 20, yOffset + 10);
        doc.text(`Contact Number: ${updatedFormData.contactNo}`, 20, yOffset + 20);
    
        // Total Price Section
        const totalPrice = updatedFormData.services.reduce(
            (acc, service) => acc + (Number(service.servicePrice) || 0),
            0
        );
        doc.text(`Total Price: ₱${totalPrice}`, 20, yOffset + 40);
    
        // Footer Section
        yOffset += 60; // Add spacing before footer
        doc.setFontSize(11);
        doc.text('Thank you for choosing Emperors Lounge Barbershop!', 20, yOffset);
        doc.text('Please show this receipt to the counter upon arrival.', 20, yOffset + 10);
        doc.text('If you have any questions or need to modify your booking, feel free to contact us.', 20, yOffset + 20);
        doc.text('This receipt serves as confirmation of your booking.', 20, yOffset + 30);
    
        // Save the PDF
        doc.save('booking-receipt.pdf');
    };

    return (
        <div className="billing-container">
            <h2 className="billing">Billing Summary</h2>
            <div className="billing-details">
                <h3>Customer Details:</h3>
                <p>Name: {formData.name}</p>
                <p>Email: {formData.email}</p>
                <h3>Selected Services:</h3>
                {formData.services && formData.services.length > 0 ? (
                    formData.services.map((service, index) => (
                        <div key={index} className="service-details">
                            <p>Service: {service.serviceName}</p>
                            <p>Price: ₱{service.servicePrice}</p>
                            <p>Staff: {service.staffName} (ID: {service.staffID})</p>
                        </div>
                    ))
                ) : (
                    <p>No services selected.</p>
                )}
                <h3>Payment Method:</h3>
                <p>{formData.paymentMethod}</p>
                <h3>Date & Time:</h3>
                <p>Date: {formData.date ? new Date(formData.date).toLocaleDateString() : 'Not selected'}</p>
                <p>Time: {formData.time || 'Not selected'}</p>
            </div>
            <div className="billing-total">
                <h3>Total Amount</h3>
                <p>
                    ₱
                    {formData.services
                        ? formData.services.reduce(
                              (total, service) => total + parseFloat(service.servicePrice || 0),
                              0
                          )
                        : 0}
                </p>
            </div>
            <div className="buttonGroup">
                <button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
                <button onClick={() => navigate('/services-barber')}>Edit Details</button>
            </div>
        </div>
    );
};

export default BillingInterface;
