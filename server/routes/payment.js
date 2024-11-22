const express = require('express');
const router = express.Router();
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const config = require('../config/vnpay');

router.post('/create_payment', function (req, res, next) {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId = moment(date).format('DDHHmmss');
    const amount = req.body.amount;
    
    let vnpUrl = config.vnp_Url;
    const vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': config.vnp_TmnCode,
        'vnp_Locale': 'vn',
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': orderId,
        'vnp_OrderInfo': 'Thanh toan cho ma GD: ' + orderId,
        'vnp_OrderType': 'billpayment',
        'vnp_Amount': amount * 100,
        'vnp_ReturnUrl': config.vnp_ReturnUrl,
        'vnp_IpAddr': req.ip,
        'vnp_CreateDate': createDate
    };

    if (req.body.bankCode) {
        vnp_Params['vnp_BankCode'] = req.body.bankCode;
    }

    // Sắp xếp các tham số theo thứ tự a-z
    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.json({ code: '00', data: vnpUrl });
});

router.get('/vnpay_return', function (req, res, next) {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp lại các tham số
    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if(secureHash === signed){
        // Kiểm tra xem dữ liệu trong db có trùng khớp không
        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];

        // Kiểm tra mã giao dịch: vnp_ResponseCode
        if(rspCode === "00") {
            // Cập nhật trạng thái đơn hàng trong db
            // Order.findOneAndUpdate({orderId: orderId}, {status: 'paid'})
            res.json({
                code: '00',
                message: 'Success'
            });
        } else {
            res.json({
                code: '01',
                message: 'Error'
            });
        }
    } else {
        res.json({
            code: '97',
            message: 'Invalid Signature'
        });
    }
});

// Hàm sắp xếp object theo key
function sortObject(obj) {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj){
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = router;