import React, { useState } from "react";

const EditProducts = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
  });

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const addProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price)
      return alert("Name and price are required");
    setProducts([...products, { ...newProduct, id: Date.now() }]);
    setNewProduct({ name: "", price: "", description: "" });
  };

  const deleteProduct = (id) => {
    const updated = products.filter((product) => product.id !== id);
    setProducts(updated);
  };

  const editProduct = (id) => {
    const toEdit = products.find((p) => p.id === id);
    setNewProduct(toEdit);
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto mt-18">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Products</h2>

      <form
        onSubmit={addProduct}
        className="bg-white p-6 rounded-lg shadow space-y-4 mb-8"
      >
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Price (₹)
          </label>
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleInputChange}
            placeholder="Enter product price"
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={newProduct.description}
            onChange={handleInputChange}
            placeholder="Enter product description"
            className="w-full border border-gray-300 rounded-md p-2 h-24"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
        >
          {newProduct.id ? "Update Product" : "Add Product"}
        </button>
      </form>

      <div className="grid gap-4">
        {products.length === 0 ? (
          <p className="text-gray-500">No products added yet.</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="p-4 border border-gray-200 rounded-md flex justify-between items-start bg-white shadow"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">₹{product.price}</p>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editProduct(product.id)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EditProducts;
