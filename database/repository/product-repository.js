const mongoose = require("mongoose");
const Product = require("../models/Product");

class ProductRepository {
  async CreateProduct({
    name,
    desc,
    img,
    type,
    stock,
    price,
    available,
    sizes,
    colors,
    seller,
  }) {
    const product = new Product({
      name,
      desc,
      img,
      type,
      stock,
      price,
      available,
      sizes,
      colors,
      seller,
    });

    const productResult = await product.save();
    return productResult;
  }

  async Products() {
    return await Product.find();
  }

  async FindById(id) {
    return await Product.findById(id);
  }

  async FindByCategory(category) {
    const products = await Product.find({ type: category });

    return products;
  }

  async FindSelectedProducts(selectedIds) {
    const products = await Product.find()
      .where("_id")
      .in(selectedIds.map((_id) => _id))
      .exec();
    return products;
  }

  async UpdateProduct(id, updatedData) {
    print("Updated data received:", updatedData);

    // Remove empty or undefined arrays
    if (!Array.isArray(updatedData.img) || updatedData.img.length === 0) delete updatedData.img;
    if (!Array.isArray(updatedData.sizes) || updatedData.sizes.length === 0) delete updatedData.sizes;
    if (!Array.isArray(updatedData.colors) || updatedData.colors.length === 0) delete updatedData.colors;

    // Remove empty strings
    if (typeof updatedData.name === "string" && updatedData.name.trim() === "") delete updatedData.name;
    if (typeof updatedData.type === "string" && updatedData.type.trim() === "") delete updatedData.type;
    if (typeof updatedData.desc === "string" && updatedData.desc.trim() === "") delete updatedData.desc;

    // Remove null or undefined numbers
    if (updatedData.price == null) delete updatedData.price;
    if (updatedData.available == null) delete updatedData.available;
    if (updatedData.stock == null) delete updatedData.stock;

    // If seller should NOT be updated, remove it
    if (updatedData.seller) delete updatedData.seller;

    print("Data to update:", updatedData);

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: updatedData },
        { new: true }
    );

    return updatedProduct;
}}

module.exports = ProductRepository;
