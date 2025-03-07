"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AgentBuilder from "@/components/agent-builder";
import AgentDetail from "@/components/agent-detail/index";

export default function AgentDetailPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AgentDetail />
    </DndProvider>
  );
}