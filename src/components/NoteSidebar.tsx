import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Settings,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SearchBar } from "./SearchBar";
import { CategoryManager } from "./CategoryManager";
import { useNoteStore } from "@/store/noteStore";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

interface NoteSidebarProps {
  onCreateNote: (subcategoryId: string) => void;
}

export const NoteSidebar = ({ onCreateNote }: NoteSidebarProps) => {
  const { t } = useTranslation();
  const { categories, getNotesBySubcategory } = useNoteStore();
  const {
    selectedCategoryId,
    selectedSubcategoryId,
    setSelectedCategory,
    setSelectedSubcategory,
  } = useAppStore();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);

    // Select category if not already selected
    if (selectedCategoryId !== categoryId) {
      setSelectedCategory(categoryId);
    }
  };

  const selectSubcategory = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };

  return (
    <div className="h-full flex flex-col bg-muted/30 border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{t("app.title")}</h2>
        </div>
        <SearchBar />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {/* All Notes */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              !selectedCategoryId && !selectedSubcategoryId && "bg-accent",
            )}
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSubcategory(null);
            }}
          >
            <FileText className="h-4 w-4" />
            {t("sidebar.allNotes")}
          </Button>

          <Separator className="my-2" />

          {/* Categories */}
          <div className="space-y-1">
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  {t("category.noCategories")}
                </p>
              </div>
            ) : (
              categories.map((category) => {
                const isExpanded = expandedCategories.has(category.id);
                const isSelected = selectedCategoryId === category.id;

                return (
                  <div key={category.id} className="space-y-1">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between p-2 h-auto",
                        isSelected && !selectedSubcategoryId && "bg-accent",
                      )}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                        {isExpanded ? (
                          <FolderOpen className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <Folder className="h-4 w-4 flex-shrink-0" />
                        )}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium truncate">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {category.subcategories.length}
                      </span>
                    </Button>

                    {/* Subcategories */}
                    {isExpanded && (
                      <div className="ml-6 space-y-1">
                        {category.subcategories.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-1 px-2">
                            {t("subcategory.noSubcategories")}
                          </p>
                        ) : (
                          category.subcategories.map((subcategory) => {
                            const noteCount = getNotesBySubcategory(
                              subcategory.id,
                            ).length;
                            const isSubSelected =
                              selectedSubcategoryId === subcategory.id;

                            return (
                              <div
                                key={subcategory.id}
                                className="flex items-center gap-1"
                              >
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "flex-1 justify-between text-xs h-8 px-2",
                                    isSubSelected && "bg-accent",
                                  )}
                                  onClick={() =>
                                    selectSubcategory(subcategory.id)
                                  }
                                >
                                  <span className="truncate">
                                    {subcategory.name}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {noteCount}
                                  </span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => onCreateNote(subcategory.id)}
                                  title={t("note.create")}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Category Management Section - Always Visible */}
      <div className="border-t flex-shrink-0">
        <Collapsible
          open={showCategoryManager}
          onOpenChange={setShowCategoryManager}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Manage Categories</span>
              </div>
              {showCategoryManager ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t bg-muted/20">
            <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
              <CategoryManager />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
