// src/pages/QRCodePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import qrCodeImage from '../assets/images/qrcode.jpg'; // Thay đường dẫn tương ứng

const QRCodePage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(120); // 120 giây = 2 phút

  useEffect(() => {
    // Chuyển hướng sau 2 phút (120000 ms)
    const redirectTimeout = setTimeout(() => {
      navigate('/failed');
    }, timeLeft * 1000);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(redirectTimeout);
      clearInterval(timer);
    };
  }, [navigate, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="qrcode-page container text-center mt-5">
      <h2>Thanh Toán Bằng QR Code</h2>
      <p>Quét mã QR bên dưới để thanh toán:</p>
      <img src={qrCodeImage} alt="QR Code Ngân Hàng" className="img-fluid" />
      <p className="mt-3">Hạn thanh toán kết thúc sau: .</p>
      <h3>{formatTime(timeLeft)}</h3>
    </div>
  );
};

export default QRCodePage;