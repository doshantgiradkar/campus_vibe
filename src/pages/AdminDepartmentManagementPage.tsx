import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Department } from '../models/types';
import { toast } from 'react-toastify';
import { 
  getAllDepartments, 
  createDepartment, 
  updateDepartment,
  deleteDepartment 
} from '../services/departmentService';

export default function AdminDepartmentManagementPage() {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    facultyCount: 0,
    studentCount: 0,
    courses: 0,
    established: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'facultyCount' || name === 'studentCount' || name === 'courses') {
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

  const handleEdit = (department: Department) => {
    setCurrentDepartment(department);
    setFormData(department);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setCurrentDepartment(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      image: '',
      facultyCount: 0,
      studentCount: 0,
      courses: 0,
      established: ''
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
        
        // Update local state after successful deletion
        setDepartments(departments.filter(dept => dept.id !== id));
        
        toast.success('Department deleted successfully');
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error('Failed to delete department. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isCreating) {
        // Create department data without the id field
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...departmentData } = formData;
        
        // Create department in Firebase
        const newDepartmentData = await createDepartment(departmentData);
        
        // Update local state
        setDepartments([...departments, newDepartmentData as Department]);
        setIsCreating(false);
        
        toast.success('Department created successfully');
      } else if (isEditing && currentDepartment) {
        // Get the department ID
        const departmentId = currentDepartment.id;
        
        // Create update data without the id field
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...departmentData } = formData;
        
        // Update department in Firebase
        await updateDepartment(departmentId, departmentData);
        
        // Update local state
        setDepartments(
          departments.map(dept => (dept.id === departmentId ? { ...departmentData, id: departmentId } as Department : dept))
        );
        setIsEditing(false);
        
        toast.success('Department updated successfully');
      }
      
      // Reset form
      setFormData({
        id: '',
        name: '',
        description: '',
        image: '',
        facultyCount: 0,
        studentCount: 0,
        courses: 0,
        established: ''
      });
      setCurrentDepartment(null);
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Failed to save department. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setCurrentDepartment(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      image: '',
      facultyCount: 0,
      studentCount: 0,
      courses: 0,
      established: ''
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
          <h1 className="text-2xl font-bold">Department Management</h1>
          <button 
            onClick={handleCreate}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          >
            Create New Department
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading departments...</p>
          </div>
        ) : isEditing || isCreating ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {isCreating ? 'Create New Department' : 'Edit Department'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name
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
                    Established Year
                  </label>
                  <input
                    type="text"
                    name="established"
                    value={formData.established}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faculty Count
                  </label>
                  <input
                    type="number"
                    name="facultyCount"
                    value={formData.facultyCount}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Count
                  </label>
                  <input
                    type="number"
                    name="studentCount"
                    value={formData.studentCount}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Courses Offered
                  </label>
                  <input
                    type="number"
                    name="courses"
                    value={formData.courses}
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
                  {isCreating ? 'Create Department' : 'Update Department'}
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Established</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Faculty</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Students</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Courses</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departments.map(department => (
                  <tr key={department.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{department.name}</td>
                    <td className="px-4 py-3 text-sm">{department.established}</td>
                    <td className="px-4 py-3 text-sm">{department.facultyCount}</td>
                    <td className="px-4 py-3 text-sm">{department.studentCount}</td>
                    <td className="px-4 py-3 text-sm">{department.courses}</td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(department)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(department.id)}
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