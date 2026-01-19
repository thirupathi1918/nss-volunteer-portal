# NSS Volunteer & Donation Management Portal 🛡️

A comprehensive full-stack solution designed for the National Service Scheme (NSS) to manage volunteer registrations and track digital donations transparently.

## 🚀 Live Links
- **Vercel Deployment:** https://nss-volunteer-portal.vercel.app/
- **Video Demonstration:** https://drive.google.com/file/d/1BfGrNqJrP2dFdpfKrU3YVec-GObrJAaV/view?usp=drive_link

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Data & Payment Handling](#-data--payment-handling)
- [Setup Instructions](#-setup-instructions)

## 🌟 Project Overview
This portal fulfills the requirements for a centralized volunteer management system. It provides a secure environment for volunteers to register and donate, while giving admins a high-level overview of community impact through aggregated data.

## ✨ Features

### 👤 Volunteer Side
- **Unified Authentication:** Common login/register page with role-based access and redirection.
- **Donation Flow:** Support for custom donation amounts with real-time status tracking.
- **User Dashboard:** View registration details and personal donation history.
- **UX Enhancements:** Password visibility toggle and smooth loading transitions to handle serverless cold starts.

### 🛠️ Admin Side
- **Admin Dashboard:** Instant view of total registrations and total funds collected.
- **Registration Management:** View all users with advanced search and role-based filtering.
- **Account Control:** Administrative ability to edit display names or permanently delete accounts.
- **Donation Management:** Full tracking of all transaction attempts with timestamps and aggregated amounts.
- **Data Portability:** Export filtered registration or donation records to CSV for offline reporting.

## 💻 Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (NoSQL) with Mongoose.
- **Payment Gateway:** Razorpay API (Sandbox Mode).
- **Hosting:** Vercel (Serverless Functions).

## 🏗️ System Architecture
The application utilizes a **Client-Server Architecture**:
1. **Client:** Static assets served from the `public` folder.
2. **Serverless API:** Express handles logic through Vercel serverless functions.
3. **Database:** Mongoose connects to MongoDB Atlas using an optimized connection strategy to maintain stability in a serverless environment.



## 🔐 Data & Payment Handling Rules
In compliance with project standards:
- **Independence:** Registration data is saved to MongoDB immediately upon form submission, independent of donation completion.
- **Integrity:** "Success" status is only granted after genuine gateway confirmation; no fake or forced logic is used.
- **Transparency:** Failed and pending payment attempts are clearly recorded in the database for audit purposes.

## 🛠️ Setup Instructions
1. Clone the repo: `git clone [Your Repo Link]`
2. Install dependencies: `npm install`
3. Configure `.env`: Add your `MONGODB_URI`
4. Run locally: `node server.js`
