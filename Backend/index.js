const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Create a database connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "orvl",
});

// Check connection
async function checkDbConnection() {
  try {
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}
// Call the check function
checkDbConnection();

// Route to get exam names
app.get("/examNames", async (req, res) => {
  try {
    // Fetch exams from the database
    const [rows] = await db.query(
      `SELECT exam_creation_Id,exam_name FROM exam_creation_table`
    );

    // Check if rows are empty and respond accordingly
    if (rows.length === 0) {
      return res.status(404).json({ message: "No exams found" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// Route to get micro course names based on exam ID
app.get("/MicroCourseNames/:examId", async (req, res) => {
    const { examId } = req.params;
    try {
      // Fetch micro courses from the database
      const [rows] = await db.query(
        `SELECT cct.courseCreationId,cct.courseName,ect.exam_creation_Id FROM micro_course_creation_table cct JOIN exam_creation_table ect ON cct.exam_creation_Id = ect.exam_creation_Id WHERE ect.exam_creation_Id = ?`,  // Corrected this line
        [examId]  // Added a comma here
      );
  
      // Check if rows are empty and respond accordingly
      if (rows.length === 0) {
        return res.status(404).json({ message: "No courses found for the given exam ID" });
      }
  
      res.json(rows);
    } catch (error) {
      console.error("Error executing MySQL query:", error);
      res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
  });
  


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
