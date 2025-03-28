import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Plus, Download, RefreshCw, Edit, Calendar } from "lucide-react";
import { AddColumnModal } from "./add-column-modal";
import { EditCellValue } from "./edit-cell-value";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Table, CustomColumn, SheetData } from "@shared/schema";
import { TooltipHelper } from "@/components/ui/tooltip-helper";
import { AnimatedContainer } from "@/components/ui/animated-container";

// Define types for the table data response from API
interface TableDataResponse {
  table: Table;
  customColumns: CustomColumn[];
  sheetData: SheetData;
}

interface TableViewerModalProps {
  tableId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TableViewerModal({ tableId, open, onOpenChange }: TableViewerModalProps) {
  const { toast } = useToast();
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<string[][]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // WebSocket for real-time updates
  const wsRef = useRef<WebSocket | null>(null);
  
  const { 
    data: tableData, 
    isLoading, 
    error,
    refetch 
  } = useQuery<TableDataResponse>({
    queryKey: [`/api/tables/${tableId}/data`],
    enabled: open && !!tableId,
  });
  
  // Set up WebSocket connection and polling
  useEffect(() => {
    if (open && tableId) {
      // Determine WebSocket URL (use secure connection in production)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws-api`;
      
      console.log('Attempting to connect to WebSocket:', wsUrl);
      
      // Try to establish WebSocket connection
      try {
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          console.log('WebSocket connected, subscribing to table updates');
          // Subscribe to updates for this table
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'subscribe',
              tableId: tableId
            }));
          }
        };
        
        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            // Handle subscription confirmation
            if (data.type === 'subscribed' && data.tableId === tableId) {
              console.log('Successfully subscribed to real-time updates');
              toast({
                title: "Connected",
                description: "Real-time updates enabled",
                variant: "default"
              });
            }
            
            // Handle table updates
            else if (data.type === 'tableUpdate' && data.tableId === tableId) {
              console.log('Table update received, refreshing data with:', data);
              
              // If the update includes the data directly, use it
              if (data.sheetData && data.customColumns) {
                // Set the data directly from the WebSocket
                queryClient.setQueryData([`/api/tables/${tableId}/data`], {
                  table: data.table,
                  sheetData: data.sheetData,
                  customColumns: data.customColumns
                });
                console.log('Updated data from WebSocket directly');
              } else {
                // Otherwise refetch
                refetch();
              }
              
              toast({
                title: "Table Updated",
                description: "New data received from Google Sheets",
                variant: "default"
              });
            }
            
            // Handle refreshed data
            else if (data.type === 'dataRefreshed' && data.tableId === tableId) {
              console.log('Data refresh notification received');
              
              // If the update includes the data directly, use it
              if (data.sheetData && data.customColumns) {
                // Set the data directly from the WebSocket
                queryClient.setQueryData([`/api/tables/${tableId}/data`], {
                  table: data.table,
                  sheetData: data.sheetData,
                  customColumns: data.customColumns
                });
                console.log('Updated data from refresh notification');
              } else {
                // Otherwise refetch
                refetch();
              }
              
              toast({
                title: "Data Refreshed",
                description: "Latest data from Google Sheets loaded",
                variant: "default"
              });
            }
            
            // Handle column added event
            else if (data.type === 'columnAdded' && data.tableId === tableId) {
              console.log('Column added event received:', data);
              
              // If the update includes the data directly, use it
              if (data.sheetData && data.column) {
                const currentData = queryClient.getQueryData([`/api/tables/${tableId}/data`]) as any;
                
                if (currentData) {
                  // Add the new column to the existing data
                  const updatedData = {
                    ...currentData,
                    customColumns: [...(currentData.customColumns || []), data.column],
                    sheetData: data.sheetData // Use the latest sheet data
                  };
                  
                  // Update the query cache
                  queryClient.setQueryData([`/api/tables/${tableId}/data`], updatedData);
                  console.log('Updated data with new column directly from WebSocket');
                } else {
                  // If we don't have existing data, do a full refetch
                  refetch();
                }
              } else {
                // Fallback to refetch if we don't have the data
                refetch();
              }
              
              toast({
                title: "Column Added",
                description: `Column "${data.column.name}" added successfully`,
                variant: "default"
              });
            }
            
