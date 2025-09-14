import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import api from "../services/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ProductsPage = () => {
  const query = useQuery();
  const location = useLocation();
  const category = query.get("category") || "";

  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
    if (category) {
      fetchSubcategories();
    }
  }, [category, selectedSubcategory, currentPage, location.search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage
      });
      
      // Add search parameter
      const searchParam = query.get("search");
      if (searchParam) {
        params.append('keyword', searchParam);
      }
      
      if (category && category !== "All") {
        params.append('category', category);
      }
      
      if (selectedSubcategory && selectedSubcategory !== "All") {
        params.append('subcategory', selectedSubcategory);
      }

      const response = await api.getProducts(`?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFilteredProducts(data.products);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await api.getSubcategories(category);
      const data = await response.json();
      
      if (data.success) {
        setSubcategories(data.subcategories);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setSubcategories([]);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ff] py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7b5fc4]"></div>
      </div>
    );
  }

  return (
    <div className="pt-10 max-w-7xl mx-auto px-4 min-h-screen bg-[#f7f4ff]">
      <div className="flex items-center gap-4 mb-6">
        <a href="/" className="p-2 hover:bg-white rounded-full transition">
          <Home className="h-5 w-5 text-[#7b5fc4]" />
        </a>
        <h2 className="text-xl font-semibold">
          {query.get("search") ? `Search Results for "${query.get("search")}"` : `Category: ${category || "All Products"}`}
        </h2>
      </div>
      
      <div className="flex gap-6">
        {/* Sidebar Filter */}
        <div className="w-2/12 rounded-lg p-4 shadow-lg bg-white h-fit">
          <h3 className="font-semibold text-lg mb-4">Filters</h3>
          <ul className="space-y-2 text-sm">
            <li
              className={`cursor-pointer p-2 rounded ${
                selectedSubcategory === "All"
                  ? "font-bold text-[#7b5fc4] bg-[#e1cffb]"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedSubcategory("All")}
            >
              All
            </li>
            {subcategories.map((sub, idx) => (
              <li
                key={idx}
                className={`cursor-pointer p-2 rounded ${
                  selectedSubcategory === sub
                    ? "font-bold text-[#7b5fc4] bg-[#e1cffb]"
                    : "text-gray-700 hover:bg-gray-100"
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
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No products found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pb-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 border rounded-md ${
                          currentPage === pageNumber
                            ? "bg-[#7b5fc4] text-white border-[#7b5fc4]"
                            : "border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;