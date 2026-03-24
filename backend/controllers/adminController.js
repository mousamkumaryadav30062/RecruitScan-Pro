import Application from '../models/Application.js';
import User from '../models/User.js';
import Vacancy from '../models/Vacancy.js';
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail
} from '../utils/emailService.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: 'user',
        select: '-password'
      })
      .populate('vacancy')
      .sort('-createdAt');

    res.json(applications);
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getApprovedApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: 'approved' })
      .populate({
        path: 'user',
        select: '-password'
      })
      .populate('vacancy')
      .sort('-createdAt');

    res.json(applications);
  } catch (error) {
    console.error('Get approved applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status, rejectionReason } = req.body;

    const updateData = { status };

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason || '';
      updateData.canReapply = true;
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    ).populate('user').populate('vacancy');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const candidateName = `${application.user?.firstName || ''} ${application.user?.lastName || ''}`.trim();
    const candidateEmail = application.user?.email;
    const masterId = application.user?.masterId || '-';
    const vacancyName = application.vacancy?.vacancyName || '-';

    try {
      if (status === 'approved' && candidateEmail) {
        await sendApplicationApprovedEmail({
          toEmail: candidateEmail,
          name: candidateName,
          masterId,
          vacancyName
        });
      }

      if (status === 'rejected' && candidateEmail) {
        await sendApplicationRejectedEmail({
          toEmail: candidateEmail,
          name: candidateName,
          masterId,
          vacancyName,
          rejectionReason: rejectionReason || 'No reason provided.'
        });
      }
    } catch (mailError) {
      console.error('Application status email error:', mailError);
    }

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const autoAssignSymbolNumbers = async (req, res) => {
  try {
    const { vacancyId } = req.body;

    if (!vacancyId) {
      return res.status(400).json({ message: 'Vacancy ID is required' });
    }

    const vacancies = await Vacancy.find().sort({ createdAt: 1 });

    const vacancyIndex = vacancies.findIndex(
      (vacancy) => vacancy._id.toString() === vacancyId
    );

    if (vacancyIndex === -1) {
      return res.status(404).json({ message: 'Vacancy not found' });
    }

    const baseSymbol = (vacancyIndex + 1) * 1000;

    const applications = await Application.find({
      status: 'approved',
      vacancy: vacancyId
    }).populate('user').populate('vacancy');

    if (!applications.length) {
      return res.status(404).json({
        message: 'No approved applications found for this company'
      });
    }

    applications.sort((a, b) => {
      const nameA = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });

    for (let i = 0; i < applications.length; i++) {
      applications[i].symbolNumber = (baseSymbol + i).toString();
      await applications[i].save();
    }

    res.json({
      message: 'Symbol numbers assigned successfully according to alphabetical S.N.',
      count: applications.length,
      startingFrom: baseSymbol
    });
  } catch (error) {
    console.error('Auto assign symbols error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const assignExamCenter = async (req, res) => {
  try {
    const { vacancyId, startIndex, endIndex, centerName } = req.body;

    if (!vacancyId) {
      return res.status(400).json({ message: 'Vacancy ID is required' });
    }

    const applications = await Application.find({
      status: 'approved',
      vacancy: vacancyId
    })
      .populate('user')
      .populate('vacancy')
      .sort('createdAt');

    if (!applications.length) {
      return res.status(404).json({ message: 'No approved applications found for this company' });
    }

    applications.sort((a, b) => {
      const nameA = `${a.user?.firstName} ${a.user?.lastName}`.toLowerCase();
      const nameB = `${b.user?.firstName} ${b.user?.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    for (let i = startIndex; i <= endIndex && i < applications.length; i++) {
      applications[i].examCenter = centerName;
      await applications[i].save();
    }

    res.json({
      message: 'Exam center assigned successfully',
      count: endIndex - startIndex + 1
    });
  } catch (error) {
    console.error('Assign exam center error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const generateAdmitCard = async (req, res) => {
  try {
    const { applicationId, examDate, examTime, rules } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (!application.symbolNumber || !application.examCenter) {
      return res.status(400).json({
        message: 'Symbol number and exam center must be assigned first'
      });
    }

    application.admitCardGenerated = true;
    application.admitCardData = {
      examDate,
      examTime,
      rules
    };

    await application.save();

    res.json({
      message: 'Admit card generated successfully',
      application
    });
  } catch (error) {
    console.error('Generate admit card error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const generateAllAdmitCards = async (req, res) => {
  try {
    const { vacancyId, examDate, examTime, rules } = req.body;

    if (!vacancyId) {
      return res.status(400).json({ message: 'Vacancy ID is required' });
    }

    const applications = await Application.find({
      status: 'approved',
      vacancy: vacancyId,
      symbolNumber: { $exists: true, $ne: '' },
      examCenter: { $exists: true, $ne: '' }
    });

    if (!applications.length) {
      return res.status(404).json({
        message: 'No eligible applications found for this company'
      });
    }

    for (const app of applications) {
      app.admitCardGenerated = true;
      app.admitCardData = {
        examDate,
        examTime,
        rules
      };
      await app.save();
    }

    res.json({
      message: 'Admit cards generated for selected company',
      count: applications.length
    });
  } catch (error) {
    console.error('Generate all admit cards error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const assignSymbolNumber = async (req, res) => {
  try {
    const { applicationId, symbolNumber, examCenter } = req.body;

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { symbolNumber, examCenter },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ message: 'Symbol number assigned', application });
  } catch (error) {
    console.error('Assign symbol number error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const approvedApplications = await Application.countDocuments({ status: 'approved' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
    const paidApplications = await Application.countDocuments({ feePaid: { $gt: 0 } });

    res.json({
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      paidApplications
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};