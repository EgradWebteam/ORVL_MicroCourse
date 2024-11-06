import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import HeaderMc from '../Headermicrocourses/HeaderMc';
import NavBar from '../Navabar/NavBar';
import './styles/Mycourses.css'
import { GrPrevious } from "react-icons/gr";
import { FaRegPlayCircle } from "react-icons/fa";
import { IoNewspaperSharp } from "react-icons/io5";
import { GrNext } from "react-icons/gr";

const CourseDetails = () => {
    const { id, courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
    const [showExercise, setShowExercise] = useState(false);
    const [userAnswer, setUserAnswer] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [showLectures, setShowLectures] = useState(true);
    const [videoSolutions, setVideoSolutions] = useState([]); // State for video solutions
    const [imageSolutions, setImageSolutions] = useState([]);
    const [answerDisabled, setAnswerDisabled] = useState(false);  // State for image solutions

    const [lastVisitedVideoId, setLastVisitedVideoId] = useState(null);
    const [viewingSolutionForQuestion, setViewingSolutionForQuestion] = useState(null);

    

    // Track video visit using the state variable for visit tracking
    const trackVideoVisit = (videoId) => {
        if (lastVisitedVideoId !== videoId) {
            setLastVisitedVideoId(videoId);
            // Make POST request to track the video visit
            axios.post('http://localhost:5000/microcourses/video_visit', {
                userId: id,
                courseCreationId: courseId,
                unitId: videoId
            }).catch((error) => {
                console.error('Error tracking video visit:', error);
            });
        }
    };
    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/microcourses/my_courses/course_details/${id}/${courseId}`);
                setCourse(response.data);
                if (response.data.videos.length > 0) {
                    setSelectedVideo(response.data.videos[null]);
                }
            } catch (error) {
                console.error('Error fetching course details:', error);
            }
        };

        fetchCourseDetails();
    }, [id, courseId]);

    const handleVideoSelect = (index) => {
        setCurrentLectureIndex(index);
        setSelectedVideo(course.videos[index]);
        setCurrentExerciseIndex(0);
        setShowExercise(false);
        setShowLectures(false);
        trackVideoVisit(course.videos[index].lectureId);
        // const firstQuestion = course.videos[index].exerciseQuestions[0];
        // axios.post('http://localhost:5000/microcourses/mark_question_visited', {
        //     userId: id,
        //     unitExerciseId: course.videos[index].unitExerciseId,
        //     exerciseQuestionId: firstQuestion.excercise_question_Id
        // });
        
    };

    const handleExerciseSelect = (index) => {
        setCurrentExerciseIndex(0); // Reset to the first question of the exercise
        setShowExercise(true);
        setCurrentLectureIndex(index);
        setSelectedVideo(course.videos[index]); // Ensure the selected video is updated
        setShowLectures(false);
        trackVideoVisit(course.videos[index].lectureId);
        // const firstQuestion = course.videos[index].exerciseQuestions[0];
        // axios.post('http://localhost:5000/microcourses/mark_question_visited', {
        //     userId: id,
        //     unitExerciseId: course.videos[index].unitExerciseId,
        //     exerciseQuestionId: firstQuestion.excercise_question_Id
        // });
    };
    const closeSlideshow = () => {
        setSelectedVideo(null);
        setCurrentExerciseIndex(0);
        setCurrentLectureIndex(0);
        setShowExercise(false);
        setShowLectures(true);
    };

    const getYouTubeEmbedUrl = (videoLink) => {
        let embedUrl = videoLink;
        if (videoLink.includes('youtube.com/watch?v=')) {
            const vidId = new URL(videoLink).searchParams.get('v');
            embedUrl = `https://www.youtube.com/embed/${vidId}`;
        } else if (videoLink.includes('youtu.be/')) {
            const vidId = videoLink.split('/').pop();
            embedUrl = `https://www.youtube.com/embed/${vidId}`;
        }
        return embedUrl;
    };

    const nextQuestion = () => {
        if (currentExerciseIndex < selectedVideo.exerciseQuestions.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
          
        } else {
            alert("You have completed all questions.");
        }
    };
    const previousQuestion = () => {
        if (currentExerciseIndex > 0) { // Change this condition
            setCurrentExerciseIndex(currentExerciseIndex - 1);
            
        } else {
            alert("This is the first question.");
        }
    };
    
    const navigateToQuestion = (index) => {
        if (index >= 0 && index < selectedVideo.exerciseQuestions.length) {
            setCurrentExerciseIndex(index);
        }
    };
    const nextLecture = () => {
        // Ensure we're accessing the correct video from the `course.videos` array
        if (currentLectureIndex < course.videos.length - 1) {
         
            handleVideoSelect(currentLectureIndex + 1);
           
        } else {
            alert("You are already on the last lecture.");
        }
    };
    
    const previousLectureOrExercise = () => {
        if (showExercise) {
            // If currently showing exercise, go back to the current lecture
            setShowExercise(false); // This will go back to the video of the current lecture
        } else {
            
            // If currently showing lecture, navigate to previous lecture's exercise
            if (currentLectureIndex === 0) {
                // If on the first lecture, stay on it
                alert("You are already on the first lecture.");
            } else {
                const previousIndex = currentLectureIndex - 1;
                handleVideoSelect(previousIndex); // Select the previous lecture
                setShowExercise(true); // Show the exercise for that lecture
            }
        }
      
    };
    
    useEffect(() => {
     // Inside the fetchUserAnswerAndSolutions function
const fetchUserAnswerAndSolutions = async () => {
    if (selectedVideo) {
        const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id;

        try {
            const response = await axios.get(`http://localhost:5000/microcourses/userAnswer/${id}/${exerciseQuestionId}`);
            if (response.data.success) {
                setUserAnswer(response.data.previousResponse || '');
                
                setVideoSolutions(response.data.videoSolutions || []);
                setImageSolutions(response.data.imageSolutions || []);
         
                // Set feedback based on correctness
                if (response.data.isCorrect !== null) {
                    setFeedback(response.data.isCorrect ? `Correct answer!`: `Incorrect answer. The correct answer is: ${response.data.correctAnswer}`);
                } else {
                    setFeedback(""); 
                }
                if (response.data.previousResponse !== null) {
                    setAnswerDisabled(true);  
                } else {
                    setAnswerDisabled(false); 
                }
                
            }
        } catch (error) {
            console.error('Error fetching user answer and solutions:', error);
        }
    }
};

        fetchUserAnswerAndSolutions();
    }, [selectedVideo, currentExerciseIndex]); // Dependencies include currentExerciseIndex
    
    
    
