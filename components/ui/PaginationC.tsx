"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationC({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Function to handle next and previous clicks
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // Helper function to generate page numbers with ellipses
  const getPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      // Show all pages if total pages are 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show the first two pages
      pages.push(1);
      if (currentPage > 3) pages.push(2);

      if (currentPage > 4) pages.push("...");

      // Show current page and its adjacent pages
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) pages.push("...");

      // Always show the last two pages
      if (currentPage < totalPages - 2) pages.push(totalPages - 1);
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex justify-center items-center mt-8 space-x-2 ">
      {/* Previous Button */}
      <div
        className={`p-2 rounded-md cursor-pointer ${
          currentPage === 1 ? "text-primary cursor-not-allowed" : " text-primary"
        }`}
        onClick={handlePrevious}
      >
        <ChevronLeft />
      </div>

      {/* Page Numbers */}
      {pages.map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 text-primary  hover:border hover:border-borderColor  hover:text-primary rounded-md ${
              currentPage === page ? " border border-borderColor text-primary hover:bg-primary/10 hover:text-primary" : "bg-transparent text-primary"
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-4 py-2 text-primary">
            {page}
          </span>
        )
      )}

      {/* Next Button */}
      <div
        className={`p-2 rounded-md cursor-pointer ${
          currentPage === totalPages ? "text-primary cursor-not-allowed" : "text-primary"
        }`}
        onClick={handleNext}
      >
        <ChevronRight />
      </div>
    </div>
  );
}
