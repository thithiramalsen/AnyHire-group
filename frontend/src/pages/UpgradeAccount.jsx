import { useNavigate } from "react-router-dom";

const UpgradeAccount = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Upgrade Your Account</h1>
                <div className="space-y-6">
                    <p className="text-gray-300 text-center">
                        To apply for jobs, you need to upgrade your account to a job seeker account.
                        This will allow you to browse and apply for jobs on our platform.
                    </p>
                    <div className="bg-gray-700 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Benefits of Upgrading:</h2>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-center">
                                <span className="mr-2">✓</span>
                                Apply to unlimited jobs
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2">✓</span>
                                Track your applications
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2">✓</span>
                                Get notified about new opportunities
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2">✓</span>
                                Build your professional profile
                            </li>
                        </ul>
                    </div>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => navigate("/profile")}
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Upgrade Now
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeAccount; 