//    const handleSubmitAnswer = async (e) => {
//         e.preventDefault(); // Prevent the form from refreshing the page

//         if (!userAnswer) {
//             alert("Please enter an answer.");
//             return;
//         }

//         const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id; // Adjusted for proper ID

//         try {
//             const response = await axios.post('http://localhost:5000/microcourses/submitAnswer', {
//                 userId: id,
//                 unitExerciseId: selectedVideo.unitExerciseId,
//                 exerciseQuestionId,
//                 userAnswer
//             });
//             const fetchUserAnswerAndSolutions = async () => {
//                 if (selectedVideo) {
//                     const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id;
            
//                     try {
//                         const response = await axios.get(`http://localhost:5000/microcourses/userAnswer/${id}/${exerciseQuestionId}`);
//                         if (response.data.success) {
//                             setUserAnswer(response.data.previousResponse || '');
//                             setVideoSolutions(response.data.videoSolutions || []);
//                             setImageSolutions(response.data.imageSolutions || []);
                            
//                             // Set feedback based on correctness
//                             if (response.data.isCorrect !== null) {
//                                 setFeedback(response.data.isCorrect ? "Correct answer!" : `Incorrect answer. The correct answer is: ${response.data.correctAnswer}`);
//                             } else {
//                                 setFeedback(""); // Reset feedback if no answer given
//                             }
//                         }
//                     } catch (error) {
//                         console.error('Error fetching user answer and solutions:', error);
//                     }
//                 }
//             };
//             fetchUserAnswerAndSolutions();
//             // Check the response for correctness
//             if (response.data.correct) {
//                 setFeedback("Correct answer!");
//             } else {
//                 setFeedback("Wrong answer. The correct answer is: " + response.data.correctAnswer);
//             }
//         } catch (error) {
//             console.error('Error submitting answer:', error);
//         }
//     };
const viewSolution = () => {
    setViewingSolutionForQuestion(currentExerciseIndex);
};

