import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard.jsx";
import LoginModal from "../components/LoginModal.jsx";
import PersonalizedRecommendations from "../components/PersonalizedRecommendations.jsx";
import FavoriteCollections from "../components/FavoriteCollections.jsx";
import logo from "../images/logo.png";
import bgImage from "../images/banner4.jpg";
import api from "../services/api";

const Body = () => {
  const [homeData, setHomeData] = useState({
    welcomeTitle: "Welcome !!",
    welcomeSubtitle:
      "Every product is handmade with love, care and attention to detail.",
    bannerImage: null,
    phoneNumber: "+91 9150324779",
    aboutTitle: "Our Story",
    aboutDescription1:
      "Founded in 2015, Varuknit began as a passion for handcrafted yarn creations.",
    aboutDescription2:
      "Every piece is custom-made with eco-conscious materials.",
    aboutImage: null,
    collectionTitle: "Cozy Crochet Collection",
    collectionBy: "By Varu's Knit Store",
    collectionDescription:
      "Handcrafted with love, each piece brings warmth and comfort to your home.",
    collectionImage: null,
  });
  const [latestProducts, setLatestProducts] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchHomepageData();
    fetchLatestProducts();

    // Check if login modal should be opened
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("login") === "true") {
      setShowLoginModal(true);
    }
  }, [location]);

  const fetchHomepageData = async () => {
    try {
      const response = await api.getHomepage();
      const data = await response.json();
      if (data.success) {
        setHomeData(data.homepage);
      }
    } catch (err) {
      console.error("Error fetching homepage data:", err);
    }
  };

  const fetchLatestProducts = async () => {
    try {
      const response = await api.getLatestCollections();
      const data = await response.json();
      if (data.success) {
        setLatestProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching latest products:", err);
    }
  };

  return (
    <div className="bg-gray-50 py-1 mx-auto max-w-screen-lg">
      {/* Header */}
      <div
        className="relative h-70 rounded-b-lg bg-cover bg-center bg-no-repeat shadow-lg"
        style={{
          backgroundImage: `url(${homeData?.bannerImage?.url || bgImage})`,
        }}
      >
        <div className="px-4 pt-8 pb-10">
          <div className="absolute inset-x-0 -bottom-10 mx-auto w-36 rounded-full border-1 border-white shadow-lg">
            <img
              className="mx-auto h-auto w-full rounded-full overflow-hidden "
              src={logo}
              alt="Logo"
            />
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="mt-12 flex flex-col items-start justify-center space-y-4 py-4 px-4 sm:flex-row sm:space-y-0 md:justify-between lg:px-0">
        <div className="max-w-lg">
          <h1 className="text-2xl font-bold text-gray-800">
            {homeData?.welcomeTitle || "Welcome !!"}
          </h1>
          <p className="mt-2 text-gray-600">
            {homeData?.welcomeSubtitle ||
              "Every product is handmade with love, care and attention to detail."}
          </p>
        </div>
        <div>
          <button className="flex whitespace-nowrap rounded-lg bg-[#6f5d6e] px-6 py-2 font-bold text-white transition hover:translate-y-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 inline h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Chat with us
          </button>
          <p className="mt-4 flex items-center text-gray-500 sm:justify-end">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 inline h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {homeData?.phoneNumber || "+91 9150324779"}
          </p>
        </div>
      </div>
      <section>
        <div className="mx-4 my-6 max-w-screen-lg overflow-hidden rounded-xl shadow-lg md:pl-8">
          <div className="flex flex-col overflow-hidden bg-white sm:flex-row md:h-80">
            {/* Text Content */}
            <div className="flex w-full flex-col p-4 sm:w-1/2 sm:p-8 lg:w-3/5">
              <h2 className="text-2xl  font-semibold text-black-700 md:text-xl lg:text-xl">
                {homeData?.collectionTitle || "Cozy Crochet Collection"}
              </h2>
              <p className="mt-2 text-lg font-medium text-[#D97878]">
                {homeData?.collectionBy || "By Varu's Knit Store"}
              </p>
              <p className="mt-4 mb-8 max-w-md text-gray-500">
                {homeData?.collectionDescription ||
                  "Handcrafted with love, each piece brings warmth and comfort to your home."}
              </p>
              <a
                href="/products"
                className="group mt-auto flex w-44 cursor-pointer select-none items-center justify-center rounded-md bg-[#A084CA] hover:bg-[#8b6bb1] px-6 py-2 text-white transition"
              >
                <span className="group-hover:underline font-medium text-center w-full">
                  Shop now
                </span>
                <svg
                  className="ml-4 h-6 w-0 group-hover:w-6 transition-all"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </div>

            {/* Image */}
            <div className="order-first ml-auto h-48 w-full bg-gray-700 sm:order-none sm:h-auto sm:w-1/2 lg:w-2/5">
              <img
                className="h-full w-full object-cover"
                src={
                  homeData?.collectionImage?.url ||
                  "https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
                }
                alt={homeData?.collectionTitle || "Winter Collection"}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <PersonalizedRecommendations />
        </div>
      </section>

      {/* Favorite Collections section*/}
      <FavoriteCollections />
      
      {/* Latest Collection section*/}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#444444] mb-6">
            Latest Collection
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-8">
            {latestProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
      {/* About Section */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-[#f7f4ff] font-sans">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          {/* Image */}
          <div className="lg:w-1/2 w-full">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl shadow-md">
              <img
                src={
                  homeData?.aboutImage?.url || "https://placehold.co/600x450"
                }
                alt="Crocheting with yarn and accessories"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:w-1/2 text-[#444444]">
            <h2 className="text-xl md:text-2xl font-serif font-semibold mb-3 text-[#A084CA]">
              {homeData?.aboutTitle || "Our Story"}
            </h2>
            <p className="text-sm md:text-base mb-3 leading-relaxed">
              {homeData?.aboutDescription1 ||
                "Founded in 2015, Varuknit began as a passion for handcrafted yarn creations. From cozy living rooms to nationwide deliveries, we've kept the art of yarn alive."}
            </p>
            <p className="text-sm md:text-base mb-5 leading-relaxed">
              {homeData?.aboutDescription2 ||
                "Every piece is custom-made with eco-conscious materials, ensuring sustainability without compromising comfort. We believe in craft, community, and care."}
            </p>
            <a
              href="/about"
              className="bg-[#D97878] hover:bg-[#c76666] text-white text-sm font-medium py-2 px-6 rounded-full transition duration-200 inline-block"
            >
              Learn More About Us
            </a>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="text-center text-gray-500">
          <p>More exciting features coming soon!</p>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          // Clear login parameter from URL
          const urlParams = new URLSearchParams(location.search);
          if (urlParams.has("login")) {
            urlParams.delete("login");
            const newSearch = urlParams.toString();
            navigate(location.pathname + (newSearch ? "?" + newSearch : ""), {
              replace: true,
            });
          }
        }}
      />
    </div>
  );
};

export default Body;
