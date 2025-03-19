import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { createEvent } from '../../services/eventService';
import { getAllDepartments } from '../../services/departmentService';
import { getAllClubs } from '../../services/clubService';
import { toast } from 'react-toastify';
import { validateImageFile, createImagePreview, uploadImageToCloudinary } from '../../services/imageService';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  
  // Image handling states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    maxAttendees: 100,
    registrationDeadline: '',
    requirements: '',
    organizerType: 'admin',
    organizerId: '',
    price: 0,
    // We'll handle imageUrl separately with file upload
  });

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const [depts, clubsList] = await Promise.all([
          getAllDepartments(),
          getAllClubs()
        ]);
        setDepartments(depts);
        setClubs(clubsList);
      } catch (error) {
        console.error('Error fetching organizers:', error);
        toast.error('Failed to load departments and clubs');
      }
    };
    
    fetchOrganizers();
    
    // Set current user as organizer if admin
    if (currentUser && currentUser.id) {
      setFormData(prev => ({
        ...prev,
        organizerId: currentUser.id
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle number inputs
    if (name === 'maxAttendees' || name === 'price') {
      setFormData({
        ...formData,
        [name]: Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate image file
      const validation = validateImageFile(file, 5); // 5MB max size for event images
      if (!validation.valid) {
        setImageError(validation.message || 'Invalid image file');
        return;
      }
      
      setEventImage(file);
      
      // Create a preview of the image
      createImagePreview(file)
        .then(preview => setImagePreview(preview))
        .catch(error => {
          console.error('Error creating preview:', error);
          setImageError('Failed to preview image');
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form data
      if (!formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.location) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }
      
      if (!eventImage) {
        toast.error('Please upload an event image');
        setIsLoading(false);
        return;
      }
      
      // Upload event image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(eventImage, 'events');
      
      // Create event in Firestore
      const eventData = {
        ...formData,
        imageUrl,
        status: 'published',
        attendeeCount: 0,
        capacity: formData.maxAttendees
      };
      
      const eventId = await createEvent(eventData);
      toast.success('Event created successfully!');
      navigate(`/admin/events/${eventId}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Event</h1>
            
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Academic">Academic</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Career">Career</option>
                    <option value="Sports">Sports</option>
                    <option value="Technology">Technology</option>
                    <option value="Social">Social</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Date & Time */}
                <div className="md:col-span-2 mt-4">
                  <h2 className="text-xl font-semibold mb-4">Date & Time</h2>
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                {/* Capacity & Pricing */}
                <div className="md:col-span-2 mt-4">
                  <h2 className="text-xl font-semibold mb-4">Capacity & Pricing</h2>
                </div>
                
                <div>
                  <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Attendees
                  </label>
                  <input
                    type="number"
                    id="maxAttendees"
                    name="maxAttendees"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (0 for free events)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Organizer Info */}
                <div className="md:col-span-2 mt-4">
                  <h2 className="text-xl font-semibold mb-4">Organizer Information</h2>
                </div>
                
                <div>
                  <label htmlFor="organizerType" className="block text-sm font-medium text-gray-700 mb-1">
                    Organizer Type *
                  </label>
                  <select
                    id="organizerType"
                    name="organizerType"
                    value={formData.organizerType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="department">Department</option>
                    <option value="club">Club</option>
                  </select>
                </div>
                
                {formData.organizerType !== 'admin' && (
                  <div>
                    <label htmlFor="organizerId" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Organizer *
                    </label>
                    <select
                      id="organizerId"
                      name="organizerId"
                      value={formData.organizerId}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select {formData.organizerType === 'department' ? 'Department' : 'Club'}</option>
                      {formData.organizerType === 'department' 
                        ? departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))
                        : clubs.map((club) => (
                            <option key={club.id} value={club.id}>{club.name}</option>
                          ))
                      }
                    </select>
                  </div>
                )}
                
                {/* Requirements */}
                <div className="md:col-span-2 mt-4">
                  <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements / What to Bring
                  </label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                {/* Event Image */}
                <div className="md:col-span-2 mt-4">
                  <h2 className="text-xl font-semibold mb-4">Event Image *</h2>
                  
                  <div 
                    onClick={handleImageClick}
                    className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary-500 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="space-y-2 text-center">
                        <img 
                          src={imagePreview} 
                          alt="Event preview" 
                          className="mx-auto h-64 object-cover rounded-lg" 
                        />
                        <p className="text-sm text-gray-500">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                          >
                            <span>Upload an image</span>
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                    <input 
                      id="file-upload"
                      ref={fileInputRef}
                      name="file-upload" 
                      type="file" 
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                  </div>
                  
                  {imageError && (
                    <p className="mt-2 text-sm text-red-600">{imageError}</p>
                  )}
                </div>
                
                {/* Submit Button */}
                <div className="md:col-span-2 mt-8">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Event...
                      </>
                    ) : (
                      'Create Event'
                    )}
                  </button>
                </div>
                
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 