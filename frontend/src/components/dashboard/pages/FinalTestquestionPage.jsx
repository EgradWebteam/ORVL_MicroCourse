import React, { useState, useEffect } from 'react';
import HeaderMc from '../Headermicrocourses/HeaderMc';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/styles/FinalTest.css'

const FinalTestquestionPage = () => {
    const [examDetails, setExamDetails] = useState({});
    const [answers, setAnswers] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);  // Track the current question index
    const { id, finalTestId, courseId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch questions data from the backend
        const fetchExamDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/finalTest/FinalTestquestionPage/${id}/${courseId}/${finalTestId}`);
                console.log('Exam details:', response.data);
                setExamDetails(response.data);
            } catch (error) {
                console.error('Error fetching exam details:', error);
            }
        };

        fetchExamDetails();
    }, [id, courseId, finalTestId]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:5000/finalTest/submitAnswers', {
                userId: 1, // You will need to replace this with the actual user ID
                courseCreationId: courseId, // Same for this
                micro_course_final_test_Id: finalTestId, // Same for this
                answers,
            });
            console.log('Answers submitted successfully:', response.data);
            navigate(`/TestResults/${id}/${courseId}/${finalTestId}`);  // Redirect after submission
        } catch (error) {
            console.error('Error submitting answers:', error);
        }
    };


    // Ensure the data exists and is an array before mapping
    const test = examDetails?.test?.[0]?.finalQuestions || [];

    const currentQuestion = test[currentIndex] || {};  // Get the current question based on the index

    const goToNextQuestion = () => {
        if (currentIndex < test.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const goToQuestion = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div>
            <HeaderMc />
            {examDetails.courseName && (
                <h1>{examDetails.ExamName}</h1>
            )}
            {test.length > 0 ? (
                <div className='flexcolumforpaleques'><div className='exampart'>
                    {/* Display the current question */}
                    <div key={currentQuestion.finalTest_question_Id} className='questioninput'>
                        <h2>Question {currentQuestion.finalTest_question_Id}</h2>
                        {currentQuestion.final_test_questionImg && (
                            <img
                                src={`data:image/png;base64,${currentQuestion.final_test_questionImg}`}
                                alt={`Question ${currentQuestion.finalTest_question_Id}`}
                            />
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
                    checked={answers[currentQuestion.finalTest_question_Id] === option.index}
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
                    onChange={(e) => {
                        const newAnswers = { ...answers };
                        // Handle MSQ, where multiple answers can be selected
                        if (e.target.checked) {
                            if (!newAnswers[currentQuestion.finalTest_question_Id]) {
                                newAnswers[currentQuestion.finalTest_question_Id] = [];
                            }
                            newAnswers[currentQuestion.finalTest_question_Id].push(option.index);  // Save option.id directly
                        } else {
                            newAnswers[currentQuestion.finalTest_question_Id] = newAnswers[currentQuestion.finalTest_question_Id]?.filter((index) =>index !== option.index);
                        }
                        setAnswers(newAnswers);
                    }}
                    checked={answers[currentQuestion.finalTest_question_Id]?.includes(option.index)}  // Ensure the checkbox is checked if the answer is selected
                />
                <img src={`data:image/png;base64,${option.img}`} alt={`Option ${option.index}`} />
            </div>
        ))}
    </div>
)  : currentQuestion.finaltest_questiontype === 'NAT' ? (
                            <div>
                                <label>
                                    Answer:
                                    <input
                                        type="text"
                                        name={`question-${currentQuestion.finalTest_question_Id}`}
                                        value={answers[currentQuestion.finalTest_question_Id] || ''}
                                        onChange={(e) => handleAnswerChange(currentQuestion.finalTest_question_Id, e.target.value)}
                                        placeholder="Enter your answer"
                                    />
                                </label>
                            </div>
                        ) : (
                            <p>No options available for this question type.</p>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div>
                        <button onClick={goToPreviousQuestion} disabled={currentIndex === 0}>Previous</button>
                        <button onClick={goToNextQuestion} disabled={currentIndex === test.length - 1}>Next</button>
                    </div>
                        </div>
                    {/* Question Number Palette */}
                    <div className='fexnumberssubmit'>
                        <h3>{examDetails.Candidate_Name}</h3>
                        <div>
                        {test.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToQuestion(index)}
                                style={{ margin: '5px', padding: '10px', backgroundColor: currentIndex === index ? '#ddd' : '#fff' }}
                            >
                                {index + 1}
                            </button>
                        ))}</div>
                        <button onClick={handleSubmit}>Submit Answers</button>
                    </div>
                </div>
            ) : (
                <p>No questions available.</p>
            )}
            
        </div>
    );
};

export default FinalTestquestionPage;
