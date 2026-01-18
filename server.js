require('dotenv').config(); // Loads your .env variables
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// 1. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("NSS Database Connected Successfully"))
    .catch(err => console.error("Database Connection Error:", err));

// 2. Define Data Schemas
const User = mongoose.model('User', new mongoose.Schema({
    name: String, email: { type: String, unique: true }, password: String, role: String
}));

const Donation = mongoose.model('Donation', new mongoose.Schema({
    id: Number, donorEmail: String, amount: Number, status: String, timestamp: String
}));

// 3. Auth Routes
app.post('/api/auth', async (req, res) => {
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

// 4. Donation Routes
app.post('/api/initiate-donation', async (req, res) => {
    const count = await Donation.countDocuments();
    const donation = new Donation({
        id: count, donorEmail: req.body.email, amount: Number(req.body.amount),
        status: 'pending', timestamp: new Date().toLocaleString()
    });
    await donation.save();
    res.json(donation);
});

app.post('/api/update-donation', async (req, res) => {
    const { id, status } = req.body;
    await Donation.findOneAndUpdate({ id: parseInt(id) }, { status });
    res.json({ status: "success" });
});

app.get('/api/admin-stats', async (req, res) => {
    const allUsers = await User.find();
    const allDonations = await Donation.find();
    const total = allDonations.filter(d => d.status === 'success').reduce((s, d) => s + d.amount, 0);
    res.json({ totalReg: allUsers.length, totalDonations: total, allUsers, allDonations });
});

// 5. Export for Vercel
module.exports = app;

// Local Development
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log("Local server: http://localhost:3000"));
}