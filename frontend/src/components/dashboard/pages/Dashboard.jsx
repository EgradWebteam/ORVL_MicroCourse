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
    const checkAccess = async (courseId) => {
      console.log('Checking access for courseId:', courseId); // Log courseId before making the request
      try {
        // Log user ID and courseId
        console.log('User ID:', id);
        const accessResponse = await axios.get(`http://localhost:5000/microcourses/accessStatus/${id}/${courseId}`);
        console.log('Access Response:', accessResponse.data);  // Log the response from the API
        setpercentageforve(accessResponse.data);
        setCourseCompletionData(accessResponse.data); // Store the completion data
      } catch (err) {
        console.error('Error checking access:', err);
        setError('Error checking access');
      }
    };
  
    // Log the viewedCourses to ensure it's populated
    console.log('Viewed Courses:', viewedCourses);
  
    // Check access for all courses after they are fetched
    if (viewedCourses.length > 0) {
      viewedCourses.forEach(course => {
        console.log('Calling checkAccess for course with ID:', course.courseCreationId); // Log each course's ID
        checkAccess(course.courseCreationId);  // Pass courseCreationId as courseId
      });
    }
  
  }, [id, viewedCourses]);  // Trigger effect whenever 'viewedCourses' changes
   // Trigger effect whenever 'viewedCourses' changes
  
 

  const handleContinue = (courseId) => {
    navigate(`/mycourses/course_details/${id}/${courseId}`);
  };
  const calculateCompletionPercentage = () => {
    if (courseCompletionData) {
      const completed = courseCompletionData.totalCompletionPercentage || 0;
      console.log(completed )
      const remaining = 100 - completed;
      return { completed, remaining };
    }
    return { completed: 0, remaining: 100 }; // Default to 0% if no data
  };

  const { completed, remaining } = calculateCompletionPercentage();
  const chartData = {
    labels: ['completed', 'remaining'],
    datasets: [
        {
            data: [completed, remaining],
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
                  <Pie data={chartData} options={chartOptions} />
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
