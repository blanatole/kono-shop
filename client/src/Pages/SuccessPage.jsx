// src/pages/SuccessPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Chuyển hướng đến trang chủ sau 5 giây (5000 ms)
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-page container text-center mt-5">
      <h2>Thanh Toán Thành Công!</h2>
      <p>Cảm ơn bạn đã mua sắm. Bạn sẽ được chuyển hướng đến trang chủ trong giây lát.</p>
    </div>
  );
};

export default SuccessPage;