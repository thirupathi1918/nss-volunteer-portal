require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// 1. IMPROVED: Serverless Database Connection Strategy
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log("✅ NSS Database Connected Successfully");
    } catch (err) {
        console.error("❌ Database Connection Error:", err);
    }
};

// 2. Define Data Schemas
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: String, email: { type: String, unique: true }, password: String, role: String
}));

const Donation = mongoose.models.Donation || mongoose.model('Donation', new mongoose.Schema({
    id: Number, donorEmail: String, amount: Number, status: String, timestamp: String
}));

// 3. Auth Routes
app.post('/api/auth', async (req, res) => {
    await connectDB();
    const { email, password, role, action, name } = req.body;
    const user = await User.findOne({ email });

    if (action === 'login') {
        if (user && user.password === password && user.role === role) {
            return res.json({ status: "success", user });
        }
        return res.status(401).json({ message: "Invalid Credentials" });
    }
    if (action === 'register') {
        if (user) return res.status(400).json({ message: "User already exists" });
        await new User({ name, email, password, role }).save();
        return res.json({ status: "success" });
    }
});

// NEW: Forgot Password Placeholder
app.post('/api/forgot-password', async (req, res) => {
    res.json({ message: "Password reset link sent to your email (Sandbox Mode)." });
});

// --- ADMIN MANAGEMENT ROUTES ---

// UPDATE Profile Route
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
        res.json({ status: "success", message: "Profile updated successfully!", user: updatedUser });
    } catch (err) {
        res.status(500).json({ status: "error", message: "Update failed" });
    }
});

// DELETE User Route
app.post('/api/delete-user', async (req, res) => {
    await connectDB();
    const { email } = req.body;
    try {
        const deletedUser = await User.findOneAndDelete({ email: email });
        if (!deletedUser) return res.status(404).json({ status: "error", message: "User not found" });
        res.json({ status: "success", message: "User permanently removed from database." });
    } catch (err) {
        res.status(500).json({ status: "error", message: "Failed to delete user" });
    }
});

app.get('/api/admin-stats', async (req, res) => {
    await connectDB();
    const allUsers = await User.find();
    const allDonations = await Donation.find();
    const total = allDonations.filter(d => d.status === 'success').reduce((s, d) => s + d.amount, 0);
    res.json({ totalReg: allUsers.length, totalDonations: total, allUsers, allDonations });
});

// --- DONATION ROUTES ---

app.post('/api/initiate-donation', async (req, res) => {
    await connectDB();
    const count = await Donation.countDocuments();
    const donation = new Donation({
        id: count, donorEmail: req.body.email, amount: Number(req.body.amount),
        status: 'pending', timestamp: new Date().toLocaleString()
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

// 5. Export for Vercel
module.exports = app;

// Local Development
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log("Local server: http://localhost:3000"));
}