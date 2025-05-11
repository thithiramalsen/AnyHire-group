import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import multer from "../lib/multer.js";
import NotificationService from "../services/notification.service.js";

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
	await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
	res.cookie("accessToken", accessToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};

export const signup = async (req, res) => {
	console.log("Uploaded file:", req.file); // Debugging
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { email, password, name, role } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
        return res.status(400).json({ message: "All fields (name, email, password) are required" });
    }

       /*/ Validate email format
       const emailRegex = /\S+@\S+\.\S+/;
       if (!emailRegex.test(email)) {
           return res.status(400).json({ message: "Invalid email format" });
       }
   
       // Validate password length
       if (password.length < 6) {
           return res.status(400).json({ message: "Password must be at least 6 characters long" });
       }
   
       // Validate password match
       if (password !== confirmPassword) {
           return res.status(400).json({ message: "Passwords do not match" });
       }*/
   

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Handle image upload
        const image = req.file ? req.file.filename : null;

        // Create the user with the provided role (default is 'customer' if not provided)
        const user = await User.create({ name, email, password, role, image });

        // Authenticate
        const { accessToken, refreshToken } = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);

        await NotificationService.createNotification(
            user._id,
            'WELCOME',
            'Welcome to AnyHire!',
            'Thank you for joining AnyHire. We\'re excited to have you on board!',
            '/profile' // Optional link to profile page
        );

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            accessToken,
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			const { accessToken, refreshToken } = generateTokens(user._id);
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken);

			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				accessToken,
			});
		} else {
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

		if (storedToken !== refreshToken) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully", accessToken });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Ensure the user is authenticated
        const userId = req.user._id;

        // Update the user's profile
        const updatedUser = await User.findByIdAndUpdate(
        	userId,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");

        res.json(updatedUser);
    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const uploadPfp = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = req.user;

        // Delete the old PFP if it exists
        if (user.image) {
            const oldImagePath = path.join("uploads", user.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Update the user's PFP
        user.image = req.file.filename;
        await user.save();

        res.json({ message: "Profile picture updated successfully", image: user.image });
    } catch (error) {
        console.error("Error uploading PFP:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deletePfp = async (req, res) => {
    try {
        const user = req.user;

        if (!user.image) {
            return res.status(400).json({ message: "No profile picture to delete" });
        }

        // Delete the PFP file
        const imagePath = path.join("uploads", user.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Remove the PFP reference from the user
        user.image = null;
        await user.save();

        res.json({ message: "Profile picture deleted successfully" });
    } catch (error) {
        console.error("Error deleting PFP:", error);
        res.status(500).json({ message: "Server error" });
    }
};


export const deleteAccount = async (req, res) => {
    try {
        const user = req.user;

        // Delete the user's profile picture if it exists
        if (user.image) {
            const imagePath = path.join("uploads", user.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Delete the user from the database
        await User.findByIdAndDelete(user._id);

        // Clear cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const upgradeToJobSeeker = async (req, res) => {
    try {
        const user = req.user;

        // Check if user is already a job seeker
        if (user.role === 'jobSeeker') {
            return res.status(400).json({ message: 'You are already a job seeker' });
        }

        // Check if user is a customer
        if (user.role !== 'customer') {
            return res.status(400).json({ message: 'Only customers can upgrade to job seekers' });
        }

        // Update user role
        user.role = 'jobSeeker';
        await user.save();

        // Create notification
        await NotificationService.createNotification(
            user._id,
            'ROLE_UPGRADE',
            'Welcome Job Seeker!',
            'Your account has been upgraded to Job Seeker. You can now start offering your services!',
            '/jobs/create'
        );

        res.json({ 
            message: 'Successfully upgraded to job seeker',
            role: user.role 
        });
    } catch (error) {
        console.error('Error upgrading role:', error);
        res.status(500).json({ message: 'Server error' });
    }
};