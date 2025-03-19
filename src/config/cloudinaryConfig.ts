// Cloudinary configuration
interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiUrl: string;
  folders: {
    events: string;
    profiles: string;
    departments: string;
    clubs: string;
    mentors: string;
    general: string;
  };
}

// In a production environment, you should use environment variables
// e.g., cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const cloudinaryConfig: CloudinaryConfig = {
  cloudName: 'demo', // Replace with your actual Cloudinary cloud name
  uploadPreset: 'campus_vibe_uploads', // Unsigned upload preset name (create this in your Cloudinary account)
  apiUrl: 'https://api.cloudinary.com/v1_1',
  folders: {
    events: 'campus-vibe/events',
    profiles: 'campus-vibe/profiles',
    departments: 'campus-vibe/departments',
    clubs: 'campus-vibe/clubs',
    mentors: 'campus-vibe/mentors',
    general: 'campus-vibe/general'
  }
};

export default cloudinaryConfig; 