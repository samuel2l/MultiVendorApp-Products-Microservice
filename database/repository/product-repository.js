const mongoose = require('mongoose');
const Product  = require("../models/Product");

class ProductRepository {


    async CreateProduct({ name, desc,img, type, stock,price, available, seller }){

        const product = new Product({
            name, desc,img, type, stock,price, available, seller
        })

        const productResult = await product.save();
        return productResult;
    }


     async Products(){
        return await Product.find();
    }
   
    async FindById(id){
        
       return await Product.findById(id);

    }

    async FindByCategory(category){

        const products = await Product.find({ type: category});

        return products;
    }

    async FindSelectedProducts(selectedIds){
        const products = await Product.find().where('_id').in(selectedIds.map(_id => _id)).exec();
        return products;
    }

    async UpdateProduct(id, updatedData) {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true }
        );
        return updatedProduct;
    }
    
}

module.exports = ProductRepository;
