import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Schema for form validation
const createTableSchema = z.object({
  name: z.string().min(1, "Table name is required"),
  googleSheetUrl: z.string().url("Please enter a valid Google Sheet URL"),
  columns: z.array(
    z.object({
      name: z.string().min(1, "Column name is required"),
      type: z.enum(["text", "date"])
    })
  ).min(1, "At least one column is required")
});

type CreateTableFormData = z.infer<typeof createTableSchema>;

interface CreateTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTableCreated?: () => void;
}

export function CreateTableModal({ open, onOpenChange, onTableCreated }: CreateTableModalProps) {
  const { toast } = useToast();
  const [numColumns, setNumColumns] = useState(3);
  
  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<CreateTableFormData>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      name: "",
      googleSheetUrl: "",
      columns: [
        { name: "", type: "text" },
        { name: "", type: "text" },
        { name: "", type: "text" }
      ]
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "columns"
  });
  
  // Update columns when numColumns changes
  useEffect(() => {
    const currentLength = fields.length;
    
    if (numColumns > currentLength) {
      // Add more columns
      for (let i = 0; i < numColumns - currentLength; i++) {
        append({ name: "", type: "text" });
      }
    } else if (numColumns < currentLength) {
      // Remove excess columns
      for (let i = currentLength - 1; i >= numColumns; i--) {
        remove(i);
      }
    }
  }, [numColumns, fields.length, append, remove]);
  
  const createTableMutation = useMutation({
    mutationFn: async (data: CreateTableFormData) => {
      const res = await apiRequest("POST", "/api/tables", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Table created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      
      // Reset form and close modal
      reset();
      onOpenChange(false);
      
      // Callback
      if (onTableCreated) {
        onTableCreated();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create table: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: CreateTableFormData) => {
    createTableMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Table</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Table Name</Label>
            <Input
              id="name"
              placeholder="e.g. Customer Data"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="googleSheetUrl">Google Sheet URL</Label>
            <Input
              id="googleSheetUrl"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              {...register("googleSheetUrl")}
            />
            {errors.googleSheetUrl && (
              <p className="text-sm text-red-500">{errors.googleSheetUrl.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="numColumns">Number of Columns</Label>
            <Input
              id="numColumns"
              type="number"
              min={1}
              max={20}
              value={numColumns}
              onChange={(e) => setNumColumns(parseInt(e.target.value) || 1)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Define Columns</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center">
                <Input
                  placeholder="Column Name"
                  {...register(`columns.${index}.name`)}
                />
                <Select
                  defaultValue={field.type}
                  onValueChange={(value) => setValue(`columns.${index}.type`, value as "text" | "date")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={fields.length <= 1}
                  onClick={() => {
                    if (fields.length > 1) {
                      remove(index);
                      setNumColumns(prev => prev - 1);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            {errors.columns && (
              <p className="text-sm text-red-500">{errors.columns.message}</p>
            )}
          </div>
          
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
            <Button type="submit" disabled={createTableMutation.isPending}>
              {createTableMutation.isPending ? "Creating..." : "Create Table"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
