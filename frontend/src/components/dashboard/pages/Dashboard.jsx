import React from 'react'
import HeaderMc from  '../Headermicrocourses/HeaderMc'
import NavBar from '../Navabar/NavBar'
import { useParams, useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const { id } = useParams();
  return (
    <div>
      <HeaderMc/>
      <NavBar userId={id}/>
    </div>
  )
}

export default Dashboard