const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const { Category } = require('../models/category');
const { SubCategory } = require('../models/subCat');
const { Product } = require('../models/products');
const { ProductSize } = require('../models/productSize');
const { ProductWeight } = require('../models/productWeight');
const { HomeBanner } = require('../models/homeBanner');

const BASE_URL = 'https://tokyolife.vn';
const MAX_CATEGORY_CANDIDATES = 30;
const MAX_CATEGORIES = 10;
const PRODUCTS_PER_CATEGORY = 10;

const sizeSeeds = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', 'Free Size'];
const weightSeeds = ['100g', '150g', '200g', '250g', '300g', '350g', '400g', '450g', '500g', '1kg'];

function stripHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanText(value = '') {
  return stripHtml(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function slugify(value = '') {
  return cleanText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function absoluteUrl(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${BASE_URL}${value}`;
  }

  return `${BASE_URL}/${value.replace(/^\/+/, '')}`;
}

function normalizePrice(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return 0;
  }

  const parsed = Number(value.replace(/[^\d]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function findFirstString(object, keys) {
  for (const key of keys) {
    if (typeof object?.[key] === 'string' && cleanText(object[key])) {
      return cleanText(object[key]);
    }
  }

  return '';
}

function findFirstNumber(object, keys) {
  for (const key of keys) {
    const price = normalizePrice(object?.[key]);
    if (price > 0) {
      return price;
    }
  }

  return 0;
}

function addImage(images, value) {
  if (!value || typeof value !== 'string') {
    return;
  }

  const url = absoluteUrl(value);
  if (/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url) && !images.includes(url)) {
    images.push(url);
  }
}

function collectImages(value, images = [], depth = 0) {
  if (!value || depth > 5 || images.length >= 6) {
    return images;
  }

  if (typeof value === 'string') {
    addImage(images, value);
    return images;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectImages(item, images, depth + 1);
      if (images.length >= 6) {
        break;
      }
    }

    return images;
  }

  if (typeof value === 'object') {
    const preferredKeys = [
      'resized_image',
      'optimized_original_image',
      'thumbnail',
      'image_link',
      'link',
      'url',
      'image',
      'images',
      'pc_images',
      'mobile_images',
      'favicon',
    ];

    for (const key of preferredKeys) {
      collectImages(value[key], images, depth + 1);
      if (images.length >= 6) {
        break;
      }
    }
  }

  return images;
}

function traverse(value, visitor, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) {
    return;
  }

  seen.add(value);
  visitor(value);

  for (const item of Array.isArray(value) ? value : Object.values(value)) {
    traverse(item, visitor, seen);
  }
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'user-agent': 'Mozilla/5.0 KonoShopDemoSeeder/2.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Cannot fetch ${url}: ${response.status}`);
  }

  return response.text();
}

function extractNextData(html) {
  const marker = '<script id="__NEXT_DATA__" type="application/json">';
  const start = html.indexOf(marker);

  if (start < 0) {
    return null;
  }

  const end = html.indexOf('</script>', start);
  return JSON.parse(html.slice(start + marker.length, end));
}

function collectCategoriesFromHome(data) {
  const categories = new Map();

  traverse(data, (node) => {
    const link = absoluteUrl(findFirstString(node, ['link', 'url', 'href', 'uri', 'redirect_link']));

    if (!link.includes('/danh-muc-san-pham/')) {
      return;
    }

    const pathSlug = link.split('/').filter(Boolean).pop();
    const name = findFirstString(node, ['alt', 'name', 'title', 'label']) || pathSlug;
    const slug = slugify(pathSlug || name);
    const images = collectImages(node);

    if (name && slug && !categories.has(slug)) {
      categories.set(slug, {
        name: cleanText(name),
        slug,
        image: images[0] || '',
        sourceUrl: link,
      });
    }
  });

  return [...categories.values()].slice(0, MAX_CATEGORY_CANDIDATES);
}

function extractSizeOptions(product) {
  const sizes = new Set();

  for (const variant of product.variants || []) {
    for (const option of variant.options || []) {
      const code = String(option.option_code || option.option_label || '').toLowerCase();
      if (!code.includes('size')) {
        continue;
      }

      const rawValue = cleanText(option.value || option.label || '');
      const size = rawValue.replace(/^size\s+/i, '').trim();
      if (size) {
        sizes.add(size);
      }
    }
  }

  return [...sizes].slice(0, 8);
}

function normalizeProduct(product, category, index) {
  const variant = (product.variants || []).find((item) => collectImages(item).length) || product.variants?.[0] || {};
  const images = collectImages(product).concat(collectImages(variant));
  const uniqueImages = [...new Set(images)].slice(0, 5);

  const price =
    findFirstNumber(product, ['sale_price', 'current_price', 'price', 'range_sale_price']) ||
    findFirstNumber(variant, ['sale_price', 'current_price', 'price']);
  const oldPrice =
    findFirstNumber(product, ['origin_price', 'price', 'range_price']) ||
    findFirstNumber(variant, ['origin_price', 'price']) ||
    price;
  const explicitDiscount = Number(product.discount_percent || product.display_discount_percent || variant.discount_percent || 0);
  const discount = explicitDiscount > 0
    ? Math.round(explicitDiscount)
    : oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  return {
    name: cleanText(product.name),
    description: cleanText(product.features || product.description || `${category.name} demo product from TokyoLife.`),
    images: uniqueImages,
    price,
    oldPrice,
    discount,
    productCode: cleanText(product.product_code || product.sku || product.path || `${category.slug}-${index}`),
    sourceUrl: absoluteUrl(product.path || category.sourceUrl),
    size: extractSizeOptions(product),
    countInStock: Number(product.ec_inventory || product.inventory || variant.ec_inventory || variant.inventory || 0),
  };
}

async function crawlCategoryProducts(category) {
  const html = await fetchHtml(category.sourceUrl);
  const data = extractNextData(html);
  const pageData = data?.props?.pageProps?.data;

  if (!pageData || !Array.isArray(pageData.products)) {
    return {
      ...category,
      image: category.image || collectImages(pageData)[0] || '',
      products: [],
    };
  }

  const categoryImage = category.image || collectImages(pageData)[0] || '';
  const products = pageData.products
    .map((product, index) => normalizeProduct(product, category, index))
    .filter((product) => product.name && product.price > 0 && product.images.length > 0)
    .slice(0, PRODUCTS_PER_CATEGORY);

  return {
    ...category,
    image: categoryImage,
    products,
  };
}

async function crawlTokyoLife() {
  const homeHtml = await fetchHtml(BASE_URL);
  const homeData = extractNextData(homeHtml);

  if (!homeData) {
    throw new Error('Cannot find TokyoLife __NEXT_DATA__.');
  }

  const categories = collectCategoriesFromHome(homeData);
  const crawledCategories = [];

  for (const category of categories) {
    if (crawledCategories.length >= MAX_CATEGORIES) {
      break;
    }

    try {
      const crawled = await crawlCategoryProducts(category);
      console.log(`${crawled.name}: ${crawled.products.length} products`);

      if (crawled.products.length < PRODUCTS_PER_CATEGORY) {
        console.warn(`Skip ${crawled.name}: only ${crawled.products.length} products`);
        continue;
      }

      crawledCategories.push(crawled);
    } catch (error) {
      console.warn(`Skip ${category.sourceUrl}: ${error.message}`);
    }
  }

  return {
    candidates: categories,
    selected: crawledCategories,
  };
}

async function upsertReferenceData() {
  for (const size of sizeSeeds) {
    await ProductSize.findOneAndUpdate({ size }, { size }, { upsert: true, new: true });
  }

  for (const productWeight of weightSeeds) {
    await ProductWeight.findOneAndUpdate(
      { productWeight },
      { productWeight },
      { upsert: true, new: true }
    );
  }
}

async function upsertDemoData(categories, candidateSlugs = []) {
  await upsertReferenceData();
  await Product.deleteMany({ brand: 'TokyoLife' });
  await SubCategory.deleteMany({ subCat: / Demo$/ });
  await HomeBanner.deleteMany({ images: /^https:\/\/s3-hni02\.higiocloud\.vn/ });

  const selectedSlugs = categories.map((category) => category.slug);
  const staleSlugs = candidateSlugs.filter((slug) => !selectedSlugs.includes(slug));
  if (staleSlugs.length) {
    await Category.deleteMany({ slug: { $in: staleSlugs } });
  }

  const savedCategories = new Map();
  let productCount = 0;

  for (const category of categories) {
    const savedCategory = await Category.findOneAndUpdate(
      { slug: category.slug },
      {
        $set: {
          name: category.name,
          slug: category.slug,
          images: category.image ? [category.image] : [],
          color: '#f7f1ea',
        },
        $unset: { parentId: '' },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    savedCategories.set(category.slug, savedCategory);

    const subCategory = await SubCategory.findOneAndUpdate(
      { category: savedCategory._id, subCat: `${category.name} Demo` },
      {
        category: savedCategory._id,
        subCat: `${category.name} Demo`,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (category.image) {
      await HomeBanner.findOneAndUpdate(
        { images: category.image },
        { images: [category.image] },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    for (const [index, product] of category.products.entries()) {
      await Product.create({
        name: product.name,
        description: `${product.description} Source: ${product.sourceUrl}`,
        images: product.images,
        brand: 'TokyoLife',
        price: product.price,
        oldPrice: product.oldPrice,
        catName: savedCategory.name,
        catId: savedCategory._id.toString(),
        subCatId: subCategory._id.toString(),
        subCat: subCategory.subCat,
        category: savedCategory._id,
        countInStock: product.countInStock > 0 ? product.countInStock : 30 + index,
        rating: 4 + (index % 2) * 0.5,
        isFeatured: index < 3,
        discount: product.discount,
        size: product.size.length ? product.size : sizeSeeds.slice(0, 5),
        productWeight: weightSeeds.slice(0, 3),
        location: 'All',
      });

      productCount += 1;
    }
  }

  return {
    categories: savedCategories.size,
    products: productCount,
    expectedProducts: categories.length * PRODUCTS_PER_CATEGORY,
    sizes: sizeSeeds.length,
    weights: weightSeeds.length,
  };
}

async function main() {
  if (!process.env.CONNECTION_STRING) {
    throw new Error('CONNECTION_STRING is not set.');
  }

  const options = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};
  await mongoose.connect(process.env.CONNECTION_STRING, options);

  const crawled = await crawlTokyoLife();
  const categories = crawled.selected;

  if (categories.length < MAX_CATEGORIES) {
    throw new Error(`Only found ${categories.length} categories with at least ${PRODUCTS_PER_CATEGORY} products.`);
  }

  const result = await upsertDemoData(categories, crawled.candidates.map((category) => category.slug));
  console.log(JSON.stringify(result, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
