import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, Briefcase, Info, HelpCircle, MailQuestion, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const Navbar = () => {
    const { user, logout } = useUserStore();
    const location = useLocation();

    const scrollToContact = () => {
        if (location.pathname !== '/') {
            window.location.href = '/#contact';
            return;
        }

        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800'>
            <div className='container mx-auto px-4 py-3'>
                <div className='flex items-center justify-between'>
                    {/* Logo - Left */}
                    <Link to='/' className='text-2xl font-bold text-emerald-400 items-center space-x-2 flex'>
                        AnyHire.lk
                    </Link>

                    {/* Main Navigation - Center */}
                    <nav className='flex-1 flex justify-center'>
                        <div className='flex items-center gap-6'>
                            <Link
                                to={"/"}
                                className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'
                            >
                                Home
                            </Link>

                            <Link
                                to={"/jobs"}
                                className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center'
                            >
                                <Briefcase className="mr-1" size={18} />
                                Jobs
                            </Link>

                            <Link
                                to="/about"
                                className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center'
                            >
                                <Info className="mr-1" size={18} />
                                About Us
                            </Link>

                            <Link
                                to="/terms-and-policies"
                                className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center'
                            >
                                <FileText className="mr-1" size={18} />
                                Terms & Policies
                            </Link>

                            <Link
                                to="/how-anyhire-works"
                                className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center'
                            >
                                <HelpCircle className="mr-1" size={18} />
                                How It Works
                            </Link>

                            <button
                                onClick={scrollToContact}
                                className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center'
                            >
                                <MailQuestion className="mr-1" size={18} />
                                Help
                            </button>
                        </div>
                    </nav>

                    {/* Auth Buttons - Right */}
                    <div className='flex items-center gap-4'>
                        {user && (
                            <Link
                                className='bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center'
                                to={"/secret-dashboard"}
                            >
                                <Lock className='inline-block mr-1' size={18} />
                                <span className='hidden sm:inline'>Dashboard</span>
                            </Link>
                        )}

                        {user ? (
                            <button
                                className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                                onClick={logout}
                            >
                                <LogOut size={18} />
                                <span className='hidden sm:inline ml-2'>Log Out</span>
                            </button>
                        ) : (
                            <>
                                <Link
                                    to={"/signupchoice"}
                                    className='bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                                >
                                    <UserPlus className='mr-2' size={18} />
                                    Sign Up
                                </Link>
                                <Link
                                    to={"/login"}
                                    className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                                >
                                    <LogIn className='mr-2' size={18} />
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;