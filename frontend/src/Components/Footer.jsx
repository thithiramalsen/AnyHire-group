import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gray-950 text-gray-300 w-full"
        >
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-gray-800">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <span className="text-3xl font-bold text-white">AnyHire</span>
                        <p className="text-gray-400 leading-relaxed">
                            Connecting skilled professionals with great opportunities. Your trusted platform for job matching and hiring.
                        </p>
                        <div className="flex gap-4">
                            <motion.a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="flex items-center gap-2 text-gray-300 bg-gray-800 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors"
                            >
                                <Facebook className="w-5 h-5 text-blue-400" />
                            </motion.a>
                            <motion.a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="flex items-center gap-2 text-gray-300 bg-gray-800 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors"
                            >
                                <Linkedin className="w-5 h-5 text-blue-600" />
                            </motion.a>
                            <motion.a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="flex items-center gap-2 text-gray-300 bg-gray-800 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors"
                            >
                                <Instagram className="w-5 h-5 text-pink-400" />
                            </motion.a>
                            <motion.a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="flex items-center gap-2 text-gray-300 bg-gray-800 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors"
                            >
                                <Twitter className="w-5 h-5 text-blue-400" />
                            </motion.a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-400 hover:text-emerald-400 transition-colors">Home</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-emerald-400 transition-colors">About Us</Link></li>
                            <li><Link to="/how-anyhire-works" className="text-gray-400 hover:text-emerald-400 transition-colors">How AnyHire Works</Link></li>
                            <li><Link to="/support" className="text-gray-400 hover:text-emerald-400 transition-colors">Help</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">Contact Us</Link></li>
                            <li><Link to="/terms-and-policies" className="text-gray-400 hover:text-emerald-400 transition-colors">Terms & Policies</Link></li>
                        </ul>
                    </div>

                    {/* User Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">For Users</h3>
                        <ul className="space-y-2">
                            <li><Link to="/jobs" className="text-gray-400 hover:text-emerald-400 transition-colors">Find Jobs</Link></li>
                            <li><Link to="/post-job" className="text-gray-400 hover:text-emerald-400 transition-colors">Post a Job</Link></li>
                            <li><Link to="/faq" className="text-gray-400 hover:text-emerald-400 transition-colors">FAQs</Link></li>
                            <li><Link to="/profile" className="text-gray-400 hover:text-emerald-400 transition-colors">My Account</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Contact Us</h3>
                        <div className="space-y-2">
                            <p className="text-gray-400">Email: anyhirelk@gmail.com</p>
                            <p className="text-gray-400">Phone: +94-76 595 3860</p>
                            <p className="text-gray-400">Colombo, Sri Lanka</p>
                        </div>
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold text-white mb-2">Stay Updated!</h4>
                            <form className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                >
                                    Subscribe
                                </motion.button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Legal Section */}
                <div className="mt-8 space-y-4">
                    <div className="text-center text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} AnyHire. All rights reserved.
                    </div>
                    <div className="text-center text-gray-500 text-sm max-w-2xl mx-auto">
                        AnyHire is a platform for connecting job seekers and employers. We are not responsible for individual agreements or outcomes.
                    </div>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer; 