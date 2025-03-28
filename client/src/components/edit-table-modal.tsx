import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema
const editTableSchema = z.object({
  name: z.string().min(1, "Name is required"),
  googleSheetUrl: z.string().url("Must be a valid URL")
});

type EditTableFormData = z.infer<typeof editTableSchema>;

interface EditTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  onTableUpdated?: () => void;
}

export function EditTableModal({ open, onOpenChange, table, onTableUpdated }: EditTableModalProps) {
  const { toast } = useToast();
  
  const form = useForm<EditTableFormData>({
    resolver: zodResolver(editTableSchema),
    defaultValues: {
      name: table?.name || "",
      googleSheetUrl: table?.googleSheetUrl || ""
    }
  });
  
  // Update form when table changes
  useEffect(() => {
    if (table) {
      form.reset({
        name: table.name,
        googleSheetUrl: table.googleSheetUrl
      });
    }
  }, [table, form]);
  
  // Update table mutation
  const updateTableMutation = useMutation({
    mutationFn: async (data: EditTableFormData) => {
      if (!table) throw new Error("No table selected");
      const res = await apiRequest("PATCH", `/api/tables/${table.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch latest data
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      
      toast({
        title: "Success",
        description: "Table updated successfully",
      });
      
      onOpenChange(false);
      
      if (onTableUpdated) {
        onTableUpdated();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update table: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: EditTableFormData) => {
    updateTableMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Table</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Sales Data" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="googleSheetUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Sheet URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://docs.google.com/spreadsheets/d/..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateTableMutation.isPending}
              >
                {updateTableMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}