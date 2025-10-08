# To-Do List Application

A feature-rich To-Do List application with database support, customizable backgrounds, and comprehensive task management.

## Features

- ✅ **Task Management**: Add, edit, delete, and organize tasks by urgency levels
- 🎨 **Custom Backgrounds**: Choose from 5 color themes or upload your own image
- 📅 **Due Date Tracking**: Visual indicators for overdue and upcoming tasks
- 💾 **Database Storage**: Persistent storage using SQLite database instead of localStorage
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Edit Mode**: Easy task editing through modal interfaces

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6
- **Backend**: Node.js + Express
- **Database**: SQLite
- **APIs**: RESTful API for task and settings management

## Installation and Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### 3. Access the Application
Open your browser and go to: `http://localhost:3000`

## Database Structure

### Tasks Table
- `id`: Auto-incrementing primary key
- `title`: Task title
- `description`: Task description
- `urgency`: Priority level (high, medium, low)
- `due_date`: Task deadline
- `created_at`: Creation timestamp
- `updated_at`: Last modification timestamp

### Settings Table
- `id`: Auto-incrementing primary key
- `setting_key`: Setting identifier (backgroundColor, backgroundImage)
- `setting_value`: Setting value
- `updated_at`: Last modification timestamp

## API Endpoints

### Tasks
- `GET /api/tasks` - Retrieve all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a specific task
- `DELETE /api/tasks/:id` - Delete a specific task

### Settings
- `GET /api/settings/:key` - Get a setting value
- `POST /api/settings` - Save a setting
- `DELETE /api/settings/:key` - Delete a setting

## File Structure

```
To_Do_List/
├── server.js              # Express server with API endpoints
├── script_database.js     # Frontend JavaScript with database integration
├── script.js             # Original localStorage version (backup)
├── index.html            # Main HTML structure
├── style.css             # Application styling
├── package.json          # Node.js dependencies and scripts
├── todos.db              # SQLite database (created automatically)
└── README.md             # This file
```

## Migration from localStorage

The application automatically migrates from localStorage to database storage. Your previous tasks and settings will be preserved during the transition.

## Development Notes

- The SQLite database file (`todos.db`) is created automatically on first run
- CORS is enabled for development purposes
- The server serves static files from the project directory
- Background images are stored as base64 strings in the database

## Color Themes

Available background colors:
- 🔵 Blue (#4285f4)
- 🟢 Green (#34a853)
- 🩷 Pink (#ff69b4)
- 🟠 Orange (#ffa500) - Default
- 🤎 Brown (#8b4513)

## Task Urgency Levels

Tasks are organized by urgency with visual indicators:
- **High Urgency**: Red background
- **Medium Urgency**: Yellow background
- **Low Urgency**: Green background

Due date color coding:
- 🔴 **Red**: Overdue tasks (displayed in uppercase)
- 🟠 **Orange**: Due within 2 days
- 🟢 **Green**: Normal deadline