const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    // if (userAnswer.trim() === '') {
    //     alert("Please enter an answer.");
    //     return;
    // }
  
    const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id;

    try {
        const response = await axios.post('http://localhost:5000/microcourses/submitAnswer', {
            userId: id,
            unitExerciseId: selectedVideo.unitExerciseId,
            exerciseQuestionId,
            userAnswer: [userAnswer] // Send as an array for consistency
        });
        const fetchUserAnswerAndSolutions = async () => {
            if (selectedVideo) {
                const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id;
        
                try {
                    const response = await axios.get(`http://localhost:5000/microcourses/userAnswer/${id}/${exerciseQuestionId}`);
                    if (response.data.success) {
                        setUserAnswer(response.data.previousResponse || '');
                        setVideoSolutions(response.data.videoSolutions || []);
                        setImageSolutions(response.data.imageSolutions || []);
                        
                        // Set feedback based on correctness
                        if (response.data.isCorrect !== null) {
                            setFeedback(response.data.isCorrect ? `Correct answer!` : `Incorrect answer. The correct answer is: ${response.data.correctAnswer}`);
                        } else {
                            setFeedback(""); // Reset feedback if no answer given
                        }
                        setAnswerDisabled(true);
                    }
                   
                } catch (error) {
                    console.error('Error fetching user answer and solutions:', error);
                }
            }
        };
        
                fetchUserAnswerAndSolutions();
        if (response.data.correct) {
            setFeedback("Correct answer!");
        } else {
            setFeedback("Wrong answer. The correct answer is: " + response.data.correctAnswer);
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
    }
};

