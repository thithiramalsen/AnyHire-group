import { Navigate, Route, Routes } from "react-router-dom";

import IndexPage from "./pages/IndexPage";
import JobsPage from "./pages/JobsPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import DashBoard from "./pages/DashBoard";
import SignUpChoicePage from "./pages/SignUpChoicePage";
import SignUpJobSeekerPage from "./pages/SignUpJobSeekerPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import MyJobs from "./Components/MyJobs";
import UpgradeAccount from "./pages/UpgradeAccount";
import Cart from "../../backend/models/cart.model";
import UsersAnalytics from "./Components/analytics/UsersAnalytics";
import JobsAnalytics from "./Components/analytics/JobsAnalytics";
import BookingsAnalytics from "./Components/analytics/BookingsAnalytics";
import PaymentsAnalytics from "./Components/analytics/PaymentsAnalytics";
import RatingsAnalytics from "./Components/analytics/RatingsAnalytics";
import SupportAnalytics from "./Components/analytics/SupportAnalytics";
import UserProfileView from "./Components/UserProfileView";

import Navbar from "./Components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import ApplyPage from "./pages/ApplyPage";
import BookingPage from "./pages/BookingPage";

import Chatbot from "./Components/Chatbot/Chatbot";
import ChatPage from './pages/ChatPage';
import ReviewPage from './pages/ReviewPage';
import HowAnyHireWorks from "./pages/HowAnyHireWorks";
import AboutUs from "./pages/AboutUs";

function App() {
	const { user, checkAuth, checkingAuth } = useUserStore();
  
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		if (!user) return;
	}, [user]);

	if (checkingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
			{/* Background gradient */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
				</div>
			</div>

			<div className='relative z-50 pt-20'>
				<Navbar />
				<Routes>
					<Route path='/' element={<IndexPage />} />
					<Route path='/jobs' element={<JobsPage />} />
					<Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
					<Route path='/signupchoice' element={!user ? <SignUpChoicePage /> : <Navigate to='/' />} />
					<Route path='/signup-jobseeker' element={!user ? <SignUpJobSeekerPage /> : <Navigate to='/' />} />
					<Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />	

					<Route
						path="/secret-dashboard"
						element={
							user ? (
								<DashBoard />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>

					{/* Analytics Routes */}
					<Route
						path="/analytics/users"
						element={
							user?.role === 'admin' ? (
								<UsersAnalytics />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route
						path="/analytics/jobs"
						element={
							user?.role === 'admin' ? (
								<JobsAnalytics />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route
						path="/analytics/bookings"
						element={
							user?.role === 'admin' ? (
								<BookingsAnalytics />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route
						path="/analytics/payments"
						element={
							user?.role === 'admin' ? (
								<PaymentsAnalytics />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route
						path="/analytics/ratings"
						element={
							user?.role === 'admin' ? (
								<RatingsAnalytics />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route
						path="/analytics/support"
						element={
							user?.role === 'admin' ? (
								<SupportAnalytics />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>

					{/* Other Routes */}
					<Route path="/apply/:jobId" element={<ApplyPage />} />
					<Route path="/upgrade-account" element={<UpgradeAccount />} />
					<Route
						path="/my-jobs"
						element={
							user ? (
								<MyJobs />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route
						path="/payment/:bookingId"
						element={
							user ? (
								<PaymentPage />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route
						path="/confirm-payment/:bookingId"
						element={
							user ? (
								<PaymentConfirmation />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route path="/booking/:bookingId" element={<BookingPage />} />
					<Route path="/bookings" element={<BookingPage />} />
					<Route path="/chat/:bookingId" element={<ChatPage />} />
					<Route path='/cart' element={<Cart />} />
					<Route
						path="/review/:bookingId"
						element={
							user ? (
								<ReviewPage />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route path="/analytics/users" element={<UsersAnalytics />} />
					<Route path="/how-anyhire-works" element={<HowAnyHireWorks />} />
					<Route path="/about" element={<AboutUs />} />



				</Routes>
			</div>
			<Toaster />
			<Chatbot />
		</div>
	);
}

export default App;