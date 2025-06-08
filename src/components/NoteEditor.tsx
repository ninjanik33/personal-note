import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Save, X, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

export const NoteEditor = ({
  note,
  subcategoryId,
  onSave,
  onCancel,
}: NoteEditorProps) => {
  const { t } = useTranslation();
  const { createNote, updateNote } = useNoteStore();
  const { setSelectedNote } = useAppStore();

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [images, setImages] = useState<string[]>(note?.images || []);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setImages(note.images);
    }
  }, [note]);

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

    if (!subcategoryId && !note) {
      toast({
        title: t("common.error"),
        description: "Please select a subcategory",
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
      } else if (subcategoryId) {
        // Create new note
        const newNote = createNote({
          title: title.trim(),
          content,
          subcategoryId,
          tags,
        });

        // Update images for the new note
        if (images.length > 0) {
          updateNote(newNote.id, { images });
        }

        setSelectedNote(newNote.id);

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span>{note ? t("note.edit") : t("note.create")}</span>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
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
