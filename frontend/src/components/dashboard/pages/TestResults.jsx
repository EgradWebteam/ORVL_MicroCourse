import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderMc from '../Headermicrocourses/HeaderMc';
import { useLocation } from 'react-router-dom';
import './styles/TestResults.css'
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CircularProgressbar } from 'react-circular-progressbar'; // Import the CircularProgressbar
import 'react-circular-progressbar/dist/styles.css';

// Register the necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const TestResults = () => {
    const { id, finalTestId,courseId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAnswers, setShowAnswers] = useState(false);
    const [solutionVisibility, setSolutionVisibility] = useState({
      imageSolution: {}, // Holds toggle state for each question's image solution
      videoSolution: {}  // Holds toggle state for each question's video solution
    });

    const location = useLocation();
    const { answered, unanswered, unvisited,totalTime,timeLeft } = location.state || {};
    const timeSpent = totalTime - timeLeft;
    const timeSpentPercentage = (timeSpent / totalTime) * 100;
    const timeLeftPercentage = (timeLeft / totalTime) * 100;
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
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      return `${hours}hours ${minutes}minutes ${remainingSeconds}Seconds`;
  };
  const answeredQuestions = data.answeredQuestions;
  const totalQuestions = data.totalQuestions;
  const correctAnswers = data.correctAnswersCount;
  const wrongAnswers = answeredQuestions - correctAnswers;
  const unattemptedQuestions = (totalQuestions - answeredQuestions);
  

  const chartData = {
      labels: ['Correct Answers', 'Wrong Answers', 'Unattempted Questions'],
      datasets: [
          {
              data: [correctAnswers, wrongAnswers, unattemptedQuestions],
              backgroundColor: ['#4CAF50', '#FF5722', '#97979f'],
              hoverOffset: 3,
          },
      ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          // Display the label and value using the chart data
          generateLabels: (chart) => {
            return chart.data.labels.map((label, index) => {
              return {
                text: `${label}: ${chart.data.datasets[0].data[index]}`, // Add value to the label
                fillStyle: chart.data.datasets[0].backgroundColor[index], // Set the color for each label
                strokeStyle: chart.data.datasets[0].backgroundColor[index],
                lineWidth: 1,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            // Show the label and value in the tooltip
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };
  const percentageScore = (data.score.totalScore / data.courseRows?.[0]?.TotalMarks) * 100;
  // Function to toggle image solution visibility for specific question
  const opentoggleimage = (questionId) => {
    setSolutionVisibility(prevState => ({
      ...prevState,
      imageSolution: {
        ...prevState.imageSolution,
        [questionId]: !prevState.imageSolution[questionId], // Toggle for specific question
      },
    }));
  };

  // Function to toggle video solution visibility for specific question
  const opentogglevideo = (questionId) => {
    setSolutionVisibility(prevState => ({
      ...prevState,
      videoSolution: {
        ...prevState.videoSolution,
        [questionId]: !prevState.videoSolution[questionId], // Toggle for specific question
      },
    }));
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
  return (
    <div>
         <HeaderMc/>
       <div className='bodyresults'>
       <div className='pch2'> Your Performance</div>
          <div className='userInterfaceMainCon'>
            
          <table className='tableforres'>
            <tr>
            <td><span className='spantd'>Test Name:</span>{data?.courseRows?.[0]?.final_test_name}</td>
            <td><span className='spantd'>Test Duration:</span>{data?.courseRows?.[0]?.Duration} minutes</td>
            <td><span className='spantd'>Test Questions:</span>{data?.courseRows?.[0]?.TotalQuestions}</td>
            <td><span className='spantd'>Test Marks:</span>{data.totalMarks} </td>
            <td><span className='spantd'> Your Marks:</span>{data?.score?.totalScore}</td>
            <td><span className='spantd'>Candidate Name:</span>{data?.courseRows?.[0]?.Candidate_Name} </td>
            </tr>
          </table>
         <div className="buttons-container">
                    <button 
                        onClick={() => setShowAnswers(false)} 
                        className={`btndef ${!showAnswers ? "active" : ""}`}
                    >
                        Your Performance
                    </button>
                    <button 
                        onClick={() => setShowAnswers(true)} 
                        className={ `btndef ${showAnswers ? "active" : ""}`}
                    >
                        Show Answers
                    </button>
                </div>
      
         {!showAnswers ? (
          <div className="score">
     <div className='flexscoretime'> 
      <div className='flexscoretimesub'> 
        Results:
        <div className='flexscoresub'><p><span className='spantd'>Marks:</span> {data?.score?.correctMarks}</p>
      <p><span className='spantd'>Negitive Marks:</span> {data?.score?.negativeMarks}</p>
      <p><span className='spantd'>Obtained Total Marks:</span> {data?.score?.totalScore}</p>
      <p><span className='spantd'>Test Total Marks:</span> {data.totalMarks}</p></div></div>
    <div className='flexscoretimesub'>     <div className="progress-bar-container">
                                        <div className="progress-bar">
                                            <div className="time-spent" style={{ width: `${timeSpentPercentage}%` }}></div>
                                            <div className="time-left" style={{ width: `${timeLeftPercentage}%` }}></div>
                                        </div>
                                       <div className='legendmaincon'> <div className='legendcon'><div className="time-spent-legend"></div> <div>Time Spent: {formatTime(timeSpent)}</div>  </div>
                                        <div className='legendcon'><div className="time-left-legend"></div><div>Time Left: {formatTime(timeLeft)}</div> </div></div>
                                    </div>   </div> </div> 
                         <div className='flexpercentage'> <div> <div className="pie-chart-container">
                                <h3>Answer Evaluation</h3>
                                <Pie data={chartData} options={chartOptions} />
                            </div></div> 
                             <div className="pie-chart-container1">  
                             <h3 className='textstylefor percentage'>Your Total Percentage</h3>    <div className='CircularProgressbarcon'>  <CircularProgressbar
                  value={percentageScore}
                  text={`${Math.round(percentageScore)}%`}
                  styles={{
                    path: { stroke: '#4CAF50' }, // Green for the path
                    text: { fill: '#4CAF50', fontSize: '20px' }, // Green text for score percentage
                    trail: { stroke: '#d6d6d6' }, // Light gray trail for the background
                  }}
                /> </div></div> </div> 
                                    
     
               
      </div>

    ) : (
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
                 
                    {/* Handle MCQ and MSQ options */}
                    {question.options.map((option) => {
                      // For MCQ (Radio buttons)
                      if (question.finaltest_questiontype === 'MCQ') {
                        return (
                          <div key={option.id}>
                             {option.index}
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
                            {option.index}
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
                 
                </div>
              ) : null}
 <div>
                    <strong>Correct Answer:</strong>
                    <span className={question.result === 'correct' ? 'correct-answer' : (question.userResponse ? 'wrong': 'Notanswered')}>
                      {question.correctAnswer}
                    </span>
                  </div>
              <div className={question.result === 'correct' ? 'correct-answer' :  (question.userResponse ? 'wrong': 'Notanswered')}>
                {question.result}
              </div>
              <div>
        {question.imageSolution && (
          <button className='Solutionvidimg' onClick={() => opentoggleimage(question.finalTest_question_Id)}>
          Image Solution
        </button>
        )}
        {question.videoSolution && (
         <button className='Solutionvidimg' onClick={() => opentogglevideo(question.finalTest_question_Id)}>
         Video Solution
       </button>
        )}
      </div>
      {solutionVisibility.imageSolution[question.finalTest_question_Id] && question.imageSolution && (
        <div className='videocontrol'>
          <img src={`data:image/jpeg;base64,${question.imageSolution}`} alt="Image Solution" />
        </div>
      )}

      {/* Show video solution if it's toggled */}
      {solutionVisibility.videoSolution[question.finalTest_question_Id]&& question.videoSolution && (
        <div className='videocontrol'>
          <iframe
                                                            width="560"
                                                            height="315"
                                                            src={getYouTubeEmbedUrl(question.videoSolution)}
                                                            title={`Video Solution ${question.finalTest_question_Id}`}
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        />
        </div>
      )}
            </div>
          ))}
        </div>
      )}
         </div></div>
    </div>
  )
}

export default TestResults