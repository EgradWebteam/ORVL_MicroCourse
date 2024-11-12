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
const uploadDir = path.join(__dirname, 'uploads');
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
      cb(null, uploadDir); // Make sure this directory exists
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
  });
  
  const upload = multer({ storage: storage });




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
// app.post("/ORVL_uploadDocument", upload.single("document"), async (req, res) => {
//     const {
//       LN, LVL, EN, EQ, EANS, EVSOL, EQSID, ESOL, a, b, c, d, courseId
//     } = req.body;
  
//     const filePath = path.join(uploadDir, req.file.filename);
//     const outputDir = path.join(uploadDir, path.parse(req.file.originalname).name);
//     const docName = req.file.originalname;
  
//     try {
//       await fsPromises.mkdir(outputDir, { recursive: true });
  
//       // Convert DOCX to HTML and raw text
//       const result = await mammoth.convertToHtml({ path: filePath });
//       const htmlContent = result.value;
//       const textResult = await mammoth.extractRawText({ path: filePath });
//       const textContent = textResult.value;
//       const textSections = textContent.split("\n\n");
  
//       // Insert document record in DB
//       const [documentResult] = await db.query("INSERT INTO ovl_documents SET ?", {
//         OVLDocumentName: docName,
//         courseCreationId: courseId,
//       });
//       const document_Id = documentResult.insertId;
  
//       // Extract images from HTML
//       const images = [];
//       const $ = cheerio.load(htmlContent);
//       $("img").each(function (i, element) {
//         const base64Data = $(this).attr("src").replace(/^data:image\/\w+;base64,/, "");
//         if (base64Data) {
//           const imageBuffer = Buffer.from(base64Data, "base64");
//           images.push(imageBuffer);
//         }
//       });
  
//       // Insert various records based on provided fields
//       let ovlLectureNameId = 0;
//       let exerciseNameId = 0;
//       let exerciseQuestionsId = 0;
//       let image_index = 0;
//       let k = 1;
  
//       // Check for the provided fields and insert records
//       if (LN) {
//         const LectureName = {
//           LectureName: LN.trim(),
//           courseCreationId: courseId,
//         };
//         ovlLectureNameId = await insertRecord("ovl_lecturename", LectureName);
//       }
  
//       if (LVL) {
//         const LectureVideoLink = {
//           LectureVideoLink: LVL.trim(),
//           ovlLectureNameId: ovlLectureNameId,
//         };
//         await insertRecord("ovl_lecturevideolink", LectureVideoLink);
//       }
  
//       if (EN) {
//         const exerciseName = {
//           exerciseName: EN.trim(),
//           ovlLectureNameId: ovlLectureNameId,
//         };
//         exerciseNameId = await insertRecord("ovl_exercisename", exerciseName);
//       }
  
//       if (EQ) {
//         if (image_index < images.length) {
//           const imageName = `snapshot_${document_Id}_question_${k}.png`;
//           const imagePath = path.join(outputDir, imageName);
  
//           await fsPromises.writeFile(imagePath, images[image_index]);
//           image_index++;
//           k++;
  
//           const questionRecord = {
//             exerciseQuetionsImg: imageName,
//             exerciseNameId: exerciseNameId,
//           };
//           exerciseQuestionsId = await insertRecord("ovl_exercisequetions", questionRecord);
//         }
//       }
  
//       if (EANS) {
//         const answerContent = EANS.trim();
//         const [answer, unit] = answerContent.split(",").map(item => item.trim());
  
//         const exerciseAnswer = {
//           exerciseAnswer: answer || '',
//           exerciseAnswerUnit: unit || '',
//           exerciseQuetionsId: exerciseQuestionsId,
//         };
//         await insertRecord("ovl_exerciseanswer", exerciseAnswer);
//       }
  
//       if (EVSOL) {
//         const Exercisesolution = {
//           exerciseSolutionLink: EVSOL.trim(),
//           exerciseQuetionsId: exerciseQuestionsId,
//         };
//         await insertRecord("ovl_exercisesolution", Exercisesolution);
//       }
  
//       if (ESOL) {
//         const ExerciseImageSolution = {
//           exerciseSolutionImageName: ESOL.trim(),
//           exerciseQuetionsId: exerciseQuestionsId,
//         };
//         await insertRecord("ovl_exercise_image_solution", ExerciseImageSolution);
//       }
  
