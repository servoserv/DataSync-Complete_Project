import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Edit, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EditCellValueProps {
  columnId: number;
  rowIndex: number;
  initialValue: string;
  onSave?: (value: string) => void;
  onCancel?: () => void;
}

export function EditCellValue({ 
  columnId, 
  rowIndex, 
  initialValue = "", 
  onSave, 
  onCancel 
}: EditCellValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const { toast } = useToast();

  // Fetch the existing value for this cell
  const { 
    data: cellValue,
    isLoading,
    isError
  } = useQuery<{ columnId: number; rowIndex: number; value: string; id?: number }>({
    queryKey: [`/api/columns/${columnId}/values/${rowIndex}`],
    enabled: !isEditing, // Only fetch when not editing to avoid race conditions
  });

  // Set the value when cell data is loaded
  useEffect(() => {
    if (cellValue && cellValue.value) {
      setValue(cellValue.value);
    } else if (!isEditing) {
      setValue(initialValue);
    }
  }, [cellValue, initialValue, isEditing]);

  // Save value mutation
  const saveValueMutation = useMutation({
    mutationFn: async (data: { columnId: number; rowIndex: number; value: string }) => {
      const res = await apiRequest("POST", "/api/columns/values", data);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate any related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/columns/${columnId}/values/${rowIndex}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      
      setIsEditing(false);
      toast({
        title: "Value saved",
        description: "The cell value has been saved successfully.",
      });
      onSave?.(value);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save value",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (cellValue && cellValue.value) {
      setValue(cellValue.value);
    } else {
      setValue(initialValue);
    }
    onCancel?.();
  };

  const handleSave = useCallback(() => {
    saveValueMutation.mutate({
      columnId,
      rowIndex,
      value,
    });
  }, [columnId, rowIndex, value, saveValueMutation]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-8">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive text-xs">Error loading value</div>
    );
  }

  // Show the editing interface
  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8"
          autoFocus
        />
        <div className="flex space-x-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7" 
            onClick={handleSave}
            disabled={saveValueMutation.isPending}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7" 
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Show the display interface with an edit button
  return (
    <div className="flex items-center justify-between">
      <span className="truncate mr-2">
        {cellValue && cellValue.value ? cellValue.value : "—"}
      </span>
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-7 w-7 opacity-50 hover:opacity-100" 
        onClick={handleStartEditing}
      >
        <Edit className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}