import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns'; // Import format from date-fns
import 'bootstrap/dist/css/bootstrap.min.css';
import './Books.css';

const CustBook = () => {
    const [bookings, setBookings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get('https://vynceianoani.helioho.st/Balbuena/getbook.php'); // Ensure this endpoint is correct
                setBookings(response.data.data); // Access the data field
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        };

        fetchBookings();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://vynceianoani.helioho.st/Balbuena/deleteBooking.php/${id}`);
            setBookings(bookings.filter((booking) => booking.booking_id !== id)); // Match by booking_id
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    };

    const handleLogout = () => {
        // Add any logout logic here (like clearing tokens)
        navigate('/');
    };

    // Function to format date and time
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, 'MMMM dd, yyyy'); // Format date as 'Month Day, Year'
    };

    const formatTime = (timeString) => {
        const date = new Date(`1970-01-01T${timeString}`);
        return format(date, 'hh:mm a'); // Format time as 'hh:mm AM/PM'
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <nav className="col-md-2 bg-dark sidebar">
                    <div className="text-white text-center py-3">
                        <h4>Emperor's Lounge</h4>
                    </div>
                    <hr className="text-white" />
                    <div className="text-center">
                        <button className="nav-link text-white btn btn-link" onClick={() => navigate('/admin')}>
                            <i className="fas fa-home"></i> Dashboard
                        </button>
                        <button className="nav-link text-white btn btn-link" onClick={() => navigate('/custbook')}>
                            <i className="fas fa-calendar-alt"></i> Customer's Booking
                        </button>
                        <button className="nav-link text-white btn btn-link" onClick={() => navigate('/payments')}>
                            <i className="fas fa-credit-card"></i> Payment
                        </button>
                        <button className="nav-link text-white btn btn-link" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i> Log out
                        </button>
                    </div>
                </nav>
    
                {/* Main Content */}
                <main className="col-md-10 mt-5">
                    {/* Booking Table */}
                    <div className="card">
                        <div className="card-body">
                            <table className="table table-striped table-responsive">
                                <thead className="thead-dark">
                                    <tr>
                                        <th>Booking ID</th>
                                        <th>Customer Name</th>
                                        <th>Service</th>
                                        <th>Staff Name</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.length > 0 ? (
                                        bookings.map((booking) => (
                                            <tr key={booking.booking_id}>
                                                <td>{booking.booking_id}</td> {/* Updated to booking_id */}
                                                <td>{booking.customer_name}</td> {/* Updated to customer_name */}
                                                <td>{booking.service}</td> {/* Updated to services */}
                                                <td>{booking.staffName}</td> {/* Fetched from staffName */}
                                                <td>{formatDate(booking.date)}</td> {/* Format the date */}
                                                <td>{formatTime(booking.time)}</td> {/* Format the time */}
                                                <td>
                                                    <button className="btn btn-danger custom-btn" onClick={() => handleDelete(booking.booking_id)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7">No Records</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}    
export default CustBook;
