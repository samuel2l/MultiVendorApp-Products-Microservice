const Product = require("../database/models/Product");
const ProductService = require("../services/product-service");
const { PublishMessage,SubscribeMessage } = require("../utils");
const {auth,isSeller} = require("./middleware/auth");

productRoutes = (app, channel) => {
  const service = new ProductService();
  SubscribeMessage(channel, service)

  app.get("/", async (req, res, next) => {
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get("/seller-products",isSeller,async(req,res)=>{
    const seller=req.user._id
    const products= await Product.find({seller})
    res.status(200).json(products)
  })


  app.post("/product/create",isSeller, async (req, res, next) => {
    const { name, desc,img, type, stock, price, available=true } =
      req.body;
      const seller=req.user._id
    console.log(req.body);
    const { data } = await service.CreateProduct({
      name,
      desc,
      img,
      type,
      stock,
      price,
      available, 
      seller
    });
    return res.json(data);
  });

  app.put("/product/:id", async (req, res) => {
    const productId = req.params.id;
    const { name, desc,img, type, stock, price, available } = req.body;
    const seller=req.user._id

    try {
      const { data } = await service.UpdateProduct(productId, {
        name,
        desc,
        img,
        type,
        stock,
        price,
        available, 
        seller,
      });

      if (!data) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/product/:id",isSeller, async (req, res, next) => {
const productId =req.params.id

const foundProduct=await Product.findById(productId)
if(foundProduct.seller==req.user._id){
  const deletedProduct=await Product.findByIdAndDelete(productId)

  res.json(deletedProduct)
}
else{
  res.json({"error":"you are not the seller how you want delete product? ah chale you no dey try"})
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

    try {
      const { data } = await service.GetProductDescription(productId);
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
    }  });

    app.put("/wishlist", auth, async (req, res, next) => {
      const { _id } = req.user;
  
      const { data } = await service.GetProductPayload(
        _id,
        { productId: req.body.product._id, amount: req.body.amount },
        "ADD_TO_WISHLIST"
      );
      console.log("in put wishlist route")
      console.log(data)
  
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
  console.log(data)
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
  

  app.put("/cart", auth, async (req, res, next) => {
    const { _id } = req.user;

    const { data } = await service.GetProductPayload(
      _id,
      { productId: req.body.product._id, amount: req.body.amount },
      "ADD_TO_CART"
    );
    console.log("in put cart route")
    console.log(data)

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
console.log(data)
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
