import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/BuyCourses.css'

const PaymentPage = () => {
    const { id, courseId } = useParams(); // Capture id and courseId from URL
    console.log("Params:", useParams()); // Log entire params object

    console.log("ID:", id, "Course ID:", courseId); // Log the IDs for debugging
    const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
    console.log("ID:", id, "Course ID:", courseId); 
    // Fetch the courses when the component mounts
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/microcourses/courses_main?userId=${id}`);
                console.log("Fetched courses:", response.data); // Log the fetched courses
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
                alert('Failed to fetch courses.');
            }
        };

        fetchCourses();
    }, [id]);

    const initiatePayment = async (courseId) => {
        console.log("Initiating payment for courseId:", courseId);
        try {
            // Convert courseId to a number for comparison
            const course = courses.find(c => c.courseCreationId === Number(courseId)); // Use 'courses' instead of 'setCourses'
            if (!course) {
                console.error('Course not found for courseId:', courseId, 'Available courses:', courses);
                throw new Error('Course not found');
            }
    
            const paymentResponse = await axios.post('http://localhost:5000/Payment/create-order', {
                amount: course.totalPrice // Amount in paise
            });
    
            const options = {
                key: 'rzp_test_x3lel82AZIsRl6', // Replace with your Razorpay key
                amount: paymentResponse.data.amount,
                currency: paymentResponse.data.currency,
                name: 'Course Purchase',
                description: course.courseName,
                order_id: paymentResponse.data.id,
                handler: async (response) => {
                    if (response.razorpay_payment_id) {
                        await handleBuyCourse(course.courseCreationId, response);
                    } else {
                        console.error('Payment failed or was cancelled:', response);
                        alert('Payment was not successful. Please try again.');
                    }
                },
                prefill: {
                    name: userInfo.name,
                    email: userInfo.email,
                    contact: userInfo.phone
                },
                theme: {
                    color: '#F37254'
                }
            };
    
            const razorpay = new window.Razorpay(options);
            razorpay.open();
    
            razorpay.on('closed', function() {
                console.log('Payment window closed by user.');
                alert('Payment was cancelled. No transaction was made.');
            });
    
        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('An error occurred while initiating payment.');
        }
    };
    

    const handleBuyCourse = async (courseId, paymentResponse) => {
        try {
            const purchaseResponse = await axios.post('http://localhost:5000/Payment/buy_course', {
                userId: id,
                courseCreationId: courseId,
                paymentId: paymentResponse.razorpay_payment_id,
                status: 1,
            });
            alert(purchaseResponse.data.message);
            if (purchaseResponse.data.redirectUrl) {
                navigate(purchaseResponse.data.redirectUrl);
            }
        } catch (error) {
            console.error('Error during purchase:', error);
            alert('Failed to purchase course.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo({ ...userInfo, [name]: value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting payment for courseId:", courseId); // Check this log
        await initiatePayment(courseId);
    };

    return (
        <div className='paymentform'> 
            <h2>Enter Your Details</h2>
            <form onSubmit={handleFormSubmit} className='paymentformflex'>
                <input 
                    type="text" 
                    name="name" 
                    placeholder="Your Name" 
                    value={userInfo.name} 
                    onChange={handleInputChange}
                    className='inputfpem inputpayment' 
                    required 
                />
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Your Email" 
                    value={userInfo.email} 
                    onChange={handleInputChange}
                    className='inputfpem inputpayment' 
                    required 
                />
                <input 
                    type="tel" 
                    name="phone" 
                    placeholder="Your Phone Number" 
                    value={userInfo.phone} 
                    onChange={handleInputChange} 
                    className='inputfpem inputpayment'
                    required 
                />
                <div className='btnflex'>
                    <button type="submit" className='btnpayment'>Proceed to Payment</button>
                </div>
            </form>
        </div>
    );
}

export default PaymentPage;
