import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  province: {
    type: String,
    default: ''
  },
  district: {
    type: String,
    default: ''
  },
  localBody: {
    type: String,
    default: ''
  },
  wardNo: {
    type: String,
    default: ''
  },
  tole: {
    type: String,
    default: ''
  }
}, { _id: false });

const educationSchema = new mongoose.Schema({
  country: {
    type: String,
    default: ''
  },
  university: {
    type: String,
    default: ''
  },
  level: {
    type: String,
    default: ''
  },
  gpaPercentage: {
    type: String,
    default: ''
  },
  gradeDivision: {
    type: String,
    default: ''
  },
  documents: [
    {
      docType: {
        type: String,
        default: ''
      },
      file: {
        type: String,
        default: ''
      }
    }
  ]
}, { _id: true });

const userSchema = new mongoose.Schema({
  masterId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dobAD: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  citizenship: {
    type: String,
    required: true,
    unique: true
  },
  nid: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  fatherName: {
    type: String,
    default: ''
  },
  motherName: {
    type: String,
    default: ''
  },
  grandFatherName: {
    type: String,
    default: ''
  },
  citizenshipIssuePlace: {
    type: String,
    default: ''
  },
  citizenshipIssueDateAD: {
    type: Date
  },
  citizenshipIssueDateBS: {
    type: String,
    default: ''
  },
  photo: {
    type: String,
    default: ''
  },
  signature: {
    type: String,
    default: ''
  },
  citizenshipFront: {
    type: String,
    default: ''
  },
  citizenshipBack: {
    type: String,
    default: ''
  },
  permanentAddress: {
    type: addressSchema,
    default: () => ({})
  },
  temporaryAddress: {
    type: addressSchema,
    default: () => ({})
  },
  sameAddress: {
    type: Boolean,
    default: false
  },
  quota: {
    type: String,
    default: ''
  },
  caste: {
    type: String,
    default: ''
  },
  religion: {
    type: String,
    default: ''
  },
  employmentStatus: {
    type: String,
    default: ''
  },
  education: [educationSchema],
  profileCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;