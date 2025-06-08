import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { MoreVertical, Edit, Trash2, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useNoteStore } from "@/store/noteStore";
import { useAppStore } from "@/store/appStore";
import { Note } from "@/types/note";

interface NoteListProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
}

export const NoteList = ({ notes, onEditNote }: NoteListProps) => {
  const { t } = useTranslation();
  const { deleteNote } = useNoteStore();
  const { selectedNoteId, setSelectedNote } = useAppStore();
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  const handleDeleteNote = () => {
    if (deletingNote) {
      deleteNote(deletingNote.id);
      if (selectedNoteId === deletingNote.id) {
        setSelectedNote(null);
      }
      setDeletingNote(null);
      toast({
        title: t("common.success"),
        description: "Note deleted successfully",
      });
    }
  };

  const stripHtml = (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          {t("note.noNotes")}
        </h3>
        <p className="text-sm text-muted-foreground">
          Create your first note to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {notes.map((note) => (
          <Card
            key={note.id}
            className={`cursor-pointer transition-colors hover:bg-accent/50 ${
              selectedNoteId === note.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedNote(note.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-sm truncate">
                      {note.title}
                    </h3>
                    {note.images.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {note.images.length} 📷
                      </Badge>
                    )}
                  </div>

                  {note.content && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {truncateText(stripHtml(note.content))}
                    </p>
                  )}

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {t("note.lastModified")}:{" "}
                      {format(note.updatedAt, "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditNote(note)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t("common.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingNote(note)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("common.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Note Alert */}
      <AlertDialog
        open={!!deletingNote}
        onOpenChange={() => setDeletingNote(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("note.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("note.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
