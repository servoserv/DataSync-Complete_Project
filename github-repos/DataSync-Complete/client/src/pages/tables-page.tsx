import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableViewerModal } from "@/components/table-viewer-modal";
import { CreateTableModal } from "@/components/create-table-modal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Table } from "@shared/schema";
import { Loader2, Plus, Search, ExternalLink, Trash2, Edit, MoreHorizontal, FileSpreadsheet, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function TablesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  // Get all tables
  const { 
    data: tables = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['/api/tables'],
    refetchOnWindowFocus: true
  });
  
  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: number) => {
      await apiRequest("DELETE", `/api/tables/${tableId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      toast({
        title: "Table deleted",
        description: "The table has been successfully deleted."
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete table",
        variant: "destructive"
      });
    }
  });
  
  // Sync table mutation
  const syncTableMutation = useMutation({
    mutationFn: async (tableId: number) => {
      await apiRequest("POST", `/api/tables/${tableId}/sync`);
    },
    onSuccess: () => {
      // Invalidate both tables list and any open table data
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      
      // If there's a selected table, invalidate its data too
      if (selectedTableId) {
        queryClient.invalidateQueries({ queryKey: [`/api/tables/${selectedTableId}/data`] });
      }
      
      toast({
        title: "Sync successful",
        description: "The table has been synchronized with Google Sheets.",
        duration: 3000
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync with Google Sheets",
        variant: "destructive",
        duration: 5000
      });
    }
  });
  
  // Handle opening table
  const handleOpenTable = (tableId: number) => {
    setSelectedTableId(tableId);
    setIsViewerOpen(true);
  };
  
  // Handle delete table click
  const handleDeleteClick = (table: Table) => {
    setTableToDelete(table);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (tableToDelete) {
      deleteTableMutation.mutate(tableToDelete.id);
    }
  };
  
  // Filter tables based on search
  const filteredTables = searchTerm
    ? tables.filter((table: Table) => 
        table.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tables;
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tables</h1>
            <p className="text-slate-500 mt-1">
              Connect, view, and manage your data tables
            </p>
          </div>
          
          <Button className="gap-2" onClick={() => setIsCreateTableOpen(true)}>
            <Plus className="h-4 w-4" />
            Create New Table
          </Button>
        </div>
        
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              className="pl-9"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center p-8 border rounded-lg bg-red-50 text-red-600">
            {error instanceof Error ? error.message : "Failed to load tables"}
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-white">
            {searchTerm ? (
              <div>
                <p className="text-lg font-medium">No tables found</p>
                <p className="text-slate-500 mt-1">
                  No tables matching "{searchTerm}" were found. Try a different search term or create a new table.
                </p>
              </div>
            ) : (
              <div>
                <div className="mx-auto h-12 w-12 bg-indigo-100 flex items-center justify-center rounded-full mb-4">
                  <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="text-lg font-medium">No tables yet</p>
                <p className="text-slate-500 mt-1 mb-6">
                  Get started by creating your first data table
                </p>
                <Button onClick={() => setIsCreateTableOpen(true)}>
                  Create New Table
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTables.map((table: Table) => (
              <Card key={table.id} className="overflow-hidden">
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <CardTitle className="text-xl">{table.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleOpenTable(table.id)}>
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          View Table
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => syncTableMutation.mutate(table.id)}
                          disabled={syncTableMutation.isPending}
                        >
                          {syncTableMutation.isPending && syncTableMutation.variables === table.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Sync Now
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            // We'll implement edit settings in a future update
                            toast({
                              title: "Coming Soon",
                              description: "Table editing functionality will be available in the next update."
                            });
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (table.googleSheetUrl) {
                              window.open(table.googleSheetUrl, '_blank');
                            } else {
                              toast({
                                title: "No URL Available",
                                description: "This table doesn't have a Google Sheet URL configured.",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open in Google Sheets
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(table)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Table
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="mt-1 text-sm text-slate-500">
                    Connected to Google Sheets
                  </div>
                  <div className="mt-4 text-xs text-slate-400">
                    Last updated: {table.lastUpdatedAt 
                      ? new Date(table.lastUpdatedAt).toLocaleString()
                      : 'Never'
                    }
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 pb-4 bg-gray-50 flex gap-2">
                  <Button 
                    variant="default" 
                    className="flex-1" 
                    onClick={() => handleOpenTable(table.id)}
                  >
                    Open Table
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-1"
                    disabled={syncTableMutation.isPending}
                    onClick={() => syncTableMutation.mutate(table.id)}
                  >
                    {syncTableMutation.isPending && syncTableMutation.variables === table.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Sync
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* Create Table Modal */}
        <CreateTableModal 
          open={isCreateTableOpen}
          onOpenChange={setIsCreateTableOpen}
          onTableCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
          }}
        />
        
        {/* Table Viewer Modal */}
        {selectedTableId && (
          <TableViewerModal
            tableId={selectedTableId}
            open={isViewerOpen}
            onOpenChange={setIsViewerOpen}
          />
        )}
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the table "{tableToDelete?.name}"? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                disabled={deleteTableMutation.isPending}
              >
                {deleteTableMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Table
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}