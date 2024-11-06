const express = require("express");
const router = express.Router();
const db = require("../database/database");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); // Import bcrypt for hashing passwords
const crypto = require('crypto');
const Razorpay = require('razorpay');
const checkCoursePurchased = async (req, res, next) => {
    const { userId, courseCreationId } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT * FROM student_buy_courses 
            WHERE userId = ? AND courseCreationId = ?
        `, [userId, courseCreationId]);

        if (rows.length === 0) {
            return res.status(403).json({ message: 'Access denied: Course not purchased.' });
        }

        next(); // User has purchased the course, proceed to the next middleware/route handler
    } catch (error) {
        console.error('Error checking course purchase:', error);
        res.status(500).send('Server error');
    }
};


 
 
router.post('/buy_course', async (req, res) => {
    const { userId, courseCreationId, paymentId, status } = req.body;
 
    // Validate required fields
    if (!userId || !courseCreationId || !paymentId || !status) {
        return res.status(400).json({ message: 'User ID, Course Creation ID, Payment ID, and Status are required.' });
    }
 
    if (status !== 1) {
        return res.status(400).json({ message: 'Payment was not successful. No course purchased.' });
    }
 
    // Insert the course purchase
    try {
        const result = await db.query(`INSERT INTO student_buy_courses (user_Id, courseCreationId, student_buy_course_Id , payment_status, activation_status) VALUES (?, ?, ?, ?, ?)`, [userId, courseCreationId, paymentId, 1, 'active']);
        const redirectUrl = `/Mycourses/${userId}`;
        return res.status(201).json({ message: 'Course purchased successfully.', courseId: result.insertId , redirectUrl});
    } catch (error) {
        console.error('Error purchasing course:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
 
 
 
const razorpay = new Razorpay({
    key_id: 'rzp_test_x3lel82AZIsRl6', 
    key_secret: 'IAdwmjeqwMbXm9LEJD90JtAk' 
});
 
// Create a route to create an order
router.post('/create-order', async (req, res) => {
    console.log('Create order request received:', req.body);
    const { amount } = req.body;
 
    // Additional logging
    console.log('Amount:', amount);
 
    const options = {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `receipt_${new Date().getTime()}`,
    };
 
    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error); // Log the error
        res.status(500).send('Server error');
    }
});
 
module.exports = router;
 