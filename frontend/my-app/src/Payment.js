import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { server } from './server';

function Payment({ 
    amount = 50000, 
    currency = "INR", 
    receiptId = "qwsaq1" 
}) {
    const [loading, setLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false); // State for payment success

    // Check local storage for payment status on component mount
    useEffect(() => {
        const storedPaymentStatus = localStorage.getItem('paymentSuccess');
        if (storedPaymentStatus === 'true') {
            setPaymentSuccess(true);
        }
    }, []);

    const paymentHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create an order on the server
            const orderResponse = await fetch(`${server}/order`, {
                method: "POST",
                body: JSON.stringify({
                    amount,
                    currency,
                    receipt: receiptId,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const order = await orderResponse.json();
            console.log(order)

            if (order.order && order.order.id) {
                const options = {
                    key: process.env.RAZORPAY_KEY_ID,
                    amount: order.order.amount,
                    currency,
                    name: "FruitBox",
                    description: "Booking Payment",
                    order_id: order.order.id,
                    handler: async (response) => {
                        const verifyResponse = await fetch(`${server}/verify-payment`, {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyResult = await verifyResponse.json();
                        if (verifyResult.success) {
                            setPaymentSuccess(true); // Set payment success to true
                            // localStorage.setItem('paymentSuccess', 'true'); // Store in local storage
                        } else {
                            alert('Payment verification failed!');
                        }
                    },
                    prefill: {
                        name: 'Neha Patel',
                        email: 'nehapatel@gmail.com',
                        contact: '9302491596',
                    },
                    theme: {
                        color: "#F37254",
                    },
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', (response) => {
                    alert("Payment failed: " + response.error.description);
                });

                rzp1.open();
            } else {
                alert('Order creation failed!');
            }
        } catch (error) {
            console.error("Error creating order", error);
            alert("Payment failed");
        } finally {
            setLoading(false); // Stop loading regardless of success or failure
        }
    };

    return (
        <div>

                <button 
                    onClick={paymentHandler} 
                    disabled={loading} 
                    aria-label={`Pay ₹${amount / 100}`} 
                    style={{ backgroundColor: '#F37254', color: '#fff' }}
                >
                    {loading ? 'Processing...' : `Pay ₹${amount / 100}`}
                </button>
            
        </div>
    );
}

export default Payment;
