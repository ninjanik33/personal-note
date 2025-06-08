import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Edit, Tag, Calendar, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Note } from "@/types/note";
import { storage } from "@/lib/storage";

interface NoteDetailViewProps {
  note: Note;
  onEdit: () => void;
}

export const NoteDetailView = ({ note, onEdit }: NoteDetailViewProps) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getImageSrc = (imageId: string) => {
    return storage.getImage(imageId) || "";
  };

  const renderContent = (content: string) => {
    return { __html: content };
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-bold">{note.title}</span>
            <Button onClick={onEdit} size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              {t("common.edit")}
            </Button>
          </CardTitle>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {t("note.createdAt")}:{" "}
                {format(note.createdAt, "MMM dd, yyyy HH:mm")}
              </span>
            </div>
            {note.updatedAt.getTime() !== note.createdAt.getTime() && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {t("note.lastModified")}:{" "}
                  {format(note.updatedAt, "MMM dd, yyyy HH:mm")}
                </span>
              </div>
            )}
          </div>

          {note.tags.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-auto space-y-6">
          {/* Content */}
          {note.content && (
            <div className="prose prose-sm max-w-none">
              <div
                dangerouslySetInnerHTML={renderContent(note.content)}
                className="break-words"
              />
            </div>
          )}

          {/* Images */}
          {note.images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <h3 className="font-medium">{t("note.images")}</h3>
                <Badge variant="outline" className="text-xs">
                  {note.images.length}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {note.images.map((imageId) => {
                  const imageSrc = getImageSrc(imageId);
                  return (
                    <div
                      key={imageId}
                      className="relative aspect-square overflow-hidden rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedImage(imageSrc)}
                    >
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt="Note image"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!note.content && note.images.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-muted-foreground">
                This note is empty. Click edit to add content.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Full size"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
