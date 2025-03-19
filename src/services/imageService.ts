import { toast } from 'react-toastify';
// Import will be needed when switching back to real Cloudinary implementation
// import cloudinaryConfig from '../config/cloudinaryConfig';

// Upload image to Cloudinary
export const uploadImageToCloudinary = async (
  imageFile: File, 
  folder: string = 'general'
): Promise<string> => {
  try {
    // For demo purposes, we'll create a local data URL instead of uploading to Cloudinary
    // This avoids issues with Cloudinary credentials in a demo environment
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // In a real app, this would be the URL returned from Cloudinary
        console.log(`Mock upload to folder: ${folder}`);
        
        // Simulate a small delay to mimic network request
        setTimeout(() => {
          // Use the file's data URL as a temporary replacement for the Cloudinary URL
          const dataUrl = reader.result as string;
          
          // You could also use a placeholder image if you prefer
          // const placeholderUrl = `https://via.placeholder.com/800x600?text=${encodeURIComponent(imageFile.name)}`;
          
          resolve(dataUrl);
        }, 500);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(imageFile);
    });
    
    /* 
    // Real Cloudinary implementation - kept for reference
    // Create a FormData object to send the image
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    
    // Determine the Cloudinary folder based on the input or use a default from config
    const cloudinaryFolder = cloudinaryConfig.folders[folder as keyof typeof cloudinaryConfig.folders] || 
                           cloudinaryConfig.folders.general;
    formData.append('folder', cloudinaryFolder);

    // Use the cloudinary config for the API URL
    const uploadUrl = `${cloudinaryConfig.apiUrl}/${cloudinaryConfig.cloudName}/image/upload`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cloudinary error details:', errorData);
      throw new Error(`Image upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
    */
  } catch (error) {
    console.error('Error handling image:', error);
    toast.error('Failed to process image. Please try again.');
    throw error;
  }
};

// Helper function to resize image before upload if needed
export const resizeImage = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = function(e) {
      img.src = e.target?.result as string;
      
      img.onload = function() {
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to Blob then File
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas to Blob conversion failed"));
            return;
          }
          
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          
          resolve(resizedFile);
        }, file.type, quality);
      };
    };
    
    reader.onerror = function(error) {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

// Function to validate image file (size, type)
export const validateImageFile = (
  file: File, 
  maxSizeMB: number = 5, 
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
): { valid: boolean; message?: string } => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      message: `Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}` 
    };
  }
  
  // Check file size (convert MB to bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      message: `File size exceeds ${maxSizeMB}MB limit` 
    };
  }
  
  return { valid: true };
};

// Image preview creator
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}; 