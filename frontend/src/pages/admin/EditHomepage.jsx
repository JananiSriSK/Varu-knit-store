import React, { useState, useEffect } from 'react';
import { Save, Eye, Upload } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

const EditHomepage = () => {
  const [homeData, setHomeData] = useState({
    welcomeTitle: "Welcome !!",
    welcomeSubtitle: "Every product is handmade with love, care and attention to detail.",
    bannerImage: null,
    phoneNumber: "+91 9150324779",
    aboutTitle: "Our Story",
    aboutDescription1: "Founded in 2015, Varuknit began as a passion for handcrafted yarn creations.",
    aboutDescription2: "Every piece is custom-made with eco-conscious materials.",
    aboutImage: null,
    collectionTitle: "Winter Collection",
    collectionBy: "By Luis Vuitton",
    collectionDescription: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
    collectionImage: null
  });
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      const response = await api.getHomepage();
      const data = await response.json();
      if (data.success) {
        setHomeData({
          ...data.homepage,
          bannerImagePreview: null,
          aboutImagePreview: null,
          bannerImageFile: null,
          aboutImageFile: null
        });
      }
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      // Keep default homepage data if server is down
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHomeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setHomeData(prev => ({
          ...prev,
          [`${fieldName}Preview`]: reader.result,
          [`${fieldName}File`]: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(homeData).forEach(key => {
        if (!key.includes('Image') && !key.includes('Preview') && !key.includes('File') && homeData[key]) {
          formData.append(key, homeData[key]);
        }
      });
      
      // Add image files if they exist
      if (homeData.bannerImageFile) {
        formData.append('bannerImage', homeData.bannerImageFile);
      }
      
      if (homeData.aboutImageFile) {
        formData.append('aboutImage', homeData.aboutImageFile);
      }
      
      if (homeData.collectionImageFile) {
        formData.append('collectionImage', homeData.collectionImageFile);
      }
      
      const response = await api.updateHomepage(formData);
      const data = await response.json();
      
      if (data.success) {
        addNotification('Homepage updated successfully!', 'success');
        // Clear preview URLs and use server data
        setHomeData({
          ...data.homepage,
          bannerImagePreview: null,
          aboutImagePreview: null,
          bannerImageFile: null,
          aboutImageFile: null
        });
      } else {
        addNotification(data.message || 'Failed to update homepage', 'error');
      }
    } catch (err) {
      console.error('Error updating homepage:', err);
      addNotification('Failed to update homepage', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (showPreview) {
    return (
      <div className="bg-gray-50 py-1 mx-auto max-w-screen-lg">
        <div className="flex justify-between items-center mb-4 p-4">
          <h2 className="text-xl font-bold text-[#7b5fc4]">Homepage Preview</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="bg-[#e1cffb] text-[#444444] px-4 py-2 rounded-lg hover:bg-[#b89ae8] transition"
          >
            Back to Edit
          </button>
        </div>
        
        {/* Preview Content */}
        <div className="relative h-70 rounded-b-lg bg-cover bg-center bg-no-repeat shadow-lg" style={{ backgroundImage: `url(${homeData?.bannerImage?.url || '/images/banner4.jpg'})` }}>
          <div className="px-4 pt-8 pb-10"></div>
        </div>
        
        <div className="mt-16 flex flex-col items-start justify-center space-y-4 py-8 px-4">
          <div className="max-w-lg">
            <h1 className="text-2xl font-bold text-gray-800">{homeData.welcomeTitle}</h1>
            <p className="mt-2 text-gray-600">{homeData.welcomeSubtitle}</p>
          </div>
          <div>
            <button className="flex whitespace-nowrap rounded-lg bg-[#6f5d6e] px-6 py-2 font-bold text-white">
              {homeData.chatButtonText}
            </button>
            <p className="mt-4 flex items-center text-gray-500">{homeData.phoneNumber}</p>
          </div>
        </div>
        
        <section className="py-10 bg-[#f7f4ff]">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 px-4">
            <div className="lg:w-1/2">
              <img src={homeData?.aboutImage?.url || 'https://placehold.co/600x450'} alt="About" className="rounded-xl shadow-md" />
            </div>
            <div className="lg:w-1/2 text-[#444444]">
              <h2 className="text-xl md:text-2xl font-serif font-semibold mb-3 text-[#A084CA]">{homeData.aboutTitle}</h2>
              <p className="text-sm md:text-base mb-3 leading-relaxed">{homeData.aboutDescription1}</p>
              <p className="text-sm md:text-base mb-5 leading-relaxed">{homeData.aboutDescription2}</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#444444]">Edit Homepage</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#7b5fc4] text-white rounded-lg hover:bg-[#6b4fb4] transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Banner Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold mb-4 text-[#7b5fc4]">Banner Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'bannerImage')}
                  className="hidden"
                  id="banner-upload"
                />
                <label
                  htmlFor="banner-upload"
                  className="bg-[#e1cffb] text-[#444444] px-4 py-2 rounded-lg hover:bg-[#b89ae8] transition cursor-pointer flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Banner
                </label>
                {(homeData.bannerImagePreview || homeData.bannerImage) && (
                  <img src={homeData.bannerImagePreview || (homeData.bannerImage?.url || homeData.bannerImage)} alt="Banner" className="h-16 w-24 object-cover rounded" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold mb-4 text-[#7b5fc4]">Welcome Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Title
              </label>
              <input
                type="text"
                name="welcomeTitle"
                value={homeData.welcomeTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Subtitle
              </label>
              <textarea
                name="welcomeSubtitle"
                value={homeData.welcomeSubtitle}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={homeData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold mb-4 text-[#7b5fc4]">About Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Image
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'aboutImage')}
                  className="hidden"
                  id="about-upload"
                />
                <label
                  htmlFor="about-upload"
                  className="bg-[#e1cffb] text-[#444444] px-4 py-2 rounded-lg hover:bg-[#b89ae8] transition cursor-pointer flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </label>
                {(homeData.aboutImagePreview || homeData.aboutImage) && (
                  <img src={homeData.aboutImagePreview || (homeData.aboutImage?.url || homeData.aboutImage)} alt="About" className="h-16 w-24 object-cover rounded" />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Title
              </label>
              <input
                type="text"
                name="aboutTitle"
                value={homeData.aboutTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Description (Paragraph 1)
              </label>
              <textarea
                name="aboutDescription1"
                value={homeData.aboutDescription1}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Description (Paragraph 2)
              </label>
              <textarea
                name="aboutDescription2"
                value={homeData.aboutDescription2}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
              />
            </div>
          </div>
        </div>

        {/* Collection Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold mb-4 text-[#7b5fc4]">Collection Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Image
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'collectionImage')}
                  className="hidden"
                  id="collection-upload"
                />
                <label
                  htmlFor="collection-upload"
                  className="bg-[#e1cffb] text-[#444444] px-4 py-2 rounded-lg hover:bg-[#b89ae8] transition cursor-pointer flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </label>
                {(homeData.collectionImagePreview || homeData.collectionImage) && (
                  <img src={homeData.collectionImagePreview || (homeData.collectionImage?.url || homeData.collectionImage)} alt="Collection" className="h-16 w-24 object-cover rounded" />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Title
                </label>
                <input
                  type="text"
                  name="collectionTitle"
                  value={homeData.collectionTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection By
                </label>
                <input
                  type="text"
                  name="collectionBy"
                  value={homeData.collectionBy}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Description
              </label>
              <textarea
                name="collectionDescription"
                value={homeData.collectionDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHomepage;