import express from "express";
import { getFavoriteCollections, setFavoriteCollections } from "../controller/favoriteCollectionController.js";
import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";

const router = express.Router();

router.route("/favorite-collections").get(getFavoriteCollections);
router.route("/admin/favorite-collections").put(verifyUserAuth, roleBasedAccess("admin"), setFavoriteCollections);

export default router;