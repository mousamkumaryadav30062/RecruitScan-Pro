import User from '../models/User.js';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import { generateRandomPassword, generateMasterId, sendCredentials, sendPasswordReset } from '../utils/emailService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dobBS,
      dobAD,
      gender,
      email,
      mobile,
      citizenship,
      nid
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }, { citizenship }, { nid }]
    });

    if (existingUser) {
      let message = 'User already exists with ';
      if (existingUser.email === email) message += 'this email';
      else if (existingUser.mobile === mobile) message += 'this mobile number';
      else if (existingUser.citizenship === citizenship) message += 'this citizenship number';
      else if (existingUser.nid === nid) message += 'this NID number';
      
      return res.status(400).json({ message });
    }

    const password = generateRandomPassword();
    const masterId = generateMasterId();

    const user = await User.create({
      masterId,
      firstName,
      lastName,
      dobBS,
      dobAD,
      gender,
      email,
      mobile,
      citizenship,
      nid,
      password
    });

    await sendCredentials(email, masterId, password);

    res.status(201).json({
      message: 'Registration successful! Credentials sent to your email.',
      masterId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    // 1️⃣ Find user by email or mobile
    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }]
    }).select('+password');

    // ❌ User not found
    if (!user) {
      return res.status(404).json({
        message: 'User does not exist with this email/phone number'
      });
    }

    // ❌ Password mismatch
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Email/Mobile and password do not match'
      });
    }

    // ✅ Success
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        masterId: user.masterId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isFirstLogin: user.isFirstLogin,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(oldPassword))) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Forgot password request for email:', email);

    // Must include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate 6-digit password
    const newPassword = generateRandomPassword();

    console.log('Generated new password for user:', user.email);

    // Set new password (will be auto-hashed by schema)
    user.password = newPassword;
    user.isFirstLogin = true;
    await user.save();

    // Send email
    const userName = `${user.firstName} ${user.lastName}`;
    await sendPasswordReset(user.email, userName, user.masterId, newPassword);

    res.json({
      success: true,
      message: 'New password has been sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Password reset failed',
      error: error.message
    });
  }
};


export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id);

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const adminRegister = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // You can make role optional and default to 'admin'
    const finalRole = role || "admin";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    // Create new admin
    // → password will be automatically hashed thanks to pre('save') hook
    const admin = await Admin.create({
      email,
      password,           // plain text — will be hashed automatically
      role: finalRole,
    });

    // Optional: create token right away (like login)
    const token = generateToken(admin._id);

    res.status(201).json({
      message: "Admin account created successfully",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin register error:", error);
    res.status(500).json({
      message: "Server error during admin registration",
      error: error.message,
    });
  }
};