const renderOptions = (question) => {
    return question.options.map(option => (
        <div key={option.id}>
            {question.question_type === 'MCQ' ? (
                <label>
                    ({option.index})
                    <input
                        type="radio"
                        value={option.id}
                        checked={userAnswer.includes(option.id)}
                        disabled={answerDisabled}
                        onChange={() => {
                            setUserAnswer([option.id]); // Set single answer for MCQ
                        }}
                    />
                    {option.index && <img src={`data:image/jpeg;base64,${option.img}`} alt={option.index} />}
                    {/* Display option text or index if necessary */}
                </label>
            ) : (
                <label>
                    ({option.index})
                    <input
                        type="checkbox"
                        value={option.id}
                        checked={userAnswer.includes(option.id)}
                        disabled={answerDisabled}
                        onChange={() => {
                            if (userAnswer.includes(option.id)) {
                                setUserAnswer(userAnswer.filter(id => id !== option.id));
                            } else {
                                setUserAnswer([...userAnswer, option.id]);
                            }
                        }}
                    />
                    {option.index && <img src={`data:image/jpeg;base64,${option.img}`} alt={option.index} />}
                     {/* Display option text or index if necessary */}
                </label>
            )}
        </div>
    ));
};
    return (
        <div>
            <HeaderMc />
            <NavBar userId={id} />
            <div className='userInterfaceMainCon'>
                {course && (
                    <div>
                        <h1 className='h1mid'>{course.courseName}</h1>
                       
                        <ul className='ullecturesshow'>
                            {showLectures && course.videos.map((video, index) => (
                                <li key={video.lectureId} className='lecturesshow'>
                                    <div onClick={() => handleVideoSelect(index)}>
                                        {video.lectureName}<FaRegPlayCircle className='videxamicon' />
                                    </div>
                                    <div onClick={() => handleExerciseSelect(index)}>
                                        {video.unitExerciseName}<IoNewspaperSharp className='videxamicon' />
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {selectedVideo && !showExercise && (
                            
                            <div className="slideshow">
                                 
                                <h2 className='h1mid'>{selectedVideo.lectureName}</h2>
                                <div className='containerclose'> <button className='btnclose' onClick={closeSlideshow}>Close</button></div> 
                                <div className="navigation-buttons">
                                <button className='btnpreviousnxt' onClick={previousLectureOrExercise} disabled={currentLectureIndex === 0}>
                                        {showExercise ? <GrPrevious />: <GrPrevious />}
                                    </button>
                                    <div>
                                <iframe
                                  className='iframevideoplay'
                                    src={getYouTubeEmbedUrl(selectedVideo.videoLink)}
                                    title={selectedVideo.lectureName}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    onError={() => {
                                        alert('Failed to load the video. Please try again later.');
                                    }}
                                ></iframe>
                               </div>
                               
                            
                                    <button  className='btnpreviousnxt' onClick={() => { setShowExercise(true); }}><GrNext /></button>
                                </div>
                            </div>
                        )}

                        {showExercise && (
                            <div className="exercise-questions">
                                
                                {selectedVideo.exerciseQuestions.length > 0 ? (
                                    <div>
                                       <h2 className='h1mid'>{selectedVideo.unitExerciseName}</h2> 
                                     <div className='containerclose'> <button className='btnclose' onClick={closeSlideshow}>Close</button></div> 
                                       
                                        <div className="navigation-buttons">
                                        <button  className='btnpreviousnxt' onClick={previousLectureOrExercise} disabled={currentLectureIndex ===-1}><GrPrevious /></button>
                                        <div  className='iframevideoplay excerciseques'>
                                        
                                        <div className='palate-ques-flex'>
                                        <div className="ques-number-palette">
                                      <div className='quesno-quesimg-flex'> <h4>{currentExerciseIndex + 1}. {selectedVideo.exerciseQuestions[currentExerciseIndex]?.question_Text}</h4>
                                        {selectedVideo.exerciseQuestions[currentExerciseIndex]?.question_Image_Name && (
                                            
                                            <img src={`data:image/jpeg;base64,${selectedVideo.exerciseQuestions[currentExerciseIndex].question_Image_Name}`} alt={`Question ${currentExerciseIndex + 1}`} />
                                        )}</div> 
                                        <form onSubmit={handleSubmitAnswer} className='formforques'>
                                        {selectedVideo.exerciseQuestions[currentExerciseIndex].question_type === 'NAT' ? (
                                      <div>Enter Answer: <input
                                            type="text"
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            placeholder="Enter your answer"
                                            disabled={answerDisabled}
                                            className='InpBoxAns'
                                        /></div>
                                    ) : (
                                        renderOptions(selectedVideo.exerciseQuestions[currentExerciseIndex])
                                    )}
{feedback && <div>{feedback}</div>}
                                            <div className='navigation-buttons'>
                                            <div onClick={previousQuestion} className='btnnxtques'>
                                                Previous Question
                                            </div>   {!answerDisabled && (   <button type ="submit" className=' viewsolsubmit' >Submit</button>)}
                                            {answerDisabled &&( <div>
                                                <div onClick={viewSolution} className='viewsolsubmit' >View Solution</div>
                                            </div>)}
                                            <div onClick={nextQuestion} className='btnnxtques'>
                                                Next Question
                                            </div></div>
                                </form>
                                       
                                        </div>
                                        <div className="number-palette">
                                            {selectedVideo.exerciseQuestions.map((_, index) => (
                                                <button 
                                                    key={index} 
                                                    onClick={() => navigateToQuestion(index)} 
                                                    className={currentExerciseIndex === index ? 'active' : `notactive${feedback!=null ?  `answered` :``} `} // Highlight active question
                                                    
                                                >
                                                    {index + 1}
                                                </button>

                                            ))}
                                        </div></div>
                                
                            </div>
                            
                                            <button  className='btnpreviousnxt' onClick={nextLecture}>
                                            <GrNext />
                                            </button>
                                           
                                        </div>
                                   {viewingSolutionForQuestion === currentExerciseIndex &&(   <div>
                                        {videoSolutions.length > 0 && (
                                            <div>
                                                <h3>Video Solutions:</h3>
                                                {videoSolutions.map((solution, index) => (
                                                    <div key={index}>
                                                        <iframe
                                                            width="560"
                                                            height="315"
                                                            src={getYouTubeEmbedUrl(solution.excercise_solution_link)}
                                                            title={`Video Solution ${index + 1}`}
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Displaying image solutions */}
                                        {imageSolutions.length > 0 && (
    <div>
        <h3>Image Solutions:</h3>
        {imageSolutions.map((base64String, index) => (
            <div key={index}>
                <img 
                    src={`data:image/png;base64,${base64String}`} 
                    alt={`Solution ${index + 1}`} 
                />
            </div>
        ))}
    </div>
)}</div>
)}

                              {/* Displaying video solutions */}


                                    </div>
                                ) : (
                                    <span>No exercise available for this lecture.</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetails; 