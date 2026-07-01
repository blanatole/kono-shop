const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
        default: ''
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    oldPrice: {
        type: Number,
        default: 0,
        require: false
    },
    catName: {
        type: String,
        default: ''
    },
    catId: {
        type: String,
        default: ''
    },
    subCatId: {
        type: String,
        default: ''
    },
    subCat: {
        type: String,
        default: ''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    discount: {
        type: Number,
        required: false,
    },
    size: [
        {
            type: String,
            default: null,
        }
    ],
    productWeight: [
        {
            type: String,
            default: null,
        }
    ],
    location: {
        type: String,
        default: "All"
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

productSchema.index({ category: 1 });
productSchema.index({ catId: 1, location: 1 });
productSchema.index({ subCatId: 1, location: 1 });
productSchema.index({ isFeatured: 1, location: 1 });
productSchema.index({ rating: 1, catId: 1, location: 1 });
productSchema.index({ rating: 1, subCatId: 1, location: 1 });
productSchema.index({ name: "text", brand: "text", catName: "text", subCat: "text" });

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});

exports.Product = mongoose.model('Product', productSchema);
