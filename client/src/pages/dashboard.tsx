import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { TablesList } from "@/components/tables-list";
import { CreateTableModal } from "@/components/create-table-modal";
import { StatCard } from "@/components/stat-card";
import { FeaturesSection } from "@/components/features-section";
import { Plus, FileSpreadsheet, BarChart3, Clock, Sparkles, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Table as TableType } from "@shared/schema";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { TooltipHelper } from "@/components/ui/tooltip-helper";

export default function Dashboard() {
  const { user } = useAuth();
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
  const [greeting, setGreeting] = useState("Good day");
  
  // Set appropriate greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);
  
  // Fetch tables data
  const { 
    data: tables = [],
    isLoading,
    error,
  } = useQuery<TableType[]>({
    queryKey: ['/api/tables'],
  });
  
  // Calculate time since last update (most recent table)
  const getLastUpdateTime = () => {
    if (!tables || !Array.isArray(tables) || tables.length === 0) return "Never";
    
    // Find the most recently updated table
    const tablesArray = [...tables];
    const mostRecentTable = tablesArray.sort((a, b) => {
      return new Date(b.lastUpdatedAt || 0).getTime() - new Date(a.lastUpdatedAt || 0).getTime();
    })[0];
    
    if (!mostRecentTable.lastUpdatedAt) return "Never";
    
    return formatDistanceToNow(new Date(mostRecentTable.lastUpdatedAt), { addSuffix: true });
  };
  
  const tableCount = Array.isArray(tables) ? tables.length : 0;
  const lastUpdateTime = getLastUpdateTime();
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        {/* Mobile-specific padding for fixed header */}
        <div className="pt-16 lg:pt-0"></div>
        
        {/* Dashboard content */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Page header with greeting card */}
          <AnimatedContainer animation="fade-in" duration={800} className="mb-8">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-36 h-36 bg-white opacity-10 rounded-full"></div>
              
              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="text-white">
                  <AnimatedContainer animation="slide-up" delay={100}>
                    <h1 className="text-3xl font-bold">{greeting}, {user?.firstName || user?.username}!</h1>
                  </AnimatedContainer>
                  <AnimatedContainer animation="slide-up" delay={300}>
                    <p className="mt-2 text-blue-100 max-w-2xl">
                      Welcome to your DataSync dashboard. View and manage your data tables with real-time Google Sheets integration.
                    </p>
                  </AnimatedContainer>
                </div>
                
                <AnimatedContainer animation="scale-in" delay={500}>
                  <Button 
                    onClick={() => setIsCreateTableModalOpen(true)}
                    className="mt-4 lg:mt-0 gap-2 bg-white text-blue-600 hover:bg-blue-50 border-none shadow-md"
                    size="lg"
                  >
                    <Plus className="h-5 w-5" />
                    Create New Table
                  </Button>
                </AnimatedContainer>
              </div>
            </div>
          </AnimatedContainer>
          
          {/* Quick stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <AnimatedContainer animation="slide-right" delay={200}>
              <TooltipHelper content="Number of Google Sheets tables you've connected">
                <StatCard
                  title="Total Tables"
                  value={tableCount}
                  icon={<FileSpreadsheet />}
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-600"
                />
              </TooltipHelper>
            </AnimatedContainer>
            
            <AnimatedContainer animation="slide-right" delay={400}>
              <TooltipHelper content="Your tables are set up to receive real-time updates">
                <StatCard
                  title="Real-time Updates"
                  value="Active"
                  icon={<Sparkles className="animate-pulse" />}
                  iconBgColor="bg-green-100"
                  iconColor="text-green-600"
                />
              </TooltipHelper>
            </AnimatedContainer>
            
            <AnimatedContainer animation="slide-right" delay={600}>
              <TooltipHelper content="Last time any of your tables received data from Google Sheets">
                <StatCard
                  title="Last Sync"
                  value={lastUpdateTime}
                  icon={<Clock />}
                  iconBgColor="bg-indigo-100"
                  iconColor="text-indigo-600"
                />
              </TooltipHelper>
            </AnimatedContainer>
          </div>
          
          {/* Smart Features */}
          <FeaturesSection />
          
          {/* Recent activity section */}
          <AnimatedContainer animation="fade-in" delay={700} duration={800}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Your Tables</h2>
              {tableCount > 0 && (
                <TooltipHelper content="See all your tables">
                  <Button variant="ghost" className="text-sm gap-1">
                    View all <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipHelper>
              )}
            </div>
            
            {/* Table list */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Tables</h3>
                    <p className="mt-1 text-sm text-slate-500">Manage your data tables with real-time Google Sheets connection.</p>
                  </div>
                  {tableCount > 0 && (
                    <div className="mt-3 sm:mt-0">
                      <AnimatedContainer animation="scale-in" delay={900}>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tableCount} {tableCount === 1 ? 'table' : 'tables'}
                        </span>
                      </AnimatedContainer>
                    </div>
                  )}
                </div>
              </div>
              
              <TablesList onCreateTable={() => setIsCreateTableModalOpen(true)} />
            </div>
          </AnimatedContainer>
        </div>
      </main>
      
      {/* Modals */}
      <CreateTableModal
        open={isCreateTableModalOpen}
        onOpenChange={setIsCreateTableModalOpen}
      />
    </div>
  );
}
