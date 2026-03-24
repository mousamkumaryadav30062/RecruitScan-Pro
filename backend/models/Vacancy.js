import mongoose from 'mongoose';

const vacancySchema = new mongoose.Schema({
  vacancyName: {
    type: String,
    required: true
  },
  companySymbolPrefix: {
    type: Number,
    unique: true,
    sparse: true
  },
  lastDate: {
    type: Date,
    required: true
  },
  doubleFeeLastDate: {
    type: Date,
    required: true
  },
  regularFee: {
    type: Number,
    required: true
  },
  doubleFee: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: String
}, {
  timestamps: true
});
const Vacancy = mongoose.model('Vacancy', vacancySchema);
export default Vacancy;