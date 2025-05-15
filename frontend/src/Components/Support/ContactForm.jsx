import { useState } from 'react';
import { Mail, MessageCircle, User, HelpCircle, Users, Briefcase } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = (values) => {
        const errors = {};
        
        // Name validation - only characters, no numbers
        if (!values.name) {
            errors.name = 'Name is required';
        } else if (!/^[A-Za-z\s]+$/.test(values.name)) {
            errors.name = 'Name should only contain letters and spaces';
        }

        // Email validation
        if (!values.email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Subject validation - at least 5 characters
        if (!values.subject) {
            errors.subject = 'Subject is required';
        } else if (values.subject.trim().length < 5) {
            errors.subject = 'Subject must be at least 5 characters';
        }

        // Message validation - at least 10 characters
        if (!values.message) {
            errors.message = 'Message is required';
        } else if (values.message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters';
        }

        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Validate on change if field has been touched
        if (touched[name]) {
            const validationErrors = validate({ ...formData, [name]: value });
            setErrors(prev => ({
                ...prev,
                [name]: validationErrors[name]
            }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        
        // Validate on blur
        const validationErrors = validate(formData);
        setErrors(prev => ({
            ...prev,
            [name]: validationErrors[name]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields on submit
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        
        // Check if there are any errors
        if (Object.keys(validationErrors).length > 0) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/contact/create', formData);
            toast.success(`Message sent successfully! We'll get back to you soon.`);
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
            setErrors({});
            setTouched({});
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error sending message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="sm:mx-auto sm:w-full sm:max-w-3xl"
        >
            {/* Header Section */}
            <div className="text-center mb-12">
                <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 bg-clip-text text-transparent"
                >
                    Get in Touch with AnyHire
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto"
                >
                    Have a question, need support, or want to share feedback? We're here to help! Whether you're a job seeker, an employer, or just exploring opportunities, fill out the form below, and our team will get back to you shortly. Let's connect and make hiring easier together!
                </motion.p>
                
                {/* Feature Icons */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex justify-center gap-8 mb-8"
                >
                    <div className="flex flex-col items-center">
                        <div className="bg-emerald-500/10 p-4 rounded-full mb-2">
                            <Users className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-400">Job Seekers</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-emerald-500/10 p-4 rounded-full mb-2">
                            <Briefcase className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-400">Employers</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-emerald-500/10 p-4 rounded-full mb-2">
                            <HelpCircle className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-400">Support</span>
                    </div>
                </motion.div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                            Full name
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`block w-full px-3 py-2 pl-10 bg-gray-700 border ${
                                    errors.name ? 'border-red-500' : 'border-gray-600'
                                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                                placeholder="John Doe"
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email address
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`block w-full px-3 py-2 pl-10 bg-gray-700 border ${
                                    errors.email ? 'border-red-500' : 'border-gray-600'
                                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                                placeholder="you@example.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                            Subject
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MessageCircle className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`block w-full px-3 py-2 pl-10 bg-gray-700 border ${
                                    errors.subject ? 'border-red-500' : 'border-gray-600'
                                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                                placeholder="How can we help?"
                            />
                        </div>
                        {errors.subject && (
                            <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                            Message
                        </label>
                        <div className="mt-1">
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`block w-full px-3 py-2 bg-gray-700 border ${
                                    errors.message ? 'border-red-500' : 'border-gray-600'
                                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                                rows={4}
                                placeholder="Your message here..."
                            />
                        </div>
                        {errors.message && (
                            <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default ContactForm;