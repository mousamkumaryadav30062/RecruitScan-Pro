import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vacancy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vacancy',
    required: true
  },
  quota: {
    type: String,
    required: true
  },
  feePaid: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  canReapply: {
    type: Boolean,
    default: false
  },
  symbolNumber: {
    type: String,
    default: ''
  },
  examCenter: {
    type: String,
    default: ''
  },
  admitCardGenerated: {
    type: Boolean,
    default: false
  },
  admitCardData: {
    examDate: Date,
    examTime: String,
    rules: String
  },
  applicationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;