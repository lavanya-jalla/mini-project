const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  mobile: String,
  type: String,
  experience: Number,
  budget: Number ,    
  shop: { type: String, default: '' },
  password: String,
  profilePic: {
    data: String,      // base64 encoded
    contentType: String
  },
  rating: String
});
const bookedDateSchema = new mongoose.Schema({
  date: String,
  vendorName: String,
  customerName:String,
  vendorEmail: String,
  customerEmail:String,
  location: String
});

// Create separate models based on type
const MakeupVendor = mongoose.model("makeupvendors", vendorSchema);
const DrapingVendor = mongoose.model("drapingvendors", vendorSchema);
const HairstyleVendor = mongoose.model("hairstylevendors", vendorSchema);
const BookedDate = mongoose.model('vendorBookings',bookedDateSchema);


const feedbackSchema = new mongoose.Schema({
  email: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = {
  MakeupVendor,
  DrapingVendor,
  HairstyleVendor,
  BookedDate,
  Feedback
};
