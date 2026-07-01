const mongoose = require('mongoose');

const productWeightSchema = mongoose.Schema({
    productWeight:{
        type:String,
        default:null
    }
})

productWeightSchema.index({ productWeight: 1 });

productWeightSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productWeightSchema.set('toJSON', {
    virtuals: true,
});

exports.ProductWeight = mongoose.model('ProductWeight', productWeightSchema);
exports.productWeightSchema = productWeightSchema;
