import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader, Image } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";

const validate = (fields) => {
	const errs = {};

	// Name validation
	if (!fields.name) {
		errs.name = "Name is required.";
	} else if (fields.name.length < 3) {
		errs.name = "Name must be at least 3 characters.";
	} else if (!/^[A-Za-z\s]+$/.test(fields.name)) {
		errs.name = "Name can only contain letters.";
	}

	// Email validation
	if (!fields.email) {
		errs.email = "Email is required.";
	} else if (!/\S+@\S+\.\S+/.test(fields.email)) {
		errs.email = "Please enter a valid email address.";
	}

	// Password validation
	if (!fields.password) {
		errs.password = "Password is required.";
	} else if (fields.password.length < 6) {
		errs.password = "Password must be at least 6 characters.";
	}

	// Confirm Password validation
	if (!fields.confirmPassword) {
		errs.confirmPassword = "Please confirm your password.";
	} else if (fields.confirmPassword !== fields.password) {
		errs.confirmPassword = "Passwords do not match.";
	}

	// Image validation (if required)
	if (fields.image && !fields.image.type.startsWith("image/")) {
		errs.image = "Please select a valid image file.";
	}

	return errs;
};

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { signup, loading } = useUserStore();

	const handleSubmit = (e) => {
		e.preventDefault();

		const errors = validate(formData);
		if (Object.keys(errors).length > 0) {
			Object.values(errors).forEach((error) => toast.error(error));
			return;
		}

		const data = new FormData();
		data.append("name", formData.name);
		data.append("email", formData.email);
		data.append("password", formData.password);
		data.append("confirmPassword", formData.confirmPassword);
		if (formData.image) {
			data.append("image", formData.image); // Add image to FormData
		}

		signup(data); // Pass FormData to the signup function
	};

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>Create your account</h2>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<label htmlFor='name' className='block text-sm font-medium text-gray-300'>
								Full name
							</label>
							<div className='mt-1 relative rounded-md shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<User className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='name'
									type='text'
									required
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
									placeholder='John Doe'
									onBlur={(e) => setFormData({ ...formData, touched: { ...formData.touched, name: true } })}
								/>
								{formData.touched?.name && validate(formData).name && (
									<div className="text-red-500 text-xs mt-1">{validate(formData).name}</div>
								)}
							</div>
						</div>

						<div>
							<label htmlFor='email' className='block text-sm font-medium text-gray-300'>
								Email address
							</label>
							<div className='mt-1 relative rounded-md shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='email'
									type='email'
									required
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
									rounded-md shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-emerald-500 
									 focus:border-emerald-500 sm:text-sm'
									placeholder='you@example.com'
									onBlur={(e) => setFormData({ ...formData, touched: { ...formData.touched, email: true } })}
								/>
								{formData.touched?.email && validate(formData).email && (
									<div className="text-red-500 text-xs mt-1">{validate(formData).email}</div>
								)}
							</div>
						</div>

						<div>
							<label htmlFor='password' className='block text-sm font-medium text-gray-300'>
								Password
							</label>
							<div className='mt-1 relative rounded-md shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='password'
									type='password'
									required
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
									rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
									placeholder='••••••••'
									onBlur={(e) => setFormData({ ...formData, touched: { ...formData.touched, password: true } })}
								/>
								{formData.touched?.password && validate(formData).password && (
									<div className="text-red-500 text-xs mt-1">{validate(formData).password}</div>
								)}
							</div>
						</div>

						<div>
							<label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-300'>
								Confirm Password
							</label>
							<div className='mt-1 relative rounded-md shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='confirmPassword'
									type='password'
									required
									value={formData.confirmPassword}
									onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
									className=' block w-full px-3 py-2 pl-10 bg-gray-700 border
									 border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
									placeholder='••••••••'
									onBlur={(e) => setFormData({ ...formData, touched: { ...formData.touched, confirmPassword: true } })}
								/>
								{formData.touched?.confirmPassword && validate(formData).confirmPassword && (
									<div className="text-red-500 text-xs mt-1">{validate(formData).confirmPassword}</div>
								)}
							</div>
						</div>

						<div>
							<label htmlFor='image' className='block text-sm font-medium text-gray-300'>
								Profile Picture
							</label>
							<div className='mt-1 relative rounded-md shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Image className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='image'
									type='file'
									accept='image/*'
									onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
									className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm
									placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
								/>
							</div>
						</div>

						<button
							type='submit'
							className='w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
							 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
									Loading...
								</>
							) : (
								<>
									<UserPlus className='mr-2 h-5 w-5' aria-hidden='true' />
									Sign up
								</>
							)}
						</button>
					</form>

					<p className='mt-8 text-center text-sm text-gray-400'>
						Already have an account?{" "}
						<Link to='/login' className='font-medium text-emerald-400 hover:text-emerald-300'>
							Login here <ArrowRight className='inline h-4 w-4' />
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};
export default SignUpPage;