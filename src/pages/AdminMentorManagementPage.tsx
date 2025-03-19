import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Mentor } from '../models/types';
import { toast } from 'react-toastify';
import { 
  getAllMentors, 
  createMentor, 
  updateMentor,
  deleteMentor 
} from '../services/mentorService';

const DEPARTMENTS = ['Computer Science', 'Business Administration', 'Electrical Engineering', 'Biology', 'Psychology', 'Architecture'];

export default function AdminMentorManagementPage() {
  const { isAdmin } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentMentor, setCurrentMentor] = useState<Mentor | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    department: '',
    specialization: '',
    bio: '',
    image: '',
    officeHours: '',
    contactInfo: '',
    yearsOfExperience: 0
  });

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const data = await getAllMentors();
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Failed to load mentors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'yearsOfExperience') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseInt(value, 10)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleEdit = (mentor: Mentor) => {
    setCurrentMentor(mentor);
    setFormData(mentor);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setCurrentMentor(null);
    setFormData({
      id: '',
      name: '',
      email: '',
      department: '',
      specialization: '',
      bio: '',
      image: '',
      officeHours: '',
      contactInfo: '',
      yearsOfExperience: 0
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this mentor?')) {
      try {
        await deleteMentor(id);
        
        // Update local state after successful deletion
        setMentors(mentors.filter(mentor => mentor.id !== id));
        
        toast.success('Mentor deleted successfully');
      } catch (error) {
        console.error('Error deleting mentor:', error);
        toast.error('Failed to delete mentor. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isCreating) {
        // Create mentor data without the id field
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...mentorData } = formData;
        
        // Create mentor in Firebase
        const newMentorData = await createMentor(mentorData);
        
        // Update local state
        setMentors([...mentors, newMentorData as Mentor]);
        setIsCreating(false);
        
        toast.success('Mentor created successfully');
      } else if (isEditing && currentMentor) {
        // Get the mentor ID
        const mentorId = currentMentor.id;
        
        // Create update data without the id field
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...mentorData } = formData;
        
        // Update mentor in Firebase
        await updateMentor(mentorId, mentorData);
        
        // Update local state
        setMentors(
          mentors.map(mentor => (mentor.id === mentorId ? { ...mentorData, id: mentorId } as Mentor : mentor))
        );
        setIsEditing(false);
        
        toast.success('Mentor updated successfully');
      }
      
      // Reset form
      setFormData({
        id: '',
        name: '',
        email: '',
        department: '',
        specialization: '',
        bio: '',
        image: '',
        officeHours: '',
        contactInfo: '',
        yearsOfExperience: 0
      });
      setCurrentMentor(null);
    } catch (error) {
      console.error('Error saving mentor:', error);
      toast.error('Failed to save mentor. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setCurrentMentor(null);
    setFormData({
      id: '',
      name: '',
      email: '',
      department: '',
      specialization: '',
      bio: '',
      image: '',
      officeHours: '',
      contactInfo: '',
      yearsOfExperience: 0
    });
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
          <p className="mt-2">You do not have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mentor Management</h1>
          <button 
            onClick={handleCreate}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          >
            Add New Mentor
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading mentors...</p>
          </div>
        ) : isEditing || isCreating ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {isCreating ? 'Add New Mentor' : 'Edit Mentor'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a department</option>
                    {DEPARTMENTS.map(department => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Office Hours
                  </label>
                  <input
                    type="text"
                    name="officeHours"
                    value={formData.officeHours}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biography
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {isCreating ? 'Add Mentor' : 'Update Mentor'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Specialization</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Experience</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mentors.map(mentor => (
                  <tr key={mentor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{mentor.name}</td>
                    <td className="px-4 py-3 text-sm">{mentor.department}</td>
                    <td className="px-4 py-3 text-sm">{mentor.specialization}</td>
                    <td className="px-4 py-3 text-sm">{mentor.email}</td>
                    <td className="px-4 py-3 text-sm">{mentor.yearsOfExperience} years</td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(mentor)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(mentor.id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
} 