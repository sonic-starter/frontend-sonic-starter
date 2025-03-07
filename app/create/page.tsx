"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AgentBuilder from "@/components/agent-builder";
import { useSearchParams } from "next/navigation";
  

export default function CreatePage() {

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  console.log("agent id in create page", id);

  return (
    <DndProvider backend={HTML5Backend}>
      <AgentBuilder agentId={id} />
    </DndProvider>
  );
}