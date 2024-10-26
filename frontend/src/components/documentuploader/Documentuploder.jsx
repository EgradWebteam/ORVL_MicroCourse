import React,{useState,useEffect} from 'react'
import axios from 'axios'

const Documentuploder = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [file, setFile] = useState(null);
  // Fetch exam names on component mount
  useEffect(() => {
    const fetchExamNames = async () => {
      try {
        const response = await axios.get('http://localhost:5000/examNames');
        setExams(response.data);
      } catch (error) {
        console.error('Error fetching exam names:', error);
      }
    };

    fetchExamNames();
  }, []);
  const handleExamChange = (event) => {
    const examId = event.target.value;
    setSelectedExam(examId);
    setSelectedCourse(''); // Reset course selection
    setCourses([]); // Clear courses
    if (examId) {
      fetchMicroCourseNames(examId);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  // Fetch micro course names based on selected exam
  const fetchMicroCourseNames = async (examId) => {
    try {
      const response = await axios.get(`http://localhost:5000/MicroCourseNames/${examId}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching micro course names:', error);
    }
  };
  return (
    <div>Documentuploder
      <div>
      <form >
      <label htmlFor="examName">Select Exam:</label>
      <select id="examName" value={selectedExam} onChange={handleExamChange} required>
        <option value="">--Select Exam--</option>
        {exams.map((exam) => (
          <option key={exam.exam_creation_Id} value={exam.exam_creation_Id}>
            {exam.exam_name}
          </option>
        ))}
      </select>

      <br /><br />

      <label htmlFor="microCourseName">Select Micro Course:</label>
      <select
        id="microCourseName"
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        required
        disabled={!selectedExam} // Disable if no exam is selected
      >
        <option value="">--Select Course--</option>
        {courses.map((course) => (
          <option key={course.courseCreationId} value={course.courseCreationId}>
            {course.courseName}
          </option>
        ))}
      </select>

      <br /><br />
      <label htmlFor="documentfile"> Upload UploadFormat:</label>
      <input type="file" id="documentfile" onChange={handleFileChange} accept="*/*" required />
      <br /><br />

      <button type="submit">Upload</button>
    </form>
      </div>
    </div>
  )
}

export default Documentuploder