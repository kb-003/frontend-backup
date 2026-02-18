import { useState, useEffect } from "react";
import { Building2, Droplet, MapPin, Waves, ChevronDown, ChevronUp, List } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

const MapLegend = () => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  // Update expanded state when screen size changes
  useEffect(() => {
    setIsExpanded(!isMobile);
  }, [isMobile]);

  const legendItems = [
    { 
      label: "Fire Station", 
      icon: <Building2 className="w-4 h-4 text-destructive" /> 
    },
    { 
      label: "Fire Hydrant", 
      icon: (
        <svg className="w-4 h-4 text-destructive" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C9.24 2 7 4.24 7 7v3H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3z"/>
        </svg>
      )
    },
    { 
      label: "River", 
      icon: <Droplet className="w-4 h-4 text-blue-500" /> 
    },
    { 
      label: "Well", 
      icon: <MapPin className="w-4 h-4 text-blue-600" /> 
    },
    { 
      label: "Sea", 
      icon: <Waves className="w-4 h-4 text-blue-300" /> 
    },
  ];

  return (
    <div className="absolute top-4 right-4 z-10">
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in">
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full flex items-center justify-between px-3 py-2 bg-[hsl(var(--fire-orange))]/10 hover:bg-[hsl(var(--fire-orange))]/20 transition-colors border-b"
          >
            <span className="font-bold text-xs">Legend</span>
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="p-3 space-y-2">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="bg-white shadow-lg hover:bg-[hsl(var(--fire-orange))]/10 border-[hsl(var(--fire-orange))]/30 gap-1.5"
        >
          <List className="w-4 h-4" />
          <span className="text-xs font-medium">Legend</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default MapLegend;
