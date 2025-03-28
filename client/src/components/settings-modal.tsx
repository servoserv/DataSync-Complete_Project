import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { ColorPaletteGenerator } from "@/components/color-palette-generator";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { saveTheme } from "@/lib/theme-utils";
import { ColorTheme } from "@/types/theme";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("appearance");
  const { toast } = useToast();
  
  const handleApplyTheme = (theme: ColorTheme) => {
    saveTheme(theme);
    toast({
      title: "Theme applied",
      description: `Applied the ${theme.name} color palette`,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your dashboard appearance and preferences
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-2">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-6">
            <AnimatedContainer animation="fade-in">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Theme Mode</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose between light, dark, or system theme
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="theme-toggle">Theme:</Label>
                    <ThemeToggle />
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-lg font-medium">Color Palette</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customize your dashboard colors based on your data
                  </p>
                  
                  <ColorPaletteGenerator onApplyTheme={handleApplyTheme} />
                </div>
              </div>
            </AnimatedContainer>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6">
            <AnimatedContainer animation="fade-in">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Additional user preferences will be added in a future update
                </p>
              </div>
            </AnimatedContainer>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}