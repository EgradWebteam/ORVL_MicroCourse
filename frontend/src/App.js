import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaymentPage from './components/dashboard/pages/PaymentPage';
const CourseDetails= lazy(() => import( './components/dashboard/pages/CourseDetails'));
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


            </Routes>
            </Suspense>
            </BrowserRouter>
    </div>
  );
}

export default App;