//       if (EQSID) {
//         const ovlSortid = {
//           ovlSortidNo: EQSID.trim(),
//           exerciseQuetionsId: exerciseQuestionsId,
//         };
//         await insertRecord("ovl_sortid", ovlSortid);
//       }
  
//       // Handle options a, b, c, d
//       const options = [
//         { text: a, index: 0 },
//         { text: b, index: 1 },
//         { text: c, index: 2 },
//         { text: d, index: 3 },
//       ];
  
//       for (const option of options) {
//         if (option.text) {
//           const exerciseOption = {
//             excerciseOptionImg_Name: option.text.trim(), // Store the option text
//             excerciseOptionImg_Index: option.index, // Store the index
//             exerciseQuestion_Id: exerciseQuestionsId, // Associate with the question ID
//           };
//           await insertRecord("exercise_options", exerciseOption);
//         }
//       }
  
//       res.send("Text content and images extracted and saved to the database successfully.");
//     } catch (error) {
//       console.error("Error during content extraction or database insertion:", error);
//       res.status(500).send("Error extracting content and saving it to the database.");
//     }
//   });



app.post("/ORVL_uploadDocument", upload.single("document"), async (req, res) => {
  const { examId, courseId } = req.body;
  const filePath = path.join(uploadDir, req.file.filename);
  const outputDir = path.join(uploadDir, path.parse(req.file.originalname).name);
  const docName = req.file.originalname;

  try {
      await fsPromises.mkdir(outputDir, { recursive: true });

      // Convert DOCX to HTML and raw text
      const result = await mammoth.convertToHtml({ path: filePath });
      const textResult = await mammoth.extractRawText({ path: filePath });
      const textContent = textResult.value;
      const htmlContent = result.value;

      // Extract values using regex
      const LN = [...textContent.matchAll(/^\[LN\](.*)$/gm)].map(match => match[1].trim());
      const LVL = [...textContent.matchAll(/^\[LVL\](.*)$/gm)].map(match => match[1].trim());
      const EN = [...textContent.matchAll(/^\[EN\](.*)$/gm)].map(match => match[1].trim());
      const EANS = [...textContent.matchAll(/^\[EANS\](.*)$/gm)].map(match => match[1].trim());
      const ESOL = [...textContent.matchAll(/^\[ESOL\](.*)$/gm)].map(match => match[1].trim());
      const EISOL = [...textContent.matchAll(/^\[EISOL\](.*)$/gm)].map(match => match[1].trim());
      const EQSID = [...textContent.matchAll(/^\[EQSID\](.*)$/gm)].map(match => match[1].trim());
      const options = ['a', 'b', 'c', 'd'].map(opt => 
          [...textContent.matchAll(new RegExp(`^\\[${opt.toUpperCase()}\\](.*)$`, 'gm'))]
          .map(match => match[1].trim())
      );

      // Insert document record into DB
      const [documentResult] = await db.query("INSERT INTO `exercise_test_document` SET ?", {
          exercise_test_document_name: docName,
          courseCreationId: courseId,
      });
      const document_Id = documentResult.insertId;
      console.log("Inserted Document ID:", document_Id);

      // Process images
      const images = [];
      const $ = cheerio.load(htmlContent);
      $("img").each(function (i, element) {
          const base64Data = $(this).attr("src").replace(/^data:image\/\w+;base64,/, "");
          if (base64Data) {
              const imageBuffer = Buffer.from(base64Data, "base64");
              images.push(imageBuffer);
          }
      });

      // Combine LN and LVL for insertion
      const combinedLectureData = [];
      for (let i = 0; i < Math.max(LN.length, LVL.length); i++) {
          combinedLectureData.push({
              unit_lecture_name: LN[i] || null,
              unit_lecture_video_link: LVL[i] || null,
              exercise_test_document_Id: document_Id,
              courseCreationId: courseId,
          });
      }

      // Insert all lectures at once
      const insertPromises = combinedLectureData.map(data => insertRecord("unit_name", data));
      const insertedLectureIds = await Promise.all(insertPromises);
      console.log("Inserted Lecture Name and Video Link IDs:", insertedLectureIds);

      // Insert exercises and questions
      let image_index = 0;
      let k=0;
    // Assuming you've already set up necessary variables: image_index, k, images, etc.
for (let i = 0; i < EN.length; i++) {
  const exercise = EN[i];
  const exerciseName = {
      unit_exercise_name: exercise,
      unit_Id: insertedLectureIds[i] || null, // Link to the corresponding lecture
  };

  const exerciseNameId = await insertRecord("unit_exercise", exerciseName);
  console.log("Inserted Exercise Name ID:", exerciseNameId);

  while (k < EANS.length) {
      // Prepare question data
      const questionData = {
          unit_exercise_Id: exerciseNameId,
          exercise_test_document_Id: document_Id,
      };

      // Handle image assignment if available
      if (image_index < images.length) {
          const imageName = `snapshot_${document_Id}_question_${k}.png`;
          const imagePath = path.join(outputDir, imageName);
          await fsPromises.writeFile(imagePath, images[image_index]);
          questionData.question_Image_Name = imageName; // Assign image name to question data
          image_index++; // Move to the next image
      }

      const questionId = await insertRecord("excercise_questions", questionData);
      console.log("Inserted Question ID:", questionId);

      // Insert answers for the question
      const answerParts = EANS[k].split(",").map(part => part.trim());
      const answerData = {
          excercise_answer_text: answerParts[0],
          excercise_answer_unit: answerParts[1] || null,
          excercise_question_Id: questionId,
      };
      const answerId = await insertRecord("excercise_answers", answerData);
      console.log("Inserted Answer ID:", answerId);

      // Insert video solutions for the question
      const videolink = ESOL[k] ? ESOL[k].split(",") : [];
      const solutionData = {
          excercise_solution_link: videolink,
          excercise_question_Id: questionId,
      };
      const solutionId = await insertRecord("excercise_video_solution", solutionData);
      console.log("Inserted Solution ID:", solutionId);

      // Insert sort IDs for the question
      const sortids = EQSID[k] ? EQSID[k].split(",") : [];
      const sortData = {
          eq_sort_text: sortids,
          excercise_question_Id: questionId,
      };
      const sortIdResult = await insertRecord("excercise_question_sortids", sortData);
      console.log("Inserted Sort ID:", sortIdResult);

      k++; // Move to the next question
      if (k >= EANS.length) break; // Exit if no more questions
  }
}


      res.send("Document uploaded and data saved successfully.");
  } catch (error) {
      console.error("Error during content extraction or database insertion:", error);
      res.status(500).send("Error extracting content and saving it to the database.");
  }
});

