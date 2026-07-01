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
  ['users', User],
  ['categories', Category],
  ['subcategories', SubCategory],
  ['products', Product],
  ['productreviews', ProductReviews],
  ['productsizes', ProductSize],
  ['productweights', ProductWeight],
  ['recentlyviewds', RecentlyViewd],
  ['carts', Cart],
  ['mylists', MyList],
  ['orders', Orders],
  ['homebanners', HomeBanner],
  ['imageuploads', ImageUpload],
];

async function main() {
  if (!process.env.CONNECTION_STRING) {
    throw new Error('CONNECTION_STRING is not set.');
  }

  const options = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};
  await mongoose.connect(process.env.CONNECTION_STRING, options);

  const result = {};
  for (const [name, model] of models) {
    result[name] = await model.countDocuments();
  }

  console.log(JSON.stringify(result, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
