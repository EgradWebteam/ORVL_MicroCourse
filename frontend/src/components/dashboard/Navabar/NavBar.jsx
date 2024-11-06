import React,{ useState, useEffect } from 'react'
import './NavBar.css'
const NavBar = ({ userId }) => {
  const [activeButton, setActiveButton] = useState('');
  useEffect(() => {
    const path = window.location.pathname;
    if (path === `/UserDashboard/${userId}`) {
      setActiveButton('Dashboard');
    } else if (path === `/Mycourses/${userId}`) {
      setActiveButton('/Mycourses');
    } else if (path === `/BuyCourses/${userId}`) {
      setActiveButton('BuyCourses');
    } else if (path === `/Myaccount/${userId}`) {
      setActiveButton('MyAccount');
    }
  }, []);

  return (
    <div className='navbarMicroCourses'>
       <div className='SubnavbarMicroCourses'>
       <a href={`/UserDashboard/${userId}`}>
          <div className={`btnudnb nav-button ${activeButton === 'Dashboard' ? 'active' : ''}`}>
            Dashboard
          </div>
        </a>
        <a href={`/Mycourses/${userId}`}>
          <div className={`btnudnb nav-button ${activeButton === '/Mycourses' ? 'active' : ''}`}>
            My Courses
          </div>
        </a>
        <a href={`/BuyCourses/${userId}`}>
          <div  className={`btnudnb nav-button ${activeButton === 'BuyCourses' ? 'active' : ''}`}>
            Buy Courses
          </div>
        </a>
        <a href={`/Myaccount/${userId}`}>
          <div  className={`btnudnb nav-button ${activeButton === 'MyAccount' ? 'active' : ''}`}>
            My Account
          </div>
        </a>
       </div>
    </div>
  )
}

export default NavBar