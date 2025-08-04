import React from "react";
import ProductCard from "../components/ProductCard.jsx";
import dummyProducts from "../constants/dummyProducts.js";
import logo from "../images/logo.png";
import bgImage from "../images/banner4.jpg";

const Body = () => {
  return (
    <div className="bg-gray-50 py-1 mx-auto max-w-screen-lg">
      {/* Header */}
      <div
        className="relative h-70 rounded-b-lg bg-cover bg-center bg-no-repeat shadow-lg"
        style={{ backgroundImage: `url(${bgImage})` }}
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
      <div className="mt-16 flex flex-col items-start justify-center space-y-4 py-8 px-4 sm:flex-row sm:space-y-0 md:justify-between lg:px-0">
        <div className="max-w-lg">
          <h1 className="text-2xl font-bold text-gray-800">Welcome !!</h1>
          <p className="mt-2 text-gray-600">
            Every product is handmade with love, care and attention to detail.
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
            +91 9150324779
          </p>
        </div>
      </div>
      <section>
        <div class="m-10 mx-4 max-w-screen-lg overflow-hidden rounded-xl border-hidden shadow-lg md:pl-8">
          <div class="flex flex-col overflow-hidden bg-white sm:flex-row md:h-80">
            <div class="flex w-full flex-col p-4 sm:w-1/2 sm:p-8 lg:w-3/5">
              <h2 class="text-xl font-bold text-gray-900 md:text-2xl lg:text-4xl">
                Winter Collection
              </h2>
              <p class="mt-2 text-lg">By Luis Vuitton</p>
              <p class="mt-4 mb-8 max-w-md text-gray-500">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Aliquam iusto, cumque dolores sit odio ex.
              </p>
              <a
                href="#"
                class="group mt-auto flex w-44 cursor-pointer select-none items-center justify-center rounded-md bg-black px-6 py-2 text-white transition"
              >
                <span class="group flex w-full items-center justify-center rounded py-1 text-center font-bold">
                  {" "}
                  Shop now{" "}
                </span>
                <svg
                  class="flex-0 group-hover:w-6 ml-4 h-6 w-0 transition-all"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </div>

            <div class="order-first ml-auto h-48 w-full bg-gray-700 sm:order-none sm:h-auto sm:w-1/2 lg:w-2/5">
              <img
                class="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-[#f7f4ff] font-sans">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          {/* Image */}
          <div className="lg:w-1/2">
            <img
              src="https://placehold.co/600x450"
              alt="Crocheting with yarn and accessories"
              className="rounded-xl shadow-md"
            />
          </div>

          {/* Text Content */}
          <div className="lg:w-1/2 text-[#444444]">
            <h2 className="text-xl md:text-2xl font-serif font-semibold mb-3 text-[#A084CA]">
              Our Story
            </h2>
            <p className="text-sm md:text-base mb-3 leading-relaxed">
              Founded in 2015, Varuknit began as a passion for handcrafted yarn
              creations. From cozy living rooms to nationwide deliveries, we’ve
              kept the art of yarn alive.
            </p>
            <p className="text-sm md:text-base mb-5 leading-relaxed">
              Every piece is custom-made with eco-conscious materials, ensuring
              sustainability without compromising comfort. We believe in craft,
              community, and care.
            </p>
            <button className="bg-[#D97878] hover:bg-[#c76666] text-white text-sm font-medium py-2 px-6 rounded-full transition duration-200">
              Learn More About Us
            </button>
          </div>
        </div>
      </section>

      {/* Feature section*/}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#444444] mb-6">
            Featured Products
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-8">
            {dummyProducts
              .slice(0, 3)
              .map(
                (product, index) =>
                  product && (
                    <ProductCard key={product.id || index} product={product} />
                  )
              )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="text-center text-gray-500">
          <p>More exciting features coming soon!</p>
        </div>
      </section>
    </div>
  );
};

export default Body;
