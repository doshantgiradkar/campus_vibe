import { Link } from 'react-router-dom';

export interface EventType {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizerId: string;
  organizerName: string;
  image?: string;
  category?: string;
  isBookmarked?: boolean;
  isRegistered?: boolean;
}

interface EventCardProps {
  event: EventType;
  onBookmark?: (id: string) => void;
  onRegister?: (id: string) => void;
  showActions?: boolean;
}

export default function EventCard({ event, onBookmark, onRegister, showActions = true }: EventCardProps) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative h-48 bg-gray-200">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100">
            <span className="text-primary-500 text-lg font-semibold">{event.title.charAt(0)}</span>
          </div>
        )}
        {event.category && (
          <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
            {event.category}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
          {showActions && onBookmark && (
            <button 
              onClick={() => onBookmark(event.id)}
              className="text-gray-400 hover:text-yellow-500 focus:outline-none"
              aria-label={event.isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill={event.isBookmarked ? "currentColor" : "none"} 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={event.isBookmarked ? "0" : "2"}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                />
              </svg>
            </button>
          )}
        </div>
        
        <div className="text-sm text-gray-500 mb-3">
          <div className="flex items-center mb-1">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate} • {event.time}</span>
          </div>
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            By {event.organizerName}
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <Link 
                to={`/events/${event.id}`}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                Details
              </Link>
              
              {onRegister && (
                <button
                  onClick={() => onRegister(event.id)}
                  disabled={event.isRegistered}
                  className={`text-sm font-medium rounded px-3 py-1 ${
                    event.isRegistered
                      ? 'bg-green-100 text-green-800'
                      : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                  }`}
                >
                  {event.isRegistered ? 'Registered' : 'Register'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 