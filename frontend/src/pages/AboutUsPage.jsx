import { motion } from 'framer-motion';
import Footer from '../Components/Footer';

const AboutUsPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <div className="flex-grow">
                <div className="container mx-auto px-4 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h1 className="text-4xl font-bold mb-8 text-center">About AnyHire</h1>
                        
                        <div className="space-y-8">
                            <section className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl">
                                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    At AnyHire, we're dedicated to revolutionizing the way people find and offer professional services. 
                                    Our platform connects skilled professionals with those who need their expertise, creating opportunities 
                                    for meaningful work and growth.
                                </p>
                            </section>

                            <section className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl">
                                <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    We envision a world where finding the right professional for any job is seamless, transparent, 
                                    and efficient. By leveraging technology and community trust, we're building a platform that 
                                    empowers both service providers and seekers.
                                </p>
                            </section>

                            <section className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl">
                                <h2 className="text-2xl font-semibold mb-4">Why Choose AnyHire?</h2>
                                <ul className="list-disc list-inside space-y-2 text-gray-300">
                                    <li>Verified professionals and secure transactions</li>
                                    <li>Wide range of service categories</li>
                                    <li>User-friendly platform</li>
                                    <li>24/7 customer support</li>
                                    <li>Transparent pricing and reviews</li>
                                </ul>
                            </section>

                            <section className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl">
                                <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    We are a dedicated team of professionals committed to making AnyHire the best platform for 
                                    connecting service providers with those who need their expertise. Our diverse team brings 
                                    together expertise in technology, customer service, and business operations.
                                </p>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AboutUsPage; 