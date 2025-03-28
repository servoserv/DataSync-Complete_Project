import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Schema for form validation
const addColumnSchema = z.object({
  name: z.string().min(1, "Column name is required"),
  type: z.enum(["text", "date"]),
});

type AddColumnFormData = z.infer<typeof addColumnSchema>;

interface AddColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: number;
  onColumnAdded?: () => void;
}

export function AddColumnModal({ open, onOpenChange, tableId, onColumnAdded }: AddColumnModalProps) {
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AddColumnFormData>({
    resolver: zodResolver(addColumnSchema),
    defaultValues: {
      name: "",
      type: "text"
    }
  });
  
  // Watch the column type to show appropriate default value field
  const columnType = watch("type");
  
  const addColumnMutation = useMutation({
    mutationFn: async (data: AddColumnFormData) => {
      const res = await apiRequest("POST", `/api/tables/${tableId}/columns`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Column added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tables', tableId] });
      
      // Reset form and close modal
      reset();
      onOpenChange(false);
      
      // Callback
      if (onColumnAdded) {
        onColumnAdded();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add column: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: AddColumnFormData) => {
    addColumnMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Column Name</Label>
            <Input
              id="name"
              placeholder="e.g. Status"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Column Type</Label>
            <Select
              defaultValue="text"
              onValueChange={(value) => setValue("type", value as "text" | "date")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>
          
          <p className="text-sm text-slate-500">
            This column will only be visible in the dashboard and won't be added to the Google Sheet.
          </p>
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addColumnMutation.isPending}>
              {addColumnMutation.isPending ? "Adding..." : "Add Column"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
