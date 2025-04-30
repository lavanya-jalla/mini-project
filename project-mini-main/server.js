const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { MakeupVendor, DrapingVendor, HairstyleVendor, BookedDate,Feedback } = require('./vendor');


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
let storage = multer.memoryStorage();
let upload = multer({ 
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
    res.sendFile(path.join(__dirname,'/login.html'))
});
app.get('/regist',(req,res)=>{
    res.sendFile(path.join(__dirname ,'/regist.html'));
});
app.get('/home',(req,res)=>{
    res.sendFile(path.join(__dirname ,'/home.html'))
});
app.get('/service',(req,res)=>{
    res.sendFile(path.join(__dirname ,'/service.html'))
});
app.get('/makeup', (req,res)=> {
    res.sendFile(path.join(__dirname ,'/makeup.html'))
});
app.get('/draping', (req,res)=> {
    res.sendFile(path.join(__dirname ,'/draping.html'))
});
app.get('/hairsty',(req,res)=>{
    res.sendFile(path.join(__dirname ,'/hairstyle.html'))
});
app.get('/vendorpage',(req,res)=>{
    res.sendFile(path.join(__dirname ,'/vendorpage.html'))
});
app.get('/vendor booking form',(req,res)=>{
  res.sendFile(path.join(__dirname ,'/vendorpage.html'))
});
app.get('/submit-feedback', (req, res) => {
  const filePath = path.join(__dirname, '/feedback.html');
  console.log('Serving file:', filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving feedback.html:', err);
      res.status(404).send('Feedback page not found');
    }
  });
});
app.get('/work', (req, res) => {
  res.sendFile(path.join(__dirname, '/works.html'));
});



app.get("/api/booked-dates", async (req, res) => {
  const bookings = await BookedDate.find({});
  res.json(bookings);
});
app.post("/api/book-date", async (req, res) => {
  const { vendorName, customerName, customerEmail, vendorEmail, date, location } = req.body;
  console.log("Booking data received:", req.body); 
  const exists = await BookedDate.findOne({ date, vendorName });

  if (exists) return res.status(400).json({ error: "Date already booked" });

  const newBooking = new BookedDate({
    vendorName,
    customerName,
    vendorEmail: vendorEmail,     // Store vendor's email
    customerEmail:customerEmail,
    location,
    date
  });

  await newBooking.save();

  // TODO: Send email via nodemailer here

  res.status(200).json({ message: "Booking saved" });
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
  app.get('/show-vendorBook',(req,res)=>{
    res.sendFile('C:/Users/lavan/Downloads/project-mini-main/project-mini-main/vendor_booking_form.html');
  })
  app.get('/vendor-book', (req, res) => {
    const { email } = req.query;
    res.redirect(`/show-vendorBook?email=${encodeURIComponent(email)}`);
  });
  
    
    //register user
    app.post('/register',upload.single('profilePic'), async (req, res) => {
        const { name, email, address, mobile, services, budget, experience, shop, password,rating } = req.body;
        const VendorModel = getVendorModel(services); // change here to use 'services'
        if (!VendorModel) return res.status(400).send("Invalid vendor type");
    
        const existingUser = await VendorModel.findOne({ email });
        if (existingUser) {
            return res.send("User already exists. Please choose a different email.");
        }
        profilePic = {};
        if (req.file) {
          profilePic = {
            data: req.file.buffer.toString('base64'),
            contentType: req.file.mimetype
          };
        }
        const newVendor = new VendorModel({
          name,
          email,
          address,
          mobile,
          type: services,
          budget,              // add budget
          experience ,          // add experience
          shop,
          password,
          profilePic,
          rating: rating || '' // optional
        });
      
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
      

      


// Serve feedback.html with error handling
app.get('/submit-feedback', (req, res) => {
  const filePath = path.join(__dirname, 'feedback.html');
  console.log('Serving file:', filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving feedback.html:', err);
      res.status(404).send('Feedback page not found');
    }
  });
});

// Handle feedback submission
app.post('/feedback', async (req, res) => {
  const { email, rating } = req.body;

  if (!email || !rating) {
    return res.status(400).json({ error: 'Email and rating are required' });
  }

  try {
    const newFeedback = new Feedback({ email, rating });
    await newFeedback.save();
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
      


const port = 5000;
app.listen(port,() => {
    console.log(`Server running on Port: ${port}`);
});