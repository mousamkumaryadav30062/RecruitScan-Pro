import User from '../models/User.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updatePersonalDetails = async (req, res) => {
  try {
    const updates = req.body;

    if (req.files) {
      if (req.files.photo) updates.photo = req.files.photo[0].filename;
      if (req.files.signature) updates.signature = req.files.signature[0].filename;
      if (req.files.idDocumentFront) updates.idDocumentFront = req.files.idDocumentFront[0].filename;
      if (req.files.idDocumentBack) updates.idDocumentBack = req.files.idDocumentBack[0].filename;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Personal details updated', user });
  } catch (error) {
    console.error('Update personal details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAddressDetails = async (req, res) => {
  try {
    const { permanentAddress, temporaryAddress, sameAddress } = req.body;

    if (
      !permanentAddress ||
      !permanentAddress.province ||
      !permanentAddress.district ||
      !permanentAddress.localBody ||
      !permanentAddress.wardNo ||
      !permanentAddress.tole
    ) {
      return res.status(400).json({ message: 'All permanent address fields are required' });
    }

    if (
      !temporaryAddress ||
      !temporaryAddress.province ||
      !temporaryAddress.district ||
      !temporaryAddress.localBody ||
      !temporaryAddress.wardNo ||
      !temporaryAddress.tole
    ) {
      return res.status(400).json({ message: 'All temporary address fields are required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.permanentAddress = {
      province: permanentAddress.province,
      district: permanentAddress.district,
      localBody: permanentAddress.localBody,
      wardNo: permanentAddress.wardNo,
      tole: permanentAddress.tole
    };

    user.temporaryAddress = sameAddress
      ? {
          province: permanentAddress.province,
          district: permanentAddress.district,
          localBody: permanentAddress.localBody,
          wardNo: permanentAddress.wardNo,
          tole: permanentAddress.tole
        }
      : {
          province: temporaryAddress.province,
          district: temporaryAddress.district,
          localBody: temporaryAddress.localBody,
          wardNo: temporaryAddress.wardNo,
          tole: temporaryAddress.tole
        };

    user.sameAddress = sameAddress;

    await user.save();

    res.json({ message: 'Address details updated', user });
  } catch (error) {
    console.error('Update address details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateExtraDetails = async (req, res) => {
  try {
    const { quota, caste, religion, employmentStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          quota,
          caste,
          religion,
          employmentStatus
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Extra details updated', user });
  } catch (error) {
    console.error('Update extra details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addEducation = async (req, res) => {
  try {
    const { country, university, level, gpaPercentage, gradeDivision } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const uploadedFiles = req.files || [];
    const documents = uploadedFiles.map((file, index) => ({
      docType: req.body[`docType_${index}`] || 'Other',
      file: file.filename
    }));

    const educationData = {
      country,
      university,
      level,
      gpaPercentage,
      gradeDivision,
      documents
    };

    user.education.push(educationData);
    await user.save();

    res.json({ message: 'Education details added', user });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profileCompleted: true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile completed successfully', user });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const updateEducation = async (req, res) => {
  try {
    const { educationId } = req.params;
    const { country, university, level, gpaPercentage, gradeDivision } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const education = user.education.id(educationId);

    if (!education) {
      return res.status(404).json({ message: 'Education record not found' });
    }

    education.country = country ?? education.country;
    education.university = university ?? education.university;
    education.level = level ?? education.level;
    education.gpaPercentage = gpaPercentage ?? education.gpaPercentage;
    education.gradeDivision = gradeDivision ?? education.gradeDivision;

    await user.save();

    res.json({ message: 'Education updated successfully', user });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const { educationId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const education = user.education.id(educationId);

    if (!education) {
      return res.status(404).json({ message: 'Education record not found' });
    }

    education.deleteOne();
    await user.save();

    res.json({ message: 'Education deleted successfully', user });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};