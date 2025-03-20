import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Link } from "react-router-dom";

const BookingsTab = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get("/bookings"); // 
                setBookings(response.data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Your Bookings</h2>
            {/* Post a Job Button */}
            <Link to="/post-job" className="mb-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded">
                Post a Job
            </Link>
            {/* Show "No bookings found" if the bookings array is empty */}
            {bookings.length === 0 ? (
                <div>No bookings found.</div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="p-4 bg-gray-800 rounded shadow">
                            <p><strong>Job Title:</strong> {booking.jobTitle}</p>
                            <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {booking.status}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingsTab;