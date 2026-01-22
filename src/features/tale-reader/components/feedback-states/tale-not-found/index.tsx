"use client";

import React from "react";

function TaleNotFound() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-6 text-center text-white">
      <h1 className="mb-4 font-bold text-2xl">Tale Not Found</h1>
      <p className="mb-2 text-gray-400">
        The tale you're looking for doesn't exist or is no longer available.
      </p>
    </div>
  );
}

export default TaleNotFound;
