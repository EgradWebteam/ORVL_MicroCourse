import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
const PaymentPage = lazy(() => import('./components/dashboard/pages/PaymentPage'));
const FinalTestMicrocourses = lazy(() => import('./components/dashboard/pages/FinalTestMicrocourses'));
const Finaltestinstuctions = lazy(() => import('./components/dashboard/pages/Finaltestinstuctions'));
const GeneralInstructions = lazy(() => import('./components/dashboard/pages/GeneralInstructions'));
const FinalTestquestionPage = lazy(() => import('./components/dashboard/pages/FinalTestquestionPage'));
const CourseDetails= lazy(() => import( './components/dashboard/pages/CourseDetails'));
const TestResults= lazy(() => import( './components/dashboard/pages/TestResults'));
const Dashboard = lazy(() => import('./components/dashboard/pages/Dashboard'));
const Mycourses = lazy(() => import('./components/dashboard/pages/Mycourses'));
const BuyCourses = lazy(() => import('./components/dashboard/pages/BuyCourses'));
const Myaccount = lazy(() => import('./components/dashboard/pages/Myaccount'));
const Documentuploder = lazy(() => import('./components/documentuploader/Documentuploder'));

function App() {
  return (
    <div className="App">
      
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
          <Route path="/UserDashboard/:id" element={<Dashboard />} />
          <Route path="/Mycourses/:id" element={<Mycourses />} />
          <Route path="/BuyCourses/:id" element={<BuyCourses />} />
          <Route path="/Myaccount/:id" element={<Myaccount />} />
          <Route path="/PaymentPage/:id/:courseId" element={<PaymentPage />} />
          <Route path="/Documentuploder" element={<Documentuploder/>} />
          <Route path="/mycourses/course_details/:id/:courseId" element={<CourseDetails/>} />
          <Route path="/FinalTestMicrocourses/:id" element={<FinalTestMicrocourses/>}/>
          <Route path="/Finaltestinstuctions/:id/:courseId/:finalTestId" element={<Finaltestinstuctions/>}/>
          <Route path="/GeneralInstructions/:id/:courseId/:finalTestId" element={<GeneralInstructions/>}/>
          <Route path="/FinalTestquestionPage/:id/:courseId/:finalTestId" element={<FinalTestquestionPage/>}/>
          <Route path="/TestResults/:id/:courseId/:finalTestId" element={<TestResults/>}/>

            </Routes>
            </Suspense>
            </BrowserRouter>
    </div>
  );
}

export default App;
