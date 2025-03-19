import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { createEvent, getEventById, updateEvent } from '../services/eventService';
import { toast } from 'react-toastify';
import { validateImageFile, createImagePreview, uploadImageToCloudinary } from '../services/imageService';

// Define event categories
const EVENT_CATEGORIES = ['Technology', 'Arts', 'Career', 'Academic', 'Sports', 'Cultural'];

// Define the structure for the event form data
interface EventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  maxAttendees: string;
  registrationDeadline: string;
  imageUrl: string;
  requirements: string;
  agenda: { time: string; activity: string }[];
  organizerType: 'admin' | 'department' | 'club';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
}

// Define event data interface to match Firestore requirements
interface EventData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  capacity: number;
  maxAttendees: number;
  registrationDeadline: string;
  imageUrl: string;
  requirements: string;
  agenda: { time: string; activity: string }[];
  organizerType: 'admin' | 'department' | 'club';
  organizerId: string;
  organizerName: string;
  createdBy: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  attendeeCount: number;
  departmentId?: string;
  clubId?: string;
}

export default function CreateEventPage() {
  const { currentUser, isAdmin, isDepartment, isClub } = useAuth();
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId?: string }>();
  const isEditMode = !!eventId;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [agendaItems, setAgendaItems] = useState<{ time: string; activity: string }[]>([
    { time: '', activity: '' }
  ]);
  
  // File upload related states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    maxAttendees: '100', // Default value
    registrationDeadline: '',
    imageUrl: '',
    requirements: '',
    agenda: agendaItems,
    organizerType: isAdmin ? 'admin' : isDepartment ? 'department' : isClub ? 'club' : 'admin',
    status: 'published'
  });

  // Fetch event data if in edit mode
  useEffect(() => {
    if (isEditMode && eventId) {
      const fetchEvent = async () => {
        setIsLoading(true);
        try {
          const eventData = await getEventById(eventId);
          if (eventData) {
            // Convert date to YYYY-MM-DD format for the date input
            const eventDate = new Date(eventData.date);
            const formattedDate = eventDate.toISOString().split('T')[0];
            
            // Extract time from eventData or use defaults
            const startTime = eventData.startTime || '';
            const endTime = eventData.endTime || '';
            
            setFormData({
              title: eventData.title || '',
              description: eventData.description || '',
              date: formattedDate,
              startTime: startTime,
              endTime: endTime,
              location: eventData.location || '',
              category: eventData.category || '',
              maxAttendees: eventData.capacity?.toString() || '',
              registrationDeadline: eventData.registrationDeadline || '',
              imageUrl: eventData.imageUrl || '',
              requirements: eventData.requirements || '',
              agenda: eventData.agenda || [{ time: '', activity: '' }],
              organizerType: eventData.organizerType || (isAdmin ? 'admin' : isDepartment ? 'department' : 'club'),
              status: eventData.status || 'draft'
            });
            
            // Update agenda items state
            if (eventData.agenda && eventData.agenda.length > 0) {
              setAgendaItems(eventData.agenda);
            }
          }
        } catch (error) {
          console.error('Error fetching event:', error);
          toast.error('Failed to load event details');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchEvent();
    }
  }, [eventId, isEditMode, isAdmin, isDepartment, isClub]);

  // Add or remove agenda items
  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, { time: '', activity: '' }]);
  };

  const removeAgendaItem = (index: number) => {
    if (agendaItems.length > 1) {
      const updatedItems = [...agendaItems];
      updatedItems.splice(index, 1);
      setAgendaItems(updatedItems);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAgendaChange = (index: number, field: 'time' | 'activity', value: string) => {
    const updatedAgendaItems = [...agendaItems];
    updatedAgendaItems[index][field] = value;
    setAgendaItems(updatedAgendaItems);
    
    // Also update the form data
    setFormData({
      ...formData,
      agenda: updatedAgendaItems
    });
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
        .then(preview => {
          setImagePreview(preview);
        })
        .catch(error => {
          console.error('Error creating preview:', error);
          setImageError('Failed to preview image');
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.date || 
          !formData.startTime || !formData.endTime || !formData.location || 
          !formData.category) {
        setSubmitError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Check if we have an image (either new upload or existing URL)
      if (!eventImage && !formData.imageUrl && !isEditMode) {
        setSubmitError('Please upload an event image');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare event data for Firestore
      const eventData: EventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        category: formData.category,
        capacity: parseInt(formData.maxAttendees),
        maxAttendees: parseInt(formData.maxAttendees),
        registrationDeadline: formData.registrationDeadline,
        imageUrl: formData.imageUrl || '', // Will be updated if there's a new image
        requirements: formData.requirements || '',
        agenda: formData.agenda,
        organizerType: formData.organizerType,
        organizerId: currentUser?.id || '',
        organizerName: currentUser?.name || 'Unknown',
        createdBy: currentUser?.id || '',
        status: formData.status,
        attendeeCount: 0
      };

      // Only add departmentId and clubId if they are defined
      if (currentUser?.departmentId) {
        eventData.departmentId = currentUser.departmentId;
      }
      
      if (currentUser?.clubId) {
        eventData.clubId = currentUser.clubId;
      }

      // Upload the image if a new one is selected
      if (eventImage) {
        const imageUrl = await uploadImageToCloudinary(eventImage, 'events');
        eventData.imageUrl = imageUrl;
      }

      if (isEditMode && eventId) {
        // Update existing event
        await updateEvent(eventId, eventData);
        toast.success('Event updated successfully');
      } else {
        // Create new event
        await createEvent(eventData);
        toast.success('Event created successfully');
      }
      
      // Navigate back to events page
      if (isAdmin) {
        navigate('/admin/events');
      } else {
        navigate('/events');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
      setSubmitError('Failed to save event. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user is authorized to create events
  if (!isAdmin && !isDepartment && !isClub) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <h2 className="text-lg font-semibold">Unauthorized Access</h2>
            <p>Only admins, departments, and club representatives can create events.</p>
          </div>
        </div>
      </Layout>
    );
  }

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
        
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {submitError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a category</option>
                {EVENT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <>
                <div>
                  <label htmlFor="organizerType" className="block text-sm font-medium text-gray-700 mb-1">
                    Organizer Type *
                  </label>
                  <select
                    id="organizerType"
                    name="organizerType"
                    required
                    value={formData.organizerType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="admin">Admin</option>
                    <option value="department">Department</option>
                    <option value="club">Club</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                required
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
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
                required
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Attendees *
              </label>
              <input
                type="number"
                id="maxAttendees"
                name="maxAttendees"
                required
                min="1"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                Registration Deadline *
              </label>
              <input
                type="date"
                id="registrationDeadline"
                name="registrationDeadline"
                required
                value={formData.registrationDeadline}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Image {!isEditMode && '*'}
              </label>
              <div 
                onClick={handleImageClick}
                className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary-500 transition-colors"
              >
                {imagePreview || formData.imageUrl ? (
                  <div className="space-y-2 text-center">
                    <img 
                      src={imagePreview || formData.imageUrl} 
                      alt="Event preview" 
                      className="mx-auto h-40 object-cover rounded-lg" 
                    />
                    <p className="text-sm text-gray-500">
                      Click to {isEditMode ? 'change' : 'update'} image
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
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                      >
                        <span>Upload an image</span>
                      </label>
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
                  required={!isEditMode && !formData.imageUrl}
                />
              </div>
              {imageError && (
                <p className="mt-2 text-sm text-red-600">{imageError}</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
              Requirements/Prerequisites
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows={3}
              value={formData.requirements}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="List any requirements for attendance (e.g., materials, prior knowledge, etc.)"
            />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Event Agenda
              </label>
              <button
                type="button"
                onClick={addAgendaItem}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Item
              </button>
            </div>
            
            {agendaItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  placeholder="Time"
                  value={item.time}
                  onChange={(e) => handleAgendaChange(index, 'time', e.target.value)}
                  className="w-1/4 p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Activity"
                  value={item.activity}
                  onChange={(e) => handleAgendaChange(index, 'activity', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                {agendaItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-primary-600 text-white rounded-md ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-primary-700'
              }`}
            >
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 