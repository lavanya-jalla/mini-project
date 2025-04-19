const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  mobile: String,
  type: String,
  shop: { type: String, default: '' },
  password: String
});

// Create separate models based on type
const MakeupVendor = mongoose.model("makeupvendors", vendorSchema);
const DrapingVendor = mongoose.model("drapingvendors", vendorSchema);
const HairstyleVendor = mongoose.model("hairstylevendors", vendorSchema);

module.exports = {
  MakeupVendor,
  DrapingVendor,
  HairstyleVendor
};
