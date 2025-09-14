import express from "express";
import { getHomepage, updateHomepage, getFooter, updateFooter } from "../controller/contentController.js";
import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";

const contentRouter = express.Router();

// Homepage routes
contentRouter.route("/homepage").get(getHomepage);
contentRouter.route("/admin/homepage").put(verifyUserAuth, roleBasedAccess("admin"), updateHomepage);

// Footer routes
contentRouter.route("/footer").get(getFooter);
contentRouter.route("/admin/footer").put(verifyUserAuth, roleBasedAccess("admin"), updateFooter);

export default contentRouter;