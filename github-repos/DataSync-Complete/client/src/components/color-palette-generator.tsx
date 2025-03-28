import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { AnimatedContainer } from "@/components/ui/animated-container";

type ColorTheme = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
};

// Predefined color themes for different data types
const DATA_THEMES: Record<string, ColorTheme> = {
  financial: {
    name: "Financial",
    primary: "#2563eb",
    secondary: "#1e40af",
    accent: "#3b82f6",
    background: "#f8fafc",
    foreground: "#1e293b",
    muted: "#94a3b8",
    border: "#cbd5e1",
  },
  marketing: {
    name: "Marketing",
    primary: "#ec4899",
    secondary: "#db2777",
    accent: "#f472b6",
    background: "#fdf2f8",
    foreground: "#831843",
    muted: "#f9a8d4",
    border: "#fbcfe8",
  },
  analytics: {
    name: "Analytics",
    primary: "#8b5cf6",
    secondary: "#7c3aed",
    accent: "#a78bfa",
    background: "#f5f3ff",
    foreground: "#4c1d95",
    muted: "#c4b5fd",
    border: "#ddd6fe",
  },
  nature: {
    name: "Nature",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    background: "#ecfdf5",
    foreground: "#065f46",
    muted: "#6ee7b7",
    border: "#a7f3d0",
  },
  creative: {
    name: "Creative",
    primary: "#f97316",
    secondary: "#ea580c",
    accent: "#fb923c",
    background: "#fff7ed",
    foreground: "#7c2d12",
    muted: "#fdba74",
    border: "#fed7aa",
  },
};

const generateRandomPalette = (): ColorTheme => {
  // Generate a random color palette for demonstration
  const hue = Math.floor(Math.random() * 360);
  
  return {
    name: "Custom Generated",
    primary: `hsl(${hue}, 90%, 50%)`,
    secondary: `hsl(${(hue + 30) % 360}, 85%, 45%)`,
    accent: `hsl(${(hue + 60) % 360}, 80%, 60%)`,
    background: `hsl(${hue}, 20%, 98%)`,
    foreground: `hsl(${hue}, 15%, 15%)`,
    muted: `hsl(${hue}, 30%, 70%)`,
    border: `hsl(${hue}, 25%, 85%)`,
  };
};

// Function to generate a palette based on data characteristics
const generatePaletteFromData = (dataType: string): ColorTheme => {
  // In a real implementation, this would analyze actual data
  // For demonstration, we'll use predefined themes based on type
  return DATA_THEMES[dataType] || generateRandomPalette();
};

interface ColorPaletteGeneratorProps {
  onApplyTheme: (theme: ColorTheme) => void;
  dataType?: string;
}

export function ColorPaletteGenerator({ onApplyTheme, dataType = "analytics" }: ColorPaletteGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme | null>(null);
  const [activeTab, setActiveTab] = useState("predefined");
  const [generatedThemes, setGeneratedThemes] = useState<ColorTheme[]>([]);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    // Generate initial themes
    generateNewThemes();
  }, [dataType]);

  const generateNewThemes = () => {
    const themes: ColorTheme[] = [];
    // Generate 3 variations for demonstration
    for (let i = 0; i < 3; i++) {
      if (i === 0 && DATA_THEMES[dataType]) {
        themes.push(DATA_THEMES[dataType]);
      } else {
        themes.push(generateRandomPalette());
      }
    }
    setGeneratedThemes(themes);
  };

  const handleApplyTheme = () => {
    if (selectedTheme) {
      onApplyTheme(selectedTheme);
      setIsApplied(true);
      setTimeout(() => setIsApplied(false), 2000);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Color Palette Generator</CardTitle>
        <CardDescription>
          Generate and apply custom color themes based on your data characteristics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="predefined">Predefined Themes</TabsTrigger>
            <TabsTrigger value="generated">Generated Themes</TabsTrigger>
          </TabsList>

          <TabsContent value="predefined" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(DATA_THEMES).map((theme) => (
                <AnimatedContainer 
                  key={theme.name} 
                  animation="fade-in" 
                  className="cursor-pointer"
                >
                  <div 
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTheme?.name === theme.name 
                        ? "border-primary ring-2 ring-primary ring-opacity-50" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedTheme(theme)}
                  >
                    <h3 className="font-medium mb-2">{theme.name}</h3>
                    <div className="flex space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.secondary }}></div>
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">Click to select</div>
                  </div>
                </AnimatedContainer>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="generated" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Based on your data type: <span className="font-medium">{dataType || "General"}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateNewThemes}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Regenerate
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {generatedThemes.map((theme, index) => (
                <AnimatedContainer 
                  key={index} 
                  animation="fade-in" 
                  delay={index * 100}
                  className="cursor-pointer"
                >
                  <div 
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTheme === theme 
                        ? "border-primary ring-2 ring-primary ring-opacity-50" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedTheme(theme)}
                  >
                    <h3 className="font-medium mb-2">{theme.name || `Generated Theme ${index + 1}`}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div 
                        className="w-full h-6 rounded-md" 
                        style={{ 
                          background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary}, ${theme.accent})` 
                        }}
                      ></div>
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.background }}></div>
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.foreground }}></div>
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.muted }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">Click to select</div>
                  </div>
                </AnimatedContainer>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedTheme ? (
            <span>Selected: <span className="font-medium">{selectedTheme.name}</span></span>
          ) : (
            <span>Select a theme to apply</span>
          )}
        </div>
        <div className="flex gap-2">
          {isApplied && (
            <AnimatedContainer animation="fade-in" className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Applied!</span>
            </AnimatedContainer>
          )}
          <Button 
            onClick={handleApplyTheme} 
            disabled={!selectedTheme}
            variant="default"
          >
            Apply Theme
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}