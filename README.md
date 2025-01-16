
# Products Microservice

The **Products Microservice** is a core component of a multivendor platform, designed to handle all operations related to products. This includes creating, retrieving, updating, managing stock, and integrating with other microservices to facilitate seamless e-commerce functionality.

---

## Features

- **Product Management:**
  - Create new products with details like name, description, price, stock, and seller information.
  - Retrieve single or multiple products for display or integration with other services.
  - Update product details such as availability, price, or stock levels.
- **Stock Management:**
  - Automatically reduce stock upon order placement.
  - Mark products as unavailable when stock runs out.
- **Inter-Service Communication:**
  - Works with RabbitMQ for messaging between services like Shopping and Notification microservices.

---

## Technologies Used

- **Node.js:** Backend runtime environment.
- **Express.js:** Framework for building RESTful APIs.
- **MongoDB:** Database for storing product information.
- **Mongoose:** ORM for MongoDB interactions.
- **RabbitMQ:** Message broker for communication with other microservices (e.g., Order, Search).
- **Cloudinary:** (Optional) For handling product image uploads.

---

## Installation and Setup

### Steps to Set Up

1. Delete the `node_modules` folder, then run the following command in the root directory:
   ```bash
   npm install

2. Create a .env file that looks like this:
   
		    DB_URI=<your MongoDB URI>
		    MESSAGE_BROKER_URL=<Your broker URL>
		    EXCHANGE_NAME=<any exchange name of your choice>
		    QUEUE_NAME=<any queue name of your choice>
        CUSTOMER_BINDING_KEY=<variable to bind messages to the user/customer queue. eg customerBindingKey>
        SHOPPING_BINDING_KEY=<variable to bind messages to the shopping queue. eg shoppingBindingKey>
        PRODUCT_BINDING_KEY=<<variable to bind messages to the shopping queue. eg productKey>


	



	3.	Note:
The RabbitMQ URL for interservice communication can be obtained from CloudAMQP:
	•	Create a new instance and follow the prompts.
	•	After creating the instance, click on the link for the instance with the name you gave it to view and copy the URL.
	4.	Start the service by running:

Run:


	5.	node index.js


You can now test the APIs

## Multivendor Application Services

This is one of the three services for the **Multivendor Application**.  

### Related Repositories

- **Shopping Frontend:**  
  [MultivendorPlatform-Shopping-Frontend](https://github.com/haariswaqas/MultivendorPlatform-Shopping-Frontend)

- **Notification Microservice:**  
  [MultiVendorPlatform-Notification-Microservice](https://github.com/samuel2l/MultiVendorPlatform-Notification-Microservice)

- **Shopping Microservice:**  
  [MultiVendorApp-Products-Microservice](https://github.com/samuel2l/MultivendorPlatform-Shopping-Service)

- **User Microservice:**  
  [MultiVendorApp-User-Service](https://github.com/samuel2l/MultiVendorApp-User-Service)
