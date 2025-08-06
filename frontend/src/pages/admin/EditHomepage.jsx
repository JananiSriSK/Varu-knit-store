import React, { useState } from "react";

const EditHomepage = () => {
  const [bannerTitle, setBannerTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate saving the data (you can connect this to an API later)
    console.log("Homepage Content Updated:", {
      bannerTitle,
      headline,
      description,
    });
    alert("Homepage content updated successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto mt-18">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Edit Homepage Content
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Banner Title
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
            placeholder="Enter banner title"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Main Headline
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Enter main headline"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter homepage description"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditHomepage;
