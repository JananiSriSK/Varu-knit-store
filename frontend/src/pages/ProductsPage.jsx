import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import DummyProducts from "../constants/dummyProducts.js";
import ProductCard from "../components/ProductCard.jsx";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ProductsPage = () => {
  const query = useQuery();
  const category = query.get("category") || "All";

  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    // When category changes, update subcategories and reset selected subcategory to "All"
    let products = DummyProducts;

    if (category !== "All") {
      products = products.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    const uniqueSubs = [
      ...new Set(products.map((p) => p.subcategory).filter(Boolean)),
    ];
    setSubcategories(uniqueSubs);
    setSelectedSubcategory("All");
  }, [category]);

  useEffect(() => {
    let products = DummyProducts;

    if (category !== "All") {
      products = products.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (selectedSubcategory !== "All") {
      products = products.filter(
        (product) =>
          product.subcategory?.toLowerCase() ===
          selectedSubcategory.toLowerCase()
      );
    }

    setFilteredProducts(products);
  }, [category, selectedSubcategory]);

  return (
    <div className="pt-10 max-w-7xl mx-auto px-4">
      <h2 className="text-xl font-semibold mb-6">Category: {category}</h2>
      <div className="flex gap-6">
        {/* Sidebar Filter */}
        <div className="w-2/12 rounded-lg p-2 shadow-lg bg-gray-80 h-fit">
          <h3 className="font-semibold text-lg mb-4">Filters</h3>
          <ul className="space-y-2 text-sm">
            <li
              className={`cursor-pointer ${
                selectedSubcategory === "All"
                  ? "font-bold text-purple-700"
                  : "text-gray-700"
              }`}
              onClick={() => setSelectedSubcategory("All")}
            >
              All
            </li>
            {subcategories.map((sub, idx) => (
              <li
                key={idx}
                className={`cursor-pointer ${
                  selectedSubcategory === sub
                    ? "font-bold text-purple-700"
                    : "text-gray-700"
                }`}
                onClick={() => setSelectedSubcategory(sub)}
              >
                {sub}
              </li>
            ))}
          </ul>
        </div>

        {/* Products Grid */}
        <div className="w-10/12">
          {filteredProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.name}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
