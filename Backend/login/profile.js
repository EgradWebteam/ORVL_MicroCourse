const express = require("express");
const router = express.Router();
const db = require("../database/database");
router.get('/user-profile/:userId', async (req, res) => {
    const userId = req.params.userId; // Get userId from URL parameters

    try {
        // SQL query to fetch user profile data
        const query = `
            SELECT 
                r.Candidate_Name, 
                r.Email_Id, 
                r.Contact_Number, 
                r.Candidate_Photo
            FROM 
                registration_details r
            JOIN 
                login_details l 
            ON 
                r.student_registration_Id = l.student_registration_Id
            WHERE 
                l.user_Id = ?;
        `;

        // Execute the query with userId
        const [rows] = await db.query(query, [userId]);

        if (rows.length > 0) {
            const userProfile = rows[0];
            // If the user has a profile picture, encode it in base64
            if (userProfile.Candidate_Photo) {
                userProfile.Candidate_Photo = Buffer.from(userProfile.Candidate_Photo).toString('base64');
            }
            res.json(userProfile);
        } else {
            res.status(404).json({ message: 'User profile not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;