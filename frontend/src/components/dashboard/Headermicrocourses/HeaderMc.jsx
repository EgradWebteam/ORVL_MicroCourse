import React from 'react'
import logo from '../Images/logo.png'
import './HeaderMc.css'

const HeaderMc = () => {
  return (
    <div>
        <div className="headermc">
            <div className="subheadermc">
                <div className="imglogo">
                    <img src={logo} alt="logo" />
                </div>
            </div>
        </div>
    </div>
  )
}

export default HeaderMc