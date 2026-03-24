import Vacancy from '../models/Vacancy.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

export const createVacancy = async (req, res) => {
  try {
    const vacancy = await Vacancy.create(req.body);
    res.status(201).json({ message: 'Vacancy created', vacancy });
  } catch (error) {
    console.error('Create vacancy error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllVacancies = async (req, res) => {
  try {
    const vacancies = await Vacancy.find({ isActive: true });
    res.json(vacancies);
  } catch (error) {
    console.error('Get vacancies error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const applyVacancy = async (req, res) => {
  try {
    const { vacancyId, quota } = req.body;

    const user = await User.findById(req.user._id);
    if (!user.profileCompleted) {
      return res.status(400).json({ message: 'Please complete your profile before applying' });
    }

    const vacancy = await Vacancy.findById(vacancyId);
    if (!vacancy) {
      return res.status(404).json({ message: 'Vacancy not found' });
    }

    const currentDate = new Date();
    let feePaid = vacancy.regularFee;

    if (currentDate > new Date(vacancy.lastDate)) {
      feePaid = vacancy.doubleFee;
    }

    // Find any existing application for this vacancy by this user
    const existingApplication = await Application.findOne({
      user: req.user._id,
      vacancy: vacancyId
    });

    // If already applied and not rejected, block duplicate apply
    if (existingApplication && existingApplication.status !== 'rejected') {
      return res.status(400).json({ message: 'Already applied for this vacancy' });
    }

    // If rejected before, reuse same application as re-apply
    if (existingApplication && existingApplication.status === 'rejected') {
      existingApplication.quota = quota;
      existingApplication.feePaid = feePaid;
      existingApplication.status = 'pending';
      existingApplication.rejectionReason = '';
      existingApplication.canReapply = false;
      existingApplication.symbolNumber = '';
      existingApplication.examCenter = '';
      existingApplication.admitCardGenerated = false;
      existingApplication.admitCardData = {};
      existingApplication.applicationDate = new Date();

      await existingApplication.save();

      return res.status(200).json({
        message: 'Application re-applied successfully',
        application: existingApplication,
        feePaid
      });
    }

    // Fresh apply
    const application = await Application.create({
      user: req.user._id,
      vacancy: vacancyId,
      quota,
      feePaid,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
      feePaid
    });
  } catch (error) {
    console.error('Apply vacancy error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('vacancy')
      .populate({
        path: 'user',
        select: 'firstName lastName masterId email mobile citizenship gender photo signature citizenshipFront citizenshipBack'
      })
      .sort('-createdAt');
    
    res.json(applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ... existing imports

export const updateVacancy = async (req, res) => {
  try {
    const { id } = req.params;
    const vacancy = await Vacancy.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!vacancy) {
      return res.status(404).json({ message: 'Vacancy not found' });
    }
    
    res.json({ message: 'Vacancy updated successfully', vacancy });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteVacancy = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are applications for this vacancy before deleting
    const hasApplications = await Application.exists({ vacancy: id });
    if (hasApplications) {
      return res.status(400).json({ 
        message: 'Cannot delete vacancy because it already has applications. Try deactivating it instead.' 
      });
    }

    await Vacancy.findByIdAndDelete(id);
    res.json({ message: 'Vacancy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};