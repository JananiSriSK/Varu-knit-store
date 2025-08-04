import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div className="group my-6 flex w-full max-w-[450px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <a
        className="relative mx-3 mt-3 flex h-44 overflow-hidden rounded-lg"
        href="#"
      >
        <img
          className="peer absolute top-0 right-0 h-full w-full object-cover transition-all duration-700"
          src={product.image1}
          alt="product"
        />
        <img
          className="peer absolute top-0 -right-96 h-full w-full object-cover transition-all delay-100 duration-1000 hover:right-0 peer-hover:right-0"
          src={product.image2}
          alt="product hover"
        />
        <div className="absolute bottom-0 mb-3 flex w-full justify-center space-x-2">
          <span className="h-2 w-2 rounded-full border-2 border-white bg-gray-200"></span>
          <span className="h-2 w-2 rounded-full border-2 border-white bg-gray-200"></span>
          <span className="h-2 w-2 rounded-full border-2 border-white bg-gray-200"></span>
        </div>
      </a>

      <div className="mt-3 px-4 pb-4 flex flex-col flex-grow">
        <h5 className="text-sm font-semibold text-slate-800">{product.name}</h5>

        <div className="mt-1 mb-3 flex items-center justify-between">
          <p className="text-base font-semibold text-slate-900">
            ₹{product.price}
          </p>
        </div>

        <div className="mt-auto">
          <a
            href="#"
            className="flex items-center justify-center rounded bg-[#6f5d6e] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#5c4b5a]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add to cart
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
