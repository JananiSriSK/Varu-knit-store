import React from "react";
import {
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
  FaFacebook,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 p-6">
      <div className="container mx-auto text-center space-y-4">
        {/* Heading */}
        <h2 className="text-2xl font-bold">Contact Us</h2>

        {/* Row 1: Combined Contact Info */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-base">
          <p>Phone: +91 9944610600</p>
          <span className="hidden md:inline">|</span>
          <p>Gmail: varalakshmikutti76@gmail.com</p>
          <span className="hidden md:inline">|</span>
          <p>Follow us on Instagram: @varuknitstore</p>
        </div>

        {/* Row 2: Social Icons */}
        <div className="flex justify-center space-x-6 text-2xl">
          <a
            href="https://wa.me/919944610600"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700"
            aria-label="WhatsApp"
          >
            <FaWhatsapp />
          </a>
          <a
            href="https://www.instagram.com/varuknitstore"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-700"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="mailto:skjananisri@gmail.com"
            className="text-red-600 hover:text-red-700"
            aria-label="Gmail"
          >
            <FaEnvelope />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
        </div>

        {/* Row 3: About Section */}
        <div className="text-sm text-gray-900 mt-4">
          <p>
            Every product is handmade with love, care and attention to detail.
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          © {new Date().getFullYear()} VaruKnitStore. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
