import React,{ useState,useEffect} from 'react'
import HeaderMc from  '../Headermicrocourses/HeaderMc'
import NavBar from '../Navabar/NavBar'
import axios from 'axios';
import {useParams, useNavigate } from 'react-router-dom';
import '../pages/styles/FinalTest.css'
const FinalTestMicrocourses = () => {
    const { id } = useParams();
    const [accessGranted, setAccessGranted] = useState(null);
    const [loading, setLoading] = useState(false);  // For showing a loading state while submitting
    const [error, setError] = useState(null); 
    const [finalTests, setFinalTests] = useState([]);
    const [courseId, setCourseId] = useState([]);
    const[finalTestId,setFinalTestId] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const checkAccess = async () => {
          try {
            // const courseId= myCourses.map(course=>{course.coursesId})
            const courseId = finalTests.length > 0 ? finalTests[0].courseCreationId : null;
            setCourseId(courseId); 
            const accessResponse = await axios.get(`http://localhost:5000/microcourses/accessStatus/${id}/${courseId}`);
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
      }, [id,finalTests]); 
      const handleStartTest = (finalTest) => {
        if(courseId){
        const finalTestId = finalTest.micro_couse_final_test_Id;
      
         navigate(`/Finaltestinstuctions/${id}/${courseId}/${finalTestId}`);
      }};
    useEffect(() => {
        const fetchFinalTests = async () => {
          try {
            // Make a GET request to the backend API
            const response = await axios.get(`http://localhost:5000/microcourses/my_final_tests/${id}`);
           
    
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
  return (
    <div>  <HeaderMc/>
      <NavBar userId={id}/>
      <div className='userInterfaceMainCon'>
      <h1>Available Final Tests for Your Purchased Courses</h1>


    
      <table  className="finaltesttable" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Course</th>
              <th>Duration (minutes)</th>
              <th>Total Questions</th>
              <th>Total Marks</th>
              <th>start</th>
            </tr>
          </thead>
          <tbody>
  {finalTests.map((test) => (
    <tr key={test.micro_couse_final_test_Id}>
      <td>{test.final_test_name}</td>
      <td>{test.courseName}</td>
      <td>{test.Duration}</td>
      <td>{test.TotalQuestions}</td>
      <td>{test.TotalMarks}</td>
      <td>
        {accessGranted === true ? (
          <div>
           <button onClick={() => handleStartTest(test)
            
           }
           className='btnStart'
           disabled={!accessGranted}>Start Test</button>

          </div>
        ) : accessGranted === false ? (
          <p>You do not have access to this test.</p>
        ) : null}
      </td> {/* Ensure this <td> is properly closed */}
    </tr>
  ))}
</tbody>

        </table>
        
    </div></div>
  )
}

export default FinalTestMicrocourses