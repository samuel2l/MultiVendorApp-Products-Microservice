const mongoose = require('mongoose');
const Product  = require("../models/Product");

class ProductRepository {


    async CreateProduct({ name, desc,img, type, unit,price, available, supplier }){

        const product = new Product({
            name, desc,img, type, unit,price, available, supplier
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
    
}

module.exports = ProductRepository;
