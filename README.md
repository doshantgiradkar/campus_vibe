# Campus Vibe

A modern web application for managing campus events, connecting students with organizations, and enhancing the overall campus experience.

## Features

- **User Authentication**: Secure login and signup with role-based access
- **Event Discovery**: Browse and search for campus events
- **Event Registration**: Register for events and manage your bookings
- **Organization Management**: Create and manage organizations on campus
- **Event Management**: For organization admins to create and manage events
- **Admin Dashboard**: For campus administrators to oversee all activities

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Authentication**: Firebase Authentication
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm/yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/campus-vibe.git
   cd campus-vibe
   ```

2. Install dependencies:
   ```
   npm install
   ```
   
3. Create a `.env.local` file in the root directory and add your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## User Roles

### Student
- Browse and register for events
- Bookmark favorite events
- View personal event calendar
- Join campus organizations

### Organization
- Create and manage organization profile
- Create and manage events
- View event registrations
- Communicate with registered students

### Admin
- Approve new organizations
- Manage all events and organizations
- Access site-wide analytics
- Manage user permissions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
