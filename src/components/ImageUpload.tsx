import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { imageUtils } from "@/lib/imageUtils";
import { storage } from "@/lib/storage";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUpload = ({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploadProps) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: t("common.error"),
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const newImageIds: string[] = [];

      for (const file of files) {
        const validation = imageUtils.validateImageFile(file);
        if (!validation.valid) {
          toast({
            title: t("common.error"),
            description: validation.error,
            variant: "destructive",
          });
          continue;
        }

        const imageId = imageUtils.generateImageId();
        const resizedImage = await imageUtils.resizeImage(file);

        storage.saveImage(imageId, resizedImage);
        newImageIds.push(imageId);
      }

      onImagesChange([...images, ...newImageIds]);

      if (newImageIds.length > 0) {
        toast({
          title: t("common.success"),
          description: `${newImageIds.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: t("common.error"),
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (imageId: string) => {
    storage.deleteImage(imageId);
    onImagesChange(images.filter((id) => id !== imageId));
  };

  const getImageSrc = (imageId: string) => {
    return storage.getImage(imageId) || "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : t("note.uploadImage")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {images.length}/{maxImages} images
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((imageId) => {
            const imageSrc = getImageSrc(imageId);
            return (
              <div key={imageId} className="relative group">
                <div className="relative aspect-square overflow-hidden rounded-lg border">
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
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(imageId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
