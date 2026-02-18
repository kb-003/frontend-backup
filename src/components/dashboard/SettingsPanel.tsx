import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Map, Sun, Moon, Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const SettingsPanel = () => {
  const [mapStyle, setMapStyle] = useState("streets");
  const [searchRadius, setSearchRadius] = useState("5");
  const [autoZoom, setAutoZoom] = useState(true);
  const [theme, setTheme] = useState("light");
  const [autoSync, setAutoSync] = useState(true);
  const [offlineCache, setOfflineCache] = useState(true);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Configure your emergency response preferences</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Map Settings */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
              Map Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="map-style" className="text-sm">Map Style</Label>
                <Select value={mapStyle} onValueChange={setMapStyle}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="streets">Streets</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="search-radius" className="text-sm">Search Radius</Label>
                <Select value={searchRadius} onValueChange={setSearchRadius}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 km</SelectItem>
                    <SelectItem value="5">5 km</SelectItem>
                    <SelectItem value="10">10 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between sm:justify-start sm:gap-3 py-2 sm:py-0">
                <Label htmlFor="auto-zoom" className="text-sm">Auto-Zoom</Label>
                <Switch id="auto-zoom" checked={autoZoom} onCheckedChange={setAutoZoom} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {theme === "light" ? <Sun className="w-5 h-5 text-[hsl(var(--fire-orange))]" /> : <Moon className="w-5 h-5 text-[hsl(var(--fire-orange))]" />}
              Display
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme" className="text-sm">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
              Data & Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-sync" className="text-sm">Auto-Sync</Label>
                <p className="text-xs text-muted-foreground">Sync when connected</p>
              </div>
              <Switch id="auto-sync" checked={autoSync} onCheckedChange={setAutoSync} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="offline-cache" className="text-sm">Offline Cache</Label>
                <p className="text-xs text-muted-foreground">Store for offline use</p>
              </div>
              <Switch id="offline-cache" checked={offlineCache} onCheckedChange={setOfflineCache} />
            </div>

            <Button variant="outline" className="w-full" onClick={() => toast.info("Syncing...")}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSave} className="w-full md:w-auto md:min-w-[200px] bg-gradient-to-r from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] text-white">
        Save Settings
      </Button>
    </div>
  );
};

export default SettingsPanel;
