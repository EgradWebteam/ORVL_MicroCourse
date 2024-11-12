import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderMc from '../Headermicrocourses/HeaderMc';

const TestResults = () => {
    const { id, finalTestId,courseId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAnswers, setShowAnswers] = useState(false);
  
    useEffect(() => {
      // Function to fetch the test results data from the backend API
      const fetchTestResults = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/finalTest/Results/${id}/${courseId}/${finalTestId}`);
          setData(response.data); // Set the response data to the state
        } catch (error) {
          console.error('Error fetching test data:', error);
          // You can set some error state to show error messages if necessary
        } finally {
          setLoading(false); // Set loading to false once data is fetched
        }
      };
  
      fetchTestResults();
    }, [id, courseId, finalTestId]);
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    if (!data) {
      return <div>No data found.</div>;
    }
  return (
    <div>
         <HeaderMc/>
         <div className='userInterfaceMainCon'>
         <div className="score">
        <p>Your Score: {data.score}</p>
        <p>Answered: {data.answeredQuestions} / {data.totalQuestions}</p>
      </div>

      <button onClick={() => setShowAnswers(!showAnswers)}>
        {showAnswers ? 'Hide Answers' : 'Show Answers'}
      </button>

      {showAnswers && (
        <div id="questions-container">
          {data.questions.map((question) => (
            <div className="question-container" key={question.finalTest_question_Id}>
              <h3>Question {question.finalTest_question_Id}:</h3>
              {question.final_test_questionImg && (
                <img
                  src={`data:image/jpeg;base64,${question.final_test_questionImg}`}
                  alt="Question"
                 
                />
              )}

              {/* Question Type Handling */}
              {question.finaltest_questiontype === 'MCQ' || question.finaltest_questiontype === 'MSQ' ? (
                <div>
                  <div>
                    <strong>Your Answer:</strong>
                    {/* Handle MCQ and MSQ options */}
                    {question.options.map((option) => {
                      // For MCQ (Radio buttons)
                      if (question.finaltest_questiontype === 'MCQ') {
                        return (
                          <div key={option.id}>
                            <label>
                              <input
                                type="radio"
                                name={`question-${question.finalTest_question_Id}`}
                                value={option.index}
                                checked={question.userResponse.split(',').includes(option.index.toString())}
                                disabled
                              />
                              <img
                                src={`data:image/jpeg;base64,${option.img}`}
                                alt="Option"
                              
                              />
                            </label>
                          </div>
                        );
                      }
                      // For MSQ (Checkboxes)
                      if (question.finaltest_questiontype === 'MSQ') {
                        return (
                          <div key={option.id}>
                            <label>
                              <input
                                type="checkbox"
                                name={`question-${question.finalTest_question_Id}`}
                                value={option.index}
                                checked={question.userResponse.split(',').includes(option.index.toString())}
                                disabled
                              />
                              <img
                                src={`data:image/jpeg;base64,${option.img}`}
                                alt="Option"
                               
                              />
                            </label>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ) : question.finaltest_questiontype === 'NAT' ? (
                <div>
                  <div>
                    <strong>Your Answer:</strong>
                    <input
                      type="text"
                      value={question.userResponse}
                      readOnly
                    />
                  </div>
                  <div>
                    <strong>Correct Answer:</strong>
                    <span className={question.result === 'correct' ? 'correct-answer' : 'wrong-answer'}>
                      {question.correctAnswer}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className={question.result === 'correct' ? 'correct-answer' : 'wrong-answer'}>
                {question.result}
              </div>
            </div>
          ))}
        </div>
      )}
         </div>
    </div>
  )
}

export default TestResults