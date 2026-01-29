"use client";

import { FlowDesigner } from "@/components/flow-studio/flow-designer";
import { useParams } from "next/navigation";

export default function EditFlowPage() {
  const params = useParams();
  const id = params.id as string;

  return <FlowDesigner flowId={id} />;
}
