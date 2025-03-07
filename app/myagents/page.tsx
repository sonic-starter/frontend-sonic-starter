"use client";

import MyAgents from "@/components/my-agent";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function MyAgentPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <MyAgents />
    </DndProvider>
  );
}