// app.get('/courses_main', async (req, res) => {
//   const userId = req.query.userId; // Get userId from query parameters
//   try {
//       const [rows] = await db.query(`
//           SELECT
//               c.courseCreationId,    
//               c.courseName,
//               c.courseStartDate,
//               c.courseEndDate,
//               c.cost,
//               c.totalPrice,
//               c.Discount,
//               c.totalPrice,
//               c.cardImage,
//               e.exam_name,
//                u.unit_id,
              
//               COUNT(DISTINCT u.unit_id) AS video_count
//           FROM
//                micro_course_creation_table c
//           JOIN
//               exam_creation_table e ON c.exam_creation_Id = e.exam_creation_Id
//           JOIN 
//               unit_name u on u.courseCreationId = c.courseCreationId
          

//           LEFT JOIN
//               student_buy_courses b ON b.courseCreationId = c.courseCreationId AND b.user_Id = ?
//           WHERE
//               b.courseCreationId IS NULL
//           GROUP BY
//               c.courseCreationId;
//       `, [userId]);

//       if (rows.length > 0) {
//           const coursesWithImages = rows.map(course => {
//               if (course.cardImage) {
//                   course.cardImage = Buffer.from(course.cardImage).toString('base64');
//               }
//               return course;
//           });

//           res.json(coursesWithImages);
//       } else {
//           res.status(404).json({ message: 'No courses found' });
//       }
     
//   } catch (error) {
//       console.error('Error fetching course details:', error);
//       res.status(500).send('Internal Server Error');
//   }
// });

const Payment = require('./Payments/Payment');
app.use('/Payment', Payment);
const Microcourses = require('./microcourses/microcourses');
app.use('/microcourses', Microcourses);
const finalTest = require('./microcourses/finalTest');
app.use('/finalTest', finalTest);


// Helper function to insert records
async function insertRecord(tableName, record) {
  const [result] = await db.query(`INSERT INTO \`${tableName}\` SET ?`, record);
  return result.insertId;
}
  
  
  
  


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
