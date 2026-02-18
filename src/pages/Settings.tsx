import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Map, Settings, HelpCircle, User, Palette, Database } from "lucide-react";
import bfpLogo from "@/assets/bfp-logo.png";
import { toast } from "sonner";

interface SettingsState {
  defaultMapStyle: string;
  defaultRadius: number;
  autoZoom: boolean;
  theme: string;
  autoSync: boolean;
  cacheOffline: boolean;
}

const defaultSettings: SettingsState = {
  defaultMapStyle: "streets",
  defaultRadius: 5,
  autoZoom: true,
  theme: "light",
  autoSync: true,
  cacheOffline: true,
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Merge with defaults to handle any missing new fields
      setSettings({ ...defaultSettings, ...parsed });
    }
  }, []);

  const handleSettingChange = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("appSettings", JSON.stringify(newSettings));
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    const clampedValue = Math.max(1, Math.min(50, value)); // Clamp between 1-50 km
    handleSettingChange("defaultRadius", clampedValue);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully");
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem("appSettings", JSON.stringify(defaultSettings));
    toast.success("Settings reset to defaults");
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className="bg-gradient-to-b from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] flex flex-col items-center py-4 gap-6 w-16">
          <img src={bfpLogo} alt="BFP" className="w-10 h-10" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => navigate("/dashboard")}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Map className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Map</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-3 bg-white/20 rounded-lg transition-colors">
                <Settings className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => navigate("/help")}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
              >
                <HelpCircle className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Help</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => navigate("/profile")}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors mt-auto"
              >
                <User className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Profile</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Configure your Emergency Response Navigator</p>
            </div>

            <div className="grid gap-6">
              {/* Map Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
                    Map Settings
                  </CardTitle>
                  <CardDescription>Configure map display and behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Map Style</Label>
                      <Select
                        value={settings.defaultMapStyle}
                        onValueChange={(value) => handleSettingChange("defaultMapStyle", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="streets">Streets</SelectItem>
                          <SelectItem value="satellite">Satellite</SelectItem>
                          <SelectItem value="terrain">Terrain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Search Radius (km)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={settings.defaultRadius}
                        onChange={handleRadiusChange}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Zoom to Route</Label>
                      <p className="text-sm text-muted-foreground">Automatically fit map to calculated route</p>
                    </div>
                    <Switch
                      checked={settings.autoZoom}
                      onCheckedChange={(checked) => handleSettingChange("autoZoom", checked)}
                      className="data-[state=checked]:bg-[hsl(var(--fire-orange))]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Display Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
                    Display
                  </CardTitle>
                  <CardDescription>Appearance preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => handleSettingChange("theme", value)}
                    >
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Data & Sync */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
                    Data & Sync
                  </CardTitle>
                  <CardDescription>Manage data synchronization and offline access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Sync Data</Label>
                      <p className="text-sm text-muted-foreground">Automatically sync hydrant and water source data</p>
                    </div>
                    <Switch
                      checked={settings.autoSync}
                      onCheckedChange={(checked) => handleSettingChange("autoSync", checked)}
                      className="data-[state=checked]:bg-[hsl(var(--fire-orange))]"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Offline Map Cache</Label>
                      <p className="text-sm text-muted-foreground">Save map data for offline use</p>
                    </div>
                    <Switch
                      checked={settings.cacheOffline}
                      onCheckedChange={(checked) => handleSettingChange("cacheOffline", checked)}
                      className="data-[state=checked]:bg-[hsl(var(--fire-orange))]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button 
                  variant="outline" 
                  onClick={handleResetSettings}
                  className="order-2 sm:order-1"
                >
                  Reset to Defaults
                </Button>
                <Button 
                  onClick={handleSaveSettings}
                  className="bg-gradient-to-r from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] hover:opacity-90 order-1 sm:order-2"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SettingsPage;
