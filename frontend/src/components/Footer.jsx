import React, { useState, useEffect } from "react";
import {
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
  FaFacebook,
} from "react-icons/fa";

const Footer = () => {
  const [footerData, setFooterData] = useState({
    phone: '+91 9944610600',
    email: 'varalakshmikutti76@gmail.com',
    instagram: '@varuknitstore',
    whatsappLink: 'https://wa.me/919944610600',
    instagramLink: 'https://www.instagram.com/varuknitstore',
    facebookLink: 'https://www.facebook.com',
    aboutText: 'Every product is handmade with love, care and attention to detail.',
    copyrightText: 'VaruKnitStore. All rights reserved.'
  });

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/footer');
      const data = await response.json();
      if (data.success) {
        setFooterData(data.footer);
      }
    } catch (err) {
      console.error('Error fetching footer data:', err);
      // Keep default footer data if server is down
    }
  };

  return (
    <footer id="footer" className="bg-gray-100 text-gray-800 p-6">
      <div className="container mx-auto text-center space-y-4">
        {/* Heading */}
        <h2 className="text-2xl font-bold">Contact Us</h2>

        {/* Row 1: Combined Contact Info */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-base">
          <p>Phone: {footerData.phone}</p>
          <span className="hidden md:inline">|</span>
          <p>Gmail: {footerData.email}</p>
          <span className="hidden md:inline">|</span>
          <p>Follow us on Instagram: {footerData.instagram}</p>
        </div>

        {/* Row 2: Social Icons */}
        <div className="flex justify-center space-x-6 text-2xl">
          <a
            href={footerData.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700"
            aria-label="WhatsApp"
          >
            <FaWhatsapp />
          </a>
          <a
            href={footerData.instagramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-700"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href={`mailto:${footerData.email}`}
            className="text-red-600 hover:text-red-700"
            aria-label="Gmail"
          >
            <FaEnvelope />
          </a>
          <a
            href={footerData.facebookLink}
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
          <p>{footerData.aboutText}</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          © {new Date().getFullYear()} {footerData.copyrightText}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
