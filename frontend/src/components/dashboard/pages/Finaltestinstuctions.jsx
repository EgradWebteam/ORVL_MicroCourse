import React,{ useState,useEffect} from 'react'
import axios from 'axios';
import {useParams, useNavigate } from 'react-router-dom';
import HeaderMc from '../Headermicrocourses/HeaderMc';
import './styles/Instruction.css'

const Finaltestinstuctions = () => {
    const { id, finalTestId,courseId } = useParams();
    const [finalTests, setFinalTests] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [testData, setTestData] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {const handleGetInstructions = async () => {
        if (!id|| !courseId || !finalTestId) {
          setError('Please fill in all fields.');
          return;
        }
        
    
        try {
            const response = await axios.get(`http://localhost:5000/microcourses/inmy_final_tests/${id}/${courseId}/${finalTestId}`);
          
          setTestData(response.data)
        } catch (err) {
          setError('Something went wrong while fetching the data.');
        } finally {
          setLoading(false);
        }
      };
      handleGetInstructions()  }, [id],[courseId],[finalTestId]); 
      const Navigatetonext = () => {
       
      
         navigate(`/GeneralInstructions/${id}/${courseId}/${finalTestId}`);
      }
   
  return (
   
    <div className='userInterfaceMainCon'> 
        <div>{testData.map((test, index) => (
        <div key={index} className="test-details">
             <HeaderMc/>
            {/* <h1>General Instructions</h1>
          <h2><strong>Course Name:</strong> {test.courseName}</h2>
          <h2><strong>Test Name:</strong>{test.final_test_name}</h2> */}
          {/* <div>
          <ul>
        <li><strong>Navigation:</strong> Use the question palette on the right-hand side to navigate between questions. Click on any question number to jump directly to that question.</li>
        <li><strong>Answering Questions:</strong>
          <ul>
            <li>For <strong>Multiple Choice Questions (MCQs)</strong>, select the correct answer by clicking on one of the options.</li>
            <li>For <strong>Multiple Select Questions (MCQs)</strong>, select the correct answer by clicking on one or more than one  of the options.</li>
            <li>For <strong>Numerical Answer Type Questions(NAT)</strong>, input the correct numerical value using the keyboard. Ensure that you do not input any units (e.g., use 20 instead of 20 cm).</li>
          </ul>
        </li>
        <li><strong>Marking for Review:</strong> You can mark any question for review if you're unsure of your answer. To mark a question for review, select the "Mark for Review" option. This will not submit your answer until you finalize it.</li>
        <li><strong>Unanswered Questions:</strong> Any question that remains unanswered will be marked with a "Not Answered" status. You can come back to these questions during the exam.</li>
        <li><strong>Reviewing Questions:</strong> After answering a question, you can review your answers by returning to the question from the question palette. If you want to change your answer, simply click on the question number and modify your response.</li>
        <li><strong>Question Status:</strong> The question palette will show different colors for each question to indicate its status:
          <ul>
            <li><strong>White:</strong> Unanswered question</li>
            <li><strong>Green:</strong> Answered question</li>
            <li><strong>Yellow:</strong> Question marked for review</li>
            <li><strong>Red:</strong> Skipped question</li>
          </ul>
        </li>
        <li><strong>Timer:</strong> Keep an eye on the timer located at the top of the screen. The timer counts down, and you must submit your answers before the time runs out.</li>
        <li><strong>Final Submission:</strong> At the end of the exam, you can submit your answers. You will be asked to confirm the submission. Ensure that you have answered all questions or marked the ones you wish to review.</li>
        <li><strong>End of Exam:</strong> Once the time is over or you submit the exam, your answers will be automatically locked. No further changes can be made.</li>
      </ul>
    </div> */}
   
          {/* <p> The time duration for test is {test.Duration} minutes</p>
          <p>Total number of  questions in test is  {test.TotalQuestions}</p>
          <p>Total Marks marks for the test is {test.TotalMarks}</p>
          <p>Each question carries {test.TotalMarks/ test.TotalQuestions} marks</p> */}
          <p></p>
        </div>
      ))}</div>  <div className="instructions-container">
      <h2 className='h1gi'>IIT JEE Test Instructions</h2>
      <h3>Please read the instructions carefully before starting your test.</h3>

      <section>
        <h4>1. General Instructions</h4>
        <ul>
          <li>The test is divided into sections. Each section contains multiple-choice questions, multiple-select questions, and numeric answer-type questions.</li>
          <li>Ensure that you have a stable internet connection for the duration of the test. The system auto-submits your answers once the test timer ends.</li>
          <li>You cannot revisit the previous sections once you have submitted them, so answer carefully before moving to the next section.</li>
        </ul>
      </section>

      <section>
        <h4>2. Test Duration and Timer</h4>
        <ul>
          <li>The total duration of the test is 3 hours.</li>
          <li>A timer on your screen will track the remaining time.</li>
          <li>When the timer runs out, yoegardless of the question or section you’re on.</li>
        </ul>
      </section>

      <section>
        <h4>3. Navigation Between Questions</h4>
        <ul>
          <li>Use the "Next" and "Previous" buttons to navigate between questions within the same section.</li>
 <li>You can mark a question for review if you wish to revisit it before submitting the section. Marked questions will be highlighted in <b>blue.</b></li>
        </ul>
      </section>

      <section>
        <h4>4. Answering Questions</h4>
        <ul>
          <li><strong>Multiple Choice Questions (MCQs):</strong> Select the option you believe is correct. Only one option is correct.</li>
          <li><strong>Multiple Select Questions (MSQs):</strong> Select all options you believe are correct. More than one option may be correct.</li>
          <li><strong>Numeric Answer Type (NAT):</strong> Enter a numeric value. Answers may include decimal values.</li>
          <li>Ensure that you click "Save and Next" after selecting or entering your answer, as only saved responses are recorded.</li>
        </ul>
      </section>

      <section>
        <h4>5. Marking Scheme</h4>
        <ul>
          <li><strong>MCQs:</strong> +4 for correct answers, -1 for incorrect answers.</li>
          <li><strong>MSQs:</strong> +4 for fully correct answers, partial credit may apply; no negative marking for incorrect answers.</li>
          <li><strong>NATs:</strong> +4 for correct answers, no negative marking for incorrect answers.</li>
        </ul>
      </section>

      <section>
        <h4>6. Prohibited Actions</h4>
        <ul>
          <li>You are not allowed to switch to other applications during the test.</li>
          <li>Taking screenshots, copying questions, or recording the screen is strictly prohibited. Such actions will lead to automatic termination of the test.</li>
          <li>Once the test begins, refrain from refreshing or reloading the page.</li>
        </ul>
      </section>

      <section>
        <h4>7. Technical Issues</h4>
        <ul>
          <li>If you experience any technical issues, such as being logged out or your device shutting down, quickly re-login to resume the test. Time lost cannot be compensated, so ensure your device is fully charged.</li>
        </ul>
      </section>

      <section>
        <h4>8. Submission</h4>
        <ul>
          <li>After completing each section, click on "Submit Section" to confirm your answers for that section.</li>
          <li>Once you submit the entire test, you will not be able to access it again.</li>
        </ul>
      </section>

      <p>All the best!</p>
    </div>
      <div className='btnnxt'> <button onClick={ Navigatetonext} className='btnfornext'>Next</button></div>
    </div>
  )
}

export default Finaltestinstuctions