import { motion } from 'framer-motion';
import { Briefcase, UserPlus, Shield, CheckCircle2 } from 'lucide-react';
import Footer from '../Components/Footer';

const HowAnyHireWorksPage = () => {
    const steps = [
        {
            icon: UserPlus,
            title: "Create Your Account",
            description: "Sign up as either a service provider or a job seeker. Complete your profile with relevant information and skills."
        },
        {
            icon: Briefcase,
            title: "Browse or Post Jobs",
            description: "Search through available jobs or post your own job requirements. Filter by category, location, and more."
        },
        {
            icon: Shield,
            title: "Secure Communication",
            description: "Connect with potential matches through our secure messaging system. Discuss requirements and terms safely."
        },
        {
            icon: CheckCircle2,
            title: "Complete the Job",
            description: "Once terms are agreed upon, complete the job and leave reviews. Build your reputation on the platform."
        }
    ];

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
                        <h1 className="text-4xl font-bold mb-8 text-center">How AnyHire Works</h1>
                        
                        <div className="space-y-12">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: index * 0.2 }}
                                    className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl flex items-start gap-6"
                                >
                                    <div className="bg-emerald-500/20 p-4 rounded-lg">
                                        <step.icon className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold mb-2">{step.title}</h2>
                                        <p className="text-gray-300 leading-relaxed">{step.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="mt-16 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl"
                        >
                            <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
                            <p className="text-gray-300 leading-relaxed mb-6">
                                Join our community of professionals and job seekers today. Create your account and start exploring 
                                opportunities or posting jobs that match your needs.
                            </p>
                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
                                >
                                    Sign Up Now
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Learn More
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default HowAnyHireWorksPage; 