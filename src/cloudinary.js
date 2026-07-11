export const CLOUDINARY_CONFIG = {
  cloudName: '',
  uploadPreset: '',
};

export function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.uploadPreset);
}

export async function uploadImage(file) {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Image uploads are not connected yet. Add your Cloudinary cloud name and upload preset to src/cloudinary.js.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    throw new Error('Image upload failed.');
  }

  const data = await response.json();
  return { url: data.secure_url, publicId: data.public_id };
}
