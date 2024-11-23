import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Books.css';

const Payments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State for search query


    // Handle logout
    const handleLogout = () => {
        navigate('/');
    };

    // Fetch payments from the API and filter distinct values
    const fetchPayments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('https://vynceianoani.helioho.st/Balbuena/getBookings.php');
            console.log('API response:', response.data);
            if (response.data.success) {
                // Filter distinct payments based on bookingID
                const distinctPayments = response.data.data.reduce((acc, current) => {
                    const x = acc.find(item => item.bookingID === current.bookingID);
                    if (!x) {
                        return acc.concat([current]);
                    } else {
                        return acc;
                    }
                }, []);
                setPayments(distinctPayments); // Set distinct payments
            } else {
                setError('Failed to fetch payments.');
            }
        } catch (error) {
            setError('Error fetching payments.');
            console.error('Error details:', error.response ? error.response.data : error.message);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filter payments based on the search query
    const filteredPayments = payments.filter(payment =>
        payment.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle accepting a payment (mark as completed)
    const handleAccept = async (bookingID) => {
        try {
            // Send the request to update the booking status to "Completed"
            const response = await axios.post('https://vynceianoani.helioho.st/Balbuena/acceptPayment.php', {
                bookingID: bookingID,
                status: 'Completed',
            });

            if (response.data.success) {
                // Update the local state to reflect the new status
                setPayments((prevPayments) =>
                    prevPayments.map((payment) =>
                        payment.bookingID === bookingID
                            ? { ...payment, status: 'Completed' }
                            : payment
                    )
                );
                console.log(`Booking ID ${bookingID} marked as completed`);
            } else {
                console.error('Failed to update status for booking ID:', bookingID);
            }
        } catch (error) {
            console.error('Error updating booking status:', error);
        }
    };

    // Handle canceling a payment (update status to "Canceled")
    const handleCancel = async (bookingID) => {
        try {
            // Send the request to update the booking status to "Canceled"
            const response = await axios.post('https://vynceianoani.helioho.st/Balbuena/deleteBooking.php', {
                bookingID: bookingID,
                status: 'Canceled',
            });

            if (response.data.success) {
                // Update the local state to reflect the canceled status
                setPayments((prevPayments) =>
                    prevPayments.map((payment) =>
                        payment.bookingID === bookingID
                            ? { ...payment, status: 'Canceled' }
                            : payment
                    )
                );
                console.log(`Booking ID ${bookingID} marked as canceled`);
            } else {
                console.error('Failed to update status for booking ID:', bookingID);
            }
        } catch (error) {
            console.error('Error updating booking status:', error);
        }
    };
    // Handle deleting a booking
const handleDelete = async (bookingID) => {
    try {
        const response = await axios.post('https://vynceianoani.helioho.st/Balbuena/delete.php', {
            bookingID: bookingID,
        });

        if (response.data.success) {
            // Remove the deleted booking from the local state
            setPayments((prevPayments) => prevPayments.filter((payment) => payment.bookingID !== bookingID));
            console.log(`Booking ID ${bookingID} deleted successfully.`);
        } else {
            console.error('Failed to delete booking ID:', bookingID);
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
    }
};

// Modify the actions rendering logic


    // Fetch payments on component mount
    useEffect(() => {
        fetchPayments();
    }, []);

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
                    <div className="card">
                        <div className="card-body">
                            
                            <h2 className="text-center">Payment</h2>
                            <div className="d-flex justify-content-between mb-3">
                                <input
                                    type="text"
                                    className="form-control form-control-sm w-25"
                                    placeholder="Search by customer name"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            {isLoading ? (
                                <p>Loading payments...</p>
                            ) : error ? (
                                <p className="text-danger">{error}</p>
                            ) : payments.length > 0 ? (
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Booking ID</th>
                                            <th>Name</th>
                                            <th>Service Type</th>
                                            <th>Service Price</th>
                                            <th>Contact No</th>
                                            <th>Payment Method</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {filteredPayments.map((payment) => (
                                            <tr key={payment.bookingID}>
                                                <td>{payment.bookingID}</td>
                                                <td>{payment.customerName}</td>
                                                <td>{payment.serviceType}</td>
                                                <td>
                                                    ₱{isNaN(parseFloat(payment.servicePrice)) ? 'Invalid Price' : parseFloat(payment.servicePrice).toFixed(2)}
                                                </td>
                                                <td>{payment.contactNo}</td>
                                                <td>{payment.paymentMethod}</td>
                                                <td>
                                                <span
                                                    style={{
                                                        backgroundColor:
                                                            payment.status === 'Completed'
                                                                ? 'green'
                                                                : payment.status === 'pending'
                                                                ? '#d9a23d'
                                                                : payment.status === 'Canceled'
                                                                ? 'red'
                                                                : 'lightgray',
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td>
    {payment.status === 'pending' ? (
        <button
            className="btn btn-success custom-btn"
            onClick={() => handleAccept(payment.bookingID)}
        >
            <i className="fas fa-check"></i> Accept
        </button>
    ) : null}
    {payment.status === 'Completed' || payment.status === 'Canceled' ? (
        <button
            className="btn btn-danger custom-btn ml-2"
            onClick={() => handleDelete(payment.bookingID)}
        >
            <i className="fas fa-times"></i> Delete
        </button>
    ) : (
        <button
            className="btn btn-danger custom-btn ml-2"
            onClick={() => handleCancel(payment.bookingID)}
        >
            <i className="fas fa-times"></i> Cancel
        </button>
    )}
</td>;
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No payments found.</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Payments;
