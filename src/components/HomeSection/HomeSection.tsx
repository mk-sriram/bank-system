"use client";
import React from "react";

const HomeSection = () => {
  return (
    <section className="flex flex-col items-center pt-20 pb-6 ">
      <div className="max-w-4xl px-4 text-center">
        {/* Main Heading */}
        <h1
          className="
            text-4xl 
            md:text-6xl 
            font-bold 
            tracking-tight 
            text-gray-900 
            mb-6
          "
        >
          Statement insights with AI.
        </h1>
        {/* Subtext */}
        <p
          className="
            text-lg
            md:text-xl 
            text-gray-700
            max-w-3xl 
            mx-auto
          "
        >
          Just drop your files and let AI decide if these statements are Credit
          Worthy!
        </p>
      </div>
    </section>
  );
};

export default HomeSection;
