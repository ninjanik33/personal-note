import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/appStore";
import { useNoteStore } from "@/store/noteStore";

export const SearchBar = () => {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery, selectedTags, setSelectedTags } =
    useAppStore();
  const { getAllTags } = useNoteStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const allTags = getAllTags();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
  };

  const clearSearch = () => {
    setLocalQuery("");
    setSearchQuery("");
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  const hasActiveFilters = selectedTags.length > 0;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={t("sidebar.search")}
          className="pl-10 pr-20"
        />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
          {localQuery && (
            <Button
              onClick={clearSearch}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 ${hasActiveFilters ? "text-primary" : ""}`}
              >
                <Filter className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t("search.filterByTags")}</h4>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {allTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tags available
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {allTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <Label
                          htmlFor={`tag-${tag}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
              <Button
                onClick={() => handleTagToggle(tag)}
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