            // Handle column value updated event
            else if (data.type === 'columnValueUpdated' && data.tableId === tableId) {
              console.log('Column value updated event received:', data);
              
              // If the update includes the data directly, use it
              if (data.customColumns && data.sheetData) {
                const currentData = queryClient.getQueryData([`/api/tables/${tableId}/data`]) as any;
                
                if (currentData) {
                  // Update the query cache with the latest data
                  queryClient.setQueryData([`/api/tables/${tableId}/data`], {
                    ...currentData,
                    customColumns: data.customColumns,
                    sheetData: data.sheetData
                  });
                  console.log('Updated data with new column value directly from WebSocket');
                } else {
                  // If we don't have existing data, do a full refetch
                  refetch();
                }
              } else {
                // Fallback to refetch if we don't have the data
                refetch();
              }
              
              toast({
                title: "Value Updated",
                description: "Cell value has been updated successfully",
                variant: "default"
              });
            }
          } catch (error) {
            console.error('WebSocket message error:', error);
          }
        };
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast({
            title: "Connection Error",
            description: "Could not establish real-time connection. Falling back to polling.",
            variant: "destructive"
          });
        };
        
        wsRef.current.onclose = (event) => {
          console.log('WebSocket connection closed', event.code, event.reason);
          
          // Only show toast if modal is still open
          if (open) {
            toast({
              title: "Connection Closed",
              description: "Real-time updates disabled, using polling instead",
              variant: "default"
            });
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
      }
      
      // Fallback: Set up polling for updates every 15 seconds
      const pollingInterval = setInterval(() => {
        console.log('Polling for table updates');
        refetch();
      }, 15000);
      
      return () => {
        // Unsubscribe from table updates
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          console.log('Unsubscribing from table updates');
          wsRef.current.send(JSON.stringify({
            type: 'unsubscribe',
            tableId: tableId
          }));
          wsRef.current.close();
        }
        
        clearInterval(pollingInterval);
      };
    }
  }, [open, tableId, refetch, toast]);
  
  // Filter data based on search term
  useEffect(() => {
    if (!tableData?.sheetData?.rows) {
      setFilteredData([]);
      return;
    }
    
    if (!searchTerm) {
      setFilteredData(tableData.sheetData.rows);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = tableData.sheetData.rows.filter((row: string[]) => 
      row.some(cell => cell.toString().toLowerCase().includes(term))
    );
    
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, tableData]);
  
  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      await apiRequest("GET", `/api/tables/${tableId}/data`);
      refetch();
      toast({
        title: "Success",
        description: "Table data refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh table data",
        variant: "destructive",
      });
    }
  };
  
  // Pagination
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle export to CSV
  const exportToCsv = () => {
    if (!tableData?.sheetData) return;
    
    const headers = [...tableData.sheetData.headers];
    const customColumns = tableData.customColumns || [];
    
    // Add custom column headers
    customColumns.forEach(col => {
      headers.push(`${col.name} (Added)`);
    });
    
    // Start with headers
    let csv = headers.map(header => `"${header}"`).join(",") + "\n";
    
    // Add data rows
    tableData.sheetData.rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(",");
      
      // Add empty cells for custom columns
      customColumns.forEach(() => {
        csv += `,""`;
      });
      
      csv += "\n";
    });
    
    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableData.table.name}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Loading Table Data</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (error || !tableData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-red-500">
              {error instanceof Error ? error.message : "Failed to load table data"}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  const { table, customColumns = [], sheetData } = tableData;
  const allHeaders = [...(sheetData?.headers || []), ...(customColumns.map(col => col.name) || [])];
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{table?.name || 'Loading table...'}</DialogTitle>
            <p className="text-sm text-slate-500">
              Connected to Google Sheets • Last updated: {
                table?.lastUpdatedAt 
                  ? format(new Date(table?.lastUpdatedAt), 'MMM d, yyyy h:mm a')
                  : 'Never'
              }
            </p>
          </DialogHeader>
          
          <div className="p-4 border-y bg-gray-50 flex flex-wrap items-center gap-3">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="search"
                  className="pl-10"
                  placeholder="Search in table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <AnimatedContainer animation="scale-in" delay={100}>
              <Button 
                className="gap-1" 
                onClick={() => setIsAddColumnOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            </AnimatedContainer>
            
            <AnimatedContainer animation="scale-in" delay={200}>
              <Button 
                variant="outline" 
                className="gap-1"
                onClick={exportToCsv}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </AnimatedContainer>
            
            <AnimatedContainer animation="scale-in" delay={300}>
              <TooltipHelper content="Sync with Google Sheets">
                <Button 
                  variant="outline" 
                  className="gap-1"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </TooltipHelper>
            </AnimatedContainer>
          </div>
          
          <div className="overflow-auto flex-1">
            {/* Check if we have either sheet data headers or custom columns */}
            {((sheetData && sheetData.headers && sheetData.headers.length > 0) || customColumns.length > 0) ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {/* Google Sheet headers */}
                    {sheetData && sheetData.headers && sheetData.headers.map((header, index) => (
                      <th 
                        key={`header-${index}`} 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        <TooltipHelper 
                          content={
                            <div className="text-xs">
                              <span className="font-semibold">Google Sheet Column</span>
                              <p className="opacity-90 mt-1">Data sourced directly from your Google Sheet</p>
                            </div>
                          }
                          side="top"
                        >
                          <span className="border-b border-dotted border-slate-400 cursor-help inline-flex items-center">
                            {header}
                          </span>
                        </TooltipHelper>
                      </th>
                    ))}
                    
                    {/* Add empty header column if no sheet headers but we have custom columns */}
                    {(!sheetData || !sheetData.headers || sheetData.headers.length === 0) && customColumns.length > 0 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Data
                      </th>
                    )}
                    
                    {/* Custom columns */}
                    {customColumns.map((column) => (
                      <th 
                        key={`custom-${column.id}`} 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-green-50 border-l border-green-200"
                      >
                        <TooltipHelper 
                          content={
                            <div className="text-xs">
                              <span className="font-semibold">Custom Column</span>
                              <p className="opacity-90 mt-1">Only visible in your dashboard, not in Google Sheets</p>
                              <p className="opacity-90 mt-1">Click on cells below to add custom values</p>
                            </div>
                          }
                          side="top"
                        >
                          <span className="border-b border-dotted border-green-400 cursor-help inline-flex items-center">
                            {column.name}{' '}
                            <AnimatedContainer animation="pulse" className="ml-1 bg-green-100 text-green-600 text-[9px] px-1 rounded">
                              CUSTOM
                            </AnimatedContainer>
                          </span>
                        </TooltipHelper>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Check if we have any data rows or we need to create a placeholder row */}
                  {(currentData && currentData.length > 0) ? (
                    currentData.map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`} className="hover:bg-gray-50">
                        {/* Google Sheet data cells */}
                        {row.map((cell: string, cellIndex: number) => (
                          <td 
                            key={`cell-${rowIndex}-${cellIndex}`} 
                            className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"
                          >
                            {cell}
                          </td>
                        ))}
                        
                        {/* Add empty data cell if no sheet data but we have custom columns */}
                        {(!row || row.length === 0) && customColumns.length > 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            -
                          </td>
                        )}
                        
                        {/* Custom columns with editable values */}
                        {customColumns.map((column) => {
                          // Calculate the actual row index in the full dataset 
                          // This should match what the server sees (based on the filtered data array)
                          const actualRowIndex = (currentPage - 1) * itemsPerPage + rowIndex;
                          
                          return (
                            <td 
                              key={`custom-cell-${rowIndex}-${column.id}`} 
                              className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 bg-green-50 border-l border-green-200"
                            >
                              <EditCellValue 
                                columnId={column.id}
                                rowIndex={actualRowIndex}
                                initialValue=""
                                onSave={(value) => {
                                  toast({
                                    title: "Value saved",
                                    description: `Value "${value}" saved for column "${column.name}"`,
                                  });
                                  // Invalidate both table data and specific column value queries
                                  queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/data`] });
                                  queryClient.invalidateQueries({ queryKey: [`/api/columns/${column.id}/values/${actualRowIndex}`] });
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    // Create a placeholder row if we have headers or custom columns but no data
                    <tr>
                      <td 
                        colSpan={
                          (sheetData && sheetData.headers ? sheetData.headers.length : 0) + 
                          (customColumns.length > 0 ? (sheetData && sheetData.headers && sheetData.headers.length > 0 ? customColumns.length : customColumns.length + 1) : 0)
                        } 
                        className="px-6 py-4 text-center text-sm text-slate-500"
                      >
                        No data found. Add some data to your Google Sheet or use the "Add Column" button to create custom columns.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-slate-500">No data available</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-slate-700">
                  Showing <span className="font-medium">{Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)}</span>
                  {' '} to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span>
                  {' '} of <span className="font-medium">{filteredData.length}</span> entries
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {/* Page buttons */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                  }
                  
                  return (
                    <Button
                      key={`page-${pageNum}`}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <AddColumnModal
        open={isAddColumnOpen}
        onOpenChange={setIsAddColumnOpen}
        tableId={tableId}
        onColumnAdded={() => refetch()}
      />
    </>
  );
}
