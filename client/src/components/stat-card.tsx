import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
}

export function StatCard({ title, value, icon, iconBgColor, iconColor }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-100">
      <div className="p-6 relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 opacity-50 rounded-xl" />
        
        <div className="flex items-center relative">
          <div className={cn(
            "flex-shrink-0 rounded-xl p-3.5 shadow-sm", 
            iconBgColor
          )}>
            <div className={cn("h-6 w-6", iconColor)}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="mt-1">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
          
          {/* Decorative element */}
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tr from-gray-100 to-transparent opacity-30 rounded-bl-full" />
        </div>
      </div>
    </div>
  );
}
