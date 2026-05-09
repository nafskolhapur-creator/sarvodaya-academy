const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be processed."));
    };

    image.src = objectUrl;
  });

export const compressImageFile = async (file, options = {}) => {
  if (!file?.type?.startsWith("image/")) {
    return file;
  }

  if (file.size <= (options.skipBelowBytes || 700 * 1024)) {
    return file;
  }

  const image = await loadImage(file);
  const maxWidth = options.maxWidth || 1600;
  const maxHeight = options.maxHeight || 1600;
  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const targetWidth = Math.max(1, Math.round(image.width * ratio));
  const targetHeight = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement("canvas");

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, options.quality || 0.82);
  });

  if (!blob || blob.size >= file.size) {
    return file;
  }

  return new File([blob], file.name, {
    type: mimeType,
    lastModified: Date.now(),
  });
};

export const compressImageFiles = async (files, options) =>
  Promise.all(Array.from(files || []).map((file) => compressImageFile(file, options)));
