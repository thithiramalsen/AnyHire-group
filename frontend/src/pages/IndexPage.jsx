import { Link } from "react-router-dom";
import { Briefcase, UserPlus, ArrowRight, Facebook, Instagram, Shield, Wrench, Zap, Hammer, Paintbrush, Sparkles, Bike, Monitor, Camera, Car, Sun, CheckCircle2, Linkedin, Twitter } from "lucide-react";
import ContactForm from '../Components/Support/ContactForm';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const services = [
  { name: 'Plumbing Services', img: '/src/homeimages/plumbing.jpeg', icon: Wrench },
  { name: 'Electrical Services', img: '/src/homeimages/elec.jpeg', icon: Zap },
  { name: 'Carpentry Services', img: '/src/homeimages/carpent.jpeg', icon: Hammer },
  { name: 'Painting Services', img: '/src/homeimages/paint.jpeg', icon: Paintbrush },
  { name: 'Cleaning Services', img: '/src/homeimages/clean.jpeg', icon: Sparkles },
  { name: 'Bike Services', img: '/src/homeimages/bikeservice.jpeg', icon: Bike },
  { name: 'Computer Services', img: '/src/homeimages/comp.jpeg', icon: Monitor },
  { name: 'CCTV Services', img: '/src/homeimages/cctv.jpeg', icon: Camera },
  { name: 'Car Services', img: '/src/homeimages/carser.jpeg', icon: Car },
  { name: 'Solar Services', img: '/src/homeimages/solar.jpeg', icon: Sun },
];

const benefits = [
  "Verified Professionals",
  "Secure Payments",
  "24/7 Support",
  "Quality Guaranteed",
  "Easy Booking",
  "Affordable Rates"
];

const IndexPage = () => {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
    const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const rotateX = useTransform(scrollYProgress, [0, 1], [0, 45]);
    const springY = useSpring(y, { stiffness: 100, damping: 30 });

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Animated Background Elements */}
            <motion.div 
                style={{ opacity, scale }}
                className="fixed inset-0 overflow-hidden pointer-events-none"
            >
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </motion.div>

            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative text-center mb-12 pt-24 overflow-hidden"
            >
                <motion.div 
                    style={{ y: springY }}
                    className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-blue-500/10 blur-3xl" 
                />
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="mb-8"
                    >
                        <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium">
                            Your Trusted Platform for Professional Services
                        </span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-6xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent"
                    >
                        Find Your Perfect Job Match
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        Connect with top employers and discover opportunities that match your skills and aspirations. 
                        Whether you're a skilled professional or looking to hire one, AnyHire is your trusted platform 
                        for seamless job matching and service delivery.
                    </motion.p>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex justify-center gap-6 mb-12"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to="/jobs"
                                className="bg-emerald-500 text-white px-8 py-4 rounded-lg hover:bg-emerald-600 transition-all duration-300 flex items-center shadow-lg hover:shadow-emerald-500/25"
                            >
                                <Briefcase className="mr-2" />
                                Browse Jobs
                            </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to="/login"
                                className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center shadow-lg hover:shadow-blue-500/25"
                            >
                                <UserPlus className="mr-2" />
                                Get Started
                            </Link>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto"
                    >
                        {benefits.map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 + idx * 0.1 }}
                                className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full"
                            >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-gray-300">{benefit}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Services Section */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="container mx-auto px-4 py-12"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.h2 
                        style={{ rotateX }}
                        className="text-4xl font-bold mb-6"
                    >
                        AnyHire <span className="text-blue-400">| Find Professionals</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-gray-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Discover skilled professionals across various industries. From home services to technical expertise, 
                        find the right person for your needs.
                    </motion.p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                    {services.map((service, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <motion.img 
                                    src={service.img} 
                                    alt={service.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    whileHover={{ scale: 1.1 }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
                                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                                    <motion.div 
                                        className="bg-emerald-500/20 p-2 rounded-lg group-hover:bg-emerald-500/30 transition-colors"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                        <service.icon className="w-6 h-6 text-emerald-400" />
                                    </motion.div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                        {service.name}
                                    </h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Find skilled {service.name.toLowerCase()} professionals for your needs. Quality service guaranteed.
                                </p>
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Link
                                        to="/jobs"
                                        className="inline-flex items-center mt-4 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
                                    >
                                        Find Professionals
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Features Section */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="grid md:grid-cols-3 gap-12 mb-24 container mx-auto px-4"
            >
                {[
                    { icon: Briefcase, title: "Find Jobs", description: "Browse through thousands of verified job listings and find the perfect match for your skills.", color: "emerald" },
                    { icon: UserPlus, title: "Post Jobs", description: "Need help with a project? Post your job and connect with qualified professionals.", color: "blue" },
                    { icon: Shield, title: "Secure Payments", description: "Our secure payment system ensures safe transactions between employers and job seekers.", color: "purple" }
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.2 }}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className="bg-gray-800/50 backdrop-blur-sm p-10 rounded-xl flex flex-col items-center transform transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 border border-gray-700/50 hover:border-emerald-500/50"
                    >
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <feature.icon className={`w-16 h-16 text-${feature.color}-400 mb-6`} />
                        </motion.div>
                        <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                        <p className="text-gray-400 text-center leading-relaxed">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-16 text-center container mx-auto mb-24 relative overflow-hidden"
            >
                <motion.div 
                    style={{ y: springY }}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 blur-3xl" 
                />
                <div className="relative z-10">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold mb-6"
                    >
                        Ready to Start Your Journey?
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-300 mb-10 text-lg leading-relaxed max-w-2xl mx-auto"
                    >
                        Join thousands of professionals who have already found their dream jobs through our platform.
                        Create your account today and take the first step towards your career goals.
                    </motion.p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to="/signupchoice"
                            className="inline-flex items-center bg-emerald-500 text-white px-10 py-5 rounded-lg hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 text-lg font-semibold"
                        >
                            Create Your Account
                            <ArrowRight className="ml-2" />
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* Contact Form Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                id="contact"
                className="mt-24 scroll-mt-24 container mx-auto"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -5 }}
                    className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
                >
                    <ContactForm />
                </motion.div>
            </motion.div>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-gray-950 text-gray-300 pt-16 pb-8 mt-24"
            >
                <div className="container mx-auto px-4">
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
                                <li><Link to="/aboutus" className="text-gray-400 hover:text-emerald-400 transition-colors">About Us</Link></li>
                                <li><Link to="/howitworks" className="text-gray-400 hover:text-emerald-400 transition-colors">How AnyHire Works</Link></li>
                                <li><Link to="/help" className="text-gray-400 hover:text-emerald-400 transition-colors">Help</Link></li>
                                <li><Link to="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">Contact Us</Link></li>
                                <li><Link to="/termsandpolicies" className="text-gray-400 hover:text-emerald-400 transition-colors">Terms & Policies</Link></li>
                            </ul>
                        </div>

                        {/* User Links */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">For Users</h3>
                            <ul className="space-y-2">
                                <li><Link to="/jobs" className="text-gray-400 hover:text-emerald-400 transition-colors">Find Jobs</Link></li>
                                <li><Link to="/post-job" className="text-gray-400 hover:text-emerald-400 transition-colors">Post a Job</Link></li>
                                <li><Link to="/faq" className="text-gray-400 hover:text-emerald-400 transition-colors">FAQs</Link></li>
                                <li><Link to="/account" className="text-gray-400 hover:text-emerald-400 transition-colors">My Account</Link></li>
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
        </div>
    );
};

export default IndexPage;