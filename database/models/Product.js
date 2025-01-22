const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  img: { type: String },
  type: {
    type: String,
    enum: [
      "Electronics",
      "Fashion",
      "Home and Kitchen",
      "Health and Personal Care",
      "Books and Stationery",
      "Sports and Outdoors",
      "Toys and Games",
      "Beauty and Cosmetics",
      "Automotive",
      "Jewelry and Accessories",
      "Groceries and Food",
      "Baby Products",
      "Pet Supplies",
      "Tools and Hardware",
      "Office Supplies",
      "Musical Instruments",
      "Furniture",
      "Art and Craft",
      "Industrial and Scientific",
      "Video Games and Consoles",
      "Music",
    ],
  },
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
  // size: {
  //   type: [String],
  //   enum: [
  //     "US 5 / UK 3 / EU 36",
  //     "US 5.5 / UK 3.5 / EU 36.5",
  //     "US 6 / UK 4 / EU 37",
  //     "US 6.5 / UK 4.5 / EU 37.5",
  //     "US 7 / UK 5 / EU 38",
  //     "US 7.5 / UK 5.5 / EU 38.5",
  //     "US 8 / UK 6 / EU 39",
  //     "US 8.5 / UK 6.5 / EU 40",
  //     "US 9 / UK 7 / EU 40.5",
  //     "US 9.5 / UK 7.5 / EU 41",
  //     "US 10 / UK 8 / EU 42",
  //     "US 10.5 / UK 8.5 / EU 42.5",
  //     "US 11 / UK 9 / EU 43",
  //     "US 11.5 / UK 9.5 / EU 44",
  //     "US 12 / UK 10 / EU 44.5",
  //     "US 13 / UK 11 / EU 46",
  //     "XS",
  //     "S",
  //     "M",
  //     "L",
  //     "XL",
  //     "XXL",
  //   ],
  // },
  // colors: {
  //   type: [String],
  // },
  seller: { type: String, required: true },
});

module.exports = mongoose.model("product", ProductSchema);


