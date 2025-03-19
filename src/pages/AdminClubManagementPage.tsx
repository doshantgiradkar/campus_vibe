import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Club } from '../models/types';
import { toast } from 'react-toastify';
import { 
  getAllClubs, 
  createClub, 
  updateClub,
  deleteClub 
} from '../services/clubService';

const CATEGORIES = ['Technology', 'Arts', 'Academic', 'Service', 'Games', 'Performing Arts', 'Cultural', 'Food'];

export default function AdminClubManagementPage() {
  const { isAdmin } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    category: '',
    memberCount: 0,
    foundedYear: '',
    meetingSchedule: '',
    president: '',
    contactEmail: ''
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setIsLoading(true);
    try {
      const data = await getAllClubs();
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to load clubs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'memberCount') {
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

  const handleEdit = (club: Club) => {
    setCurrentClub(club);
    setFormData(club);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setCurrentClub(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      image: '',
      category: '',
      memberCount: 0,
      foundedYear: '',
      meetingSchedule: '',
      president: '',
      contactEmail: ''
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this club?')) {
      try {
        await deleteClub(id);
        
        // Update local state after successful deletion
        setClubs(clubs.filter(club => club.id !== id));
        
        toast.success('Club deleted successfully');
      } catch (error) {
        console.error('Error deleting club:', error);
        toast.error('Failed to delete club. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isCreating) {
        // Create club data without the id field
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...clubData } = formData;
        
        // Create club in Firebase
        const newClubData = await createClub(clubData);
        
        // Update local state
        setClubs([...clubs, newClubData as Club]);
        setIsCreating(false);
        
        toast.success('Club created successfully');
      } else if (isEditing && currentClub) {
        // Get the club ID
        const clubId = currentClub.id;
        
        // Create update data without the id field
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...clubData } = formData;
        
        // Update club in Firebase
        await updateClub(clubId, clubData);
        
        // Update local state
        setClubs(
          clubs.map(club => (club.id === clubId ? { ...clubData, id: clubId } as Club : club))
        );
        setIsEditing(false);
        
        toast.success('Club updated successfully');
      }
      
      // Reset form
      setFormData({
        id: '',
        name: '',
        description: '',
        image: '',
        category: '',
        memberCount: 0,
        foundedYear: '',
        meetingSchedule: '',
        president: '',
        contactEmail: ''
      });
      setCurrentClub(null);
    } catch (error) {
      console.error('Error saving club:', error);
      toast.error('Failed to save club. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setCurrentClub(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      image: '',
      category: '',
      memberCount: 0,
      foundedYear: '',
      meetingSchedule: '',
      president: '',
      contactEmail: ''
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
          <h1 className="text-2xl font-bold">Club Management</h1>
          <button 
            onClick={handleCreate}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          >
            Create New Club
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading clubs...</p>
          </div>
        ) : isEditing || isCreating ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {isCreating ? 'Create New Club' : 'Edit Club'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Club Name
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
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Founded Year
                  </label>
                  <input
                    type="text"
                    name="foundedYear"
                    value={formData.foundedYear}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Count
                  </label>
                  <input
                    type="number"
                    name="memberCount"
                    value={formData.memberCount}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Schedule
                  </label>
                  <input
                    type="text"
                    name="meetingSchedule"
                    value={formData.meetingSchedule}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    President
                  </label>
                  <input
                    type="text"
                    name="president"
                    value={formData.president}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
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
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
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
                  {isCreating ? 'Create Club' : 'Update Club'}
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Members</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Founded</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">President</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clubs.map(club => (
                  <tr key={club.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{club.name}</td>
                    <td className="px-4 py-3 text-sm">{club.category}</td>
                    <td className="px-4 py-3 text-sm">{club.memberCount}</td>
                    <td className="px-4 py-3 text-sm">{club.foundedYear}</td>
                    <td className="px-4 py-3 text-sm">{club.president}</td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(club)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(club.id)}
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