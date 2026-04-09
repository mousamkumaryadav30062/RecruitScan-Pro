import User from '../models/User.js';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { generateRandomPassword, generateMasterId, sendCredentials, sendPasswordReset } from '../utils/emailService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dobAD,
      gender,
      email,
      mobile,
      niNumber
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }, { niNumber }]
    });

    if (existingUser) {
      let message = 'Account already exists with ';
      if (existingUser.email === email) message += 'this email address';
      else if (existingUser.mobile === mobile) message += 'this mobile number';
      else if (existingUser.niNumber === niNumber) message += 'this National Insurance Number';

      return res.status(400).json({ message });
    }

    const password = generateRandomPassword();
    const masterId = generateMasterId();

    const user = await User.create({
      masterId,
      firstName,
      lastName,
      dobAD,
      gender,
      email,
      mobile,
      niNumber,
      password
    });

    await sendCredentials(email, masterId, password);

    res.status(201).json({
      message: 'Registration successful! Your login credentials have been sent to your email address.',
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

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }]
    }).select('+password');

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email or mobile number'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Email/Mobile and password do not match'
      });
    }

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

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email } = payload;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this Google email. Please register first.'
      });
    }

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
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Google sign-in failed. Please sign in with email and password.' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(oldPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
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

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    const newPassword = generateRandomPassword();

    user.password = newPassword;
    user.isFirstLogin = true;
    await user.save();

    const userName = `${user.firstName} ${user.lastName}`;
    await sendPasswordReset(user.email, userName, user.masterId, newPassword);

    res.json({
      success: true,
      message: 'A new password has been sent to your email address'
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

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const finalRole = role || 'admin';

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const admin = await Admin.create({
      email,
      password,
      role: finalRole,
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin register error:', error);
    res.status(500).json({
      message: 'Server error during admin registration',
      error: error.message,
    });
  }
};
