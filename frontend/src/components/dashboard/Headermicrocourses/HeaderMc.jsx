import React from 'react'
import logo from '../Images/logo.png'
import './HeaderMc.css'
import { MdHome } from "react-icons/md";
const HeaderMc = () => {
  return (
    <div>
        <div className="headermc">
            <div className="subheadermc">
                <div className="imglogo">
                    <img src={logo} alt="logo" />
                </div>
 
                <div className='Home_Container'>
                  <span><MdHome /></span>
                  <p>Home</p>
                </div>
            </div>
        </div>
    </div>
  )
}
 
export default HeaderMc
 