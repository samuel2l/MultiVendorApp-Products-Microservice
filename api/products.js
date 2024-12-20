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


  app.post("/product/create",isSeller, async (req, res, next) => {
    const { name, desc,img, type, stock, price, available } =
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

  app.post("/ids", async (req, res, next) => {
    const { ids } = req.body;
    const products = await service.GetSelectedProducts(ids);
    return res.status(200).json(products);
  });

  app.put("/wishlist", auth, async (req, res, next) => {
    const { _id } = req.user;

    const { data } = await service.GetProductPayload(
      _id,
      { productId: req.body._id },
      "ADD_TO_WISHLIST"
    );

    PublishMessage(
      channel,
      process.env.CUSTOMER_BINDING_KEY,
      JSON.stringify(data)
    );

    res.status(200).json(data.data.product);
    //data.data.product cos payload looks like this:
    // const payload = {
    //     event: event,
    //     data: { userId, product, qty}
    // };
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
    // PublishMessage(
    //   channel,
    //   process.env.SHOPPING_BINDING_KEY,
    //   JSON.stringify(data)
    // );

    res.status(200).json(data.data.product);
  });

  app.put("/cart", auth, async (req, res, next) => {
    const { _id } = req.user;
    console.log('ADD TO CART PUT ROUTE')
    console.log(req.body)

    const { data } = await service.GetProductPayload(
      _id,
      { productId: req.body.product._id, amount: req.body.amount },
      "ADD_TO_CART"
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
console.log(data)

    const response = { product: data.data.product, stock: data.data.qty };

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
