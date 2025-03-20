import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Briefcase, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";

const SignUpChoicePage = () => {

  const { loading } = useUserStore();

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
          Sign up as
        </h2>
      </motion.div>

      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">

          <div className="flex flex-col space-y-4">
            {/* Sign Up as Client */}
            <Link to="/signup">
              <button
                type="button"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out"
              >
                <UserPlus className="mr-2 h-6 w-6" />
                Sign up as a Client
              </button>
            </Link>

            {/* Sign Up as Job Seeker */}
            <Link to="/signup-jobseeker">
              <button
                type="button"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                <Briefcase className="mr-2 h-6 w-6" />
                Sign up as a Job Seeker
              </button>
            </Link>
          </div>

          {/* Optional: Already have an account */}
          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
            >
              Login here
            </Link>
          </p>

        </div>
      </motion.div>

    </div>
  );
};

export default SignUpChoicePage;
