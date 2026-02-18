import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { useMapboxGeocode, type GeocodeSuggestion } from "@/hooks/useMapboxGeocode";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: GeocodeSuggestion) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "Enter address...",
  disabled = false,
  className,
}: AddressAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { suggestions, isLoading, clearSuggestions } = useMapboxGeocode(value, enableSearch);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEnableSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show dropdown when suggestions arrive
  useEffect(() => {
    if (suggestions.length > 0 && enableSearch) {
      setIsOpen(true);
    }
  }, [suggestions, enableSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    setEnableSearch(true);
    if (v.length < 3) {
      setIsOpen(false);
    }
  };

  const handleSelect = (suggestion: GeocodeSuggestion) => {
    onChange(suggestion.placeName);
    onSelect(suggestion);
    setIsOpen(false);
    setEnableSearch(false);
    clearSuggestions();
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (value.length >= 3) setEnableSearch(true);
          }}
          disabled={disabled}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer flex items-start gap-2"
              onClick={() => handleSelect(s)}
            >
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="leading-snug">{s.placeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
