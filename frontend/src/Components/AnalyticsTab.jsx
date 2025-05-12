import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import UsersAnalytics from "./analytics/UsersAnalytics";
import BookingsAnalytics from "./analytics/BookingsAnalytics";
import PaymentsAnalytics from "./analytics/PaymentsAnalytics";
import RatingsAnalytics from "./analytics/RatingsAnalytics";

const AnalyticsTab = () => {
	console.log("[AnalyticsTab] Component mounted");
	const [currentAnalyticsTab, setCurrentAnalyticsTab] = useState("analytics-users");

	const analyticsTabs = [
		{ id: "analytics-users", label: "Users", component: <UsersAnalytics /> },
		{ id: "analytics-bookings", label: "Bookings", component: <BookingsAnalytics /> },
		{ id: "analytics-payments", label: "Payments", component: <PaymentsAnalytics /> },
		{ id: "analytics-ratings", label: "Ratings", component: <RatingsAnalytics /> }
	];

	console.log("[AnalyticsTab] Current tab:", currentAnalyticsTab);
	console.log("[AnalyticsTab] Available tabs:", analyticsTabs.map(tab => tab.id));

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="flex-1 overflow-y-auto"
		>
			{/* Analytics Sub-navigation */}
			<div className="mb-8">
				<div className="flex space-x-4 border-b border-gray-700">
					{analyticsTabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => {
								console.log("[AnalyticsTab] Switching to tab:", tab.id);
								setCurrentAnalyticsTab(tab.id);
							}}
							className={`px-4 py-2 text-sm font-medium ${
								currentAnalyticsTab === tab.id
									? "text-emerald-400 border-b-2 border-emerald-400"
									: "text-gray-400 hover:text-gray-300"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Analytics Content */}
			<div className="mt-6">
				{analyticsTabs.find(tab => tab.id === currentAnalyticsTab)?.component}
			</div>
		</motion.div>
	);
};

export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
	<motion.div
		className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
	>
		<div className='flex justify-between items-center'>
			<div className='z-10'>
				<p className='text-emerald-300 text-sm mb-1 font-semibold'>{title}</p>
				<h3 className='text-white text-3xl font-bold'>{value}</h3>
			</div>
		</div>
		<div className='absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30' />
		<div className='absolute -bottom-4 -right-4 text-emerald-800 opacity-50'>
			<Icon className='h-32 w-32' />
		</div>
	</motion.div>
);