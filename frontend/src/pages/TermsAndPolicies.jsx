import { FileText, Shield, UserCheck, Lock, AlertCircle, CreditCard, Scale, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsAndPolicies = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 pt-24 pb-12 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="container mx-auto px-4 relative">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient">
                        Terms & Policies
                    </h1>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
                        Welcome to AnyHire! By using our platform, you agree to adhere to the following terms and policies. 
                        Please read them carefully to understand your rights and responsibilities.
                    </p>
                </motion.div>

                {/* Main Content */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
                >
                    {/* Terms of Service */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:bg-emerald-500/20 transition-colors duration-300">
                                <FileText className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300">Terms of Service</h2>
                        </div>
                        <div className="space-y-4 text-gray-300">
                            <h3 className="text-lg font-medium text-emerald-400">Platform Usage</h3>
                            <p className="leading-relaxed">AnyHire is designed to connect job seekers with employers for part-time opportunities.</p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Provide accurate and up-to-date information</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Use the platform solely for lawful purposes</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Refrain from disruptive or harmful activities</span>
                                </li>
                            </ul>

                            <h3 className="text-lg font-medium text-emerald-400 mt-6">Account Responsibilities</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Maintain confidentiality of login credentials</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Report unauthorized access immediately</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Keep profile information accurate and updated</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Privacy Policy */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:bg-emerald-500/20 transition-colors duration-300">
                                <Shield className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300">Privacy Policy</h2>
                        </div>
                        <div className="space-y-4 text-gray-300">
                            <h3 className="text-lg font-medium text-emerald-400">Data Collection</h3>
                            <p className="leading-relaxed">We collect personal information such as names, email addresses, and job preferences to enhance your experience.</p>

                            <h3 className="text-lg font-medium text-emerald-400 mt-6">Usage of Data</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Facilitate connections between job seekers and employers</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Improve platform functionality</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Provide tailored recommendations</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Payment Terms */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:bg-emerald-500/20 transition-colors duration-300">
                                <CreditCard className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300">Payment Terms</h2>
                        </div>
                        <div className="space-y-4 text-gray-300">
                            <h3 className="text-lg font-medium text-emerald-400">Pricing Structure</h3>
                            <p className="leading-relaxed">Employers may incur fees for posting jobs or accessing premium features. All pricing details will be clearly stated before any transaction.</p>

                            <h3 className="text-lg font-medium text-emerald-400 mt-6">Refund Policy</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Refunds only for technical errors or duplicate charges</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Requests must be submitted within 14 days</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* User Conduct */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:bg-emerald-500/20 transition-colors duration-300">
                                <UserCheck className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300">User Conduct</h2>
                        </div>
                        <div className="space-y-4 text-gray-300">
                            <h3 className="text-lg font-medium text-emerald-400">Prohibited Activities</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">No fraudulent or misleading job listings</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">No spamming, harassment, or abusive behavior</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">No hacking or platform disruption</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Disclaimer of Liability */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:bg-emerald-500/20 transition-colors duration-300">
                                <Scale className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300">Disclaimer of Liability</h2>
                        </div>
                        <div className="space-y-4 text-gray-300">
                            <p className="leading-relaxed">AnyHire acts as a platform to facilitate connections and is not a party to any agreements between job seekers and employers.</p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Not responsible for user conduct</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Not liable for disputes from job agreements</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Not liable for platform downtime</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Updates to Terms */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:bg-emerald-500/20 transition-colors duration-300">
                                <Lock className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300">Updates to Terms</h2>
                        </div>
                        <div className="space-y-4 text-gray-300">
                            <p className="leading-relaxed">We may update these terms and policies periodically. Significant changes will be communicated via email or platform notifications.</p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Changes will be notified via email</span>
                                </li>
                                <li className="flex items-start gap-2 group/item">
                                    <span className="text-emerald-400 mt-1 group-hover/item:scale-125 transition-transform duration-300">•</span>
                                    <span className="group-hover/item:text-emerald-400 transition-colors duration-300">Continued use implies acceptance</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Contact Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 text-center"
                >
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 max-w-2xl mx-auto hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:bg-emerald-500/20 transition-colors duration-300">
                                <Mail className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300">Questions About Our Terms?</h3>
                        </div>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            For questions or further assistance, please contact us via the Help page or email at anyhirelk@gmail.com
                        </p>
                        <a
                            href="#contact"
                            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105"
                        >
                            Contact Support
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsAndPolicies; 