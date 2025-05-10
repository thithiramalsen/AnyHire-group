import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { Mail, Clock, Send, X } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const colors = {
        New: 'bg-blue-100 text-blue-800',
        'In Progress': 'bg-yellow-100 text-yellow-800',
        Resolved: 'bg-green-100 text-green-800'
    };

    return (
        <span className={`px-2 py-1 rounded text-sm ${colors[status]}`}>
            {status}
        </span>
    );
};

// Helper function to format date
const formatDate = (date) => {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('en-US', options);
};

const ContactAdminTab = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);

    const fetchContacts = async () => {
        try {
            const response = await axios.get('/contact/admin');
            setContacts(response.data);
        } catch (error) {
            toast.error('Error fetching contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleReply = async (contactId) => {
        try {
            await axios.post(`/contact/reply/${contactId}`, {
                reply: replyText
            });
            toast.success('Reply sent successfully');
            setReplyText('');
            setSelectedContact(null);
            fetchContacts();
        } catch (error) {
            toast.error('Error sending reply');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-300">Contact Messages</h2>
            
            <div className="space-y-4">
                {contacts.map((contact) => (
                    <div key={contact._id} className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-200">{contact.subject}</h3>
                                <div className="flex items-center text-gray-400 text-sm gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{contact.name} ({contact.email})</span>
                                </div>
                                <div className="flex items-center text-gray-500 text-sm gap-2 mt-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatDate(contact.createdAt)}</span>
                                </div>
                            </div>
                            <StatusBadge status={contact.status} />
                        </div>
                        
                        <div className="bg-gray-700 p-4 rounded mb-4">
                            <p className="text-gray-300">{contact.message}</p>
                        </div>

                        {contact.replies.map((reply, index) => (
                            <div key={index} className="bg-gray-700 p-4 rounded mb-4">
                                <div className="flex items-center text-gray-400 text-sm mb-2 gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>Reply from {reply.adminName}</span>
                                    <Clock className="h-4 w-4 ml-2" />
                                    <span>{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="text-gray-300">{reply.message}</p>
                            </div>
                        ))}

                        {selectedContact === contact._id ? (
                            <div className="mt-4 space-y-4">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-200"
                                    placeholder="Type your reply..."
                                    rows={4}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReply(contact._id)}
                                        className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        Send Reply
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedContact(null);
                                            setReplyText('');
                                        }}
                                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setSelectedContact(contact._id)}
                                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                                Reply to message
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContactAdminTab;