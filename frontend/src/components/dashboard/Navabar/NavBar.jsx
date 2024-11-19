import React,{ useState, useEffect } from 'react'
import { FaTachometerAlt, FaBook, FaClipboardList, FaShoppingCart, FaUser } from 'react-icons/fa'; // Importing specific icons
import './NavBar.css'
const NavBar = ({ userId }) => {
  const [activeButton, setActiveButton] = useState('');
  useEffect(() => {
    const path = window.location.pathname;
    if (path === `/UserDashboard/${userId}`) {
      setActiveButton('Dashboard');
    } else if (path === `/Mycourses/${userId}`) {
      setActiveButton('/Mycourses');
    }
    else if (path === `/FinalTestMicrocourses/${userId}`) {
      setActiveButton('/FinalTestMicrocourses');
    }else if (path === `/BuyCourses/${userId}`) {
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
            <FaTachometerAlt className="nav-icon" /> Dashboard
        </div>
    </a>
    <a href={`/Mycourses/${userId}`}>
        <div className={`btnudnb nav-button ${activeButton === '/Mycourses' ? 'active' : ''}`}>
            <FaBook className="nav-icon" /> My Courses
        </div>
    </a>
    <a href={`/FinalTestMicrocourses/${userId}`}>
        <div className={`btnudnb nav-button ${activeButton === '/FinalTestMicrocourses' ? 'active' : ''}`}>
            <FaClipboardList className="nav-icon" /> My Tests
        </div>
    </a>
    <a href={`/BuyCourses/${userId}`}>
        <div className={`btnudnb nav-button ${activeButton === 'BuyCourses' ? 'active' : ''}`}>
            <FaShoppingCart className="nav-icon" /> Buy Courses
        </div>
    </a>
    <a href={`/Myaccount/${userId}`}>
        <div className={`btnudnb nav-button ${activeButton === 'MyAccount' ? 'active' : ''}`}>
            <FaUser className="nav-icon" /> My Account
        </div>
    </a>
</div>
    </div>
  )
}
 
export default NavBar
 