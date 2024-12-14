const ProductRepository = require("../database/repository/product-repository");
const { FormatData } = require("../utils/index");

// All Business logic will be here
class ProductService {
  constructor() {
    this.repository = new ProductRepository();
  }

  async CreateProduct(productInputs) {
    const productResult = await this.repository.CreateProduct(productInputs);
    return FormatData(productResult);
  }

  async GetProducts() {
    const products = await this.repository.Products();

    let categories = {};

    products.map(({ type }) => {
      categories[type] = type;
    });

    return FormatData({
      products,
      categories: Object.keys(categories),
    });
  }

  async GetProductDescription(productId) {
    const product = await this.repository.FindById(productId);
    return FormatData(product);
  }

  async GetProductsByCategory(category) {
    const products = await this.repository.FindByCategory(category);
    return FormatData(products);
  }

  async GetSelectedProducts(selectedIds) {
    const products = await this.repository.FindSelectedProducts(selectedIds);
    return FormatData(products);
  }

  async GetProductPayload(userId, { productId, amount }, event) {
    const product = await this.repository.FindById(productId);
    console.log("FROM PRODUCT PAYLOAD TO BE SENT?????????", product);

    if (product) {
      const payload = {
        event: event,
        data: { userId, product, amount },
      };

      return FormatData(payload);
    } else {
      return FormatData({ error: "No product Available" });
    }
  }

  async reduceStock(data) {
    console.log('REDUCING STOCK??????')
    for (let i = 0; i < data.length; i++) {
      const product = await this.repository.FindById(data[i].productId);
      console.log("FOUND PRODUCT",product)
      product.stock = product.stock - data[i].productAmountBought;
      if (product.stock === 0) {
        product.available = false;
      }
      await product.save()

    }

  }
  async SubscribeEvents(payload) {
    payload = JSON.parse(payload);
    console.log("PAYLOAD IN SUBSCRIBING TO PRODUCT SERVICE");
    console.log(payload);
    const { event, data } = payload;

    switch (event) {
      case "REDUCE_PRODUCT_STOCK":
        this.reduceStock(data);
        break;
    }
    console.log("subscribe to events bitch");
  }
}

module.exports = ProductService;
