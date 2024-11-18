import React,{ useState, useEffect } from 'react';
import HeaderMc from '../Headermicrocourses/HeaderMc';
import NavBar from '../Navabar/NavBar';
import './styles/BuyCourses.css';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
const BuyCourses = ({userId}) => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCourses = async () => {
        const userId = id; 
        
        setLoading(true); // Start loading
        try {
            const response = await axios.get(`http://localhost:5000/microcourses/courses_main?userId=${userId}`);
            setCourses(response.data); // Adjust this based on the structure of your response
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to fetch courses.');
        } finally {
            setLoading(false); // Stop loading
        }
    };
    
    fetchCourses();
}, []);

  // Navigation function
  const handleBuyNow = (courseId) => {
    navigate(`/PaymentPage/${id}/${courseId}`);
  };
  return (
    <div>
      <HeaderMc />
      <NavBar userId={id} />
      <div className='userInterfaceMainCon'>
            <h1 className='buych1'>Buy Courses</h1>
                {loading ? (
                    <p>Loading exams...</p> // Loading indicator
                ) : (
                    <div className="exam-cards-containervl">
                    
                        {courses.map((course) => (
                            
                            <div className="exam-cardvl" key={course.courseCreationId}>
                              
                                <div className="imgsrc">  {course.cardImage ? (
                <img src={`data:image/jpeg;base64,${course.cardImage}`} alt={course.courseName} />
            ) : (
                <p>No image available</p>
            )} </div>   
             <div className="examnamebuynowcard"><div className='h4cn'>{course.exam_name}</div></div>
                                <div className="headec"><div className='h3cn'>{course.courseName}</div></div>
                                <div className="fsvnsv subcardgrid valinosubvid">
                                    <div className='fsvnsv subhcard'>Validity: { (course.courseStartDate)} to {(course.courseEndDate)}</div>
                                    
                                    <div className='fsvnsv'>No of Videos: {course.video_count}</div>
                                </div>
                                <div className="comcardbuyprice">
                                    <div className='fsvnsv pricebuy'>
                                   <span> ₹{course.totalPrice} </span>
                                      <del>₹{course.cost} </del>

                                      </div>
                                    <a  onClick={() => handleBuyNow(course.courseCreationId)}className="btnbut">BUY NOW</a>
                                    {/* <button className="btnbut" onClick={() =>  handleOpenPayment(course)}>BUY NOW</button> */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
    </div>
  );
}

export default BuyCourses;
