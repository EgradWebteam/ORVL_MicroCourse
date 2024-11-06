const express = require("express");
const router = express.Router();
const db = require("../database/database");
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
router.get('/courses_main', async (req, res) => {
    const userId = req.query.userId; // Get userId from query parameters
    try {
        const [rows] = await db.query(`
            SELECT
                c.courseCreationId,    
                c.courseName,
                c.courseStartDate,
                c.courseEndDate,
                c.cost,
                c.totalPrice,
                c.Discount,
                c.totalPrice,
                c.cardImage,
                e.exam_name,
                 u.unit_id,
                
                COUNT(DISTINCT u.unit_id) AS video_count
            FROM
                 micro_course_creation_table c
            JOIN
                exam_creation_table e ON c.exam_creation_Id = e.exam_creation_Id
            JOIN 
                unit_name u on u.courseCreationId = c.courseCreationId
            
  
            LEFT JOIN
                student_buy_courses b ON b.courseCreationId = c.courseCreationId AND b.user_Id = ?
            WHERE
                b.courseCreationId IS NULL
            GROUP BY
                c.courseCreationId;
        `, [userId]);
  
        if (rows.length > 0) {
            const coursesWithImages = rows.map(course => {
                if (course.cardImage) {
                    course.cardImage = Buffer.from(course.cardImage).toString('base64');
                }
                return course;
            });
  
            res.json(coursesWithImages);
        } else {
            res.status(404).json({ message: 'No courses found' });
        }
       
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).send('Internal Server Error');
    }
  });
