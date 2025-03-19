import axios from "axios";

// src/utils/cloudinary.js
export const uploadImage = async (file: string | Blob) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );
    return response.data.secure_url; // Cloudinary URL
  } catch (error: unknown) {
    console.error('Cloudinary Upload Error:', (error as { response?: { data: unknown } })?.response?.data || error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};