import React,{useEffect,useState} from 'react'
import './styles/Instruction.css'
import {useParams, useNavigate } from 'react-router-dom';
import HeaderMc from '../Headermicrocourses/HeaderMc';


const GeneralInstructions = () => {
    const [isChecked, setIsChecked] = useState(false);
    const { id, finalTestId,courseId } = useParams();
    const navigate = useNavigate();

    // Handle change for the checkbox
    const handleCheckboxChange = () => {
      setIsChecked(!isChecked); // Toggle the checkbox state
    };
    const Navigatetoprevious = () => {
       
      
        navigate(`/Finaltestinstuctions/${id}/${courseId}/${finalTestId}`);
     }
    const Navigatetonext = () => {
       
      
        navigate(`/FinalTestquestionPage/${id}/${courseId}/${finalTestId}`);
     }
  return (
    <div>
         <HeaderMc/>
         <div className='userInterfaceMainCon'>
       <div ><h1 className='h1gi'> General Instructions</h1></div> 
       <div><div><h3>Read the following instructions carefully</h3></div>
       <ol><li >The clock will be set at the server. The countdown timer at the top, right-hand side of the screen will display the time available for you to complete the examination. When the timer reaches zero, the examination will end automatically. You will not be required to end or submit your examination.</li>
         <li>The Question Palette displayed on the right-hand side of the screen will show the status of each question using one of the following
         symbols:<br />
         </li><ul className='ulbc'><li><span className='bc1'>1</span> This question has not been visited yet.</li>
         <li><span className='bc2'>2</span> This question is visted but not answered.</li>
         <li><span className='bc3'>3</span> This question has been answered and will consider for evalution.</li>
         <li><span className='bc4'>4</span> This question has been marked for review and  has not been  answered.</li>
         <li><span className='bc5'>5</span> This question has been answered and marked for review which will consider for mark for evalution.</li>
         <li><p>The Marked for Review status for a question simply indicates that you would like to look at that question again.<span className='red'> If a question is answered and Marked for Review, your answer for that question will be considered in the evaluation.</span></p></li></ul>
         <li> To answer a question, do the following:</li>
         <ol type="a"><li>Click on the question number in the Question Palette to go to that question directly.</li>
         <li> Click on Save and Next to save your answer for the current question and then go to the next question.</li>
         <li>Click on Mark for Review and Next to save your answer for the current question, mark it for review, and then go to the next question.</li>
         <li><span className='red'> Caution: Note that your answer for the current question will not be saved, if you navigate to another question directly by clicking on its question number.</span></li></ol></ol>
             {/* Declaration Checkbox */}
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={isChecked} 
              onChange={handleCheckboxChange} 
            />
            I have read and understood the instructions. I am ready to begin.
          </label>
        </div>

        {/* Button that is disabled unless the checkbox is checked */}
        <div className='btnnextprev'>
        <button 
          className=" btnfornext" 
          
          onClick={Navigatetoprevious}
          
        >
          previous
        </button>
        <button 
          className="ready-button btnfornext" 
          disabled={!isChecked}
          onClick={Navigatetonext}
          
        >
          I am ready to begin
        </button></div></div></div>
    </div>
  )
}

export default GeneralInstructions