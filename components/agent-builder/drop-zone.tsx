"use client";

import { useDrop } from "react-dnd";
import { X } from "lucide-react";
import type { AgentFunction } from "./index";
import FunctionConfig from "./FunctionConfig";
import { UserCircle2 } from "lucide-react";
import Image from "next/image";

interface DropZoneProps {
  onDrop: (item: AgentFunction | AgentFunction[]) => void;
  selectedFunctions: AgentFunction[];
  onRemove: (id: string) => void;
  errors?: {
    agentName?: string;
    codename?: string;
    roleDescription?: string;
    functions?: string;
    llmModel?: string;
    llmProvider?: string;
  };
}


export function DropZone({ onDrop, selectedFunctions, onRemove, errors }: DropZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "function",
    drop: (item: AgentFunction) => {
      // Check if the function is already in selectedFunctions before calling onDrop
      if (!selectedFunctions.some((func) => func.id === item.id)) {
        onDrop(item);
      } else {
        alert("You cannot add the same function multiple times.");
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`min-h-full rounded-lg border-dashed border-2 ${isOver ? "border-accent bg-accent/10" : "border-muted"
        } transition-colors relative`}
    >
      <div className="flex items-center gap-2 mb-6 border-b-2 border-dashed p-3">
        <div className="px-2 py-1 rounded-full bg-primary">
          <Image
            src="/images/Union.svg"
            alt="union"
            width={10}
            height={18}
            className="text-primary-foreground"
          />
        </div>
        <h3 className="text-lg font-semibold text-white">
          Agent Configuration
        </h3>
      </div>
      {selectedFunctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-8 py-36 gap-4">
          {/* Drag and Drop Icon */}
          <img
            src="/images/dragdropicon.svg"
            alt="Drag and Drop Icon"
            className="w-16 h-16" /* Optional: Adjust the icon size */
          />
          {/* Title and Instructions */}
          <div>
            <p className="text-lg font-medium text-foreground">
              Drag functions here to build your agent
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Customize your agent by adding and configuring functions
            </p>
          </div>
          {errors?.functions ? (
            <div className=" flex items-center justify-center">
              <p className="text-red-500 text-sm  p-2 rounded shadow-md">
                {errors.functions}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {selectedFunctions.map((func) => (
            <FunctionConfig key={func.id} func={func} onRemove={onRemove} />
          ))}
        </div>
      )}

      {/* Conditional text */}
      {selectedFunctions.length > 0 && (
        <div className="text-center mb-4 text-sm text-muted-foreground">
          + drag more functions
        </div>
      )}


    </div>
  );
}

