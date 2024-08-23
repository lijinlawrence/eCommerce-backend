import dbconnect from "../confiq/database.js";
import product from "../data/products.json" assert { type: "json" };
import Products from "../model/productModel.js";
import dotenv from "dotenv";

dotenv.config();
dbconnect();

const seedPrdoducts = async () => {
  try {
    await Products.deleteMany();
    console.log("all products deleted succesfully");
    await Products.insertMany(product);
   console.log("all products added");
  } catch (error) {
    console.log(error.message);
  }

  process.exit();
};

seedPrdoducts();
