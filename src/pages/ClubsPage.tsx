import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { getAllClubs } from '../services/clubService';
import { Club } from '../models/types';
import { toast } from 'react-toastify';

const CATEGORIES = ['All', 'Technology', 'Arts', 'Academic', 'Service', 'Games', 'Performing Arts', 'Cultural', 'Food'];

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch clubs on component mount
  useEffect(() => {
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

    fetchClubs();
  }, []);

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (selectedCategory === 'All' || club.category === selectedCategory)
  );

  const selectedClub = clubs.find(club => club.id === selectedClubId);

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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Campus Clubs & Organizations</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover and join student-run clubs that match your interests and passions. Connect with like-minded peers and enrich your campus experience.
          </p>

          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative flex items-center mb-6">
              <input
                type="text"
                placeholder="Search clubs..."
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

            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedClub ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
            <button 
              onClick={() => setSelectedClubId(null)}
              className="absolute ml-4 mt-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <div className="h-72 bg-gray-200 relative">
              <img 
                src={selectedClub.image} 
                alt={selectedClub.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <span className="bg-primary-600 text-white text-xs px-3 py-1 rounded-full mb-3 inline-block">
                  {selectedClub.category}
                </span>
                <h2 className="text-3xl font-bold mb-2">{selectedClub.name}</h2>
                <p className="text-sm">Founded {selectedClub.foundedYear}</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-primary-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedClub.memberCount}</p>
                  <p className="text-gray-600">Active Members</p>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg text-center">
                  <p className="text-lg font-semibold text-primary-600">{selectedClub.meetingSchedule}</p>
                  <p className="text-gray-600">Meeting Schedule</p>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg text-center">
                  <p className="text-lg font-semibold text-primary-600">{selectedClub.president}</p>
                  <p className="text-gray-600">Club President</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">About the Club</h3>
              <p className="text-gray-600 mb-6">{selectedClub.description}</p>
              
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex-1">
                  Join Club
                </button>
                <a 
                  href={`mailto:${selectedClub.contactEmail}`} 
                  className="border border-primary-600 text-primary-600 hover:bg-primary-50 font-medium py-2 px-6 rounded-lg transition-colors text-center flex-1"
                >
                  Contact Club
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClubs.length > 0 ? (
              filteredClubs.map(club => (
                <div 
                  key={club.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => setSelectedClubId(club.id)}
                >
                  <div className="h-44 bg-gray-200 relative">
                    <img 
                      src={club.image} 
                      alt={club.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {club.category}
                    </span>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h2 className="text-xl font-bold">{club.name}</h2>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 line-clamp-2 mb-4">{club.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{club.memberCount} Members</span>
                      <span className="text-gray-500">Founded {club.foundedYear}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No clubs found. Please try a different search or category.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
} 