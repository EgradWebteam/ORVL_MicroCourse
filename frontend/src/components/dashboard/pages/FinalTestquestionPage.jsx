import React, { useState, useEffect } from 'react';
import HeaderMc from '../Headermicrocourses/HeaderMc';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/styles/FinalTest.css';
import profilepicture from './Images/profilephoto.jpg';


const FinalTestquestionPage = () => {
    const [examDetails, setExamDetails] = useState({});
    const [answers, setAnswers] = useState({});
    const [tempAnswer, setTempAnswer] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);  // Track the current question index
    const [visitedQuestions, setVisitedQuestions] = useState([]);  // Track visited questions
    const [answeredQuestions, setAnsweredQuestions] = useState([]);
    const { id, finalTestId, courseId } = useParams();
      const [timer, setTimer] = useState(); 
    const [isTimeOver, setIsTimeOver] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch questions data from the backend
        const fetchExamDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/finalTest/FinalTestquestionPage/${id}/${courseId}/${finalTestId}`);
                console.log('Exam details:', response.data);
                setExamDetails(response.data);
                const examTimeInMinutes = response.data.ExamTime;
                const examTimeInSeconds = examTimeInMinutes * 60;
                setTimer(examTimeInSeconds)
                if (response.data?.test?.[0]?.finalQuestions?.length > 0) {
                    markAsVisited(response.data.test[0].finalQuestions[0].finalTest_question_Id);
                }
            } catch (error) {
                console.error('Error fetching exam details:', error);
            }
        };

        fetchExamDetails();
    }, [id, courseId, finalTestId]);
    useEffect(() => {
        if (timer === 0) {
            alert("Your time is over. The test is being submitted now.");
            handleSubmit(true); // Submit the test when the timer hits 0
        } else {
            const countdown = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(countdown); // Stop the countdown when time is over
                        setIsTimeOver(true); // Set time over flag
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            return () => clearInterval(countdown); // Cleanup interval on component unmount
        }
    }, [timer]);
    // const handleAnswerChange = (questionId, value) => {
    //     setAnswers((prevAnswers) => ({
    //         ...prevAnswers,
    //         [questionId]: value,
    //     }));
    // };
    const handleAnswerChange = (questionId, value) => {
        setTempAnswer((prevTempAnswer) => ({
            ...prevTempAnswer,
            [questionId]: value,
        }));
    };
    const saveAnswerAndGoToNext = () => {
        // Ensure the current question's answer is valid before proceeding
        const currentAnswer = tempAnswer[currentQuestion.finalTest_question_Id];
    
        if (currentQuestion.finaltest_questiontype === 'NAT' && (!currentAnswer || currentAnswer.trim() === '')) {
            // For NAT (Natural) type, check if the answer is empty (trimmed string)
            alert("Please answer the current question before proceeding.");
            return;
        }
    
        if (currentQuestion.finaltest_questiontype !== 'NAT' && (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0))) {
            // For MCQ or MSQ, check if the answer is not selected (empty array for MSQ)
            alert("Please answer the current question before proceeding.");
            return;
        }
    
        // Save the current tempAnswer to answers
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [currentQuestion.finalTest_question_Id]: currentAnswer,
        }));
    
        // If it's answered for the first time, add it to answeredQuestions
        if (!answeredQuestions.includes(currentQuestion.finalTest_question_Id)) {
            setAnsweredQuestions((prevAnswered) => [...prevAnswered, currentQuestion.finalTest_question_Id]);
        }
    
        goToNextQuestion(); // Go to the next question after saving
    };
    
    // const saveAnswerAndGoToNext = () => {
    //     if (!tempAnswer[currentQuestion.finalTest_question_Id] || tempAnswer[currentQuestion.finalTest_question_Id].trim() === '') {
    //         alert("Please answer the current question before proceeding."); // Show alert if answer is empty
    //         return; // Stop further execution
    //     }
    //     // Save the current tempAnswer to answers
    //     setAnswers((prevAnswers) => ({
    //         ...prevAnswers,
    //         [currentQuestion.finalTest_question_Id]: tempAnswer[currentQuestion.finalTest_question_Id], // Save the answer when navigating
    //     }));
    //     if (!answeredQuestions.includes(currentQuestion.finalTest_question_Id)) {
    //         setAnsweredQuestions((prevAnswered) => [...prevAnswered, currentQuestion.finalTest_question_Id]);
    //     }

    //     goToNextQuestion(); // Go to the next question after saving
    // };
    const handleSubmit = async (isAutoSubmit = false) => {
      
        if (!isAutoSubmit) {
            // Only ask for confirmation when it's a manual submit
            const confirmSubmit = window.confirm("Are you sure you want to submit the test?");
            if (!confirmSubmit) {
                return;  // Exit the function if user clicks "No"
            }
        }
       
        try {
            const response = await axios.post('http://localhost:5000/finalTest/submitAnswers', {
                userId: id, // You will need to replace this with the actual user ID
                courseCreationId: courseId, // Same for this
                micro_course_final_test_Id: finalTestId, // Same for this
                answers,
            });
            console.log('Answers submitted successfully:', response.data);
            const totalTimeInSeconds = examDetails?.ExamTime * 60;
            navigate(`/TestResults/${id}/${courseId}/${finalTestId}`, {
                state: { answered, unanswered, unvisited,totalTime:totalTimeInSeconds, // The total exam time in minutes
                    timeLeft: timer,},
            }); // Redirect after submission
        } catch (error) {
            console.error('Error submitting answers:', error);
        }
    };


    // Ensure the data exists and is an array before mapping
    const test = examDetails?.test?.[0]?.finalQuestions || [];

    const currentQuestion = test[currentIndex] || {};  // Get the current question based on the index

    const goToNextQuestion = () => {
        if (currentIndex < test.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(currentIndex + 1);
            markAsVisited(test[nextIndex].finalTest_question_Id);
        }
    };

    const goToPreviousQuestion = () => {
        
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(currentIndex - 1);
            markAsVisited(test[prevIndex].finalTest_question_Id);
        }
    };

    const goToQuestion = (index) => {
        setCurrentIndex(index);
        markAsVisited(test[index].finalTest_question_Id);
        
        
    };
    const markAsVisited = (questionId) => {
        if (!visitedQuestions.includes(questionId)) {
            setVisitedQuestions((prevVisited) => [...prevVisited, questionId]);
        }
    };
    // const handleClearResponse = () => {
    //     const currentQuestionId = currentQuestion.finalTest_question_Id;
    
    //     // Clear the tempAnswer for the current question
    //     setTempAnswer((prevTempAnswer) => {
    //         const newTempAnswer = { ...prevTempAnswer };
    //         delete newTempAnswer[currentQuestionId]; // Delete the current question's answer
    //         return newTempAnswer;
    //     });
    
    //     // Remove the answer from 'answers' if it exists for the current question
    //     setAnswers((prevAnswers) => {
    //         const newAnswers = { ...prevAnswers };
    //         delete newAnswers[currentQuestionId]; // Delete the current question's final answer
    //         return newAnswers;
    //     });
    // };
    const handleClearResponse = () => {
        const currentQuestionId = currentQuestion.finalTest_question_Id;
    
        // Clear the tempAnswer for the current question
        setTempAnswer((prevTempAnswer) => {
            const newTempAnswer = { ...prevTempAnswer };
            delete newTempAnswer[currentQuestionId]; // Remove the current question's answer
            return newTempAnswer;
        });
    
        // Clear the saved final answer for the current question
        setAnswers((prevAnswers) => {
            const newAnswers = { ...prevAnswers };
            delete newAnswers[currentQuestionId]; // Remove the answer from 'answers'
            return newAnswers;
        });
    
        // Update the answeredQuestions state to mark this question as unanswered
        setAnsweredQuestions((prevAnswered) => {
            return prevAnswered.filter((questionId) => questionId !== currentQuestionId);
        });
    
        // Mark the question as unanswered by adding it to visitedQuestions but not answered
        if (!visitedQuestions.includes(currentQuestionId)) {
            setVisitedQuestions((prevVisited) => [...prevVisited, currentQuestionId]);
        }
    };
    
    const getQuestionCounts = () => {
        const answered = answeredQuestions.length;
        const unanswered = visitedQuestions.length - answered-1;
        const unvisited = test.length - visitedQuestions.length+1;

        return { answered, unanswered, unvisited };
    };
    const getFormattedTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const { answered, unanswered, unvisited } = getQuestionCounts();
    return (
        <div>
            <HeaderMc />
            {examDetails.courseName && (
               <div className='examnamecontainer'><h1 className='examnameh1'>{examDetails.ExamName}</h1></div> 
            )}
            {test.length > 0 ? (

                <div className='flexcolumforpaleques'>
                    
                    <div   key={currentQuestion.finalTest_question_Id} className='exampart'>
                        <div  className='EXAMPART1'><h4>Question Type: {currentQuestion.finaltest_questiontype}</h4>
                        <div className='timeleft'>Time Left : {isTimeOver ? '00:00:00' : getFormattedTime(timer)}</div></div>
                    <div className='subexampart'>
                    {/* Display the current question */}
                    <div className='questioninput'>
                        <h2>Question {currentQuestion.sortIds && currentQuestion.sortIds[0]?.finalTest_question_sortId_text}</h2>
                        {currentQuestion.final_test_questionImg && (
                           <div className='question1mgcontainer'> <img
                                src={`data:image/png;base64,${currentQuestion.final_test_questionImg}`}
                                alt={`Question ${currentQuestion.finalTest_question_Id}`}
                            /></div>
                        )}
                        {/* Render options or input fields based on the question type */}
                        {currentQuestion.finaltest_questiontype === 'MCQ' ? (
    <div>
        {currentQuestion.options && currentQuestion.options.map((option) => (
            <div key={option.id}>
                <input
                    type="radio"
                    name={`question-${currentQuestion.finalTest_question_Id}`}
                    value={option.index}
                    onChange={() => handleAnswerChange(currentQuestion.finalTest_question_Id, option.index)}  // Send option.id directly
                    // checked={answers[currentQuestion.finalTest_question_Id] === option.index}
                    checked={tempAnswer[currentQuestion.finalTest_question_Id] === option.index}
                />
                <img src={`data:image/png;base64,${option.img}`} alt={`Option ${option.index}`} />
            </div>
        ))}
    </div>
) : currentQuestion.finaltest_questiontype === 'MSQ' ? (
    <div>
        {currentQuestion.options && currentQuestion.options.map((option) => (
            <div key={option.id}>
                <input
                    type="checkbox"
                    name={`question-${currentQuestion.finalTest_question_Id}`}
                    value={option.index}
                    // onChange={(e) => {
                    //     const newAnswers = { ...answers };
                    //     // Handle MSQ, where multiple answers can be selected
                    //     if (e.target.checked) {
                    //         if (!newAnswers[currentQuestion.finalTest_question_Id]) {
                    //             newAnswers[currentQuestion.finalTest_question_Id] = [];
                    //         }
                    //         newAnswers[currentQuestion.finalTest_question_Id].push(option.index);  // Save option.id directly
                    //     } else {
                    //         newAnswers[currentQuestion.finalTest_question_Id] = newAnswers[currentQuestion.finalTest_question_Id]?.filter((index) =>index !== option.index);
                    //     }
                    //     setAnswers(newAnswers);
                    // }}
                    // checked={answers[currentQuestion.finalTest_question_Id]?.includes(option.index)}  // Ensure the checkbox is checked if the answer is selected
                    onChange={(e) => {
                        const newTempAnswer = { ...tempAnswer };
                        if (e.target.checked) {
                            if (!newTempAnswer[currentQuestion.finalTest_question_Id]) {
                                newTempAnswer[currentQuestion.finalTest_question_Id] = [];
                            }
                            newTempAnswer[currentQuestion.finalTest_question_Id].push(option.index);
                        } else {
                            newTempAnswer[currentQuestion.finalTest_question_Id] = newTempAnswer[currentQuestion.finalTest_question_Id]?.filter((index) => index !== option.index);
                        }
                        setTempAnswer(newTempAnswer);
                    }}
                    checked={tempAnswer[currentQuestion.finalTest_question_Id]?.includes(option.index)}
                />
                <img src={`data:image/png;base64,${option.img}`} alt={`Option ${option.index}`} />
            </div>
        ))}
    </div>
)  : currentQuestion.finaltest_questiontype === 'NAT' ? (
                            <div>
                                <label>
                                  
                                    <input
                                        type="text"
                                        name={`question-${currentQuestion.finalTest_question_Id}`}
                                        className='inputtextbox'
                                        // value={answers[currentQuestion.finalTest_question_Id] || ''}
                                        value={tempAnswer[currentQuestion.finalTest_question_Id] || ''}
                                        onChange={(e) => handleAnswerChange(currentQuestion.finalTest_question_Id, e.target.value)}
                                        placeholder="Enter your answer"
                                        autoComplete="off"
                                    />
                                </label>
                            </div>
                        ) : (
                            <p>No options available for this question type.</p>
                        )}
                    </div></div>

                    {/* Navigation Buttons */}
                    <div className='btnflex'>
                        <div className='btnflexsub '> <button onClick={handleClearResponse} className='clearrespbtn'>Clear Response</button><button className='saveandnextbtn' onClick={saveAnswerAndGoToNext} disabled={currentIndex === test.length }>Save & Next</button></div>
                        <div className='btnflexsub'>
                        <button className='prevbtn' onClick={goToPreviousQuestion} disabled={currentIndex === 0}>Previous</button>
                        <button  className='nextbtn'onClick={goToNextQuestion} disabled={currentIndex === test.length - 1}>Next</button>
                        </div>
                      
                       
                    </div>
                        </div>
                    {/* Question Number Palette */}
                    <div className='fexnumberssubmit'>
                       <div className='profilename'><div className='profilephoto'>
                       <img
                    src={examDetails.Candidate_Photo && examDetails.Candidate_Photo.trim() !== "" 
                 ? `data:image/png;base64,${examDetails.Candidate_Photo}` 
                : profilepicture}
                alt="profile"
                    />


                             </div>
                        <h3>{examDetails.Candidate_Name}</h3></div> 
                        <div className='number-palate'>
                        {test.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToQuestion(index)}
                                // style={{ margin: '5px', padding: '10px', backgroundColor: currentIndex === index ? '#ddd' : '#fff' }}
                                className={
                                    visitedQuestions.includes(test[index].finalTest_question_Id)
                                        ? answeredQuestions.includes(test[index].finalTest_question_Id)
                                            ? 'answered'
                                            : 'NotAnswered'
                                        : 'unvisited'
                                }
                            >
                                {index + 1}
                            </button>
                        ))}</div>
                        <div className='legend'>
                            <h4>Legend:</h4>
                            <div className='LEGENDCONTAINER'><div className='LegebdsubContainer'><div className='answered'>{answered}</div> Answered</div> 
                           <div className='LegebdsubContainer'>  <div className='NotAnswered'>{unanswered}</div>Not Answered</div> 
                           <div className='LegebdsubContainer'> <div className='unvisited'>{unvisited}</div>Not Visited</div> </div>
                        </div>
                        <button className='submittest'  onClick={() => handleSubmit(false)}  // Manual submission
                            disabled={isTimeOver}>Submit Test</button>
                            
                    </div>
                </div>
            ) : (
                <p>No questions available.</p>
            )}
            
        </div>
    );
};

export default FinalTestquestionPage;
