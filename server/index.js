const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

let isDbConnected = false;
const PORT = process.env.PORT || 8000;

app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
app.use(express.json());


//Routes
const userRoutes = require('./routes/user.js');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const imageUploadRoutes = require('./helper/imageUpload.js');
const productWeightRoutes = require('./routes/productWeight.js');
const productSIZESRoutes = require('./routes/productSize.js');
const productReviews = require('./routes/productReviews.js');
const cartSchema = require('./routes/cart.js');
const myListSchema = require('./routes/myList.js');
const ordersSchema = require('./routes/orders.js');
const homeBannerSchema = require('./routes/homeBanner.js');
const searchRoutes = require('./routes/search.js');
const vnpayRoutes = require('./routes/payment.js');

app.use("/api/user",userRoutes);
app.use("/uploads",express.static("uploads"));
app.use(`/api/category`, categoryRoutes);
app.use(`/api/products`, productRoutes);
app.use(`/api/imageUpload`, imageUploadRoutes);
app.use(`/api/productWeight`, productWeightRoutes);
app.use(`/api/productSIZE`, productSIZESRoutes);
app.use(`/api/productReviews`, productReviews);
app.use(`/api/cart`, cartSchema);
app.use(`/api/my-list`, myListSchema);
app.use(`/api/orders`, ordersSchema);
app.use(`/api/homeBanner`, homeBannerSchema);
app.use(`/api/search`, searchRoutes);
app.use(`/api/vnpay`, vnpayRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        database: isDbConnected ? 'connected' : 'disconnected'
    });
});

//Database
if (process.env.CONNECTION_STRING) {
const dbOptions = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};

mongoose.connection.on('connected', () => {
    isDbConnected = true;
});

mongoose.connection.on('disconnected', () => {
    isDbConnected = false;
});

mongoose.connect(process.env.CONNECTION_STRING, dbOptions)
    .then(() => {
        isDbConnected = true;
        console.log('Database Connection is ready...');
    })
    .catch((err) => {
        isDbConnected = false;
        console.error('Database connection failed:', err.message);
    });
} else {
    console.warn('CONNECTION_STRING is not set. Server will run without database connection.');
}

app.listen(PORT, () => {
    console.log(`server is running http://localhost:${PORT}`);
});
