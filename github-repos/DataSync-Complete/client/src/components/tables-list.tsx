import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Eye, Edit, FileSpreadsheet, BarChart, AlertCircle, Calendar, Link2, Loader2, ExternalLink, ChevronRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { TableViewerModal } from "./table-viewer-modal";
import { EditTableModal } from "./edit-table-modal";
import { Table as TableType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TablesListProps {
  onCreateTable: () => void;
}

export function TablesList({ onCreateTable }: TablesListProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<TableType | null>(null);
  
  const { data: tables = [], isLoading, error } = useQuery<TableType[]>({
    queryKey: ['/api/tables'],
  });
  
  // Open table viewer with the selected table
  const openTableViewer = (tableId: number) => {
    setSelectedTable(tableId);
    setIsViewerOpen(true);
  };
  
  // Open edit modal with the selected table
  const openEditModal = (table: TableType) => {
    setTableToEdit(table);
    setIsEditOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-12 px-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading your tables...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-lg m-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Unable to load your tables</h3>
        <p className="mt-2 text-slate-500 max-w-md mx-auto">
          {error instanceof Error ? error.message : "An unexpected error occurred while loading your tables."}
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4 bg-red-100 text-red-700 hover:bg-red-200 border-none">
          Try Again
        </Button>
      </div>
    );
  }
  
  if (!tables || tables.length === 0) {
    return (
      <div className="px-6 py-12 flex flex-col items-center justify-center">
        <div className="bg-blue-50 rounded-full p-4 mb-4">
          <FileSpreadsheet className="h-12 w-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-medium text-slate-900">No tables yet</h3>
        <p className="mt-2 text-slate-500 text-center max-w-md">
          Create your first table to start syncing with Google Sheets and create custom views of your data.
        </p>
        <div className="mt-6">
          <Button 
            onClick={onCreateTable} 
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
            size="lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Your First Table
          </Button>
        </div>
      </div>
    );
  }
  
  // Use a card-based layout on smaller screens
  const isSmallScreen = window.innerWidth < 768;
  
  if (isSmallScreen) {
    return (
      <>
        <div className="space-y-4 p-4">
          {tables.map((table: TableType) => (
            <div 
              key={table.id} 
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-4 flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <BarChart className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-slate-900 truncate">{table.name}</h3>
                  <div className="mt-1 flex items-center">
                    <Calendar className="text-gray-400 h-3.5 w-3.5 mr-1.5" />
                    <p className="text-xs text-gray-500">
                      {table.lastUpdatedAt 
                        ? formatDistanceToNow(new Date(table.lastUpdatedAt), { addSuffix: true })
                        : "Never updated"}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center">
                    <Link2 className="text-gray-400 h-3.5 w-3.5 mr-1.5" />
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                      {table.googleSheetUrl}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 inline-flex text-xs leading-none font-semibold rounded-full bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={() => openTableViewer(table.id)}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  View
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => openEditModal(table)}
                >
                  <Edit className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Table Viewer Modal */}
        {selectedTable !== null && (
          <TableViewerModal
            tableId={selectedTable}
            open={isViewerOpen}
            onOpenChange={setIsViewerOpen}
          />
        )}
        
        {/* Edit Table Modal */}
        <EditTableModal
          table={tableToEdit}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onTableUpdated={() => {
            // Refetch tables data is handled by the invalidation in the modal
          }}
        />
      </>
    );
  }
  
  // Desktop view with enhanced table
  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold">Table Name</TableHead>
              <TableHead className="font-semibold">Google Sheet</TableHead>
              <TableHead className="font-semibold">Last Updated</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table: TableType) => (
              <TableRow 
                key={table.id} 
                className="hover:bg-blue-50/50 cursor-pointer group"
                onClick={() => openTableViewer(table.id)}
              >
                <TableCell>
                  <div className="flex items-center py-1">
                    <div className="flex-shrink-0 h-9 w-9 rounded-md bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-blue-600">
                      <BarChart className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-slate-900">{table.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {Array.isArray(table.columns) ? table.columns.length : 0} custom columns
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="truncate max-w-xs">
                  <div className="text-sm text-slate-600 truncate">
                    <div className="group flex items-center">
                      <span className="truncate">{table.googleSheetUrl}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-slate-600">
                    {table.lastUpdatedAt 
                      ? (
                        <div className="flex flex-col">
                          <span>{format(new Date(table.lastUpdatedAt), 'MMM d, yyyy')}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{format(new Date(table.lastUpdatedAt), 'h:mm a')}</span>
                        </div>
                      )
                      : "Never updated"}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 inline-flex text-xs leading-4 font-medium rounded-full bg-green-100 text-green-800">
                    Connected
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTableViewer(table.id);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(table);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                  </div>
                  <div className="text-blue-600 font-medium flex items-center group-hover:hidden">
                    <span>View</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Table Viewer Modal */}
      {selectedTable !== null && (
        <TableViewerModal
          tableId={selectedTable}
          open={isViewerOpen}
          onOpenChange={setIsViewerOpen}
        />
      )}
      
      {/* Edit Table Modal */}
      <EditTableModal
        table={tableToEdit}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onTableUpdated={() => {
          // Refetch tables data is handled by the invalidation in the modal
        }}
      />
    </>
  );
}
