import React, { useState, useEffect } from 'react';
import axios from 'axios';


const DocumentUploader = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [file, setFile] = useState(null);

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
    setSelectedCourse('');
    setCourses([]);
    if (examId) {
      fetchMicroCourseNames(examId);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const fetchMicroCourseNames = async (examId) => {
    try {
      const response = await axios.get(`http://localhost:5000/MicroCourseNames/${examId}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching micro course names:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      alert("Please upload a document.");
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('examId', selectedExam);
    formData.append('courseId', selectedCourse);

    try {
      const response = await axios.post('http://localhost:5000/ORVL_uploadDocument', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document. Please try again.');
    }
  };

  return (
    <div className="document-uploader">
      <h1>Document Uploader</h1>
      <form onSubmit={handleSubmit}>
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
          disabled={!selectedExam}
        >
          <option value="">--Select Course--</option>
          {courses.map((course) => (
            <option key={course.courseCreationId} value={course.courseCreationId}>
              {course.courseName}
            </option>
          ))}
        </select>

        <br /><br />

        <label htmlFor="documentfile">Upload Document:</label>
        <input type="file" id="documentfile" onChange={handleFileChange} accept="*/*" required />
        <br /><br />

        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default DocumentUploader;
