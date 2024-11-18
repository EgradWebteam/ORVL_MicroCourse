import React, { useState, useEffect } from 'react';
import HeaderMc from '../Headermicrocourses/HeaderMc';
import NavBar from '../Navabar/NavBar';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'; // Correct import

import './styles/BuyCourses.css';

// Register the ArcElement, Tooltip, and Legend
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { id } = useParams();
  const [profileDataDisplay, setProfileDataDisplay] = useState({});
  const [viewedCourses, setViewedCourses] = useState([]);
  
  const [percentageforve, setpercentageforve] = useState(null);
  const [error, setError] = useState(null);
  const [courseCompletionData, setCourseCompletionData] = useState(null); // Added state to store course completion data
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileDisplay = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/profile/user-profile/${id}`);
        setProfileDataDisplay(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (id) {
      fetchProfileDisplay();
    }
  }, [id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 15) {
      return 'Good Afternoon';
    } else if (hour >= 15 && hour < 19) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  };

  useEffect(() => {
    const fetchViewedCourses = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/microcourses/my_courses/${id}`);
        setViewedCourses(response.data);
        
        
      } catch (error) {
        console.error('Error fetching viewed courses:', error);
      }
    };

    if (id) {
      fetchViewedCourses();
    }
  }, [id]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const courseId = viewedCourses.length > 0 ? viewedCourses.courseCreationId : null;
        console.log(courseId)
        const accessResponse = await axios.get(`http://localhost:5000/microcourses/accessStatus/${id}/${courseId}`);
        setpercentageforve(accessResponse.data);
        setCourseCompletionData(accessResponse.data); // Store the completion data
      } catch (err) {
        setError('Error checking access');
      }
    };

   
      checkAccess();
  
  }, [id]);

  const handleContinue = (courseId) => {
    navigate(`/mycourses/course_details/${id}/${courseId}`);
  };

  // Prepare data for the Pie chart
  const pieChartData = courseCompletionData ? {
    labels: ['Video Completion', 'Exercise Completion', 'Remaining'],
    datasets: [
      {
        data: [
         
          100 - (parseFloat(courseCompletionData.videoCompletionPercentage) + parseFloat(courseCompletionData.exerciseCompletionPercentage)),
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  } : null;

  return (
    <div>
      <HeaderMc />
      <NavBar userId={id} />
      <div className="userInterfaceMainCon">
        {profileDataDisplay && (
          <div className="dashboardvl">
            <h1>{getGreeting()}, {profileDataDisplay.Candidate_Name}</h1>
            <h2>Happy Learning!</h2>
          </div>
        )}
        {viewedCourses.length > 0 && (
          <div>
            <h3>Viewed Courses:</h3>
            <div className="courseContainerdashboard">
              {viewedCourses.map(course => (
                <div key={course.courseCreationId} className="courseItem">
                  <div>{course.courseName}</div>
                  {/* Display Pie chart for each course */}
                  {courseCompletionData && (
                    <Pie data={pieChartData} />
                  )}
                  <button onClick={() => handleContinue(course.courseCreationId)} className="btncontinue">
                    Continue
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
