require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// 1. Stable Database Connection Strategy
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        // Stop trying after 5 seconds to prevent the "15-minute hang"
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 
        });
        isConnected = true;
        console.log("✅ NSS Database Connected Successfully");
    } catch (err) {
        console.error("❌ Database Connection Error:", err.message);
    }
};

// 2. Define Data Schemas
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: String, 
    email: { type: String, unique: true }, 
    password: String, 
    role: String
}));

const Donation = mongoose.models.Donation || mongoose.model('Donation', new mongoose.Schema({
    id: Number, 
    donorEmail: String, 
    amount: Number, 
    status: String, 
    timestamp: String
}));

// 3. Auth Routes (Updated to send User Name)
app.post('/api/auth', async (req, res) => {
    await connectDB();
    const { email, password, role, action, name } = req.body;
    const user = await User.findOne({ email });

    if (action === 'login') {
        if (user && user.password === password && user.role === role) {
            // Sends name and email back to index.html for storage
            return res.json({ 
                status: "success", 
                email: user.email, 
                name: user.name, 
                role: user.role 
            });
        }
        return res.status(401).json({ message: "Invalid Credentials" });
    }
    
    if (action === 'register') {
        if (user) return res.status(400).json({ message: "User already exists" });
        const newUser = new User({ name, email, password, role });
        await newUser.save();
        return res.json({ status: "success", email: newUser.email, name: newUser.name });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    res.json({ message: "Password reset link sent to your email (Sandbox Mode)." });
});

// 4. Admin Management Routes
app.post('/api/update-profile', async (req, res) => {
    await connectDB();
    const { email, newName } = req.body;
    try {
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { name: newName },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ status: "error", message: "User not found" });
        res.json({ status: "success", message: "Profile updated!", user: updatedUser });
    } catch (err) {
        res.status(500).json({ status: "error", message: "Update failed" });
    }
});

app.post('/api/delete-user', async (req, res) => {
    await connectDB();
    const { email } = req.body;
    try {
        const deletedUser = await User.findOneAndDelete({ email: email });
        if (!deletedUser) return res.status(404).json({ status: "error", message: "User not found" });
        res.json({ status: "success", message: "User permanently removed." });
    } catch (err) {
        res.status(500).json({ status: "error", message: "Failed to delete user" });
    }
});

app.get('/api/admin-stats', async (req, res) => {
    await connectDB();
    const allUsers = await User.find();
    const allDonations = await Donation.find();
    const total = allDonations
        .filter(d => d.status === 'success')
        .reduce((sum, d) => sum + d.amount, 0);
        
    res.json({ 
        totalReg: allUsers.length, 
        totalDonations: total, 
        allUsers, 
        allDonations 
    });
});

// 5. Donation Routes
app.post('/api/initiate-donation', async (req, res) => {
    await connectDB();
    const count = await Donation.countDocuments();
    const donation = new Donation({
        id: count + 1, // Unique numeric ID
        donorEmail: req.body.email, 
        amount: Number(req.body.amount),
        status: 'pending', 
        timestamp: new Date().toLocaleString()
    });
    await donation.save();
    res.json(donation);
});

app.post('/api/update-donation', async (req, res) => {
    await connectDB();
    const { id, status } = req.body;
    await Donation.findOneAndUpdate({ id: parseInt(id) }, { status });
    res.json({ status: "success" });
});

// 6. Export for Vercel / Local Dev
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log("Server running: http://localhost:3000"));
}