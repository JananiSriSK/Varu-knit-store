import React, { useState } from "react";
import EditHomepage from "./EditHomepage";
import EditFooter from "./EditFooter";
import PaymentSettings from "./PaymentSettings";

const ContentManagement = () => {
  const [activeSection, setActiveSection] = useState("homepage");

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Content Management
      </h2>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveSection("homepage")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeSection === "homepage"
              ? "bg-[#7b5fc4] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Homepage
        </button>
        <button
          onClick={() => setActiveSection("footer")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeSection === "footer"
              ? "bg-[#7b5fc4] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Footer
        </button>
        <button
          onClick={() => setActiveSection("payment")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeSection === "payment"
              ? "bg-[#7b5fc4] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Payment Settings
        </button>
      </div>

      {/* Content */}
      {activeSection === "homepage" && <EditHomepage />}
      {activeSection === "footer" && <EditFooter />}
      {activeSection === "payment" && <PaymentSettings />}
    </div>
  );
};

export default ContentManagement;