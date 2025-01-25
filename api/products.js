const Product = require("../database/models/Product");
const ProductService = require("../services/product-service");
const { PublishMessage, SubscribeMessage } = require("../utils");
const { auth, isSeller } = require("./middleware/auth");
let print = console.log;
productRoutes = (app, channel) => {
  const service = new ProductService();
  SubscribeMessage(channel, service);

  //GET ALL PRODUCTS
  app.get("/", async (req, res, next) => {
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  //  THIS ROUTE GETS THE PRODUCTS OF A SELLER BY ID. USED WHEN YOU ARE GOING TO THE PROFILE OF THE SELLER OF A PRODUCT
  //LIKE WHEN YOU SEE A PRODUCT AND WANT TO SEE WHO IS SELLING
  app.get("/seller-products/:id", async (req, res) => {
    const seller = req.params.id;
    const products = await Product.find({ seller });

    res.status(200).json(products);
  });
  //THIS GETS THE PRODUCTS OF A SPECIFIC SELLER. LIKE WHEN YOU AS A SELLER WANTAS TO SEE ALL YOUR LISTED PRODUCTS
  app.get("/products/seller", auth, async (req, res) => {
    print("REQUEST USERRR", req.user);
    const seller = req.user._id;
    console.log(seller, "this is the seller id???????");
    const products = await Product.find({ seller });

    res.status(200).json(products);
  });

  app.post("/product/create", isSeller, async (req, res, next) => {
    const {
      name,
      desc,
      img,
      type,
      stock,
      price,
      available = true,
      sizes = [],
      colors = [],
    } = req.body;
    const seller = req.user._id;
    console.log(req.body);
    const { data } = await service.CreateProduct({
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
    return res.json(data);
  });

  //edit product

  app.put("/product/:id", auth, async (req, res) => {
    const productId = req.params.id;
    const {
      name,
      desc,
      img = "",
      type,
      stock,
      price,
      available,
      sizes = [],
      colors = [],
    } = req.body;
    const product = await Product.findById(productId);
    if (product.seller != req.user._id) {
      res.status(403).json({
        error: "Ah chale it is not your product why do you want to touch it?",
      });
    }
    const seller = req.user._id;

    try {
      const { data } = await service.UpdateProduct(productId, {
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

      const  payload  = await service.GetUpdatedProductPayload(
        productId,
        "UPDATE_CART_PRODUCT"
      );
      console.log("in update cart route");
      console.log(payload.data);
      const  wishlistPayload  = await service.GetUpdatedProductPayload(
        productId,
        "UPDATE_WISHLIST_PRODUCT"
      );

      PublishMessage(
        channel,
        process.env.CUSTOMER_BINDING_KEY,
        JSON.stringify(payload.data)
      );
      PublishMessage(
        channel,
        process.env.SHOPPING_BINDING_KEY,
        JSON.stringify(payload.data)
      );

      
      if (!data) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/product/:id", isSeller, async (req, res, next) => {
    const productId = req.params.id;

    const foundProduct = await Product.findById(productId);
    if (foundProduct.seller == req.user._id) {
      const deletedProduct = await Product.findByIdAndDelete(productId);

      res.json(deletedProduct);
    } else {
      res.json({
        error:
          "you are not the seller how you want delete product? ah chale you no dey try",
      });
    }
  });

  app.get("/category/:type", async (req, res, next) => {
    const type = req.params.type;

    try {
      const { data } = await service.GetProductsByCategory(type);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get("/:id", async (req, res, next) => {
    const productId = req.params.id;
    print("gotten product id?????");

    try {
      const data = await Product.findById(productId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });
  app.get("/search/:product", async (req, res, next) => {
    try {
      const product = req.params.product;

      const products = await Product.find({
        name: { $regex: product, $options: "i" },
      });

      res.status(200).json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err.message });
    }
  });

  //ADD TO WISHLIST. SAME PUT ROUTE USED FOR BOTH ADDING AND REMOVING
  //DID NOT REMOVE THE DELETE ROUTES FOR BOTH CART AND WISHLIST COS IDK IF THAT IS WHAT YOU USED
  //DO NOT KNOW IF IT WILL WORK THOUGH BUT I USE THE PUT ROUTE BELOW FOR BOTH REMOVAL AND ADDING BY SIMPLY ADDING AND isRemove property set as true to remove and false to add to cart or wishlist

  app.put("/wishlist", auth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await service.GetProductPayload(
      _id,

      {
        productId: req.body.product._id,
        amount: req.body.amount,
      },

      "ADD_TO_WISHLIST",
      req.body.isRemove,
      { sizes: req.body.product.sizes, colors: req.body.product.colors }
    );

    console.log("in put wishlist route");
    console.log(data);
    print("WISHLIST DATA TO BE PUBLISHED", data);

    PublishMessage(
      channel,
      process.env.CUSTOMER_BINDING_KEY,
      JSON.stringify(data)
    );
    PublishMessage(
      channel,
      process.env.SHOPPING_BINDING_KEY,
      JSON.stringify(data)
    );
    console.log(data);
    //old
    // const response = { product: data.data.product, stock: data.data.qty };
    //new
    const response = { product: data.data.product, amount: req.body.amount };

    res.status(200).json(response);
  });

  app.delete("/wishlist/:id", auth, async (req, res, next) => {
    const { _id } = req.user;
    const productId = req.params.id;

    const { data } = await service.GetProductPayload(
      _id,
      { productId },
      "REMOVE_FROM_WISHLIST"
    );

    PublishMessage(
      channel,
      process.env.CUSTOMER_BINDING_KEY,
      JSON.stringify(data)
    );
    PublishMessage(
      channel,
      process.env.SHOPPING_BINDING_KEY,
      JSON.stringify(data)
    );

    const response = { product: data.data.product, stock: data.data.qty };

    res.status(200).json(response);
  });

  //ADD TO CART. SAME PUT ROUTE USED FOR BOTH ADDING AND REMOVING
  //DID NOT REMOVE THE DELETE ROUTES FOR BOTH CART AND WISHLIST COS IDK IF THAT IS WHAT YOU USED
  //DO NOT KNOW IF IT WILL WORK THOUGH BUT I USE THE PUT ROUTE BELOW FOR BOTH REMOVAL AND ADDING BY SIMPLY ADDING AND isRemove property set as true to remove and false to add to cart or wishlist

  app.put("/cart", auth, async (req, res, next) => {
    const { _id } = req.user;
    print(req.body);
    print("ahhjk dwd", req.body.sizes, req.body.colors);
    const { data } = await service.GetProductPayload(
      _id,
      { productId: req.body.product._id, amount: req.body.amount },
      "ADD_TO_CART",
      req.body.isRemove,
      { sizes: req.body.product.sizes, colors: req.body.product.colors }
    );
    console.log("in put cart route");
    console.log(data);

    PublishMessage(
      channel,
      process.env.CUSTOMER_BINDING_KEY,
      JSON.stringify(data)
    );
    PublishMessage(
      channel,
      process.env.SHOPPING_BINDING_KEY,
      JSON.stringify(data)
    );
    console.log(data);
    //old
    // const response = { product: data.data.product, stock: data.data.qty };
    //new
    const response = { product: data.data.product, amount: req.body.amount };

    res.status(200).json(response);
  });

  app.delete("/cart/:id", auth, async (req, res, next) => {
    const { _id } = req.user;
    const productId = req.params.id;

    const { data } = await service.GetProductPayload(
      _id,
      { productId },
      "REMOVE_FROM_CART"
    );

    PublishMessage(
      channel,
      process.env.CUSTOMER_BINDING_KEY,
      JSON.stringify(data)
    );
    PublishMessage(
      channel,
      process.env.SHOPPING_BINDING_KEY,
      JSON.stringify(data)
    );

    const response = { product: data.data.product, stock: data.data.qty };

    res.status(200).json(response);
  });
};

module.exports = productRoutes;
