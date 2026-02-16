"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Rocket } from "lucide-react";

interface PublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  flowName: string;
  hasUnsavedChanges: boolean;
}

export function PublishConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  flowName,
  hasUnsavedChanges,
}: PublishConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Publish to Production
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              You are about to publish
              <span className="font-semibold text-foreground"> "{flowName}" </span>
              to production. This will make the current draft version live.
            </span>
            {hasUnsavedChanges && (
              <span className="block text-yellow-600 dark:text-yellow-500 font-medium">
                You have unsaved changes. They will be saved automatically before publishing.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Publish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
