import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { getAllDepartments } from '../services/departmentService';
import { Department } from '../models/types';
import { toast } from 'react-toastify';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch departments on component mount
  useEffect(() => {
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

    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDepartment = departments.find(dept => dept.id === selectedDepartmentId);

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
      <div className="pt-8 pb-16 px-4 md:px-8 max-w-screen-xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Academic Departments</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our diverse academic departments offering cutting-edge research, expert faculty, and exceptional educational opportunities.
          </p>
          
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="absolute right-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {selectedDepartment ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
            <button 
              onClick={() => setSelectedDepartmentId(null)}
              className="absolute ml-4 mt-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <div className="h-80 bg-gray-200 relative">
              <img 
                src={selectedDepartment.image} 
                alt={selectedDepartment.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{selectedDepartment.name}</h2>
                <p className="text-sm">Established {selectedDepartment.established}</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-primary-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedDepartment.facultyCount}</p>
                  <p className="text-gray-600">Faculty Members</p>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedDepartment.studentCount}</p>
                  <p className="text-gray-600">Students</p>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedDepartment.courses}</p>
                  <p className="text-gray-600">Courses Offered</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">About the Department</h3>
              <p className="text-gray-600 mb-6">{selectedDepartment.description}</p>
              
              <div className="flex justify-between">
                <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Request Information
                </button>
                <button className="border border-primary-600 text-primary-600 hover:bg-primary-50 font-medium py-2 px-4 rounded-lg transition-colors">
                  View Courses
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map(department => (
                <div 
                  key={department.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                 
                >
                  <div className="h-48 bg-gray-200 relative">
                    <img 
                      src={department.image} 
                      alt={department.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h2 className="text-xl font-bold">{department.name}</h2>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 line-clamp-2 mb-4">{department.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{department.facultyCount} Faculty</span>
                      <span className="text-gray-500">{department.courses} Courses</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No departments found. Please try a different search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
} 