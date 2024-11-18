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

router.get('/my_final_tests/:userId', async (req, res) => {
    const userId = req.params.userId;
  
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
          b.user_id = ? AND f.status = 'active'  -- Only get active final tests
      `, [userId]);
  
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
            'SELECT * FROM exercise_user_responses WHERE user_Id = ? AND excercise_question_Id = ?',
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
// POST request to track video visits
// router.post('/video_visit', async (req, res) => {
//     const { userId, courseCreationId, unitId } = req.body;
//     console.log('Request received with data:', { userId, courseCreationId, unitId });

//     try {
//         const result = await db.query(
//             `INSERT INTO video_count (user_Id, courseCreationId, unit_Id, video_count) 
//              VALUES (?, ?, ?, 1) 
//              ON DUPLICATE KEY UPDATE video_count = video_count + 1`,
//             [userId, courseCreationId, unitId]
//         );
//         console.log('Database update result:', result);

//         res.status(200).send('Video visit tracked successfully');
//     } catch (error) {
//         console.error('Error during database query:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });
router.post('/video_visit', async (req, res) => {
    const { userId, courseCreationId, unitId } = req.body;
    console.log('Request received with data:', { userId, courseCreationId, unitId });

    try {
        // Step 1: Check if the record already exists
        const [existingRecord] = await db.query(
            `SELECT * FROM video_count WHERE user_Id = ? AND courseCreationId = ? AND unit_Id = ?`,
            [userId, courseCreationId, unitId]
        );

        if (existingRecord && existingRecord.length > 0) {
            // Step 2: If record exists, update the video_count
            const updateResult = await db.query(
                `UPDATE video_count SET video_count = video_count + 1 
                 WHERE user_Id = ? AND courseCreationId = ? AND unit_Id = ?`,
                [userId, courseCreationId, unitId]
            );
            
            if (updateResult.affectedRows > 0) {
                console.log('Updated video visit count for user:', userId, 'video:', unitId);
            } else {
                console.log('No rows were updated in video_count for user:', userId, 'video:', unitId);
            }
        } else {
            // Step 3: If no record exists, insert a new row with video_count = 1
            const insertResult = await db.query(
                `INSERT INTO video_count (user_Id, courseCreationId, unit_Id, video_count) 
                 VALUES (?, ?, ?, 1)`,
                [userId, courseCreationId, unitId]
            );

            if (insertResult.affectedRows > 0) {
                console.log('Inserted new video visit for user:', userId, 'video:', unitId);
            } else {
                console.log('Failed to insert new video visit for user:', userId, 'video:', unitId);
            }
        }

        // Send response
        res.status(200).send('Video visit tracked successfully');
    } catch (error) {
        console.error('Error during database query:', error.message || error);
        res.status(500).send('Internal Server Error');
    }
});







// router.post('/excerciseQuestionStatus', async (req, res) => {
//     const { userId, unitExerciseId, exerciseQuestionId, questionStatus } = req.body;

//     // Log received data for debugging
//     console.log('Request received with data:', {  userId, unitExerciseId, exerciseQuestionId, questionStatus });
//     console.log('Received excerciseQuestionStatus response', req.body);

//     // Check if all required fields are present
//     if (!userId || !unitExerciseId || !exerciseQuestionId || !questionStatus) {
//         return res.status(400).json({ message: 'Missing required fields' });
//     }

//     try {
//         const result = await db.query(
//             `INSERT INTO exercise_user_question_status_responses (user_Id, unit_exercise_Id, excercise_question_Id, question_status) 
//              VALUES (?, ?, ?, ?)`,
//             [ userId, unitExerciseId, exerciseQuestionId, questionStatus]  // Include question_status in the query
//         );

//         // If the insert is successful, send a success message with the result
//         if (result.affectedRows > 0) {
//             res.status(200).json({
//                 message: 'Inserted successfully',
//                 result: result  // Include the result of the insertion (e.g., affected rows)
//             });
//         } else {
//             res.status(400).json({ message: 'Insertion failed' });
//         }
//     } catch (error) {
//         console.error('Error during database query:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
router.post('/excerciseQuestionStatus', async (req, res) => {
    const { userId, unitExerciseId, exerciseQuestionId, questionStatus } = req.body;

    // Log received data for debugging
    console.log('Request received with data:', { userId, unitExerciseId, exerciseQuestionId, questionStatus });

    // Check if all required fields are present
    if (!userId || !unitExerciseId || !exerciseQuestionId || !questionStatus) {
        console.log('Error: Missing required fields', { userId, unitExerciseId, exerciseQuestionId, questionStatus });
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // First, check if the record already exists
        const checkQuery = `
            SELECT * FROM exercise_user_question_status_responses 
            WHERE user_Id = ? AND unit_exercise_Id = ? AND excercise_question_Id = ?
        `;
        const existingRecord = await db.query(checkQuery, [userId, unitExerciseId, exerciseQuestionId]);

        console.log('Existing record:', existingRecord);

        if (existingRecord[0].length > 0) {
            // If record exists, update the question_status
            const updateQuery = `
                UPDATE exercise_user_question_status_responses 
                SET question_status = ? 
                WHERE user_Id = ? AND unit_exercise_Id = ? AND excercise_question_Id = ?
            `;
            const updateResult = await db.query(updateQuery, [questionStatus, userId, unitExerciseId, exerciseQuestionId]);

            console.log('Update result:', updateResult);

            if (updateResult[0].affectedRows > 0) {
                res.status(200).json({
                    message: 'Updated successfully',
                    result: updateResult
                });
            } else {
                console.log('Update failed');
                res.status(400).json({ message: 'Update failed' });
            }
        } else {
            // If record doesn't exist, insert a new one
            const insertQuery = `
                INSERT INTO exercise_user_question_status_responses (user_Id, unit_exercise_Id, excercise_question_Id, question_status) 
                VALUES (?, ?, ?, ?)
            `;
            const insertResult = await db.query(insertQuery, [userId, unitExerciseId, exerciseQuestionId, questionStatus]);

            console.log('Insert result:', insertResult);

            if (insertResult[0].affectedRows > 0) {
                res.status(200).json({
                    message: 'Inserted successfully',
                    result: insertResult
                });
            } else {
                console.log('Insertion failed');
                res.status(400).json({ message: 'Insertion failed' });
            }
        }
    } catch (error) {
        console.error('Error during database query:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





// router.get('/excerciseQuestionStatusData/:userId/:unitExerciseId/:exerciseQuestionId', async (req, res) => {

//     // Get the path parameters from req.params
//     const { userId, unitExerciseId,exerciseQuestionId } = req.params;

//     // Check if the required parameters are present
//     if (!userId || !unitExerciseId||!exerciseQuestionId) {
//         return res.status(400).send('Missing userId or unitExerciseId');
//     }

//     try {
//         // Query to fetch data from the database
//         const [rows] = await db.query(`
//             SELECT * FROM exercise_user_question_status_responses
//             WHERE unit_exercise_Id = ? AND user_Id = ? AND excercise_question_Id=?
//         `, [unitExerciseId, userId,exerciseQuestionId]);

//         // Check if no records were found
//         if (rows.length === 0) {
//             return res.json({ question_status: 'NotVisited' });
//         }

//         // Send the question_status from the database
//         res.json(rows);

//     } catch (error) {
//         // Log the error and send a server error response
//         console.error('Error fetching exercise question status data:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

router.get('/excerciseQuestionStatusData/:userId/:unitExerciseId', async (req, res) => {

    // Get the path parameters from req.params
    const { userId, unitExerciseId } = req.params;

    // Check if the required parameters are present
    if (!userId || !unitExerciseId) {
        return res.status(400).send('Missing userId or unitExerciseId');
    }

    try {
        // Query to fetch data from the database
        const [rows] = await db.query(`
            SELECT * FROM exercise_user_question_status_responses
            WHERE unit_exercise_Id = ? AND user_Id = ? 
        `, [unitExerciseId, userId]);

        // Check if no records were found
        if (rows.length === 0) {
            return res.json({ question_status: 'NotVisited' });
        }

        // Send the question_status from the database
        res.json(rows);

    } catch (error) {
        // Log the error and send a server error response
        console.error('Error fetching exercise question status data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/accessStatus/:userId/:courseCreationId', async (req, res) => {
    const { userId, courseCreationId } = req.params;

    if (!userId || !courseCreationId) {
        return res.status(400).send('Missing userId or courseCreationId');
    }

    try {
        // Step 1: Check if the user has visited all videos in the course
        const [videos] = await db.query(
            `SELECT unit_Id FROM unit_name WHERE courseCreationId = ?`, [courseCreationId]
        );
        const m = videos.length;
        // Check if the user has visited all videos
        const [videoVisits] = await db.query(
            `SELECT unit_Id, video_count FROM video_count WHERE user_Id = ? AND courseCreationId = ?`, 
            [userId, courseCreationId]
        );
        const vv = videoVisits.length; 
        const visitedVideoIds = videoVisits.map(row => row.unit_Id);
        const visitedVideos = videos.map(video => video.unit_Id);
        const videoCount = videoVisits.map(video => ({
            unit: video.unit_Id, 
            videoCount: video.video_count
        }));
        
        const allUnitIds = videos.map(video => video.unit_Id);
        
        // Fetch exercises related to the course based on unit_Id
        let exercises = [];

        if (allUnitIds.length > 0) {
            [exercises]= await db.query(
                `SELECT unit_exercise_Id, unit_exercise_name, unit_Id FROM unit_exercise WHERE unit_Id IN (?)`, 
                [allUnitIds]
            );
        } else {
            // Handle the case where allUnitIds is empty. You can return an empty result, or do something else.
            exercises = [];
        }
        const n = exercises.length; // Number of exercises (assuming there is an exercise for each video)
        const videoCompletionPercentage = (100/(m + n)) * vv;
        // Step 2: Count total and answered questions for each exercise
        const exerciseDetails = await Promise.all(exercises.map(async (exercise) => {
            // Fetch questions for each exercise
            const [exerciseQuestions] = await db.query(
                `SELECT eq.excercise_question_Id 
                 FROM excercise_questions eq
                 WHERE eq.unit_exercise_Id = ?`, 
                [exercise.unit_exercise_Id]
            );
            
            const totalQuestions = exerciseQuestions.length;

            // Fetch answered questions for each exercise
            const [answeredQuestions] = await db.query(
                `SELECT excercise_question_Id 
                 FROM exercise_user_responses 
                 WHERE user_Id = ? AND excercise_question_Id IN (?)`, 
                [userId, exerciseQuestions.map(q => q.excercise_question_Id)]
            );

            const answeredQuestionsIds = answeredQuestions.map(row => row.excercise_question_Id);
            const answeredQuestionCount = answeredQuestionsIds.length;
            const exerciseCompletionPercentage = totalQuestions > 0 
            ? (answeredQuestionCount / totalQuestions) * (100/(m + n)) * 1
            : 0;
            return {
                exerciseId: exercise.unit_exercise_Id,
                exerciseName: exercise.exercise_name,
                totalQuestions,
                answeredQuestions: answeredQuestionCount,
                exerciseCompletionPercentage
            };
        }));

        // Step 3: Check if the user has answered all questions for all exercises
        const allExercisesAnswered = exerciseDetails.every(exercise => exercise.totalQuestions === exercise.answeredQuestions);

        // Step 4: Check if all videos are visited
        const areSetsEqual = (arr1, arr2) => {
            return new Set(arr1).size === new Set(arr2).size &&
                   [...new Set(arr1)].every(item => new Set(arr2).has(item));
        };
        
        const allVideosVisited = areSetsEqual(allUnitIds, visitedVideoIds);

        // Step 5: Determine if the user has access based on both conditions
        const accessGranted = allVideosVisited && allExercisesAnswered;
        const totalExercisePercentage = exerciseDetails.reduce((acc, exercise) => acc + exercise.exerciseCompletionPercentage, 0);

        // Step 7: Calculate total course completion percentage
        const totalCompletionPercentage = videoCompletionPercentage + totalExercisePercentage;
        // Step 6: Send the response with the new exercise details
        res.json({
            videoCompletionPercentage: videoCompletionPercentage.toFixed(2), // rounding to 2 decimal places
            exerciseCompletionPercentage: totalExercisePercentage.toFixed(2), 
            totalCompletionPercentage: totalCompletionPercentage.toFixed(2), // rounding to 2 decimal places
            visitedVideos,
            videoCount,
            exerciseDetails,
            access: accessGranted
        });

    } catch (error) {
        console.error('Error during access status check:', error);
        res.status(500).send('Internal Server Error');
    }
});

// router.get('/courseCompletionPercentage/:userId/:courseCreationId', async (req, res) => {
//     const { userId, courseCreationId } = req.params;

//     if (!userId || !courseCreationId) {
//         return res.status(400).send('Missing userId or courseCreationId');
//     }

//     try {
//         // Step 1: Fetch videos for the course
//         const [videos] = await db.query(
//             `SELECT unit_Id FROM unit_name WHERE courseCreationId = ?`, [courseCreationId]
//         );
//         const m = videos.length; // Number of videos
        
//         // Step 2: Fetch video visits by the user (not used for video completion)
//         const [videoVisits] = await db.query(
//             `SELECT unit_Id FROM video_count WHERE user_Id = ? AND courseCreationId = ?`, 
//             [userId, courseCreationId]
//         );
//         const vv = videoVisits.length; 
//         // Step 3: Calculate video completion percentage (each video contributes (m + n) * 1%)
       

//         // Step 4: Fetch exercises for the course
//         const allUnitIds = videos.map(video => video.unit_Id);
//         let exercises = [];
//         if (allUnitIds.length > 0) {
//             [exercises] = await db.query(
//                 `SELECT unit_exercise_Id, unit_exercise_name, unit_Id FROM unit_exercise WHERE unit_Id IN (?)`, 
//                 [allUnitIds]
//             );
//         }
//         const n = exercises.length; // Number of exercises (assuming there is an exercise for each video)
//         const videoCompletionPercentage = (m + n) * vv;
//         // Step 5: Count total and answered questions for each exercise
//         const exerciseDetails = await Promise.all(exercises.map(async (exercise) => {
//             // Fetch questions for each exercise
//             const [exerciseQuestions] = await db.query(
//                 `SELECT eq.excercise_question_Id 
//                  FROM excercise_questions eq
//                  WHERE eq.unit_exercise_Id = ?`, 
//                 [exercise.unit_exercise_Id]
//             );

//             const totalQuestions = exerciseQuestions.length;

//             // Fetch answered questions for each exercise
//             const [answeredQuestions] = await db.query(
//                 `SELECT excercise_question_Id 
//                  FROM exercise_user_responses 
//                  WHERE user_Id = ? AND excercise_question_Id IN (?)`, 
//                 [userId, exerciseQuestions.map(q => q.excercise_question_Id)]
//             );

//             const answeredQuestionsIds = answeredQuestions.map(row => row.excercise_question_Id);
//             const answeredQuestionCount = answeredQuestionsIds.length;

//             // Calculate completion percentage for this exercise
//             const exerciseCompletionPercentage = totalQuestions > 0 
//                 ? (answeredQuestionCount / totalQuestions) * (100/(m + n)) * 1
//                 : 0;

//             return {
//                 exerciseId: exercise.unit_exercise_Id,
//                 exerciseName: exercise.unit_exercise_name,
//                 totalQuestions,
//                 answeredQuestions: answeredQuestionCount,
//                 exerciseCompletionPercentage
//             };
//         }));

//         // Step 6: Calculate total exercise completion percentage
//         const totalExercisePercentage = exerciseDetails.reduce((acc, exercise) => acc + exercise.exerciseCompletionPercentage, 0);

//         // Step 7: Calculate total course completion percentage
//         const totalCompletionPercentage = videoCompletionPercentage + totalExercisePercentage;

//         // Return the response
//         res.json({
//             videoCompletionPercentage: videoCompletionPercentage.toFixed(2), // rounding to 2 decimal places
//             exerciseCompletionPercentage: totalExercisePercentage.toFixed(2), 
//             totalCompletionPercentage: totalCompletionPercentage.toFixed(2), // rounding to 2 decimal places
//             videoVisits,
//             exerciseDetails
//         });

//     } catch (error) {
//         console.error('Error during course completion percentage calculation:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });





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
                const[sortids] =await db.query(`
                    SELECT 
                    eq_sort_text
                    FROM excercise_question_sortids
                    WHERE excercise_question_Id= ?`,
                    [question.excercise_question_Id]
                );
                return {
                    ...question,
                    options, // Add options to the question
                    sortids
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
    if (!userId || !unitExerciseId || !exerciseQuestionId || userAnswer === undefined) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Fetch the correct answer and question type
        const [questionResult] = await db.query(`
            SELECT question_type 
            FROM excercise_questions 
            WHERE excercise_question_Id = ?`, [exerciseQuestionId]);

        if (questionResult.length === 0) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        const questionType = questionResult[0].question_type;

        const [answerResult] = await db.query(`
            SELECT excercise_answer_text 
            FROM excercise_answers 
            WHERE excercise_question_Id = ?`, [exerciseQuestionId]);

        if (answerResult.length === 0) {
            return res.status(404).json({ error: 'Correct answer not found.' });
        }

        const correctAnswer = answerResult[0].excercise_answer_text;
        const correctAnswersArray = correctAnswer.split(','); // Assuming answers are comma-separated

        // Normalize userAnswer for comparison
        const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.flat() : [userAnswer];

        // Check if the answer is correct based on question type
        let isCorrect;
        if (questionType === 'MSQ') { // Multiple Select Question
            isCorrect = userAnswersArray.every(answer => correctAnswersArray.includes(answer));
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





module.exports = router;