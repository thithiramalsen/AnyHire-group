import { Link } from "react-router-dom";
import { Briefcase, UserPlus, ArrowRight } from "lucide-react";

const IndexPage = () => {
    return (
        <div className="container mx-auto px-4 py-16">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                    Find Your Perfect Job Match
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    Connect with top employers and discover opportunities that match your skills and aspirations.
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        to="/jobs"
                        className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors flex items-center"
                    >
                        <Briefcase className="mr-2" />
                        Browse Jobs
                    </Link>
                    <Link
                        to="/login"
                        className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                        <UserPlus className="mr-2" />
                        Get Started
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">Find Jobs</h3>
                    <p className="text-gray-400">
                        Browse through thousands of verified job listings and find the perfect match for your skills.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">Post Jobs</h3>
                    <p className="text-gray-400">
                        Need help with a project? Post your job and connect with qualified professionals.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
                    <p className="text-gray-400">
                        Our secure payment system ensures safe transactions between employers and job seekers.
                    </p>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
                <p className="text-gray-300 mb-6">
                    Join thousands of professionals who have already found their dream jobs through our platform.
                </p>
                <Link
                    to="/signupchoice"
                    className="inline-flex items-center bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                    Create Your Account
                    <ArrowRight className="ml-2" />
                </Link>
            </div>
        </div>
    );
};

export default IndexPage; 