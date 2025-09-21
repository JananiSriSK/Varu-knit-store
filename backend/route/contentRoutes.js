import express from "express";
import { getHomepage, updateHomepage, getFooter, updateFooter } from "../controller/contentController.js";
import { getFavoriteCollections, setFavoriteCollections } from "../controller/favoriteCollectionController.js";
import { getLatestCollections, setLatestCollections } from "../controller/latestCollectionController.js";
import { getChatbotResponses, createChatbotResponse, updateChatbotResponse, deleteChatbotResponse, processChat } from "../controller/chatbotController.js";
import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";

const contentRouter = express.Router();

// Homepage routes
contentRouter.route("/homepage").get(getHomepage);
contentRouter.route("/admin/homepage").put(verifyUserAuth, roleBasedAccess("admin"), updateHomepage);

// Footer routes
contentRouter.route("/footer").get(getFooter);
contentRouter.route("/admin/footer").put(verifyUserAuth, roleBasedAccess("admin"), updateFooter);

// Favorite Collections endpoints
contentRouter.route("/favorite-collections").get(getFavoriteCollections);
contentRouter.route("/admin/favorite-collections").put(verifyUserAuth, roleBasedAccess("admin"), setFavoriteCollections);

// Latest Collections endpoints
contentRouter.route("/latest-collections").get(getLatestCollections);
contentRouter.route("/admin/latest-collections").put(verifyUserAuth, roleBasedAccess("admin"), setLatestCollections);

// Chatbot endpoints
contentRouter.route("/chat").post(processChat);
contentRouter.route("/admin/chatbot-responses").get(verifyUserAuth, roleBasedAccess("admin"), getChatbotResponses);
contentRouter.route("/admin/chatbot-responses").post(verifyUserAuth, roleBasedAccess("admin"), createChatbotResponse);
contentRouter.route("/admin/chatbot-responses/:id").put(verifyUserAuth, roleBasedAccess("admin"), updateChatbotResponse);
contentRouter.route("/admin/chatbot-responses/:id").delete(verifyUserAuth, roleBasedAccess("admin"), deleteChatbotResponse);

export default contentRouter;