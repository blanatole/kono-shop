const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const { User } = require('../models/user');
const { Category } = require('../models/category');
const { SubCategory } = require('../models/subCat');
const { Product } = require('../models/products');
const { ProductReviews } = require('../models/productReviews');
const { ProductSize } = require('../models/productSize');
const { ProductWeight } = require('../models/productWeight');
const { RecentlyViewd } = require('../models/recentlyViewd');
const { Cart } = require('../models/cart');
const { MyList } = require('../models/myList');
const { Orders } = require('../models/orders');
const { HomeBanner } = require('../models/homeBanner');
const { ImageUpload } = require('../models/imageUpload');

const models = [
  User,
  Category,
  SubCategory,
  Product,
  ProductReviews,
  ProductSize,
  ProductWeight,
  RecentlyViewd,
  Cart,
  MyList,
  Orders,
  HomeBanner,
  ImageUpload,
];

async function initDatabase() {
  if (!process.env.CONNECTION_STRING) {
    throw new Error('CONNECTION_STRING is not set.');
  }

  const options = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};
  await mongoose.connect(process.env.CONNECTION_STRING, options);

  for (const model of models) {
    await model.createCollection();
    await model.createIndexes();
    const indexes = await model.collection.indexes();
    console.log(`${model.collection.name}: ${indexes.length} indexes ready`);
  }

  await mongoose.disconnect();
}

initDatabase().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
