import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { walletAPI } from '../services/api'; // FIXED: Changed from khaltiAPI to walletAPI
import '../style.css';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get pidx from URL query parameter
        const pidx = searchParams.get('pidx');
        
        console.log('=== PAYMENT VERIFICATION START ===');
        console.log('pidx from URL:', pidx);
        
        if (!pidx) {
          console.error('No pidx found in URL');
          setStatus('error');
          setMessage('Invalid payment reference. Please contact support.');
          return;
        }

        console.log('Calling verify endpoint...');

        // Call backend to verify payment
        const response = await walletAPI.verifyTopup(pidx);
        
        console.log('Verify response:', response.data);

        if (response.data.success) {
          console.log('✅ Payment verified successfully!');
          setStatus('success');
          setMessage(`Payment successful! Rs ${(response.data.amount / 100).toFixed(2)} added to your wallet.`);
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/passenger-dashboard');
          }, 3000);
        } else {
          console.log('❌ Payment verification failed');
          setStatus('error');
          setMessage(response.data.message || 'Payment verification failed');
        }

      } catch (error) {
        console.error('❌ Verification error:', error);
        setStatus('error');
        setMessage('Failed to verify payment. Please check your wallet or contact support.');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="login-page">
      <div className="login-card" style={{maxWidth: '500px'}}>
        {status === 'verifying' && (
          <>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>⏳</div>
            <h2>Verifying Payment...</h2>
            <p style={{marginTop: '15px', color: '#666'}}>
              Please wait while we confirm your payment with Khalti.
            </p>
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              Do not close this window or press back.
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>✅</div>
            <h2 style={{color: '#4CAF50'}}>Payment Successful!</h2>
            <p style={{marginTop: '15px', fontSize: '16px'}}>
              {message}
            </p>
            <p style={{
              marginTop: '20px', 
              fontSize: '14px', 
              color: '#666'
            }}>
              Redirecting to your dashboard in 3 seconds...
            </p>
            <button 
              onClick={() => navigate('/passenger-dashboard')}
              className="signin-btn"
              style={{marginTop: '20px'}}
            >
              Go to Dashboard Now
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>❌</div>
            <h2 style={{color: '#e74c3c'}}>Verification Failed</h2>
            <p style={{marginTop: '15px', color: '#666'}}>
              {message}
            </p>
            <button 
              onClick={() => navigate('/passenger-dashboard')}
              className="signin-btn"
              style={{marginTop: '20px', backgroundColor: '#e88ec5'}}
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;