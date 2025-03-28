import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FeatureCardProps {
  title: string;
  icon: ReactNode;
  description: string;
  comingSoon?: boolean;
  onClick?: () => void;
  delay?: number;
}

export function FeatureCard({ 
  title, 
  icon, 
  description,
  comingSoon = false,
  onClick,
  delay = 0
}: FeatureCardProps) {
  return (
    <AnimatedContainer animation="scale-in" delay={delay} duration={500}>
      <Card className={`h-full transition-all duration-300 hover:shadow-lg ${comingSoon ? 'opacity-80' : 'hover:-translate-y-1'}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-primary bg-primary/10 p-2 rounded-md">
                {icon}
              </div>
              <h3 className="font-semibold">{title}</h3>
            </div>
            {comingSoon && (
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-xs">
                Coming Soon
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={comingSoon ? "outline" : "default"} 
                  size="sm" 
                  className="w-full"
                  onClick={onClick}
                  disabled={comingSoon}
                >
                  {comingSoon ? "Available Soon" : "Enable Feature"}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{comingSoon ? "This feature is coming soon. Stay tuned!" : "Click to enable this feature"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}