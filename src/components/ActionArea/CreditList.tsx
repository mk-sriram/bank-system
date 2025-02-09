"use client";

import { useState, useEffect } from "react";
import { CreditListProps } from "@/utils/types";

export default function CreditList({ finalJson }: CreditListProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = (index: number) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderCreditIcon = (creditLevel: string) => {
    switch (creditLevel) {
      case "approved":
        return (
          <svg
            className="h-5 w-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 01.023 1.414l-8 8a1 1 0 01-1.414 
                 0l-3.5-3.5a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 
                 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "declined":
        return (
          <svg
            className="h-5 w-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 
                 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 
                 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 
                 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "underReview":
        return (
          <svg
            className="h-5 w-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.764-1.36 2.722-1.36 
                 3.486 0l6.514 11.615c.75 1.338-.213 3.036-1.742 
                 3.036H3.486c-1.53 0-2.492-1.698-1.742-3.036L8.257 
                 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 
                 0zm-1-2a1 1 0 01-1-1V7a1 1 0 
                 112 0v4a1 1 0 01-1 1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto mt-8 w-[38rem] bg-white shadow-lg sm:rounded-lg">
        <ul role="list" className="divide-y divide-gray-200">
          {Array(6)
            .fill(null)
            .map((_, index) => (
              <li
                key={index}
                className="flex flex-col px-6 py-4 animate-pulse cursor-pointer transition hover:bg-gray-50"
              >
                {/* Top row: Name + Credit Icon + Expand button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-3">
                    <div className="h-5 w-5 bg-gray-300 rounded"></div>
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-5 w-5 bg-gray-300 rounded"></div>
                </div>

                {/* Expanded panel (mimic animation for expansion) */}
                {index % 2 === 0 && (
                  <div className="mt-2 text-sm text-gray-600 flex justify-end">
                    <div className="bg-gray-300 rounded-md px-4 py-2 w-full h-6"></div>
                  </div>
                )}
              </li>
            ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 w-[38rem] bg-white shadow-lg sm:rounded-lg">
      <ul role="list" className="divide-y divide-gray-200">
        {finalJson.map((person, index) => (
          <li
            key={index}
            className="flex flex-col px-6 py-4 cursor-pointer transition hover:bg-gray-50"
            onClick={() => handleToggle(index)}
          >
            {/* Top row: Name + Credit Icon + Expand button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-3">
                <svg
                  className={`h-5 w-5 transition-transform ${
                    expanded[index] ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <p className="text-lg font-semibold text-gray-900">
                  {person.accountNumber}
                </p>
              </div>
              <div>{renderCreditIcon(person.creditLevel)}</div>
            </div>

            {/* Expanded panel */}
            {expanded[index] && (
              <div className="mt-2 text-sm text-gray-600 flex justify-end">
                <p className="bg-gray-100 rounded-md px-4 py-2 w-full">
                  {person.description}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
