const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { MakeupVendor, DrapingVendor, HairstyleVendor } = require('./vendor');


const app = express();
//convert data into json format
app.use(express.json());
app.use(express.urlencoded({extended: false}));

mongoose.connect("mongodb://localhost:27017/loginreg", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"));


app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

function getVendorModel(type) {
    if (type === 'Makeup') return MakeupVendor;
    if (type === 'Draping') return DrapingVendor;
    if (type === 'Hairstyling') return HairstyleVendor;
    return null;
  }

// Set storage for Multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

// Mongoose Schema for vendor work
const vendorWorkSchema = new mongoose.Schema({
    email: String,
    image: {
      data: String,      // base64 encoded
      contentType: String
    },
    uploadedAt: { type: Date, default: Date.now }
  });
  
const VendorWork = mongoose.model("vendorworks", vendorWorkSchema);

// API to handle file upload
app.post('/api/uploadWork', upload.single('file'), async (req, res) => {
    const { email } = req.body;
    if (!req.file || !email) {
      return res.status(400).json({ error: 'Missing image or email' });
    }
  
    try {
      const base64Image = req.file.buffer.toString('base64');
      const newWork = new VendorWork({
        email,
        image: {
          data: base64Image,
          contentType: req.file.mimetype
        }
      });
      await newWork.save();
      res.json({ message: 'Image uploaded successfully', work: newWork });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });
  app.get('/api/vendorImages', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });
  
    try {
      const images = await VendorWork.find({ email });
      res.json(images.map(img => ({
        contentType: img.image.contentType,
        base64: img.image.data
      })));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  });
  app.get('/api/makeup', async (req, res) => {
    try {
      // Query the makeupvendors collection and exclude the password field
      const vendors = await MakeupVendor.find({}, { password: 0 }); // Exclude password from the response
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  });
  app.get('/api/hairstyle', async (req, res) => {
    try {
      // Query the makeupvendors collection and exclude the password field
      const vendors = await HairstyleVendor.find({}, { password: 0 }); // Exclude password from the response
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  });
  app.get('/api/drape', async (req, res) => {
    try {
      // Query the makeupvendors collection and exclude the password field
      const vendors = await DrapingVendor.find({}, { password: 0 }); // Exclude password from the response
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  });
  
  
  
  
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname,'startpage.html'))
});
app.get('/login', async (req, res) => {
    res.sendFile(path.join(__dirname,'login.html'))
});
app.get('/regist',(req,res)=>{
    res.sendFile(path.join(__dirname ,'regist.html'));
});
app.get('/home',(req,res)=>{
    res.sendFile(path.join(__dirname ,'home.html'))
});
app.get('/service',(req,res)=>{
    res.sendFile(path.join(__dirname ,'service.html'))
});
app.get('/makeup', (req,res)=> {
    res.sendFile(path.join(__dirname ,'makeup.html'))
});
app.get('/draping', (req,res)=> {
    res.sendFile(path.join(__dirname ,'draping.html'))
});
app.get('/hairsty',(req,res)=>{
    res.sendFile(path.join(__dirname ,'hairstyle.html'))
});
app.get('/vendorpage',(req,res)=>{
    res.sendFile(path.join(__dirname ,'vendorpage.html'))
});

app.get('/api/vendor', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });
  
    const types = [MakeupVendor, DrapingVendor, HairstyleVendor];
    for (let Model of types) {
      const vendor = await Model.findOne({ email });
      if (vendor) return res.json(vendor);
    }
  
    res.status(404).json({ error: "Vendor not found" });
  });
  
    
    //register user
    app.post('/register', async (req, res) => {
        const { name, email, address, mobile, services, shop, password } = req.body;
        const VendorModel = getVendorModel(services); // change here to use 'services'
        if (!VendorModel) return res.status(400).send("Invalid vendor type");
    
        const existingUser = await VendorModel.findOne({ email });
        if (existingUser) {
            return res.send("User already exists. Please choose a different email.");
        }
    
        const newVendor = new VendorModel({
            name,
            email,
            address,
            mobile,
            type: services, // store 'services' under 'type' in DB
            shop,
            password
        });
        console.log(req.body);

        await newVendor.save();
        res.redirect('/login');
    });
    
      

    //login user 
    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        
        // Search in all vendor types
        const types = [MakeupVendor, DrapingVendor, HairstyleVendor];
        for (let Model of types) {
          const user = await Model.findOne({ email, password });
          if (user) {
            // Save email in session or redirect with query
            return res.redirect('/vendorpage?email=' + encodeURIComponent(email));
          }
        }
      
        res.send("Wrong credentials");
      });
      


const port = 5000;
app.listen(port,() => {
    console.log(`Server running on Port: ${port}`);
});