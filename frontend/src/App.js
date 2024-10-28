import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/Mycourses" element={<Mycourses />} />
          <Route path="/BuyCourses" element={<BuyCourses />} />
          <Route path="/Myaccount" element={<Myaccount />} />
          <Route path="/Documentuploder" element={<Documentuploder/>} />


            </Routes>
            </Suspense>
            </BrowserRouter>
    </div>
  );
}

export default App;
