const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fsPromises = require("fs").promises;
const mammoth = require("mammoth");
const cheerio = require("cheerio");

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


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "uploads")); // Make sure this directory exists
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
  });
  
  const upload = multer({ storage: storage });

// Helper function to insert records
async function insertRecord(table, data) {
  const [result] = await db.query(`INSERT INTO ${table} SET ?`, data);
  return result.insertId; // Return the inserted ID
}


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
  
// Upload route
app.post("/videouploaddoc", upload.single("document"), async (req, res) => {
    const {
      LN, LVL, EN, EQ, EANS, EVSOL, EQSID, ESOL, a, b, c, d, courseId
    } = req.body;
  
    const filePath = path.join(uploadDir, req.file.filename);
    const outputDir = path.join(uploadDir, path.parse(req.file.originalname).name);
    const docName = req.file.originalname;
  
    try {
      await fsPromises.mkdir(outputDir, { recursive: true });
  
      // Convert DOCX to HTML and raw text
      const result = await mammoth.convertToHtml({ path: filePath });
      const htmlContent = result.value;
      const textResult = await mammoth.extractRawText({ path: filePath });
      const textContent = textResult.value;
      const textSections = textContent.split("\n\n");
  
      // Insert document record in DB
      const [documentResult] = await db.query("INSERT INTO ovl_documents SET ?", {
        OVLDocumentName: docName,
        courseCreationId: courseId,
      });
      const document_Id = documentResult.insertId;
  
      // Extract images from HTML
      const images = [];
      const $ = cheerio.load(htmlContent);
      $("img").each(function (i, element) {
        const base64Data = $(this).attr("src").replace(/^data:image\/\w+;base64,/, "");
        if (base64Data) {
          const imageBuffer = Buffer.from(base64Data, "base64");
          images.push(imageBuffer);
        }
      });
  
      // Insert various records based on provided fields
      let ovlLectureNameId = 0;
      let exerciseNameId = 0;
      let exerciseQuestionsId = 0;
      let image_index = 0;
      let k = 1;
  
      // Check for the provided fields and insert records
      if (LN) {
        const LectureName = {
          LectureName: LN.trim(),
          courseCreationId: courseId,
        };
        ovlLectureNameId = await insertRecord("ovl_lecturename", LectureName);
      }
  
      if (LVL) {
        const LectureVideoLink = {
          LectureVideoLink: LVL.trim(),
          ovlLectureNameId: ovlLectureNameId,
        };
        await insertRecord("ovl_lecturevideolink", LectureVideoLink);
      }
  
      if (EN) {
        const exerciseName = {
          exerciseName: EN.trim(),
          ovlLectureNameId: ovlLectureNameId,
        };
        exerciseNameId = await insertRecord("ovl_exercisename", exerciseName);
      }
  
      if (EQ) {
        if (image_index < images.length) {
          const imageName = `snapshot_${document_Id}_question_${k}.png`;
          const imagePath = path.join(outputDir, imageName);
  
          await fsPromises.writeFile(imagePath, images[image_index]);
          image_index++;
          k++;
  
          const questionRecord = {
            exerciseQuetionsImg: imageName,
            exerciseNameId: exerciseNameId,
          };
          exerciseQuestionsId = await insertRecord("ovl_exercisequetions", questionRecord);
        }
      }
  
      if (EANS) {
        const answerContent = EANS.trim();
        const [answer, unit] = answerContent.split(",").map(item => item.trim());
  
        const exerciseAnswer = {
          exerciseAnswer: answer || '',
          exerciseAnswerUnit: unit || '',
          exerciseQuetionsId: exerciseQuestionsId,
        };
        await insertRecord("ovl_exerciseanswer", exerciseAnswer);
      }
  
      if (EVSOL) {
        const Exercisesolution = {
          exerciseSolutionLink: EVSOL.trim(),
          exerciseQuetionsId: exerciseQuestionsId,
        };
        await insertRecord("ovl_exercisesolution", Exercisesolution);
      }
  
      if (ESOL) {
        const ExerciseImageSolution = {
          exerciseSolutionImageName: ESOL.trim(),
          exerciseQuetionsId: exerciseQuestionsId,
        };
        await insertRecord("ovl_exercise_image_solution", ExerciseImageSolution);
      }
  
      if (EQSID) {
        const ovlSortid = {
          ovlSortidNo: EQSID.trim(),
          exerciseQuetionsId: exerciseQuestionsId,
        };
        await insertRecord("ovl_sortid", ovlSortid);
      }
  
      // Handle options a, b, c, d
      const options = [
        { text: a, index: 0 },
        { text: b, index: 1 },
        { text: c, index: 2 },
        { text: d, index: 3 },
      ];
  
      for (const option of options) {
        if (option.text) {
          const exerciseOption = {
            excerciseOptionImg_Name: option.text.trim(), // Store the option text
            excerciseOptionImg_Index: option.index, // Store the index
            exerciseQuestion_Id: exerciseQuestionsId, // Associate with the question ID
          };
          await insertRecord("exercise_options", exerciseOption);
        }
      }
  
      res.send("Text content and images extracted and saved to the database successfully.");
    } catch (error) {
      console.error("Error during content extraction or database insertion:", error);
      res.status(500).send("Error extracting content and saving it to the database.");
    }
  });
  
  
  
  
  


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
