import { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getUserById, updateUserProfile } from '../services/userService';
import { validateImageFile, createImagePreview } from '../services/imageService';
import { toast } from 'react-toastify';

interface ProfileFormData {
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  year: string;
  bio: string;
  interests: string[];
  profileImage: string;
}

const AVAILABLE_INTERESTS = [
  'Art & Design', 'Business', 'Computer Science', 'Engineering',
  'Environment', 'History', 'Languages', 'Literature',
  'Mathematics', 'Medicine', 'Music', 'Philosophy',
  'Physics', 'Politics', 'Psychology', 'Sports'
];

const DEPARTMENTS = [
  'Computer Science', 'Business Administration', 'Electrical Engineering',
  'Biology', 'Psychology', 'Architecture', 'Mathematics', 'Chemistry',
  'Physics', 'Finance', 'Marketing', 'History'
];

const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'PhD'];

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    department: '',
    year: '',
    bio: '',
    interests: [],
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80'
  });

  // Fetch user profile data from Firestore
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser || !currentUser.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userData = await getUserById(currentUser.id);
        
        if (userData) {
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            department: userData.department || '',
            year: userData.year || '',
            bio: userData.bio || '',
            interests: userData.interests || [],
            profileImage: userData.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80'
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const toggleInterest = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(i => i !== interest)
      });
    } else {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest]
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate the image file
      const validation = validateImageFile(file, 3); // 3MB max size
      if (!validation.valid) {
        setImageError(validation.message || 'Invalid image file');
        return;
      }
      
      setProfileImage(file);
      
      // Create a preview of the image
      createImagePreview(file)
        .then(preview => setImagePreview(preview))
        .catch(error => {
          console.error('Error creating preview:', error);
          setImageError('Failed to preview image');
        });
    }
  };

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentUser.id) {
      setSaveError('You must be logged in to update your profile');
      return;
    }
    
    setSaveSuccess(false);
    setSaveError('');
    setIsSaving(true);
    
    try {
      // Submit profile data to Firestore
      const profileUpdate = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        year: formData.year,
        bio: formData.bio,
        interests: formData.interests
      };
      
      await updateUserProfile(currentUser.id, profileUpdate, profileImage || undefined);
      
      setIsEditing(false);
      setSaveSuccess(true);
      setIsSaving(false);
      
      // If there was a new image uploaded, update the form data with the new image URL
      if (profileImage && imagePreview) {
        setFormData(prev => ({
          ...prev,
          profileImage: imagePreview
        }));
      }
      
      toast.success('Profile updated successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError('Failed to update profile. Please try again.');
      toast.error('Failed to update profile');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-900 to-primary-700 px-6 py-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div 
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 p-1 shadow-lg overflow-hidden ${isEditing ? 'cursor-pointer relative' : ''}`} 
                onClick={handleImageClick}
              >
                <img 
                  src={imagePreview || formData.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">Change Photo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              {imageError && isEditing && (
                <div className="absolute mt-32 sm:mt-36 text-red-500 text-xs bg-white px-2 py-1 rounded shadow">
                  {imageError}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-white">{formData.name}</h1>
                <p className="text-white/80 text-lg">{formData.department} • {formData.year}</p>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  {formData.interests.slice(0, 3).map(interest => (
                    <span key={interest} className="px-2 py-1 rounded-full bg-white/20 text-white text-xs">
                      {interest}
                    </span>
                  ))}
                  {formData.interests.length > 3 && (
                    <span className="px-2 py-1 rounded-full bg-white/20 text-white text-xs">
                      +{formData.interests.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="ml-auto bg-white text-primary-700 px-4 py-2 rounded-lg shadow-sm hover:bg-white/90 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {saveSuccess && (
              <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md">
                Profile updated successfully!
              </div>
            )}
            
            {saveError && (
              <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
                {saveError}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Year</option>
                      {YEARS.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_INTERESTS.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          formData.interests.includes(interest)
                            ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                            : 'bg-gray-100 text-gray-800 border-2 border-transparent hover:bg-gray-200'
                        } transition-colors`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">About Me</h3>
                  <p className="text-gray-700">{formData.bio || 'No bio provided.'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700">{formData.email}</span>
                      </li>
                      {formData.phoneNumber && (
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-gray-700">{formData.phoneNumber}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Academic Information</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-gray-700">{formData.department || 'No department specified'}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-gray-700">{formData.year || 'No year specified'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Interests</h3>
                  {formData.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map(interest => (
                        <span key={interest} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No interests specified.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 