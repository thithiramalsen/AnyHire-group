import { motion } from 'framer-motion';
import Footer from '../Components/Footer';

const TermsAndPoliciesPage = () => {
    const sections = [
        {
            title: "Terms of Service",
            content: [
                "By using AnyHire, you agree to these terms. Please read them carefully.",
                "You must be at least 18 years old to use this service.",
                "You are responsible for maintaining the security of your account.",
                "You agree not to use the service for any illegal purposes.",
                "We reserve the right to terminate accounts that violate our terms."
            ]
        },
        {
            title: "Privacy Policy",
            content: [
                "We collect information to provide better services to our users.",
                "We use cookies and similar technologies to improve your experience.",
                "We do not share your personal information with third parties without consent.",
                "You can request access to your personal data at any time.",
                "We implement security measures to protect your information."
            ]
        },
        {
            title: "User Responsibilities",
            content: [
                "Provide accurate and complete information in your profile.",
                "Maintain professional conduct in all interactions.",
                "Respect the privacy and rights of other users.",
                "Report any suspicious or inappropriate behavior.",
                "Keep your account credentials secure."
            ]
        },
        {
            title: "Payment Terms",
            content: [
                "All payments are processed securely through our platform.",
                "Service fees are clearly displayed before transactions.",
                "Refunds are processed according to our refund policy.",
                "We use secure payment processors to handle transactions.",
                "Payment disputes should be reported within 30 days."
            ]
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
                        <h1 className="text-4xl font-bold mb-8 text-center">Terms & Policies</h1>
                        
                        <div className="space-y-8">
                            {sections.map((section, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: index * 0.2 }}
                                    className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl"
                                >
                                    <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                                    <ul className="space-y-3">
                                        {section.content.map((item, itemIndex) => (
                                            <li key={itemIndex} className="flex items-start gap-2">
                                                <span className="text-emerald-400 mt-1">•</span>
                                                <span className="text-gray-300">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="mt-12 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl"
                        >
                            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                            <p className="text-gray-300 leading-relaxed">
                                If you have any questions about our terms and policies, please contact us at 
                                <a href="mailto:anyhirelk@gmail.com" className="text-emerald-400 hover:text-emerald-300 ml-1">
                                    anyhirelk@gmail.com
                                </a>
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TermsAndPoliciesPage; 