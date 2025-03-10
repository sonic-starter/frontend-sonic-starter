"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex justify-between">
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
        <Input
          type="search"
          placeholder="Search agents..."
          className="w-full pl-12 py-2  border border-borderColor text-primary text-lg"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2 ">
        <select
          className="block rounded-md mt-2 bg-gradient-to-br from-darkStart to-darkEnd border border-borderColor text-primary px-3 py-2 outline-none"
        >
          <option value="">Sort by Marketcap</option>
          <option >Sort by Name</option>
          <option >Sort by price</option>
        </select>

        <select
          className="block rounded-md mt-2 bg-gradient-to-br from-darkStart to-darkEnd border border-borderColor text-primary pl-3 py-2 outline-none"
        >
          <option value="" >All Price</option>
          <option >1000 - 5000</option>
          <option >&lt; 1000</option>
        </select>
      </div>
    </div>
  );
}