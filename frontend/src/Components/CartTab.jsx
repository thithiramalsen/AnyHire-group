import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const CartTab = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        console.log('Fetching cart items...');
        try {
            const response = await axios.get("/cart");
            console.log('Cart items received:', response.data);
            setCartItems(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error.response || error);
            toast.error("Failed to load cart items");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id) => {
        console.log('Attempting to remove item:', id);
        try {
            const response = await axios.delete(`/cart/${id}`);
            console.log('Remove response:', response.data);
            setCartItems(cartItems.filter(item => item._id !== id));
            toast.success("Item removed from cart");
        } catch (error) {
            console.error('Error removing item:', {
                error: error.response?.data || error.message,
                status: error.response?.status,
                id: id
            });
            toast.error(`Failed to remove item: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleApply = async (jobId, cartItemId) => {
        console.log('Attempting to apply for job:', jobId);
        try {
            const response = await axios.post(`/booking/apply/${jobId}`);
            console.log('Apply response:', response.data);
            await handleRemove(cartItemId);
            toast.success("Application submitted successfully");
        } catch (error) {
            console.error('Error applying for job:', {
                error: error.response?.data || error.message,
                jobId: jobId
            });
            toast.error(error.response?.data?.message || "Failed to apply for job");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">My Cart</h2>
            {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center">Your cart is empty</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cartItems.map((item) => (
                        <div key={item._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            {item.jobDetails?.images && (
                                <img
                                    src={`http://localhost:5000${item.jobDetails.images}`}
                                    alt={item.jobDetails.title}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">{item.jobDetails?.title}</h3>
                                <p className="text-gray-400 mb-4">{item.jobDetails?.description}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-green-400 font-semibold">
                                        Rs. {item.jobDetails?.payment}
                                    </p>
                                    <div className="space-x-2">
                                        {item.jobStatus.isInProgress ? (
                                            <span className="bg-yellow-500 text-white px-4 py-2 rounded-lg">
                                                Job In Progress
                                            </span>
                                        ) : item.jobStatus.hasApplied ? (
                                            <span className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                                                Application Pending
                                            </span>
                                        ) : item.jobStatus.canApply ? (
                                            <button
                                                onClick={() => handleApply(item.jobDetails._id, item._id)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                            >
                                                Apply
                                            </button>
                                        ) : (
                                            <span className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                                                Not Available
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleRemove(item._id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CartTab;