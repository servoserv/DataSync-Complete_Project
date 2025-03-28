import { ColorTheme } from "@/types/theme";

// Function to convert hex colors to CSS variables
export function applyColorTheme(theme: ColorTheme): void {
  const root = document.documentElement;
  
  // Convert hex to HSL for CSS variables
  const hexToHSL = (hex: string): string => {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    
    if (hex.startsWith('hsl')) {
      return hex; // Already in HSL format
    }
    
    // Handling different hex formats
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    } else {
      return "0 0% 0%"; // Default for invalid inputs
    }
    
    // Convert RGB to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h *= 60;
    }
    
    // Format for CSS
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };
  
  // Adjust the contrast of a color
  const adjustContrast = (hsl: string, isDark: boolean): string => {
    const [h, s, l] = hsl.split(' ').map(part => 
      parseFloat(part.replace('%', ''))
    );
    
    // For dark mode, make light colors lighter, dark colors darker
    // For light mode, make dark colors lighter, light colors darker
    const newL = isDark 
      ? (l > 50 ? Math.min(l + 10, 95) : Math.max(l - 10, 5)) 
      : l;
      
    return `${h} ${s}% ${newL}%`;
  };
  
  // Check if we're in dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Set the CSS variables
  root.style.setProperty('--primary', hexToHSL(theme.primary));
  root.style.setProperty('--secondary', hexToHSL(theme.secondary));
  root.style.setProperty('--accent', hexToHSL(theme.accent));
  
  // Adjust background/foreground based on dark mode
  if (isDarkMode) {
    // In dark mode, invert background and foreground
    root.style.setProperty('--background', hexToHSL(theme.foreground));
    root.style.setProperty('--foreground', hexToHSL(theme.background));
    root.style.setProperty('--muted', adjustContrast(hexToHSL(theme.muted), true));
    root.style.setProperty('--border', adjustContrast(hexToHSL(theme.border), true));
  } else {
    root.style.setProperty('--background', hexToHSL(theme.background));
    root.style.setProperty('--foreground', hexToHSL(theme.foreground));
    root.style.setProperty('--muted', hexToHSL(theme.muted));
    root.style.setProperty('--border', hexToHSL(theme.border));
  }
  
  // Compute complementary colors for each base color
  const computeComplement = (baseHsl: string, isDark: boolean): string => {
    const [h, s, l] = baseHsl.split(' ').map(part => 
      parseFloat(part.replace('%', ''))
    );
    
    // For text colors on colored backgrounds
    const newL = isDark ? Math.min(l + 50, 95) : Math.max(l - 50, 5);
    return `${h} ${s}% ${newL}%`;
  };
  
  // Set the complementary colors
  root.style.setProperty('--primary-foreground', 
    computeComplement(hexToHSL(theme.primary), isDarkMode));
  root.style.setProperty('--secondary-foreground', 
    computeComplement(hexToHSL(theme.secondary), isDarkMode));
  root.style.setProperty('--accent-foreground', 
    computeComplement(hexToHSL(theme.accent), isDarkMode));
  
  // Card variables
  root.style.setProperty('--card', isDarkMode 
    ? adjustContrast(hexToHSL(theme.background), true) 
    : hexToHSL(theme.background));
  root.style.setProperty('--card-foreground', isDarkMode 
    ? hexToHSL(theme.background) 
    : hexToHSL(theme.foreground));
  
  // Derivative colors
  root.style.setProperty('--popover', root.style.getPropertyValue('--card'));
  root.style.setProperty('--popover-foreground', root.style.getPropertyValue('--card-foreground'));
  
  // Input and destructive remain similar
  root.style.setProperty('--input', hexToHSL(theme.border));
  root.style.setProperty('--ring', hexToHSL(theme.primary));
}

// Apply a stored theme if it exists
export function applyStoredTheme(): void {
  const storedTheme = localStorage.getItem('datasync-color-theme');
  
  if (storedTheme) {
    try {
      const theme = JSON.parse(storedTheme) as ColorTheme;
      applyColorTheme(theme);
    } catch (e) {
      console.error('Failed to apply stored theme:', e);
    }
  }
}

// Save theme to local storage
export function saveTheme(theme: ColorTheme): void {
  localStorage.setItem('datasync-color-theme', JSON.stringify(theme));
  applyColorTheme(theme);
}