router.get('/my_courses/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const [rows] = await db.query(`
          SELECT
                c.courseCreationId,    
                c.courseName,
                c.courseStartDate,
                c.courseEndDate,
                c.cost,
                c.totalPrice,
                c.Discount,
                c.totalPrice,
                c.cardImage,
                e.exam_name,
                 u.unit_id,
                
                COUNT(DISTINCT u.unit_id) AS video_count
            FROM
                 micro_course_creation_table c
            JOIN
                exam_creation_table e ON c.exam_creation_Id = e.exam_creation_Id
            JOIN 
                unit_name u on u.courseCreationId = c.courseCreationId
            JOIN
                student_buy_courses b ON b.courseCreationId = c.courseCreationId
          
            WHERE
                b.user_id = ?
            GROUP BY
                c.courseCreationId;
        `, [userId]);
 
        if (rows.length > 0) {
            const coursesWithImages = rows.map(course => {
                if (course.cardImage) {
                    course.cardImage = Buffer.from(course.cardImage).toString('base64');
                }
                return course;
            });
  
            res.json(coursesWithImages);
        } else {
            res.status(404).json({ message: 'No courses found' });
        }
       
       
    } catch (error) {
        console.error('Error fetching purchased courses:', error);
        res.status(500).send('Internal Server Error');
    }
});
// router.get('/my_courses/course_details/:userId/:courseCreationId', checkCoursePurchased, async (req, res) => {
//     const { userId, courseCreationId } = req.params;

//     try {
//         // Fetch course name
//         const [courseRows] = await db.query(
//             `SELECT courseName, courseCreationId
//             FROM micro_course_creation_table
//             WHERE courseCreationId = ?`, 
//             [courseCreationId]
//         );

//         if (courseRows.length === 0) {
//             return res.status(404).json({ message: 'Course not found' });
//         }

//         const courseName = courseRows[0].courseName;

//         // Fetch videos related to the course
//         const [videos] = await db.query(
//             `SELECT 
//                 l.unit_Id AS lectureId, 
//                 l.unit_lecture_name AS lectureName, 
//                 l.unit_lecture_video_link AS videoLink,
//                 u.unit_exercise_name,
//                 u.unit_exercise_Id
//             FROM unit_name l
//             JOIN micro_course_creation_table c ON c.courseCreationId = l.courseCreationId
//             JOIN unit_exercise u ON u.unit_Id = l.unit_Id
//             WHERE c.courseCreationId = ?;`, 
//             [courseCreationId]
//         );

//         // Prepare the response
//         const videoDetails = await Promise.all(videos.map(async video => {
//             // Fetch exercise question details for each video
//             const [exerciseQuestions] = await db.query(
//                 `SELECT 
//                     eq.excercise_question_Id, 
//                     eq.question_Image_Name 
//                 FROM excercise_questions eq 
//                 WHERE eq.unit_exercise_Id = ?;`, 
//                 [video.unit_exercise_Id]
//             );

//             // Process exercise questions to encode images
//             const processedQuestions = exerciseQuestions.map(question => {
//                 if (question.question_Image_Name) {
//                     question.question_Image_Name = Buffer.from(question.question_Image_Name).toString('base64');
//                 }
//                 return question;
//             });

//             return {
//                 lectureId: video.lectureId,
//                 lectureName: video.lectureName,
//                 videoLink: video.videoLink,
//                 unitExerciseId:video.unit_exercise_Id,
//                 unitExerciseName: video.unit_exercise_name,
//                 exerciseQuestions: processedQuestions // Include the fetched and processed exercise questions
//             };
//         }));

//         // Return the complete response
//         res.json({ courseName, courseCreationId, videos: videoDetails });
//     } catch (error) {
//         console.error('Error fetching course details:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


// router.post('/submitAnswer', async (req, res) => {
    // const { userId, unitExerciseId, exerciseQuestionId, userAnswer } = req.body;

    // // Log the input data
    // console.log({
    //     userId,
    //     unitExerciseId, // Use this directly from req.body
    //     exerciseQuestionId,
    //     userAnswer
    // });

    // // Input validation
    // if (!userId || !unitExerciseId || !exerciseQuestionId || userAnswer === undefined) {
    //     return res.status(400).json({ error: 'All fields are required.' });
    // }
    // if (!userAnswer.trim()) {
    //     return res.status(400).json({ error: 'Please enter an answer.' });
    // }
    
    // try {
    //     // Fetch the correct answer for the question
    //     const [results] = await db.query('SELECT excercise_answer_text FROM excercise_answers WHERE excercise_question_Id = ?', [exerciseQuestionId]);
    //     console.log(results);
    //     if (results.length === 0) {
    //         return res.status(404).json({ error: 'Question not found.' });
    //     }

    //     const correctAnswer = results[0].excercise_answer_text;

    //     // Save the user's response
    //     await db.query('INSERT INTO exercise_user_responses (user_Id, unit_exercise_Id, excercise_question_Id, excercise_user_answer) VALUES (?, ?, ?, ?)', 
    //         [userId, unitExerciseId, exerciseQuestionId, userAnswer]);

    //     // Check if the answer is correct
    //     const isCorrect = userAnswer.trim() === correctAnswer.trim();

    //     // Return the appropriate response
    //     return res.json({
    //         success: true,
    //         correct: isCorrect,
    //         message: isCorrect ? 'Correct answer!' : 'Incorrect answer. Please try again.',
    //         correctAnswer
    //     });
//     } catch (error) {
//         console.error('Error processing answer submission:', error);
//         return res.status(500).json({ error: 'Server error while processing the answer.' });
//     }
// });
// router.get('/userAnswer/:userId/:exerciseQuestionId', async (req, res) => {
//     const { userId, exerciseQuestionId } = req.params;

//     try {
//         // Check if the user has answered the question
//         const [userResponses] = await db.query(
//             'SELECT excercise_user_answer FROM exercise_user_responses WHERE user_Id = ? AND excercise_question_Id = ?',
//             [userId, exerciseQuestionId]
//         );
      
//         // If there is no response, return early with no solutions
//         if (userResponses.length === 0) {
//             return res.json({
//                 success: true,
//                 previousResponse: null,
//                 videoSolutions: [],
//                 imageSolutions: [],
//                 isCorrect: null, // No answer given, so no correctness
//                 correctAnswer: null // No answer given, so no correct answer
//             });
//         }

//         const previousResponse = userResponses[0].excercise_user_answer;

//         // Fetch the correct answer for comparison
//         const [correctAnswerResult] = await db.query(
//             'SELECT excercise_answer_text FROM excercise_answers WHERE excercise_question_Id = ?',
//             [exerciseQuestionId]
//         );

//         if (correctAnswerResult.length === 0) {
//             return res.status(404).json({ error: 'Question not found.' });
//         }

//         const correctAnswer = correctAnswerResult[0].excercise_answer_text;

//         // Check if the previous response is correct
//         const isCorrect = previousResponse.trim() === correctAnswer.trim();

//         // Fetch video solutions based on the question ID
//         const [videoSolutions] = await db.query(
//             'SELECT excercise_solution_link FROM excercise_video_solution WHERE excercise_question_Id = ?',
//             [exerciseQuestionId]
//         );

//         // Fetch image solutions based on the question ID
//         const [imageSolutions] = await db.query(
//             'SELECT Image_solution_Name FROM excercise_image_solution WHERE excercise_question_Id = ?',
//             [exerciseQuestionId]
//         );
//       // Convert image solutions to base64 if they are Buffers
//       const base64Images = imageSolutions.map(option => {
//         return Buffer.from(option.Image_solution_Name).toString('base64');
//     });
//         // Return the data
//         return res.json({
//             success: true,
//             previousResponse,
//             videoSolutions: videoSolutions.length > 0 ? videoSolutions : [],
//             imageSolutions: base64Images,
//             isCorrect, // Add correctness
//             correctAnswer // Include the correct answer for reference
//         });
//     } catch (error) {
//         console.error('Error fetching user answer and solutions:', error);
//         return res.status(500).json({ error: 'Server error while fetching user answer and solutions.' });
//     }
// });

router.get('/userAnswer/:userId/:exerciseQuestionId', async (req, res) => {
    const { userId, exerciseQuestionId } = req.params;

    try {
        // Check if the user has answered the question
        const [userResponses] = await db.query(
            'SELECT excercise_user_answer FROM exercise_user_responses WHERE user_Id = ? AND excercise_question_Id = ?',
            [userId, exerciseQuestionId]
        );
      
        // If there is no response, return early with no solutions
        if (userResponses.length === 0) {
            return res.json({
                success: true,
                previousResponse: null,
                videoSolutions: [],
                imageSolutions: [],
                isCorrect: null, // No answer given, so no correctness
                correctAnswer: null // No answer given, so no correct answer
            });
        }

        let previousResponse = userResponses[0].excercise_user_answer;

        // Ensure previousResponse is a valid string (default to empty string if not)
        previousResponse = previousResponse || '';

        // Fetch the correct answer for comparison
        const [correctAnswerResult] = await db.query(
            'SELECT excercise_answer_text FROM excercise_answers WHERE excercise_question_Id = ?',
            [exerciseQuestionId]
        );

        if (correctAnswerResult.length === 0) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        const correctAnswer = correctAnswerResult[0].excercise_answer_text;

        // Check if the previous response is correct
        const isCorrect = previousResponse.trim() === correctAnswer.trim();

        // Fetch video solutions based on the question ID
        const [videoSolutions] = await db.query(
            'SELECT excercise_solution_link FROM excercise_video_solution WHERE excercise_question_Id = ?',
            [exerciseQuestionId]
        );

        // Fetch image solutions based on the question ID
        const [imageSolutions] = await db.query(
            'SELECT Image_solution_Name FROM excercise_image_solution WHERE excercise_question_Id = ?',
            [exerciseQuestionId]
        );
      
        // Convert image solutions to base64 if they are Buffers
        const base64Images = imageSolutions.map(option => {
            return Buffer.from(option.Image_solution_Name).toString('base64');
        });

        // Return the data
        return res.json({
            success: true,
            previousResponse,
            videoSolutions: videoSolutions.length > 0 ? videoSolutions : [],
            imageSolutions: base64Images,
            isCorrect, // Add correctness
            correctAnswer // Include the correct answer for reference
        });
    } catch (error) {
        console.error('Error fetching user answer and solutions:', error);
        return res.status(500).json({ error: 'Server error while fetching user answer and solutions.' });
    }
});

router.get('/my_courses/course_details/:userId/:courseCreationId', checkCoursePurchased, async (req, res) => {
    const { userId, courseCreationId } = req.params;

    try {
        // Fetch course name
        const [courseRows] = await db.query(
            `SELECT courseName, courseCreationId
            FROM micro_course_creation_table
            WHERE courseCreationId = ?`, 
            [courseCreationId]
        );

        if (courseRows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const courseName = courseRows[0].courseName;

        // Fetch videos related to the course
        const [videos] = await db.query(
            `SELECT 
                l.unit_Id AS lectureId, 
                l.unit_lecture_name AS lectureName, 
                l.unit_lecture_video_link AS videoLink,
                u.unit_exercise_name,
                u.unit_exercise_Id
            FROM unit_name l
            JOIN micro_course_creation_table c ON c.courseCreationId = l.courseCreationId
            JOIN unit_exercise u ON u.unit_Id = l.unit_Id
            WHERE c.courseCreationId = ?;`, 
            [courseCreationId]
        );

        // Prepare the response
        const videoDetails = await Promise.all(videos.map(async video => {
            // Fetch exercise question details for each video
            const [exerciseQuestions] = await db.query(
                `SELECT 
                    eq.excercise_question_Id, 
                    eq.question_Image_Name, 
                    eq.question_type
                FROM excercise_questions eq 
                WHERE eq.unit_exercise_Id = ?;`, 
                [video.unit_exercise_Id]
            );

            // Process exercise questions to include options
            const processedQuestions = await Promise.all(exerciseQuestions.map(async question => {
                let options = [];
                if (question.question_type === 'MCQ' || question.question_type === 'MSQ') {
                    const [optionsRows] = await db.query(
                        `SELECT excercise_option_Id, excercise_optionImg_Name, excercise_optionImg_Index 
                         FROM excercise_options 
                         WHERE excercise_question_Id = ?`, 
                         [question.excercise_question_Id]
                    );
                    options = optionsRows.map(option => ({
                        id: option.excercise_optionImg_Index,
                        img: Buffer.from(option.excercise_optionImg_Name).toString('base64'), // Assuming the image is stored as BLOB
                        index: option.excercise_optionImg_Index
                    }));
                }
                if (question.question_Image_Name) {
                    question.question_Image_Name = Buffer.from(question.question_Image_Name).toString('base64');
                }
                return {
                    ...question,
                    options // Add options to the question
                };
            }));

            return {
                lectureId: video.lectureId,
                lectureName: video.lectureName,
                videoLink: video.videoLink,
                unitExerciseId: video.unit_exercise_Id,
                unitExerciseName: video.unit_exercise_name,
                exerciseQuestions: processedQuestions // Include the fetched and processed exercise questions
            };
        }));

        // Return the complete response
        res.json({ courseName, courseCreationId, videos: videoDetails });
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// New endpoint to handle submission of NAT answers



// router.post('/submitAnswer', async (req, res) => {
 
//     const { userId, unitExerciseId, exerciseQuestionId, userAnswer } = req.body;

//     // Log the input data
//     console.log({
//         userId,
//         unitExerciseId, // Use this directly from req.body
//         exerciseQuestionId,
//         userAnswer
//     });

//     // Input validation
//     if (!userId || !unitExerciseId || !exerciseQuestionId || userAnswer === undefined) {
//         return res.status(400).json({ error: 'All fields are required.' });
//     }
   
//     try {
//         // Fetch the correct answer for the question
//         const [results] = await db.query('SELECT excercise_answer_text FROM excercise_answers WHERE excercise_question_Id = ?', [exerciseQuestionId]);
//         console.log(results);
//         if (results.length === 0) {
//             return res.status(404).json({ error: 'Question not found.' });
//         }

//         const correctAnswer = results[0].excercise_answer_text;

//         // Save the user's response
//         await db.query('INSERT INTO exercise_user_responses (user_Id, unit_exercise_Id, excercise_question_Id, excercise_user_answer) VALUES (?, ?, ?, ?)', 
//             [userId, unitExerciseId, exerciseQuestionId, userAnswer]);

//         // Check if the answer is correct
//         const isCorrect = (Array.isArray(userAnswer) && userAnswer.includes(correctAnswer)) || (userAnswer[0] == correctAnswer);

//         // Return the appropriate response
//         return res.json({
//             success: true,
//             correct: isCorrect,
//             message: isCorrect ? 'Correct answer!' : 'Incorrect answer. Please try again.',
//             correctAnswer
//         });



       
        

//         // Save user answer to the database logic here (if needed)

//         res.json({ success: true, correct: isCorrect, correctAnswer });
//     } catch (error) {
//         console.error('Error submitting answer:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });
// router.post('/submitAnswer', async (req, res) => {
//     const { userId, unitExerciseId, exerciseQuestionId, userAnswer } = req.body;

//     // Log the input data
//     console.log({
//         userId,
//         unitExerciseId,
//         exerciseQuestionId,
//         userAnswer
//     });

//     // Input validation
//     if (!userId || !unitExerciseId || !exerciseQuestionId || userAnswer === undefined) {
//         return res.status(400).json({ error: 'All fields are required.' });
//     }

//     try {
//         // Fetch the correct answer and question type
//         const [questionResult] = await db.query(`
//             SELECT question_type 
//             FROM excercise_questions 
//             WHERE excercise_question_Id = ?`, [exerciseQuestionId]);

//         if (questionResult.length === 0) {
//             return res.status(404).json({ error: 'Question not found.' });
//         }

//         const questionType = questionResult[0].question_type;

//         const [answerResult] = await db.query(`
//             SELECT excercise_answer_text 
//             FROM excercise_answers 
//             WHERE excercise_question_Id = ?`, [exerciseQuestionId]);

//         if (answerResult.length === 0) {
//             return res.status(404).json({ error: 'Correct answer not found.' });
//         }

//         const correctAnswer = answerResult[0].excercise_answer_text;
//         const correctAnswersArray = correctAnswer.split(','); // Assuming answers are comma-separated

//         // Normalize userAnswer for comparison
//         const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.flat() : [userAnswer];

//         // Check if the answer is correct based on question type
//         let isCorrect;
//         if (questionType === 'MSQ') { // Multiple Select Question
//             isCorrect = userAnswersArray.every(answer => correctAnswersArray.includes(answer));
//         } else { // MCQ or NAT (single answer allowed)
//             isCorrect = userAnswersArray.length === 1 && correctAnswersArray.includes(userAnswersArray[0]);
//         }

//         // Save the user's response
//         const formattedUserAnswer = userAnswersArray.join(','); // Join answers for storage
//         await db.query('INSERT INTO exercise_user_responses (user_Id, unit_exercise_Id, excercise_question_Id, excercise_user_answer) VALUES (?, ?, ?, ?)', 
//             [userId, unitExerciseId, exerciseQuestionId, formattedUserAnswer]);

//         // Return the appropriate response
//         return res.json({
//             success: true,
//             correct: isCorrect,
//             message: isCorrect ? 'Correct answer!' : 'Incorrect answer. Please try again.',
//             correctAnswer: correctAnswersArray
//         });
//     } catch (error) {
//         console.error('Error submitting answer:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

router.post('/submitAnswer', async (req, res) => {
    const { userId, unitExerciseId, exerciseQuestionId, userAnswer } = req.body;

    // Log the input data
    console.log({
        userId,
        unitExerciseId,
        exerciseQuestionId,
        userAnswer
    });

    // Input validation
    if (!userId || !unitExerciseId || !exerciseQuestionId || !userAnswer ) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Fetch the correct answer and question type
        const [questionResult] = await db.query(
            `SELECT question_type 
            FROM excercise_questions 
            WHERE excercise_question_Id = ?`, [exerciseQuestionId]);

        if (questionResult.length === 0) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        const questionType = questionResult[0].question_type;

        const [answerResult] = await db.query(
            `SELECT excercise_answer_text 
            FROM excercise_answers 
            WHERE excercise_question_Id = ?`, [exerciseQuestionId]);

        if (answerResult.length === 0) {
            return res.status(404).json({ error: 'Correct answer not found.' });
        }

        // const correctAnswer = answerResult[0].excercise_answer_text;
        // const correctAnswersArray = correctAnswer.split(','); // Assuming answers are comma-separated

        // // Normalize userAnswer for comparison
        // const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.flat() : [userAnswer];

        // // Check if the answer is correct based on question type
        // let isCorrect;
        // if (questionType === 'MSQ') { // Multiple Select Question
        //     isCorrect = userAnswersArray.every(answer => correctAnswersArray.includes(answer));
        // } else { // MCQ or NAT (single answer allowed)
        //     isCorrect = userAnswersArray.length === 1 && correctAnswersArray.includes(userAnswersArray[0]);
        // }
        const correctAnswer = answerResult[0].excercise_answer_text;
        const correctAnswersArray = correctAnswer.split(',').map(answer => answer.trim()); // Normalize the correct answers (trim spaces)

        const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.flat().map(answer => answer.trim()) : [userAnswer.trim()];

        // Sort both arrays to ignore order and compare
        correctAnswersArray.sort(); // Sort the correct answers
        userAnswersArray.sort(); // Sort the user answers

        // Check if the answer is correct based on question type
        let isCorrect;
        if (questionType === 'MSQ') { // Multiple Select Question (MSQ)
            isCorrect = JSON.stringify(correctAnswersArray) === JSON.stringify(userAnswersArray); // Compare sorted arrays as JSON strings
        } else { // MCQ or NAT (single answer allowed)
            isCorrect = userAnswersArray.length === 1 && correctAnswersArray.includes(userAnswersArray[0]);
        }
        // Save the user's response
        const formattedUserAnswer = userAnswersArray.join(','); // Join answers for storage
        await db.query('INSERT INTO exercise_user_responses (user_Id, unit_exercise_Id, excercise_question_Id, excercise_user_answer) VALUES (?, ?, ?, ?)', 
            [userId, unitExerciseId, exerciseQuestionId, formattedUserAnswer]);

        // Return the appropriate response
        return res.json({
            success: true,
            correct: isCorrect,
            message: isCorrect ? 'Correct answer!' : 'Incorrect answer. Please try again.',
            correctAnswer: correctAnswersArray
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).send('Internal Server Error');
    }
});  
// router.get('/userAnswer/:userId/:exerciseQuestionId', async (req, res) => {
//     const { userId, exerciseQuestionId } = req.params;

//     try {
//         // Check if the user has answered the question
//         const [userResponses] = await db.query(
//             'SELECT excercise_user_answer FROM exercise_user_responses WHERE user_Id = ? AND excercise_question_Id = ?',
//             [userId, exerciseQuestionId]
//         );

//         const [questionResult] = await db.query(
//             `SELECT question_type 
//              FROM excercise_questions 
//              WHERE excercise_question_Id = ?`, [exerciseQuestionId]);

//         if (!questionResult || questionResult.length === 0) {
//             return res.status(404).json({ error: 'Question not found.' });
//         }

//         const questionType = questionResult[0].question_type;

//         // If there is no response, return early with no solutions
//         if (userResponses.length === 0) {
//             return res.json({
//                 success: true,
//                 previousResponse: null,
//                 videoSolutions: [],
//                 imageSolutions: [],
//                 isCorrect: null, // No answer given, so no correctness
//                 correctAnswer: null // No answer given, so no correct answer
//             });
//         }

//         const previousResponse = userResponses[0].excercise_user_answer;

//         // Fetch the correct answer for comparison
//         const [correctAnswerResult] = await db.query(
//             `SELECT excercise_answer_text 
//             FROM excercise_answers 
//             WHERE excercise_question_Id = ?`, [exerciseQuestionId]);

//         if (correctAnswerResult.length === 0) {
//             return res.status(404).json({ error: 'Correct answer not found.' });
//         }

//         const correctAnswer = correctAnswerResult[0].excercise_answer_text;
//         const correctAnswersArray = correctAnswer.split(',').map(answer => answer.trim()); // Normalize correct answers

//         // Normalize user answer for comparison (make sure each item is treated as a string)
//         const userAnswersArray = Array.isArray(userResponses) 
//             ? userResponses.flat().map(answer => String(answer).trim()) // Convert each answer to a string and trim it
//             : [String(userResponses[0]).trim()]; // In case userResponses is not an array

//         // Sort both arrays to ignore order and compare
//         correctAnswersArray.sort(); // Sort the correct answers
//         userAnswersArray.sort(); // Sort the user answers

//         // Check if the previous response is correct
//         let isCorrect;
//         if (questionType === 'MSQ') { // Multiple Select Question
//             // Compare sorted arrays as JSON strings
//             isCorrect = JSON.stringify(correctAnswersArray) === JSON.stringify(userAnswersArray);
//         } else { // MCQ or NAT (single answer allowed)
//             isCorrect = userAnswersArray.length === 1 && correctAnswersArray.includes(userAnswersArray[0]);
//         }

//         // Fetch video solutions based on the question ID
//         const [videoSolutions] = await db.query(
//             'SELECT excercise_solution_link FROM excercise_video_solution WHERE excercise_question_Id = ?',
//             [exerciseQuestionId]
//         );

//         // Fetch image solutions based on the question ID
//         const [imageSolutions] = await db.query(
//             'SELECT Image_solution_Name FROM excercise_image_solution WHERE excercise_question_Id = ?',
//             [exerciseQuestionId]
//         );

//         // Convert image solutions to base64 if they are Buffers
//         const base64Images = imageSolutions.map(option => {
//             return Buffer.from(option.Image_solution_Name).toString('base64');
//         });

//         // Return the data
//         return res.json({
//             success: true,
//             previousResponse,
//             videoSolutions: videoSolutions.length > 0 ? videoSolutions : [],
//             imageSolutions: base64Images,
//             isCorrect, // Add correctness
//             correctAnswer // Include the correct answer for reference
//         });
//     } catch (error) {
//         console.error('Error fetching user answer and solutions:', error);
//         return res.status(500).json({ error: 'Server error while fetching user answer and solutions.' });
//     }
// });

// router.get('/userAnswer/:userId/:exerciseQuestionId', async (req, res) => {
//     const { userId, exerciseQuestionId } = req.params;

//     try {
//         // Check if the user has answered the question
//         const [userResponses] = await db.query(
//             'SELECT  excercise_user_answer FROM exercise_user_responses WHERE user_Id = ? AND excercise_question_Id = ?',
//             [userId, exerciseQuestionId]
//         );
//         const [questionResult] = await db.query(
//             `SELECT question_type 
//              FROM excercise_questions 
//              WHERE excercise_question_Id = ?`, [exerciseQuestionId]);

//         if (!questionResult || questionResult.length === 0) {
//             return res.status(404).json({ error: 'Question not found.' });
//         }

//         const questionType = questionResult[0].question_type;
//         // If there is no response, return early with no solutions
//         if (userResponses.length === 0) {
//             return res.json({
//                 success: true,
//                 previousResponse: null,
//                 videoSolutions: [],
//                 imageSolutions: [],
//                 isCorrect: null, // No answer given, so no correctness
//                 correctAnswer: null // No answer given, so no correct answer
//             });
//         }

//         const previousResponse = userResponses[0].excercise_user_answer;

//         // Fetch the correct answer for comparison
//         const [correctAnswerResult] = await db.query(
//             `SELECT excercise_answer_text 
//             FROM excercise_answers 
//             WHERE excercise_question_Id = ?`, [exerciseQuestionId]);

//         if (correctAnswerResult.length === 0) {
//             return res.status(404).json({ error: 'Question not found.' });
//         }

//         const correctAnswer = correctAnswerResult[0].excercise_answer_text;
      
//         const correctAnswersArray = correctAnswer.split(','); // Assuming answers are comma-separated

//         // Normalize userAnswer for comparison
//         const userAnswersArray = Array.isArray(userResponses) ? userResponses.flat() : [userResponses];
//         // Check if the previous response is correct
//         let isCorrect;
//         if (questionType === 'MSQ') { // Multiple Select Question
//             isCorrect = userAnswersArray.every(answer => correctAnswersArray.includes(answer));
//         } else { // MCQ or NAT (single answer allowed)
//             isCorrect = userAnswersArray.length === 1 && correctAnswersArray.includes(userAnswersArray[0]);
//         }

//         // Fetch video solutions based on the question ID
//         const [videoSolutions] = await db.query(
//             'SELECT excercise_solution_link FROM excercise_video_solution WHERE excercise_question_Id = ?',
//             [exerciseQuestionId]
//         );

//         // Fetch image solutions based on the question ID
//         const [imageSolutions] = await db.query(
//             'SELECT Image_solution_Name FROM excercise_image_solution WHERE excercise_question_Id = ?',
//             [exerciseQuestionId]
//         );
//       // Convert image solutions to base64 if they are Buffers
//       const base64Images = imageSolutions.map(option => {
//         return Buffer.from(option.Image_solution_Name).toString('base64');
//     });
//         // Return the data
//         return res.json({
//             success: true,
//             previousResponse,
//             videoSolutions: videoSolutions.length > 0 ? videoSolutions : [],
//             imageSolutions: base64Images,
//             isCorrect, // Add correctness
//             correctAnswer // Include the correct answer for reference
//         });
//     } catch (error) {
//         console.error('Error fetching user answer and solutions:', error);
//         return res.status(500).json({ error: 'Server error while fetching user answer and solutions.' });
//     }
// });   
   
module.exports = router;