const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const vnp_TmnCode = 'Z2BZO3Z3'; // Mã website của bạn tại VNPay
const vnp_HashSecret = 'F3I9CQ51N8EHHH57M6ZUFCSFYM60AP7L'; // Chuỗi bí mật
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'; // URL thanh toán của VNPay (sandbox hoặc production)

// Tạo URL thanh toán
router.post('/create_payment_url', (req, res) => {
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const tmnCode = vnp_TmnCode;
    const secretKey = vnp_HashSecret;
    const vnpUrl = vnp_Url;
    const returnUrl = `http://localhost:${process.env.PORT_VNPAY}/vnpay_return`; // URL trả về sau khi thanh toán

    const date = new Date();
    const createDate = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const orderId = date.getTime().toString();
    const amount = req.body.amount;
    const orderInfo = req.body.orderDescription;
    const orderType = req.body.orderType;
    const locale = req.body.language || 'vn';
    const currCode = 'VND';
    const vnp_Params = {};

    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params['vnp_SecureHashType'] = 'SHA256';
    const sortedParams = Object.keys(vnp_Params).sort();
    const signData = sortedParams.map(key => `${key}=${vnp_Params[key]}`).join('&');
    const hmac = crypto.createHmac('sha256', secretKey);
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = secureHash;

    const paymentUrl = `${vnpUrl}?${sortedParams.map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`).join('&')}`;
    console.log({ paymentUrl });
    res.json({ paymentUrl });
});

// Xử lý phản hồi từ VNPay
router.get('/vnpay_return', (req, res) => {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = Object.keys(vnp_Params).sort();
    const signData = sortedParams.map(key => `${key}=${vnp_Params[key]}`).join('&');
    const hmac = crypto.createHmac('sha256', vnp_HashSecret);
    const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === checkSum) {
        res.json({ message: 'Payment success', vnp_Params });
    } else {
        res.json({ message: 'Payment failed', vnp_Params });
    }
});

module.exports = router;