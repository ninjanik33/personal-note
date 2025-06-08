import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, FileText, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { NoteSidebar } from "@/components/NoteSidebar";
import { NoteList } from "@/components/NoteList";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteDetailView } from "@/components/NoteDetailView";
import { useNoteStore } from "@/store/noteStore";
import { useAppStore } from "@/store/appStore";
import { Note } from "@/types/note";

const Index = () => {
  const { t } = useTranslation();
  const {
    categories,
    notes,
    loadData,
    searchNotes,
    getNotesBySubcategory,
    getNotesByCategory,
    getNotesByTags,
    isLoading,
  } = useNoteStore();

  const {
    selectedCategoryId,
    selectedSubcategoryId,
    selectedNoteId,
    searchQuery,
    selectedTags,
    loadAppState,
  } = useAppStore();

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [creatingNoteForSubcategory, setCreatingNoteForSubcategory] = useState<
    string | null
  >(null);
  const [isCreatingNewNote, setIsCreatingNewNote] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Initialize data
  useEffect(() => {
    loadAppState();
    loadData();
  }, [loadAppState, loadData]);

  // Get filtered notes based on current selection and search
  const filteredNotes = useMemo(() => {
    let notesToShow: Note[] = [];

    // Apply search and tag filters
    if (searchQuery || selectedTags.length > 0) {
      if (searchQuery) {
        notesToShow = searchNotes(searchQuery, selectedCategoryId || undefined);
      } else {
        notesToShow = notes;
      }

      if (selectedTags.length > 0) {
        const tagFilteredNotes = getNotesByTags(selectedTags);
        notesToShow = notesToShow.filter((note) =>
          tagFilteredNotes.some((tagNote) => tagNote.id === note.id),
        );
      }
    } else {
      // Normal navigation without search
      if (selectedSubcategoryId) {
        notesToShow = getNotesBySubcategory(selectedSubcategoryId);
      } else if (selectedCategoryId) {
        notesToShow = getNotesByCategory(selectedCategoryId);
      } else {
        notesToShow = notes;
      }
    }

    // Sort by updated date (newest first)
    return notesToShow.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }, [
    notes,
    selectedCategoryId,
    selectedSubcategoryId,
    searchQuery,
    selectedTags,
    searchNotes,
    getNotesBySubcategory,
    getNotesByCategory,
    getNotesByTags,
  ]);

  const selectedNote = selectedNoteId
    ? notes.find((note) => note.id === selectedNoteId)
    : null;

  const handleCreateNote = (subcategoryId: string) => {
    setCreatingNoteForSubcategory(subcategoryId);
    setEditingNote(null);
    setIsCreatingNewNote(false);
    setMobileSidebarOpen(false);
  };

  const handleCreateNewNote = () => {
    setIsCreatingNewNote(true);
    setCreatingNoteForSubcategory(null);
    setEditingNote(null);
    setMobileSidebarOpen(false);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setCreatingNoteForSubcategory(null);
  };

  const handleSaveNote = () => {
    setEditingNote(null);
    setCreatingNoteForSubcategory(null);
    setIsCreatingNewNote(false);
    toast({
      title: t("common.success"),
      description: t("note.saved"),
    });
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setCreatingNoteForSubcategory(null);
    setIsCreatingNewNote(false);
  };

  const getCurrentTitle = () => {
    if (searchQuery) {
      return `${t("search.searchEverywhere")}: "${searchQuery}"`;
    }
    if (selectedTags.length > 0) {
      return `${t("search.filterByTags")}: ${selectedTags.join(", ")}`;
    }
    if (selectedSubcategoryId) {
      const subcategory = categories
        .flatMap((cat) => cat.subcategories)
        .find((sub) => sub.id === selectedSubcategoryId);
      return subcategory?.name || t("sidebar.allNotes");
    }
    if (selectedCategoryId) {
      const category = categories.find((cat) => cat.id === selectedCategoryId);
      return category?.name || t("sidebar.allNotes");
    }
    return t("sidebar.allNotes");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="w-80 flex-shrink-0 hidden lg:block">
        <NoteSidebar onCreateNote={handleCreateNote} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Mobile Header */}
        <div className="lg:hidden border-b p-4 flex items-center gap-4">
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <NoteSidebar onCreateNote={handleCreateNote} />
            </SheetContent>
          </Sheet>
          <h1 className="font-semibold truncate flex-1">{getCurrentTitle()}</h1>
          <Button onClick={handleCreateNewNote} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("note.create")}
          </Button>
        </div>

        {/* Note List */}
        <div className="w-full lg:w-96 border-r flex flex-col min-h-0">
          <div className="p-4 border-b hidden lg:block flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold truncate">{getCurrentTitle()}</h2>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateNewNote}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t("note.create")}
                </Button>
                {selectedSubcategoryId && (
                  <Button
                    onClick={() => handleCreateNote(selectedSubcategoryId)}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Quick Add
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredNotes.length}{" "}
              {filteredNotes.length === 1 ? "note" : "notes"}
            </p>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto custom-scrollbar">
              <div className="p-4">
                <div className="lg:hidden mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {filteredNotes.length}{" "}
                    {filteredNotes.length === 1 ? "note" : "notes"}
                  </p>
                  {selectedSubcategoryId && (
                    <Button
                      onClick={() => handleCreateNote(selectedSubcategoryId)}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Quick Add
                    </Button>
                  )}
                </div>
                <NoteList notes={filteredNotes} onEditNote={handleEditNote} />
              </div>
            </div>
          </div>
        </div>

        {/* Note Detail/Editor */}
        <div className="flex-1 p-4">
          {editingNote ? (
            <NoteEditor
              note={editingNote}
              onSave={handleSaveNote}
              onCancel={handleCancelEdit}
            />
          ) : creatingNoteForSubcategory ? (
            <NoteEditor
              subcategoryId={creatingNoteForSubcategory}
              onSave={handleSaveNote}
              onCancel={handleCancelEdit}
            />
          ) : isCreatingNewNote ? (
            <NoteEditor onSave={handleSaveNote} onCancel={handleCancelEdit} />
          ) : selectedNote ? (
            <NoteDetailView
              note={selectedNote}
              onEdit={() => handleEditNote(selectedNote)}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">{t("app.title")}</CardTitle>
                <p className="text-muted-foreground mb-4">
                  {filteredNotes.length === 0
                    ? "No notes found. Create your first note to get started!"
                    : "Select a note to view or edit it"}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleCreateNewNote} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("note.create")}
                  </Button>
                  {selectedSubcategoryId && (
                    <Button
                      onClick={() => handleCreateNote(selectedSubcategoryId)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Quick Add to{" "}
                      {
                        categories
                          .flatMap((cat) => cat.subcategories)
                          .find((sub) => sub.id === selectedSubcategoryId)?.name
                      }
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
