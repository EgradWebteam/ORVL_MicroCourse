import React,{ useState, useEffect } from 'react'
import './NavBar.css'
const NavBar = () => {
  const [activeButton, setActiveButton] = useState('');
  useEffect(() => {
    const path = window.location.pathname;
    if (path === `/Dashboard`) {
      setActiveButton('Dashboard');
    } else if (path === `/Mycourses`) {
      setActiveButton('Mycourses');
    } else if (path === `/BuyCourses`) {
      setActiveButton('BuyCourses');
    } else if (path === `/Myaccount`) {
      setActiveButton('Myaccount');
    }
  }, []);

  return (
    <div>
       <div>
       <a href={`/Dashboard`}>
          <button className={`btnudnb nav-button ${activeButton === 'Dashboard' ? 'active' : ''}`}>
            Dashboard
          </button>
        </a>
        <a href={`/Mycourses`}>
          <button className={`btnudnb nav-button ${activeButton === 'MyCourses' ? 'active' : ''}`}>
            My Courses
          </button>
        </a>
        <a href={`/BuyCourses`}>
          <button className={`btnudnb nav-button ${activeButton === 'BuyCourses' ? 'active' : ''}`}>
            Buy Courses
          </button>
        </a>
        <a href={`/Myaccount`}>
          <button className={`btnudnb nav-button ${activeButton === 'MyAccount' ? 'active' : ''}`}>
            My Account
          </button>
        </a>
       </div>
    </div>
  )
}

export default NavBar