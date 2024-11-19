import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams,useNavigate } from 'react-router-dom';
import HeaderMc from '../Headermicrocourses/HeaderMc';
import NavBar from '../Navabar/NavBar';
import './styles/Mycourses.css'
import { GrPrevious } from "react-icons/gr";
import { FaRegPlayCircle } from "react-icons/fa";
import { IoNewspaperSharp } from "react-icons/io5";
import { GrNext } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Pie } from 'react-chartjs-2';
import { FaArrowRight } from "react-icons/fa";
import { IoVideocamOutline } from "react-icons/io5";
import { BsFileText } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, Title);
const CourseDetails = () => {
    const { id, courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
    const [showExercise, setShowExercise] = useState(false);
    const [userAnswer, setUserAnswer] = useState([]);
    const [finalTests, setFinalTests] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [showLectures, setShowLectures] = useState(true);
    const [videoSolutions, setVideoSolutions] = useState([]); // State for video solutions
    const [imageSolutions, setImageSolutions] = useState([]);
    const [answerDisabled, setAnswerDisabled] = useState(false);  // State for image solutions
    const [loading, setLoading] = useState(false);  // For showing a loading state while submitting
    const [error, setError] = useState(null); 
    const navigate = useNavigate();
    const [questionStatuses, setQuestionStatuses] = useState([]); // Array to track the status of each question
 
    const [lastVisitedVideoId, setLastVisitedVideoId] = useState(null);
    const [viewingSolutionForQuestion, setViewingSolutionForQuestion] = useState(null);
    const [accessGranted, setAccessGranted] = useState(null);
    const [percentageforve, setpercentageforve] = useState(null);
    const [visibleinlist, setvisibleinlist] = useState(true);
   
    
    const trackVideoVisit = (videoId) => {
        console.log('Tracking video visit for videoId:', videoId); // Log videoId
    
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
        const checkAccess = async () => {
          try {
            const accessResponse = await axios.get(`http://localhost:5000/microcourses/accessStatus/${id}/${courseId}`);
            setpercentageforve(accessResponse.data)
            if (accessResponse.data.access) {
              setAccessGranted(true); // User has access, now fetch course details
            } else {
              setAccessGranted(false); // User doesn't have access
            }
          } catch (err) {
            setError('Error checking access');
          }
        };
    
        checkAccess();
        
      }, [id, courseId]); 
   
   
        
    useEffect(() => {


        fetchQuestionStatuses();
    }, [id, selectedVideo]);


 

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
        setvisibleinlist(false)
   
    };

    const handleExerciseSelect = (index) => {
        setCurrentExerciseIndex(0); // Reset to the first question of the exercise
        setShowExercise(true);
        setCurrentLectureIndex(index);
        setSelectedVideo(course.videos[index]); // Ensure the selected video is updated
        setShowLectures(false);
        trackVideoVisit(course.videos[index].lectureId);
        setvisibleinlist(false)
   
    };
    const closeSlideshow = () => {
        setSelectedVideo(null);
        setCurrentExerciseIndex(0);
        setCurrentLectureIndex(0);
        setShowExercise(false);
        setShowLectures(true);
        window.location.reload();
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
    useEffect(() => {
        // Automatically post the status when the question or exercise changes
        if (selectedVideo && selectedVideo.exerciseQuestions) {
            const question = selectedVideo.exerciseQuestions[currentExerciseIndex];
            const unitExerciseId = selectedVideo.unitExerciseId;
            if (question) {
                const questionStatus = !answerDisabled ? "notAnswered" : "answered";
                postQuestionStatus(question.excercise_question_Id, questionStatus, unitExerciseId);
            }
        }
    }, [selectedVideo, currentExerciseIndex, userAnswer,answerDisabled]);
   
    const fetchQuestionStatuses = async () => {
        if (selectedVideo && selectedVideo.exerciseQuestions) {
            const unitExerciseId = selectedVideo.unitExerciseId;

            try {
                // Fetch all question statuses for the unit exercise and user
                const response = await axios.get(`http://localhost:5000/microcourses/excerciseQuestionStatusData/${id}/${unitExerciseId}`);
                console.log('Fetched question statuses:', response.data);

                // Initialize an array to store the statuses
                const statuses = selectedVideo.exerciseQuestions.map((question) => {
                    // Find the status for each question
                    const questionStatus = response.data.find(status => status.excercise_question_Id === question.excercise_question_Id);
                    return questionStatus ? questionStatus.question_status : 'NotVisited'; // Default to 'NotVisited' if no status found
                });

                // Update the question statuses state
                setQuestionStatuses(statuses);
                console.log('Updated question statuses:', statuses);
            } catch (err) {
                setError('Error fetching question statuses');
                console.error('Error fetching question statuses:', err);
            }
        }
    };
    const getQuestionCounts = () => {
        const answered = questionStatuses.filter(status => status === 'answered').length;
        const unanswered = questionStatuses.filter(status => status === 'notAnswered').length;
        const unvisited = questionStatuses.filter(status => status === 'NotVisited').length;

        return { answered, unanswered, unvisited };
    };

    const { answered, unanswered, unvisited } = getQuestionCounts();
    // Function to post the status to the server
    const postQuestionStatus = async (exerciseQuestionId, questionStatus, unitExerciseId) => {
        setLoading(true);
        setError(null); // Clear previous error

        try {
            const response = await axios.post('http://localhost:5000/microcourses/excerciseQuestionStatus', {
                userId: id, // replace with actual user ID
                unitExerciseId: selectedVideo.unitExerciseId,
                exerciseQuestionId,
                questionStatus,
            });

            if (response.status === 200) {
                console.log('Question status posted successfully:', response.data);
                fetchQuestionStatuses();
                // setExerciseQuestionStatuses(prevStatuses => {
                //     const updatedStatuses = { ...prevStatuses };
                //     // If the exercise doesn't have any statuses, initialize it as an empty array
                //     if (!updatedStatuses[unitExerciseId]) {
                //         updatedStatuses[unitExerciseId] = [];
                //     }
    
                //     // Get the index of the question in the exercise
                //     const questionIndex = selectedVideo.exerciseQuestions.findIndex(
                //         q => q.excercise_question_Id === exerciseQuestionId
                //     );
                    
                //     // Update the status for the specific question in the exercise
                //     updatedStatuses[unitExerciseId][questionIndex] = questionStatus;
    
                //     return updatedStatuses;
                // });
            }
        } catch (error) {
            console.error('Error posting question status:', error.response ? error.response.data : error);
            setError("Failed to post question status.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionSelect = (index) => {
        setCurrentExerciseIndex(index); // Set the current exercise index when a new question is selected
       
    };

    
    
    const nextQuestion = async () => {
    
        // Move to the next question if it exists
        if (currentExerciseIndex < selectedVideo.exerciseQuestions.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1); // Move to next question
        } else {
            alert("You have completed all questions.");
        }
    
        
    };
    
    const previousQuestion = async () => {
       
    
        // Move to the previous question if it exists
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(currentExerciseIndex - 1); // Move to previous question
        } else {
            alert("This is the first question.");
        }
    
       
    };
    const navigateToQuestion = async (index) => {
     
    
        if (index >= 0 && index < selectedVideo.exerciseQuestions.length) {
            // Use handleQuestionSelect instead of directly setting currentExerciseIndex
            setCurrentExerciseIndex(index);
        }
      
    };

    const nextLecture = (index) => {
        // Ensure we're accessing the correct video from the `course.videos` array
        if (currentLectureIndex < course.videos.length - 1) {
        const  nextlect = currentLectureIndex + 1;
            handleVideoSelect(currentLectureIndex + 1);
          
           
        } else {
            alert("You are already on the last lecture.");
        }
    };
    
    const previousLectureOrExercise = (index) => {
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

const viewSolution = () => {
    setViewingSolutionForQuestion(currentExerciseIndex);
};
const closeSolutionModal = () => {
    setViewingSolutionForQuestion(null); // Close the modal
};
const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (userAnswer === '') {
        alert("Please enter an answer.");
        return;
    }
  
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
                            setFeedback(""); 
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
const handleStartTest = (finalTest) => {
  
    const finalTestId = finalTest.micro_couse_final_test_Id;
  
     navigate(`/Finaltestinstuctions/${id}/${courseId}/${finalTestId}`);
}
useEffect(() => {
    const fetchFinalTests = async () => {
      try {
        // Make a GET request to the backend API
        const response = await axios.get(`http://localhost:5000/finalTest/finalexampattern/${id}/${courseId}`);
       

        // Set the response data (final tests) to the state
        setFinalTests(response.data); 
      } catch (err) {
        // Set an error message if the API request fails
        setError('Error fetching final tests');
      } finally {
        // Set loading to false when the data is fetched
        setLoading(false);
      }
    };

    // Call the function to fetch the data
    fetchFinalTests();
  }, [id]); 
const calculatePercentage = (answeredQuestions, totalQuestions) => {
    if (answeredQuestions && totalQuestions) {
        return ((answeredQuestions / totalQuestions) * 100).toFixed(2);
    }
    return "0.00"; // Return 0.00 if no answeredQuestions or totalQuestions
};
    return (
<div className='Course_Details_container'>

        <div>
            <HeaderMc />           
            <NavBar userId={id} />
            <div className='userInterfaceMainCon'>
                {course && (
                    <div className='Course_Details_main_container'>
                        <div className='Course_Deatils_Heading_container'>

                        <h1 className="h1mid">{course.courseName}</h1>
                        <p>percentage{percentageforve.totalCompletionPercentage}</p>

                        </div>

      <ul className="ullecturesshow">
        {showLectures && course.videos.map((video, index) => {
          
          // Find the corresponding video count based on the video.lectureId (unit ID)
          const videoUnitData = percentageforve.videoCount.find(item => item.unit === video.lectureId);
          const currentVideoCount = videoUnitData ? videoUnitData.videoCount : 0;

          // Find exercise details for the current video (assuming exerciseDetails is aligned by index)
          const exerciseDetail = percentageforve.exerciseDetails?.[index];
          const percentage = exerciseDetail
            ? calculatePercentage(exerciseDetail.answeredQuestions, exerciseDetail.totalQuestions)
            : 0;

          return (
            <li key={video.lectureId} className="lecturesshow">
              
              {/* Video Section */}
              <div onClick={() => handleVideoSelect(index)} className="videoexcercise">
              <div className='videoexcerciseSUB'> {video.lectureName}
              <span className="video-count">
              <IoVideocamOutline />   {`Count:${currentVideoCount}`}

                </span>
                </div> 
                {/* Show Video Count dynamically */}
                <span><FaArrowRight /></span>
              </div>

              {/* Exercise Section */}
              <div onClick={() => handleExerciseSelect(index)} className="videoexcercise">
              <div className='videoexcerciseSUB'>  {video.unitExerciseName}
              <span className="exercise-percentage">
              <BsFileText /> Excercise:{exerciseDetail.answeredQuestions}/{exerciseDetail.totalQuestions}
                </span>
                </div> 

                <span><FaArrowRight /></span>
              
              </div>
     
            </li>
          );
        })}
       {visibleinlist && finalTests.map((test) => (
  <div key={test.micro_couse_final_test_Id} className="videoexcercise">
    <span className='examtxt'>{test.final_test_name}</span>

    {accessGranted ? (
      <button 
        onClick={() => handleStartTest(test)}
        className="btnStart"
        disabled={!accessGranted}
      >
        Start Test
      </button>
    ) : (
      <p>You do not have access to this test.</p>
    )}
  </div>
))}


      </ul>


      
                        {selectedVideo && !showExercise && (
                            
                            <div className="slideshow">
                                <div className='SlideShow_Heading_container'>
                                 
                                <h2 className='Selected_heading_course_name'>{selectedVideo.lectureName}</h2>
                                </div>
                                <div className='containerclose'> <button className='btnclose' onClick={closeSlideshow}><IoClose /></button></div> 
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
                            <div className="slideshow">
                                
                                {selectedVideo.exerciseQuestions.length > 0 ? (
                                    <div>
                                                                        <div className='SlideShow_Heading_container'>
                                       <h2 className='Selected_heading_course_name'>{selectedVideo.unitExerciseName}</h2> 
                                       </div>
                                     <div className='containerclose'> <button className='btnclose' onClick={closeSlideshow}><IoClose /></button></div> 
                                       
                                        <div className="navigation-buttons">
                                        <button  className='btnpreviousnxt' onClick={previousLectureOrExercise} disabled={currentLectureIndex ===-1}><GrPrevious /></button>
                                        <div  className='iframevideoplay excerciseques'>
                                        
                                        <div className='palate-ques-flex'>
                                        <div className="ques-number-palette">
                                      <div className='quesno-quesimg-flex'> <h4>{selectedVideo.exerciseQuestions[currentExerciseIndex]?.sortids[0]?.eq_sort_text}. {selectedVideo.exerciseQuestions[currentExerciseIndex]?.question_Text}</h4>
                                        {selectedVideo.exerciseQuestions[currentExerciseIndex]?.question_Image_Name && (
                                            
                                            <img src={`data:image/jpeg;base64,${selectedVideo.exerciseQuestions[currentExerciseIndex].question_Image_Name}`} alt={`Question ${currentExerciseIndex + 1}`} />
                                        )}</div> 
                                        <form onSubmit={handleSubmitAnswer} className='formforques'>
                                            
                                        {selectedVideo.exerciseQuestions[currentExerciseIndex].question_type === 'NAT' ? (
                                      <div><input
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
                                     <div>                      
                                        
                                              <div className="number-palette">
                                    {selectedVideo.exerciseQuestions.map((question, index) => (
                                            
                                            
                                        <button
                                        key={question.excercise_question_Id}
                                        onClick={() =>navigateToQuestion(index)}
                                        className={`number-plate ${questionStatuses[index]}`}
                                    >
                                        {index + 1}
                                    </button>
                                    ))}
                                </div>
                                <div className="legend">
                        <h3>Legend for Question Status</h3>
                        <ul className='ulcolor-box'>
        <li><span className="color-box NotAnswered">{unanswered}</span>Not Answered</li>
        <li><span className="color-box Answered">{answered}</span>  Answered</li>
        <li><span className="color-box Notvisted">{unvisited}</span>  Not Visited</li>
             </ul>
                </div>
                                </div>

                                        </div>
                                        
                                
                            </div>
                            
                                            <button  className='btnpreviousnxt' onClick={nextLecture}>
                                            <GrNext />
                                            </button>
                                           
                                        </div>
                                   {viewingSolutionForQuestion === currentExerciseIndex &&(
                                                                        <div className="modal-overlay" >
        <div className="modal-content" >  
                                     <div>

            <button className="modal-close-btn" onClick={closeSolutionModal}><IoMdClose /></button>
                                        {videoSolutions.length > 0 && (
                                            <div>
                                                <div className='vidsolhead'>Video Solution</div>
                                                {videoSolutions.map((solution, index) => (
                                                    <div className='Video_Solutions' key={index}>
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
        <div  className='vidsolhead'>Image Solution</div>
        {imageSolutions.map((base64String, index) => (
            <div key={index}>
                <img 
                    src={`data:image/png;base64,${base64String}`} 
                    alt={`Solution ${index + 1}`} 
                />
            </div>
        ))}
    </div>
)}</div></div></div>
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

        </div>
    );                                      
};      
                    
export default CourseDetails; 
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';
// import HeaderMc from '../Headermicrocourses/HeaderMc';
// import NavBar from '../Navabar/NavBar';
// import './styles/Mycourses.css'
// import { GrPrevious } from "react-icons/gr";
// import { FaRegPlayCircle } from "react-icons/fa";
// import { IoNewspaperSharp } from "react-icons/io5";
// import { GrNext } from "react-icons/gr";

// const CourseDetails = () => {
//     const { id, courseId } = useParams();
//     const [course, setCourse] = useState(null);
//     const [selectedVideo, setSelectedVideo] = useState(null);
//     const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
//     const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
//     const [showExercise, setShowExercise] = useState(false);
//     const [userAnswer, setUserAnswer] = useState([]);
//     const [feedback, setFeedback] = useState('');
//     const [showLectures, setShowLectures] = useState(true);
//     const [videoSolutions, setVideoSolutions] = useState([]); // State for video solutions
//     const [imageSolutions, setImageSolutions] = useState([]);
//     const [answerDisabled, setAnswerDisabled] = useState(false);  // State for image solutions

//     const [lastVisitedVideoId, setLastVisitedVideoId] = useState(null);
//     const [viewingSolutionForQuestion, setViewingSolutionForQuestion] = useState(null);

    
    
    

//     // Track video visit using the state variable for visit tracking
//     const trackVideoVisit = (videoId) => {
//         if (lastVisitedVideoId !== videoId) {
//             setLastVisitedVideoId(videoId);
//             // Make POST request to track the video visit
//             axios.post('http://localhost:5000/microcourses/video_visit', {
//                 userId: id,
//                 courseCreationId: courseId,
//                 unitId: videoId
//             }).catch((error) => {
//                 console.error('Error tracking video visit:', error);
//             });
//         }
//     };
//     const trackQuestionVisit = (unitExerciseId, exerciseQuestionId, answerStatus) => {
//         axios.post('http://localhost:5000/microcourses/updateAnswerStatus', {
//             userId: id,
//             unitExerciseId,
//             exerciseQuestionId,
//             answerStatus
//         }).catch((error) => {
//             console.error('Error tracking question visit:', error);
//         });
//     };
 
//     useEffect(() => {
//         const fetchCourseDetails = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:5000/microcourses/my_courses/course_details/${id}/${courseId}`);
//                 setCourse(response.data);
//                 if (response.data.videos.length > 0) {
//                     setSelectedVideo(response.data.videos[null]);
//                 }
//             } catch (error) {
//                 console.error('Error fetching course details:', error);
//             }
//         };

//         fetchCourseDetails();
//     }, [id, courseId]);

//     const handleVideoSelect = (index) => {
//         setCurrentLectureIndex(index);
//         setSelectedVideo(course.videos[index]);
//         setCurrentExerciseIndex(0);
//         setShowExercise(false);
//         setShowLectures(false);
//         trackVideoVisit(course.videos[index].lectureId);
        
     
        
//     };

//     const handleExerciseSelect = (index) => {
//         setCurrentExerciseIndex(0); // Reset to the first question of the exercise
//         setShowExercise(true);
//         setCurrentLectureIndex(index);
//         setSelectedVideo(course.videos[index]); // Ensure the selected video is updated
//         setShowLectures(false);
//         trackVideoVisit(course.videos[index].lectureId);
      
//     };
//     const closeSlideshow = () => {
//         setSelectedVideo(null);
//         setCurrentExerciseIndex(0);
//         setCurrentLectureIndex(0);
//         setShowExercise(false);
//         setShowLectures(true);
//     };

//     const getYouTubeEmbedUrl = (videoLink) => {
//         let embedUrl = videoLink;
//         if (videoLink.includes('youtube.com/watch?v=')) {
//             const vidId = new URL(videoLink).searchParams.get('v');
//             embedUrl = `https://www.youtube.com/embed/${vidId}`;
//         } else if (videoLink.includes('youtu.be/')) {
//             const vidId = videoLink.split('/').pop();
//             embedUrl = `https://www.youtube.com/embed/${vidId}`;
//         }
//         return embedUrl;
//     };

//     const nextQuestion = () => {
//         const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id;
//         if (currentExerciseIndex < selectedVideo.exerciseQuestions.length - 1) {
//             setCurrentExerciseIndex(currentExerciseIndex + 1);
//            trackQuestionVisit(selectedVideo.unitExerciseId, exerciseQuestionId, 0)
          
//         } else {
//             alert("You have completed all questions.");
//         }
//     };
//     const previousQuestion = ( ) => {
//         const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id;
//         if (currentExerciseIndex > 0) { // Change this condition
//             setCurrentExerciseIndex(currentExerciseIndex - 1);
//            trackQuestionVisit(selectedVideo.unitExerciseId, exerciseQuestionId, 0)
            
//         } else {
//             alert("This is the first question.");
//         }
//     };
    
//     const navigateToQuestion = (index) => {
//         const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id;
//         if (index >= 0 && index < selectedVideo.exerciseQuestions.length) {
//             setCurrentExerciseIndex(index);
//            trackQuestionVisit(selectedVideo.unitExerciseId, exerciseQuestionId, 0)
            
//         }
//     };
//     const nextLecture = () => {
//         // Ensure we're accessing the correct video from the `course.videos` array
//         if (currentLectureIndex < course.videos.length - 1) {
         
//             handleVideoSelect(currentLectureIndex + 1);
           
//         } else {
//             alert("You are already on the last lecture.");
//         }
//     };
    
//     const previousLectureOrExercise = () => {
//         if (showExercise) {
//             // If currently showing exercise, go back to the current lecture
//             setShowExercise(false); // This will go back to the video of the current lecture
//         } else {
            
//             // If currently showing lecture, navigate to previous lecture's exercise
//             if (currentLectureIndex === 0) {
//                 // If on the first lecture, stay on it
//                 alert("You are already on the first lecture.");
//             } else {
//                 const previousIndex = currentLectureIndex - 1;
//                 handleVideoSelect(previousIndex); // Select the previous lecture
//                 setShowExercise(true); // Show the exercise for that lecture
//             }
//         }
      
//     };
    
//     useEffect(() => {
//      // Inside the fetchUserAnswerAndSolutions function
// const fetchUserAnswerAndSolutions = async () => {
//     if (selectedVideo) {
//         const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id;

//         try {
//             const response = await axios.get(`http://localhost:5000/microcourses/userAnswer/${id}/${exerciseQuestionId}`);
//             if (response.data.success) {
//                 setUserAnswer(response.data.previousResponse || '');
                
//                 setVideoSolutions(response.data.videoSolutions || []);
//                 setImageSolutions(response.data.imageSolutions || []);
         
//                 // Set feedback based on correctness
//                 if (response.data.isCorrect !== null) {
//                     setFeedback(response.data.isCorrect ? `Correct answer!`: `Incorrect answer. The correct answer is: ${response.data.correctAnswer}`);
//                 } else {
//                     setFeedback(""); 
//                 }
//                 if (response.data.previousResponse !== null) {
//                     setAnswerDisabled(true);  
//                 } else {
//                     setAnswerDisabled(false); 
//                 }
                
//             }
//         } catch (error) {
//             console.error('Error fetching user answer and solutions:', error);
//         }
//     }
// };

//         fetchUserAnswerAndSolutions();
//     }, [selectedVideo, currentExerciseIndex]); // Dependencies include currentExerciseIndex
    
    
    
// //    const handleSubmitAnswer = async (e) => {
// //         e.preventDefault(); // Prevent the form from refreshing the page

// //         if (!userAnswer) {
// //             alert("Please enter an answer.");
// //             return;
// //         }

// //         const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id; // Adjusted for proper ID

// //         try {
// //             const response = await axios.post('http://localhost:5000/microcourses/submitAnswer', {
// //                 userId: id,
// //                 unitExerciseId: selectedVideo.unitExerciseId,
// //                 exerciseQuestionId,
// //                 userAnswer
// //             });
// //             const fetchUserAnswerAndSolutions = async () => {
// //                 if (selectedVideo) {
// //                     const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id;
            
// //                     try {
// //                         const response = await axios.get(`http://localhost:5000/microcourses/userAnswer/${id}/${exerciseQuestionId}`);
// //                         if (response.data.success) {
// //                             setUserAnswer(response.data.previousResponse || '');
// //                             setVideoSolutions(response.data.videoSolutions || []);
// //                             setImageSolutions(response.data.imageSolutions || []);
                            
// //                             // Set feedback based on correctness
// //                             if (response.data.isCorrect !== null) {
// //                                 setFeedback(response.data.isCorrect ? "Correct answer!" : `Incorrect answer. The correct answer is: ${response.data.correctAnswer}`);
// //                             } else {
// //                                 setFeedback(""); // Reset feedback if no answer given
// //                             }
// //                         }
// //                     } catch (error) {
// //                         console.error('Error fetching user answer and solutions:', error);
// //                     }
// //                 }
// //             };
// //             fetchUserAnswerAndSolutions();
// //             // Check the response for correctness
// //             if (response.data.correct) {
// //                 setFeedback("Correct answer!");
// //             } else {
// //                 setFeedback("Wrong answer. The correct answer is: " + response.data.correctAnswer);
// //             }
// //         } catch (error) {
// //             console.error('Error submitting answer:', error);
// //         }
// //     };
// const viewSolution = () => {
//     setViewingSolutionForQuestion(currentExerciseIndex);
// };

// const handleSubmitAnswer = async (e) => {
//     e.preventDefault();
//     // if (userAnswer.trim() === '') {
//     //     alert("Please enter an answer.");
//     //     return;
//     // }
  
//     const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id;

//     try {
//         const response = await axios.post('http://localhost:5000/microcourses/submitAnswer', {
//             userId: id,
//             unitExerciseId: selectedVideo.unitExerciseId,
//             exerciseQuestionId,
//             userAnswer: [userAnswer] // Send as an array for consistency
//         });

//         trackQuestionVisit(selectedVideo.unitExerciseId, exerciseQuestionId, 1);

//         const fetchUserAnswerAndSolutions = async () => {
//             if (selectedVideo) {
//                 const exerciseQuestionId = selectedVideo.exerciseQuestions[currentExerciseIndex]?.excercise_question_Id;
        
//                 try {
                   
//                     const response = await axios.get(`http://localhost:5000/microcourses/userAnswer/${id}/${exerciseQuestionId}`);
//                     if (response.data.success) {
//                         setUserAnswer(response.data.previousResponse || '');
//                         setVideoSolutions(response.data.videoSolutions || []);
//                         setImageSolutions(response.data.imageSolutions || []);
                        
//                         // Set feedback based on correctness
//                         if (response.data.isCorrect !== null) {
//                             setFeedback(response.data.isCorrect ? `Correct answer!` : `Incorrect answer. The correct answer is: ${response.data.correctAnswer}`);
//                         } else {
//                             setFeedback(""); // Reset feedback if no answer given
//                         }
//                         setAnswerDisabled(true);
//                     }
                   
//                 } catch (error) {
//                     console.error('Error fetching user answer and solutions:', error);
//                 }
//             }
//         };
        
//                 fetchUserAnswerAndSolutions();
//         if (response.data.correct) {
//             setFeedback("Correct answer!");
//         } else {
//             setFeedback("Wrong answer. The correct answer is: " + response.data.correctAnswer);
//         }
//     } catch (error) {
//         console.error('Error submitting answer:', error);
//     }
// };

// const renderOptions = (question) => {
//     return question.options.map(option => (
//         <div key={option.id}>
//             {question.question_type === 'MCQ' ? (
//                 <label>
//                     ({option.index})
//                     <input
//                         type="radio"
//                         value={option.id}
//                         checked={userAnswer.includes(option.id)}
//                         disabled={answerDisabled}
//                         onChange={() => {
//                             setUserAnswer([option.id]); // Set single answer for MCQ
//                         }}
//                     />
//                     {option.index && <img src={`data:image/jpeg;base64,${option.img}`} alt={option.index} />}
//                     {/* Display option text or index if necessary */}
//                 </label>
//             ) : (
//                 <label>
//                     ({option.index})
//                     <input
//                         type="checkbox"
//                         value={option.id}
//                         checked={userAnswer.includes(option.id)}
//                         disabled={answerDisabled}
//                         onChange={() => {
//                             if (userAnswer.includes(option.id)) {
//                                 setUserAnswer(userAnswer.filter(id => id !== option.id));
//                             } else {
//                                 setUserAnswer([...userAnswer, option.id]);
//                             }
//                         }}
//                     />
//                     {option.index && <img src={`data:image/jpeg;base64,${option.img}`} alt={option.index} />}
                     
//                 </label>
//             )}
//         </div>
//     ));
// };

//     return (
//         <div>
//             <HeaderMc />           
            
//             <NavBar userId={id} />
//             <div className='userInterfaceMainCon'>
//                 {course && (
//                     <div>
//                         <h1 className='h1mid'>{course.courseName}</h1>
                       
//                         <ul className='ullecturesshow'>
//                             {showLectures && course.videos.map((video, index) => (
//                                 <li key={video.lectureId} className='lecturesshow'>
//                                     <div onClick={() => handleVideoSelect(index)}>
//                                         {video.lectureName}<FaRegPlayCircle className='videxamicon' />
//                                     </div>
//                                     <div onClick={() => handleExerciseSelect(index)}>
//                                         {video.unitExerciseName}<IoNewspaperSharp className='videxamicon' />
//                                     </div>
//                                 </li>
//                             ))}
//                         </ul>

//                         {selectedVideo && !showExercise && (
                            
//                             <div className="slideshow">
                                 
//                                 <h2 className='h1mid'>{selectedVideo.lectureName}</h2>
//                                 <div className='containerclose'> <button className='btnclose' onClick={closeSlideshow}>Close</button></div> 
//                                 <div className="navigation-buttons">
//                                 <button className='btnpreviousnxt' onClick={previousLectureOrExercise} disabled={currentLectureIndex === 0}>
//                                         {showExercise ? <GrPrevious />: <GrPrevious />}
//                                     </button>
//                                     <div>
//                                 <iframe
//                                   className='iframevideoplay'
//                                     src={getYouTubeEmbedUrl(selectedVideo.videoLink)}
//                                     title={selectedVideo.lectureName}
//                                     frameBorder="0"
//                                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                                     allowFullScreen
//                                     onError={() => {
//                                         alert('Failed to load the video. Please try again later.');
//                                     }}
//                                 ></iframe>
//                                </div>
                               
                            
//                                     <button  className='btnpreviousnxt' onClick={() => { setShowExercise(true); }}><GrNext /></button>
//                                 </div>
//                             </div>
//                         )}

//                         {showExercise && (
//                             <div className="exercise-questions">
                                
//                                 {selectedVideo.exerciseQuestions.length > 0 ? (
//                                     <div>
//                                        <h2 className='h1mid'>{selectedVideo.unitExerciseName}</h2> 
//                                      <div className='containerclose'> <button className='btnclose' onClick={closeSlideshow}>Close</button></div> 
                                       
//                                         <div className="navigation-buttons">
//                                         <button  className='btnpreviousnxt' onClick={previousLectureOrExercise} disabled={currentLectureIndex ===-1}><GrPrevious /></button>
//                                         <div  className='iframevideoplay excerciseques'>
                                        
//                                         <div className='palate-ques-flex'>
//                                         <div className="ques-number-palette">
//                                       <div className='quesno-quesimg-flex'> <h4>{currentExerciseIndex + 1}. {selectedVideo.exerciseQuestions[currentExerciseIndex]?.question_Text}</h4>
//                                         {selectedVideo.exerciseQuestions[currentExerciseIndex]?.question_Image_Name && (
                                            
//                                             <img src={`data:image/jpeg;base64,${selectedVideo.exerciseQuestions[currentExerciseIndex].question_Image_Name}`} alt={`Question ${currentExerciseIndex + 1}`} />
//                                         )}</div> 
//                                         <form onSubmit={handleSubmitAnswer} className='formforques'>
//                                         {selectedVideo.exerciseQuestions[currentExerciseIndex].question_type === 'NAT' ? (
//                                       <div>Enter Answer: <input
//                                             type="text"
//                                             value={userAnswer}
//                                             onChange={(e) => setUserAnswer(e.target.value)}
//                                             placeholder="Enter your answer"
//                                             disabled={answerDisabled}
//                                             className='InpBoxAns'
//                                         /></div>
//                                     ) : (
//                                         renderOptions(selectedVideo.exerciseQuestions[currentExerciseIndex])
//                                     )}
// {feedback && <div>{feedback}</div>}
//                                             <div className='navigation-buttons'>
//                                             <div onClick={previousQuestion} className='btnnxtques'>
//                                                 Previous Question
//                                             </div>   {!answerDisabled && (   <button type ="submit" className=' viewsolsubmit' >Submit</button>)}
//                                             {answerDisabled &&( <div>
//                                                 <div onClick={viewSolution} className='viewsolsubmit' >View Solution</div>
//                                             </div>)}
//                                             <div onClick={nextQuestion} className='btnnxtques'>
//                                                 Next Question
//                                             </div></div>
//                                 </form>
                                       
//                                         </div>
//                                         <div className="number-palette">
//                                             {selectedVideo.exerciseQuestions.map((_, index) => (
//                                                 <button 
//                                                     key={index} 
//                                                     onClick={() => navigateToQuestion(index)} 
//                                                     className={currentExerciseIndex === index ? 'active' : `notactive${feedback!=null ?  `answered` :``} `} // Highlight active question
                                                    
//                                                 >
//                                                     {index + 1}
//                                                 </button>

//                                             ))}
//                                         </div></div>
                                
//                             </div>
                            
//                                             <button  className='btnpreviousnxt' onClick={nextLecture}>
//                                             <GrNext />
//                                             </button>
                                           
//                                         </div>
//                                    {viewingSolutionForQuestion === currentExerciseIndex &&(   <div>
//                                         {videoSolutions.length > 0 && (
//                                             <div>
//                                                 <h3>Video Solutions:</h3>
//                                                 {videoSolutions.map((solution, index) => (
//                                                     <div key={index}>
//                                                         <iframe
//                                                             width="560"
//                                                             height="315"
//                                                             src={getYouTubeEmbedUrl(solution.excercise_solution_link)}
//                                                             title={`Video Solution ${index + 1}`}
//                                                             frameBorder="0"
//                                                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                                                             allowFullScreen
//                                                         />
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}

//                                         {/* Displaying image solutions */}
//                                         {imageSolutions.length > 0 && (
//     <div>
//         <h3>Image Solutions:</h3>
//         {imageSolutions.map((base64String, index) => (
//             <div key={index}>
//                 <img 
//                     src={`data:image/png;base64,${base64String}`} 
//                     alt={`Solution ${index + 1}`} 
//                 />
//             </div>
//         ))}
//     </div>
// )}</div>
// )}

//                               {/* Displaying video solutions */}


//                                     </div>
//                                 ) : (
//                                     <span>No exercise available for this lecture.</span>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default CourseDetails; 