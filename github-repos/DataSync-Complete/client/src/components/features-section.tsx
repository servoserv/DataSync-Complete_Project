import { useState } from "react";
import { FeatureCard } from "@/components/feature-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Mic, Layout, FileText, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function FeaturesSection() {
  const { toast } = useToast();
  const [isAccessibilityDialogOpen, setIsAccessibilityDialogOpen] = useState(false);
  
  const handleFeatureClick = (feature: string) => {
    toast({
      title: "Feature Enabled",
      description: `${feature} has been enabled for your account.`,
      duration: 3000,
    });
  };
  
  return (
    <div className="mb-10">
      <AnimatedContainer animation="fade-in" delay={100}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Smart Features
            </h2>
            <p className="text-sm text-gray-600">Enhance your workflow with advanced intelligent features</p>
          </div>
        </div>
      </AnimatedContainer>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="Accessibility Voice-over Mode"
          icon={<Mic className="h-5 w-5" />}
          description="Navigate and interact with your dashboard using voice commands for an inclusive experience."
          onClick={() => setIsAccessibilityDialogOpen(true)}
          delay={200}
        />
        
        <FeatureCard
          title="Smart Data Prediction Hints"
          icon={<Sparkles className="h-5 w-5" />}
          description="Get advanced data-driven insights and predictions based on your data patterns."
          comingSoon
          delay={300}
        />
        
        <FeatureCard
          title="Personalized Dashboard Layout"
          icon={<Layout className="h-5 w-5" />}
          description="Save your preferred dashboard layout, widgets, and view settings for a tailored experience."
          onClick={() => handleFeatureClick("Personalized Dashboard Layout")}
          delay={400}
        />
        
        <FeatureCard
          title="One-click Data Export Wizard"
          icon={<FileText className="h-5 w-5" />}
          description="Export your data in multiple formats with smart filtering and scheduling capabilities."
          comingSoon
          delay={500}
        />
        
        <FeatureCard
          title="Contextual Help Bubbles"
          icon={<HelpCircle className="h-5 w-5" />}
          description="Interactive contextual help with playful animations to guide you through complex features."
          onClick={() => handleFeatureClick("Contextual Help Bubbles")}
          delay={600}
        />
      </div>
      
      {/* Accessibility Dialog */}
      <Dialog open={isAccessibilityDialogOpen} onOpenChange={setIsAccessibilityDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Voice-over Mode</DialogTitle>
            <DialogDescription>
              Enable voice commands to navigate and control your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              To use voice commands, say "Hey DataSync" followed by your command:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1">•</span>
                "Open table [table name]"
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1">•</span>
                "Create new table"
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1">•</span>
                "Show me statistics"
              </li>
            </ul>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsAccessibilityDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleFeatureClick("Voice-over Mode");
              setIsAccessibilityDialogOpen(false);
            }}>
              Enable Voice Commands
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}