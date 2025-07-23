import express from "express";
import {
  createProductReview,
  createProducts,
  deleteProduct,
  deleteProductReview,
  getAdminProducts,
  getAllProducts,
  getProductDetails,
  getProductReviews,
  updateProduct,
  getSubcategory,
} from "../controller/productController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";

const productRouter = express.Router();

//everyone can view products (even if not logged in)
productRouter.route("/products").get(getAllProducts); //get all products or list of products based on category, sub category = keyword, pages, limits
productRouter.route("/product/:id").get(getProductDetails); //get single product based on id
productRouter.route("/reviews").get(getProductReviews);
productRouter.route("/subcategory").get(getSubcategory); //get the subcategories for filtering in frontend

//user- can create or delete review
productRouter.route("/review").put(verifyUserAuth, createProductReview);

//admin actions
productRouter
  .route("/admin/products")
  .post(verifyUserAuth, roleBasedAccess("admin"), createProducts)
  .get(verifyUserAuth, roleBasedAccess("admin"), getAdminProducts); // admin gets to view products in a table

productRouter
  .route("/admin/product/:id")
  .put(verifyUserAuth, roleBasedAccess("admin"), updateProduct)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteProduct);

productRouter
  .route("/admin/reviews")
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteProductReview);

export default productRouter;
