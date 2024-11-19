import React,{useState,useEffect} from 'react'
import HeaderMc from  '../Headermicrocourses/HeaderMc'
import NavBar from '../Navabar/NavBar'
import './styles/Mycourses.css'
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
const Mycourses = () => {
    const { id } = useParams();
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchMyCourses = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/microcourses/my_courses/${id}`);
                setMyCourses(response.data);
               
            } catch (err) {
                console.error('Error fetching my courses:', err);
                setError('Failed to fetch my courses.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyCourses();
    }, [id]);
    const handleViewCourse = (courseId) => {
        navigate(`/mycourses/course_details/${id}/${courseId}`); // Update URL
    };
  return (
    <div>
        <HeaderMc/>
        <NavBar userId={id} />
        <div className='userInterfaceMainCon'>
       <h1> My Courses</h1>
       {loading ? (
                    <p>Loading exams...</p> // Loading indicator
                ) : (
                    <div className="exam-cards-containervl">
                   
                       
       {myCourses.map((course) => (
                                <div className='exam-cards-containervl' key={course.courseCreationId}>
                                    <div className="exam-cardvl">
                                        <div className="imgsrc">
                                            {course.cardImage ? (
                                                <img src={`data:image/jpeg;base64,${course.cardImage}`} alt={course.courseName} />
                                            ) : (
                                                <p>No image available</p>
                                            )}
                                        </div>
                                        <div className="examnamebuynowcard"><div className='h4cn'>{course.exam_name}</div></div>
                                        <div className="headec"><div className='h3cn'>{course.courseName}</div></div>
                                        <div className="fsvnsv subcardgrid valinosubvid">
                                            <div className='fsvnsv subhcard'>Validity:  { (course.courseStartDate)} to {(course.courseEndDate)}</div>
                                            <div>No of Videos:{course.video_count}</div>
                                        </div>
                                        <div className='btnviewcourse'>
                                            <button onClick={() => handleViewCourse(course.courseCreationId)} className="btnbut">View Course</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
        </div>
    )}
        </div>
        </div>
  )
}
 
export default Mycourses
 