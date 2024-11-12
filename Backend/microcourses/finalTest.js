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
            WHERE user_Id = ? AND courseCreationId = ?
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

router.get('/inmy_final_tests/:userId/:courseCreationId/:micro_course_final_test_Id', async (req, res) => { 
    const { userId, courseCreationId, micro_course_final_test_Id } = req.params;
  
    try {
      // Query to get the final tests for the courses the user has purchased
      const [rows] = await db.query(`
        SELECT
          f.micro_couse_final_test_Id,
          f.final_test_name,
          f.courseCreationId,
          f.Duration,
          f.TotalQuestions,
          f.TotalMarks,
          f.status,
          c.courseName
        FROM
          micro_couse_final_test f
        JOIN
          micro_course_creation_table c ON f.courseCreationId = c.courseCreationId
        JOIN
          student_buy_courses b ON b.courseCreationId = c.courseCreationId
        WHERE
          b.user_id = ? 
          AND f.status = 'active'  
          AND f.courseCreationId = ? 
          AND f.micro_couse_final_test_Id = ?
      `, [userId, courseCreationId, micro_course_final_test_Id]);
  
      // If no final tests are found
      if (rows.length > 0) {
        res.json(rows); // Return the final tests for the purchased courses
      } else {
        res.status(404).json({ message: 'No final tests found for purchased courses.' });
      }
  
    } catch (error) {
      console.error('Error fetching final tests for purchased courses:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  router.get('/finalexampattern/:userId/:courseCreationId', checkCoursePurchased, async (req, res) => {
    const { userId, courseCreationId } = req.params;

    try {
        // Fetch course name
        const [courseRows] = await db.query(`
            SELECT
            f.micro_couse_final_test_Id,
            f.final_test_name,
            f.courseCreationId,
            f.Duration,
            f.TotalQuestions,
            f.TotalMarks,
            f.status,
            c.courseName
          FROM
            micro_couse_final_test f
          JOIN
            micro_course_creation_table c ON f.courseCreationId = c.courseCreationId
          JOIN
            student_buy_courses b ON b.courseCreationId = c.courseCreationId
          WHERE
            b.user_id = ? 
            AND f.status = 'active'  
            AND f.courseCreationId = ? 
           
        `, [userId, courseCreationId]);
    

        if (courseRows.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }

   

      
   
    
        // Return the complete response
        res.json(courseRows);
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/FinalTestquestionPage/:userId/:courseCreationId/:micro_course_final_test_Id', checkCoursePurchased, async (req, res) => {
    const { userId, courseCreationId, micro_course_final_test_Id } = req.params;

    try {
        // Fetch course name
        const [courseRows] = await db.query(`
            SELECT
            f.micro_couse_final_test_Id,
            f.final_test_name,
            f.courseCreationId,
            f.Duration,
            f.TotalQuestions,
            f.TotalMarks,
            f.status,
            c.courseName,
            r.Candidate_Name
          FROM
            micro_couse_final_test f
          JOIN
            micro_course_creation_table c ON f.courseCreationId = c.courseCreationId
          JOIN
            student_buy_courses b ON b.courseCreationId = c.courseCreationId
        JOIN
             login_details l ON l.user_Id  = b.user_Id
        JOIN
             registration_details r ON r.student_registration_Id = l.student_registration_Id
          WHERE
            b.user_id = ? 
            AND f.status = 'active'  
            AND f.courseCreationId = ? 
            AND f.micro_couse_final_test_Id = ?
        `, [userId, courseCreationId, micro_course_final_test_Id]);
    

        if (courseRows.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const courseName = courseRows[0].courseName;
        const ExamName = courseRows[0].final_test_name;
        const Candidate_Name = courseRows[0].Candidate_Name;
        const FinalExam = courseRows[0];


        const Examdetails = await Promise.all(courseRows.map(async test => {
       
            // Fetch exercise question details for each video
            const [FinalQuestions] = await db.query(
                `SELECT 
                    finalTest_question_Id, 
                    final_test_questionImg, 
                    finaltest_questiontype
                FROM final_test_questions fq 
                WHERE fq.micro_couse_final_test_Id = ?;`, 
                [FinalExam.micro_couse_final_test_Id]
            );

            // Process exercise questions to include options
            const processedQuestions = await Promise.all(FinalQuestions.map(async question => {
                let options = [];
                if (question.finaltest_questiontype === 'MCQ' || question.finaltest_questiontype === 'MSQ') {
                    const [optionsRows] = await db.query(
                        `SELECT finalTest_option_Id,finalTest_optionImg_Name,finalTest_optionImg_Index
                         FROM final_test_options
                         WHERE finalTest_question_Id= ?`, 
                         [question.finalTest_question_Id]
                    );
                    options = optionsRows.map(option => ({
                        id: option.finalTest_option_Id ,
                        img: Buffer.from(option.finalTest_optionImg_Name).toString('base64'), // Assuming the image is stored as BLOB
                        index: option.finalTest_optionImg_Index
                    }));
                }
                if (question.final_test_questionImg) {
                    question.final_test_questionImg = Buffer.from(question.final_test_questionImg).toString('base64');
                }
                return {
                    ...question,
                    options // Add options to the question
                };
            }));

            return {
               
                finalQuestions: processedQuestions // Include the fetched and processed exercise questions

            };
   
        }));
        // Return the complete response
        res.json({ courseName,Candidate_Name,micro_course_final_test_Id, ExamName, test: Examdetails});
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// router.post('/submitAnswers', async (req, res) => {
//     const { userId, courseCreationId, micro_course_final_test_Id, answers } = req.body;

//     try {
//         // Ensure all required parameters are provided
//         if (!userId || !courseCreationId || !micro_course_final_test_Id || !answers) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }

//         // Example: Save answers to the database
//         // Assuming you have a table `final_test_answers` to store the answers

//         const answerPromises = Object.keys(answers).map(async (questionId) => {
//             const answer = answers[questionId];

//             // Check the answer type and save accordingly (MCQ, MSQ, or NAT)
//             if (Array.isArray(answer)) { // MSQ type (multiple answers selected)
//                 const optionPromises = answer.map(async (optionId) => {
//                     const formattedUserAnswer = answers.join(','); 
//                     return db.query(
//                         'INSERT INTO final_test_answers (userId, courseCreationId, micro_course_final_test_Id, questionId, answer) VALUES (?, ?, ?, ?, ?)',
//                         [userId, courseCreationId, micro_course_final_test_Id, questionId, formattedUserAnswer]
//                     );
//                 });
//                 await Promise.all(optionPromises);
//             } else { // MCQ or NAT
//                 await db.query(
//                     'INSERT INTO final_test_answers (userId, courseCreationId, micro_course_final_test_Id, questionId, answer) VALUES (?, ?, ?, ?, ?)',
//                     [userId, courseCreationId, micro_course_final_test_Id, questionId, answer]
//                 );
//             }
//         });

//         // Wait for all answers to be saved
//         await Promise.all(answerPromises);

//         res.status(200).json({ message: 'Answers submitted successfully' });
//     } catch (error) {
//         console.error('Error submitting answers:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
router.post('/submitAnswers', async (req, res) => {
    const { userId, courseCreationId, micro_course_final_test_Id, answers } = req.body;

    try {
        // Ensure all required parameters are provided
        if (!userId || !courseCreationId || !micro_course_final_test_Id || !answers) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Save the answers to the database
        const answerPromises = Object.keys(answers).map(async (questionId) => {
            const answer = answers[questionId];

            // Check the answer type and save accordingly (MCQ, MSQ, or NAT)
            if (Array.isArray(answer)) {  // MSQ type (multiple answers selected)
                const formattedUserAnswer = answer.join(','); // Join selected options for MSQ
                return db.query(
                    'INSERT INTO final_test_user_responses (user_Id, courseCreationId, micro_couse_final_test_Id, finalTest_question_Id, finalTest_userResponse_text) VALUES (?, ?, ?, ?, ?)',
                    [userId, courseCreationId, micro_course_final_test_Id, questionId, formattedUserAnswer]
                );
            } else {  // MCQ or NAT
                return db.query(
                    'INSERT INTO final_test_user_responses (user_Id, courseCreationId, micro_couse_final_test_Id, finalTest_question_Id, finalTest_userResponse_text) VALUES (?, ?, ?, ?, ?)',
                    [userId, courseCreationId, micro_course_final_test_Id, questionId, answer]
                );
            }
        });

        // Wait for all answers to be saved
        await Promise.all(answerPromises);

        res.status(200).json({ message: 'Answers submitted successfully' });
    } catch (error) {
        console.error('Error submitting answers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// router.get('/RS/:userId/:courseCreationId/:micro_course_final_test_Id', async (req, res) => {
//     const { userId, courseCreationId, micro_course_final_test_Id} = req.params;

//     try {
//         // Fetch the user's responses for the final test (updated column)
//         const [userResponses] = await db.query(`
//             SELECT finalTest_question_Id, finalTest_userResponse_text 
//             FROM final_test_user_responses 
//             WHERE user_Id = ? 
//               AND courseCreationId = ? 
//               AND micro_couse_final_test_Id = ?  -- updated column name
//         `, [userId, courseCreationId, micro_course_final_test_Id]);

//         // If no responses are found for the user
//         if (userResponses.length === 0) {
//             return res.status(404).json({ message: 'No responses found for this test.' });
//         }

//         // Fetch the questions for the final test (updated column)
//         const [finalQuestions] = await db.query(`SELECT 
//                     finalTest_question_Id, 
//                     final_test_questionImg, 
//                     finaltest_questiontype
//                 FROM final_test_questions fq 
//                 WHERE fq.micro_couse_final_test_Id = ?;`, [micro_course_final_test_Id]);

//         if (finalQuestions.length === 0) {
//             return res.status(404).json({ message: 'No questions found for this test.' });
//         }

//         const questionIds = finalQuestions.map(q => q.finalTest_question_Id);

//         // Fetch the correct answers for all the questions in this final test
//         const [correctAnswers] = await db.query(`
//             SELECT finalTest_question_Id, final_test_answer_text
//             FROM final_test_answers 
//             WHERE finalTest_question_Id IN (?)
//         `, [questionIds]);

//         // Map the correct answers for easier lookup
//         const correctAnswerMap = correctAnswers.reduce((acc, answer) => {
//             acc[answer.finalTest_question_Id] = answer.final_test_answer_text;
//             return acc;
//         }, {});

//         // Calculate the score by comparing user responses with correct answers
//         let score = 0;
//         userResponses.forEach(response => {
//             const correctAnswer = correctAnswerMap[response.finalTest_question_Id];

//             // Only proceed if the correct answer exists
//             if (correctAnswer) {
//                 // Handle Multiple Selection Questions (MSQ) by sorting the responses
//                 const userAnswer = response.finalTest_userResponse_text.split(',').sort().join(',');
//                 if (userAnswer === correctAnswer) {
//                     score += 1;
//                 }
//             }
//         });

//         res.json({ message: 'Score retrieved successfully', score });

//     } catch (error) {
//         console.error('Error calculating score:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

router.get('/Results/:userId/:courseCreationId/:micro_course_final_test_Id', async (req, res) => {
    const { userId, courseCreationId, micro_course_final_test_Id } = req.params;

    try {
        // Fetch the user's responses for the final test
        const [userResponses] = await db.query(`
            SELECT finalTest_question_Id, finalTest_userResponse_text
            FROM final_test_user_responses
            WHERE user_Id = ? 
              AND courseCreationId = ? 
              AND micro_couse_final_test_Id = ?
        `, [userId, courseCreationId, micro_course_final_test_Id]);

        if (userResponses.length === 0) {
            return res.status(404).json({ message: 'No responses found for this test.' });
        }
        const answeredQuestionsCount = userResponses.filter(response => response.finalTest_userResponse_text.trim() !== '').length;
        // Fetch the questions for the final test
        const [finalQuestions] = await db.query(`
            SELECT finalTest_question_Id, final_test_questionImg, finaltest_questiontype
            FROM final_test_questions
            WHERE micro_couse_final_test_Id = ?
        `, [micro_course_final_test_Id]);

        if (finalQuestions.length === 0) {
            return res.status(404).json({ message: 'No questions found for this test.' });
        }

        const questionIds = finalQuestions.map(q => q.finalTest_question_Id);

        // Fetch the correct answers for all the questions
        const [correctAnswers] = await db.query(`
            SELECT finalTest_question_Id, final_test_answer_text
            FROM final_test_answers
            WHERE finalTest_question_Id IN (?)
        `, [questionIds]);

        const correctAnswerMap = correctAnswers.reduce((acc, answer) => {
            acc[answer.finalTest_question_Id] = answer.final_test_answer_text;
            return acc;
        }, {});

        // Fetch video and image solutions
        const [videoSolutions] = await db.query(`
            SELECT finalTest_question_Id, finalTest_VideoSolution_Img
            FROM final_test_video_solution
            WHERE finalTest_question_Id IN (?)
        `, [questionIds]);

        const [imageSolutions] = await db.query(`
            SELECT finalTest_question_Id, finalTest_ImageSolution_Name
            FROM final_test_image_solutions
            WHERE finalTest_question_Id IN (?)
        `, [questionIds]);

        // Create a map for video and image solutions
        const videoSolutionMap = videoSolutions.reduce((acc, solution) => {
            acc[solution.finalTest_question_Id] = solution.finalTest_VideoSolution_Img;
            return acc;
        }, {});

        const imageSolutionMap = imageSolutions.reduce((acc, solution) => {
            acc[solution.finalTest_question_Id] = Buffer.from(solution.finalTest_ImageSolution_Name).toString('base64');
            return acc;
        }, {});

        // Process questions to include options, user responses, and solutions
        const processedQuestions = await Promise.all(finalQuestions.map(async (question) => {
            const correctAnswer = correctAnswerMap[question.finalTest_question_Id];
            const userResponse = userResponses.find(r => r.finalTest_question_Id === question.finalTest_question_Id)?.finalTest_userResponse_text || '';
            const videoSolution = videoSolutionMap[question.finalTest_question_Id] || null;
            const imageSolution = imageSolutionMap[question.finalTest_question_Id] || null;
            const userAnswer = userResponse.split(',').sort().join(',');

            const result = (correctAnswer === userAnswer) ? 'correct' : 'wrong';
            // Handle options if MCQ or MSQ
            let options = [];
            if (question.finaltest_questiontype === 'MCQ' || question.finaltest_questiontype === 'MSQ') {
                const [optionsRows] = await db.query(`
                    SELECT finalTest_option_Id, finalTest_optionImg_Name, finalTest_optionImg_Index
                    FROM final_test_options
                    WHERE finalTest_question_Id= ?
                `, [question.finalTest_question_Id]);

                options = optionsRows.map(option => ({
                    id: option.finalTest_option_Id ,
                    img: Buffer.from(option.finalTest_optionImg_Name).toString('base64'),
                    index: option.finalTest_optionImg_Index
                }));
            }

            if (question.final_test_questionImg) {
                question.final_test_questionImg = Buffer.from(question.final_test_questionImg).toString('base64');
            }

            return {
                ...question,
                correctAnswer,
                result,
                userResponse,
                videoSolution,
                imageSolution,
                options
            };
        }));

        // Return the complete response with processed questions
        res.json({
            message: 'Final test data retrieved successfully',
            score: calculateScore(userResponses, correctAnswerMap),  // Calculate the score here
            
            totalQuestions: finalQuestions.length,       // Total number of questions
            answeredQuestions: userResponses.length,
            questions: processedQuestions
        });

    } catch (error) {
        console.error('Error fetching final test data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Helper function to calculate score
function calculateScore(userResponses, correctAnswerMap) {
    let score = 0;

    userResponses.forEach(response => {
        const correctAnswer = correctAnswerMap[response.finalTest_question_Id];

        // Only proceed if the correct answer exists
        if (correctAnswer) {
            // Handle Multiple Selection Questions (MSQ) by sorting the responses
            const userAnswer = response.finalTest_userResponse_text.split(',').sort().join(',');

            // Compare the user answer with the correct answer
            if (userAnswer === correctAnswer) {
                score += 1;
            }
        }
    });

    return score;
}


module.exports = router;
 
