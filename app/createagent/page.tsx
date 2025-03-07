"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import CreateAgent from "@/components/create-agent";

  

export default function CreateAgentPage() {

 

  return (
    <DndProvider backend={HTML5Backend}>
      <CreateAgent />
    </DndProvider>
  );
}