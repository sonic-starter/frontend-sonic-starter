"use client";

import { useDrag } from "react-dnd";
import { Card } from "@/components/ui/card";
import { GripHorizontal , Grip , } from "lucide-react";
import type { AgentFunction } from "./index";

interface DraggableFunctionProps {
  func: AgentFunction;
}

export function DraggableFunction({ func }: DraggableFunctionProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "function",
    item: func,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="p-3 cursor-move bg-inputbg hover:bg-accent">
        <div className="flex items-start gap-3">
          <Grip className="h-5 w-5 text-muted-foreground mt-0.5" />
        
          <div>
            <h3 className="font-medium">{func.name}</h3>
            <p className="text-sm text-muted-foreground">{func.description}</p>
          </div>
        </div>

        
              {/* <div className="space-y-2 ">
                <div className="flex flex-row gap-1 px-5">
                  <Image
                    src="/images/agentprofile.svg"
                    alt="Agent Avatar"
                    width={13}
                    height={13}
                    className="rounded-full"
                  />
                  <h3 className="text-sm font-semibold text-primary py-1">Personality Traits</h3>
                </div>

                <div className="grid grid-cols-2 gap-px bg-[#151515] border border-border rounded-lg overflow-hidden">
                  <div className="p-4 bg-black text-center border-b border-r border-border">
                    <h3 className="text-md font-semibold text-white">0%</h3>
                    <p className="text-sm text-muted-foreground">Intelligence</p>
                  </div>
                  <div className="p-4 bg-black text-center border-b border-border">
                    <h3 className="text-md font-semibold text-white">0%</h3>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="p-4 bg-black text-center border-r border-border">
                    <h3 className="text-md font-semibold text-white">0%</h3>
                    <p className="text-sm text-muted-foreground">Security</p>
                  </div>
                  <div className="p-4 bg-black text-center">
                    <h3 className="text-md font-semibold text-white">0%</h3>
                    <p className="text-sm text-muted-foreground">Processing</p>
                  </div>
                </div>

              </div> */}

              {/* Personality Traits */}
              {/* <div className="space-y-2">
                <h3 className="text-sm font-semibold text-primary px-5 py-1">
                  Personality Traits
                </h3>
                <div className="border-border border rounded-lg py-4">
                  <ul className="text-xs text-muted-foreground list-disc ml-8">
                    <li>Advanced neural processing</li>
                    <li>Real-time data analysis</li>
                    <li>Adaptive learning systems</li>
                    <li>Multi-dimensional problem solving</li>
                  </ul>
                </div>
              </div> */}
      </Card>
    </div>
  );
}