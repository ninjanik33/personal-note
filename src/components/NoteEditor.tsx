import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Save,
  X,
  Tag,
  Plus,
  FolderOpen,
  Folder,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUpload } from "./ImageUpload";
import { useNoteStore } from "@/store/noteStore";
import { useAppStore } from "@/store/appStore";
import { Note } from "@/types/note";

interface NoteEditorProps {
  note?: Note;
  subcategoryId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const predefinedColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#6b7280",
  "#374151",
];

export const NoteEditor = ({
  note,
  subcategoryId,
  onSave,
  onCancel,
}: NoteEditorProps) => {
  const { t } = useTranslation();
  const {
    categories,
    createNote,
    updateNote,
    createCategory,
    createSubcategory,
  } = useNoteStore();
  const { setSelectedNote, setSelectedCategory, setSelectedSubcategory } =
    useAppStore();

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [images, setImages] = useState<string[]>(note?.images || []);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>(
    subcategoryId || "",
  );
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // New category/subcategory creation state
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [showNewSubcategoryDialog, setShowNewSubcategoryDialog] =
    useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(predefinedColors[0]);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  // Initialize category and subcategory selection
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setImages(note.images);

      // Find the category that contains this note's subcategory
      const category = categories.find((cat) =>
        cat.subcategories.some((sub) => sub.id === note.subcategoryId),
      );
      if (category) {
        setSelectedCategoryId(category.id);
        setSelectedSubcategoryId(note.subcategoryId);
      }
    } else if (subcategoryId) {
      // If creating a new note with a specific subcategory
      const category = categories.find((cat) =>
        cat.subcategories.some((sub) => sub.id === subcategoryId),
      );
      if (category) {
        setSelectedCategoryId(category.id);
        setSelectedSubcategoryId(subcategoryId);
      }
    }
  }, [note, subcategoryId, categories]);

  // Get available subcategories for selected category
  const availableSubcategories = selectedCategoryId
    ? categories.find((cat) => cat.id === selectedCategoryId)?.subcategories ||
      []
    : [];

  // Reset subcategory when category changes
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(""); // Reset subcategory selection
  };

  const handleCreateNewCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: t("common.error"),
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    createCategory({ name: newCategoryName.trim(), color: newCategoryColor });
    setNewCategoryName("");
    setNewCategoryColor(predefinedColors[0]);
    setShowNewCategoryDialog(false);

    toast({
      title: t("common.success"),
      description: "Category created successfully",
    });
  };

  const handleCreateNewSubcategory = () => {
    if (!newSubcategoryName.trim()) {
      toast({
        title: t("common.error"),
        description: "Subcategory name is required",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCategoryId) {
      toast({
        title: t("common.error"),
        description: "Please select a category first",
        variant: "destructive",
      });
      return;
    }

    createSubcategory({
      name: newSubcategoryName.trim(),
      categoryId: selectedCategoryId,
    });
    setNewSubcategoryName("");
    setShowNewSubcategoryDialog(false);

    toast({
      title: t("common.success"),
      description: "Subcategory created successfully",
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: t("common.error"),
        description: "Note title is required",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSubcategoryId) {
      toast({
        title: t("common.error"),
        description: "Please select a category and subcategory",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (note) {
        // Update existing note
        updateNote(note.id, {
          title: title.trim(),
          content,
          tags,
          images,
        });

        toast({
          title: t("common.success"),
          description: t("note.saved"),
        });
      } else {
        // Create new note
        const newNote = createNote({
          title: title.trim(),
          content,
          subcategoryId: selectedSubcategoryId,
          tags,
        });

        // Update images for the new note
        if (images.length > 0) {
          updateNote(newNote.id, { images });
        }

        // Update app state to show the new note
        setSelectedNote(newNote.id);
        setSelectedCategory(selectedCategoryId);
        setSelectedSubcategory(selectedSubcategoryId);

        toast({
          title: t("common.success"),
          description: t("note.saved"),
        });
      }

      onSave?.();
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: t("common.error"),
        description: "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
  );
  const selectedSubcategory = availableSubcategories.find(
    (sub) => sub.id === selectedSubcategoryId,
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span>{note ? t("note.edit") : t("note.create")}</span>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim() || !selectedSubcategoryId}
              size="sm"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? t("common.loading") : t("common.save")}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              {t("common.cancel")}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-4">
        {/* Category and Subcategory Selection */}
        {!note && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category-select">{t("category.name")}</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedCategoryId}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category-select" className="flex-1">
                    <SelectValue placeholder="Select a category">
                      {selectedCategory && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: selectedCategory.color }}
                          />
                          <Folder className="h-4 w-4" />
                          <span>{selectedCategory.name}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No categories available
                      </div>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <Folder className="h-4 w-4" />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {/* Add New Category Button */}
                <Dialog
                  open={showNewCategoryDialog}
                  onOpenChange={setShowNewCategoryDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Add category</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("category.create")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-category-name">
                          {t("category.name")}
                        </Label>
                        <Input
                          id="new-category-name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder={t("category.name")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("category.color")}</Label>
                        <div className="grid grid-cols-10 gap-2">
                          {predefinedColors.map((colorOption) => (
                            <button
                              key={colorOption}
                              type="button"
                              className={`w-6 h-6 rounded-full border-2 ${
                                newCategoryColor === colorOption
                                  ? "border-gray-900"
                                  : "border-gray-300"
                              }`}
                              style={{ backgroundColor: colorOption }}
                              onClick={() => setNewCategoryColor(colorOption)}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowNewCategoryDialog(false)}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button onClick={handleCreateNewCategory}>
                          {t("common.create")}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory-select">
                {t("subcategory.name")}
              </Label>
              <div className="flex gap-2">
                <Select
                  value={selectedSubcategoryId}
                  onValueChange={setSelectedSubcategoryId}
                  disabled={!selectedCategoryId}
                >
                  <SelectTrigger id="subcategory-select" className="flex-1">
                    <SelectValue placeholder="Select a subcategory">
                      {selectedSubcategory && (
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          <span>{selectedSubcategory.name}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {selectedCategoryId
                          ? "No subcategories available"
                          : "Select a category first"}
                      </div>
                    ) : (
                      availableSubcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            <span>{subcategory.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {/* Add New Subcategory Button */}
                <Dialog
                  open={showNewSubcategoryDialog}
                  onOpenChange={setShowNewSubcategoryDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={!selectedCategoryId}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Add subcategory</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("subcategory.create")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-subcategory-name">
                          {t("subcategory.name")}
                        </Label>
                        <Input
                          id="new-subcategory-name"
                          value={newSubcategoryName}
                          onChange={(e) =>
                            setNewSubcategoryName(e.target.value)
                          }
                          placeholder={t("subcategory.name")}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowNewSubcategoryDialog(false)}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button onClick={handleCreateNewSubcategory}>
                          {t("common.create")}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}

        {/* Show current category/subcategory for existing notes */}
        {note && selectedCategory && selectedSubcategory && (
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <Folder className="h-4 w-4" />
              <span className="font-medium">{selectedCategory.name}</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span>{selectedSubcategory.name}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="note-title">{t("note.title")}</Label>
          <Input
            id="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("note.title")}
            className="font-medium"
          />
        </div>

        <div className="space-y-2">
          <Label>{t("note.content")}</Label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder={t("note.content")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("note.tags")}</Label>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("note.addTag")}
              className="flex-1"
            />
            <Button
              onClick={handleAddTag}
              disabled={!newTag.trim() || tags.includes(newTag.trim())}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t("note.images")}</Label>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={10}
          />
        </div>
      </CardContent>
    </Card>
  );
};
