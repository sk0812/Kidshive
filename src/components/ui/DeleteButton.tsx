import { Trash2 } from "lucide-react";
import { Button } from "./button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  entityName: string;
  entityType: "parent" | "child";
}

export function DeleteButton({
  onDelete,
  entityName,
  entityType,
}: DeleteButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      console.log("DeleteButton: Starting delete process");
      setIsDeleting(true);
      await onDelete();
      console.log("DeleteButton: Delete completed successfully");
      toast.success(`${entityType} deleted successfully`);
      setShowDialog(false);
    } catch (error) {
      console.error("DeleteButton error:", error);
      let errorMessage = "Failed to delete";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "error" in error
      ) {
        errorMessage = String((error as { error: unknown }).error);
      }
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          console.log("Delete button clicked for:", entityName);
          setShowDialog(true);
        }}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {entityName}
              {entityType === "parent"
                ? "'s account from the system."
                : " from the database."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                console.log("Confirm delete clicked for:", entityName);
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
