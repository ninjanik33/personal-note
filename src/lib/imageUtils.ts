export const imageUtils = {
  // Convert file to base64
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Resize image to maximum dimensions while maintaining aspect ratio
  resizeImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 600,
    quality: number = 0.8,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        const { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight,
        );

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const resizedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(resizedDataUrl);
        } else {
          reject(new Error("Failed to get canvas context"));
        }
      };

      img.onerror = reject;

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  },

  // Calculate new dimensions maintaining aspect ratio
  calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
  ) {
    let width = originalWidth;
    let height = originalHeight;

    if (width > height) {
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
    }

    return { width: Math.round(width), height: Math.round(height) };
  },

  // Generate unique image ID
  generateImageId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error:
          "Invalid file type. Please upload JPG, PNG, GIF, or WebP images.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File too large. Please upload images smaller than 10MB.",
      };
    }

    return { valid: true };
  },
};
