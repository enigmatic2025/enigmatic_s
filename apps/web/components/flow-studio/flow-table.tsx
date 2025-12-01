"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlayCircle, Trash, Edit } from "lucide-react";
import { toast } from "sonner";

import { flowService } from "@/services/flow-service";
import { DeleteFlowModal } from "@/components/flow-studio/modals/delete-flow-modal";
import { RenameFlowModal } from "@/components/flow-studio/modals/rename-flow-modal";

interface FlowTableProps {
  initialFlows: any[];
  slug: string;
}

export function FlowTable({ initialFlows, slug }: FlowTableProps) {
  const router = useRouter();
  const [flows, setFlows] = useState(initialFlows);
  const [selectedFlow, setSelectedFlow] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!selectedFlow) return;
    try {
      await flowService.deleteFlow(selectedFlow.id);
      setFlows(flows.filter((f) => f.id !== selectedFlow.id));
      toast.success("Flow deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete flow");
    }
  };

  const handleRename = async (newName: string) => {
    if (!selectedFlow) return;
    try {
      await flowService.renameFlow(selectedFlow.id, newName);
      setFlows(
        flows.map((f) =>
          f.id === selectedFlow.id ? { ...f, name: newName } : f
        )
      );
      toast.success("Flow renamed successfully");
      setIsRenameModalOpen(false);
    } catch (error) {
      toast.error("Failed to rename flow");
    }
  };

  return (
    <>
      <div className="rounded-md border-none">
        <Table>
          <TableHeader className="border-none">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[300px] pl-0">Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flows && flows.length > 0 ? (
              flows.map((flow: any) => (
                <TableRow
                  key={flow.id}
                  className="border-none hover:bg-muted/50 group"
                >
                  <TableCell className="font-medium pl-0">
                    <Link
                      href={`/nodal/${slug}/dashboard/flow-studio/design/${flow.id}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <div className="h-8 w-8 rounded-md border bg-background p-1.5 flex items-center justify-center text-muted-foreground">
                        <PlayCircle className="h-4 w-4" />
                      </div>
                      {flow.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        flow.is_active
                          ? "text-green-600 border-green-600/20 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                          : "text-orange-600 border-orange-600/20 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400"
                      }
                    >
                      {flow.is_active ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {flow.definition?.nodes?.find(
                      (n: any) => n.type === "schedule"
                    )
                      ? "Schedule"
                      : "Manual"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    Never
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedFlow(flow);
                            setIsRenameModalOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedFlow(flow);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  No flows found. Create one to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedFlow && (
        <>
          <DeleteFlowModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            flowName={selectedFlow.name}
          />
          <RenameFlowModal
            isOpen={isRenameModalOpen}
            onClose={() => setIsRenameModalOpen(false)}
            onConfirm={handleRename}
            currentName={selectedFlow.name}
          />
        </>
      )}
    </>
  );
}
