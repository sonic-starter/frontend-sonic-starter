import React, { DragEvent } from 'react';

interface DropZoneProps {
  onDrop: (items: any | any[]) => void; // Adjust the type based on the structure of the items
  selectedFunctions: any[]; // Replace `any` with your actual type for the functions if known
  onRemove: (id: string) => void; // Function to handle removal, if applicable
  multiple?: boolean; // Optional prop to determine if multiple items are allowed
}

const DropZone: React.FC<DropZoneProps> = ({ onDrop, selectedFunctions, onRemove, multiple = true }) => {
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const items = Array.from(event.dataTransfer.items).map((item) => {
      // Assuming the item is a file or a custom object
      return item.kind === 'file' ? item.getAsFile() : item; // Modify this based on your data structure
    });

    // Filter out any null or undefined items
    const validItems = items.filter((item) => item !== null && item !== undefined);

    if (multiple) {
      onDrop(validItems); // Pass the array of items
    } else {
      onDrop(validItems[0]); // Pass a single item if multiple is not allowed
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="drop-zone"
    >
      {/* Render your drop zone UI here */}
      <p>Drag items here to drop</p>
    </div>
  );
};

export default DropZone;
