const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  mobile: String,
  type: String,
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

module.exports = {
  MakeupVendor,
  DrapingVendor,
  HairstyleVendor,
  BookedDate
};
