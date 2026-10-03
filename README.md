# CivicCare — Citizen Grievance Management System

A full-stack web application that provides citizens with a simple, organized, and transparent platform to **register, submit, track, and manage civic grievances online**.

CivicCare allows citizens to report issues related to water supply, roads, garbage, electricity, street lights, drainage, sanitation, public transport, and other civic services.

---

## About the Project

The **Citizen Grievance Management System (CivicCare)** is a full-stack web application designed to digitize the process of reporting and tracking civic complaints.

Instead of depending completely on manual complaint registration, citizens can use the web application to:

- Register and securely log in
- Submit civic grievances online
- Select the relevant service/category
- Select department
- Set grievance priority
- Add detailed descriptions
- Select the grievance location using an interactive map
- Use their current location
- Upload supporting attachments
- Receive a unique grievance tracking number
- Track grievance progress
- View grievance history
- Receive notifications
- Provide feedback after resolution
- Manage their profile
- Access civic service information
- Read FAQs and help information

The main objective is to make the grievance process **simple, organized, transparent, and accessible**.

---

#  Features

##  Citizen Features

###  Authentication

- Citizen Registration
- Citizen Login
- JWT-based authentication
- Password hashing using bcryptjs
- Protected routes
- Secure logout
- Authentication state management
- Profile management

---

## Citizen Dashboard

The dashboard provides an overview of the citizen's grievances.

### Dashboard includes:

- Total grievances
- Pending grievances
- In-progress grievances
- Resolved grievances
- Recent grievances
- Quick "Lodge New Grievance" action
- Quick grievance tracking
- Civic Services Directory
- Service-specific report issue shortcuts
- Municipal helpline information

---

# Submit Grievance

Citizens can submit a complete grievance through a structured form.

### Grievance information includes:

- Grievance title
- Category
- Department
- Priority
- Location / Landmark
- Detailed description
- Photo/document attachments
- Form validation
- Character counter
- Department suggestion
- Submission guidelines

After successful submission, the system generates a unique grievance tracking number.

Example:

```text
GRV-YYYYMMDD-XXXXX
```

---

#  Interactive Map-Based Location Picker

One of the major new features is the **interactive grievance location picker using Leaflet**.

Citizens can specify the exact location of a civic issue directly through the map.

### Map features:

- Interactive Leaflet map
- Click anywhere on the map to select a location
- Draggable location marker
- "Use My Current Location" option
- Browser geolocation support
- Automatic map movement to current location
- Latitude and longitude display
- Confirm selected location
- Location locking after confirmation
- Landmark/location information retained in the grievance

Example location format:

```text
Near Main Gate, Ward 15
[GPS: 28.613900, 77.209000]
```

### Technology used

```text
Leaflet.js
```

The map functionality integrates with the existing grievance submission process without requiring a separate location workflow.

---

#  My Grievances

Citizens can view and manage their submitted grievances.

### Features:

- View all submitted grievances
- Search grievances
- Search by tracking number
- Search by title
- Search by description
- Filter by status
- Filter by category
- Filter by priority
- Filter by date
- Status count chips
- View grievance details
- Track grievance
- Submit feedback

### Date filters

- All Time
- Today
- Last 7 Days
- Last 30 Days

---

#  Grievance Tracking

Citizens can track their grievance using the generated tracking number.

### Tracking stages:

```text
Submitted
     ↓
Under Review
     ↓
Assigned
     ↓
In Progress
     ↓
Resolved
```

The tracking page provides:

- Tracking number
- Current grievance status
- Progress timeline
- Department information
- Assigned officer information when available
- Official remarks
- Chronological status history
- Timestamps
- Grievance details

The system maintains a grievance history so users can understand how their complaint has progressed.

---

#  Notifications

CivicCare includes a notification interface to keep citizens informed about grievance updates.

### Notification categories:

- All
- Unread
- Officer Assignments
- Status Updates
- Resolutions

### Notification features:

- Notification bell
- Unread notification counter
- Notification dropdown
- Read/unread status
- Status update notifications

---

#  Feedback System

Citizens can provide feedback regarding their grievance after resolution.

### Feedback features:

- 5-star rating
- Sentiment selection
- Redressal performance criteria
- Written remarks
- Feedback connected with the grievance discussion

Example rating:

```text
⭐ ⭐ ⭐ ⭐ ⭐
```

The feedback system helps capture the citizen's experience with the grievance resolution process.

---

# Civic Services Directory

CivicCare provides a dedicated directory for common municipal services.

### Current services:

1.  Water Supply
2.  Roads
3. Garbage
4.  Electricity
5.  Street Lights
6.  Drainage
7.  Sanitation
8.  Public Transport
9.  Other

Each service can provide:

- Service description
- Common issues
- Expected SLA information
- Direct report issue action

Selecting a service can automatically populate relevant grievance information.

---

#  Help & FAQ

A dedicated Help & FAQ section helps citizens understand how to use the system.

### Includes:

- 3-step grievance workflow
- Frequently Asked Questions
- Grievance status glossary
- Target SLA information
- Municipal support information
- 24x7 helpline information
- Email support information
- Office hours

---

#  Modern Responsive UI

The frontend was redesigned to provide a more practical and human-designed civic application experience.

The redesign focuses on:

- Clean layout
- Better spacing
- Clear typography
- Simple navigation
- Practical forms
- Responsive components
- Consistent status indicators
- Accessible interface
- Reduced unnecessary visual clutter
- Better mobile experience

The design avoids excessive gradients, unnecessary animations, and overly complicated dashboard layouts.

---

#  Light Mode & Dark Mode

CivicCare now supports both:

-  Light Mode
-  Dark Mode

### Theme features:

- Theme toggle in the navigation bar
- Theme persistence using local storage
- Consistent theme across application pages
- Dark/light styling for forms, cards, navigation, tables and pages
- Theme-aware UI components

The theme is managed through a reusable React Context.

---

#  Navigation

The citizen portal provides navigation to:

```text
Dashboard
Submit Grievance
My Grievances
Track Grievance
Notifications
Civic Services
Feedback
Help & FAQ
My Profile
Logout
```

---

#  System Architecture

CivicCare follows a **three-tier full-stack architecture**.

```text
                    ┌──────────────────────┐
                    │       CITIZEN        │
                    │   Browser / Mobile   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   PRESENTATION LAYER │
                    │                      │
                    │ React.js + Vite      │
                    │ HTML + CSS + JS      │
                    │ React Router         │
                    │ Context API          │
                    │ Leaflet              │
                    └──────────┬───────────┘
                               │
                          REST APIs
                               │
                               ▼
                    ┌──────────────────────┐
                    │   APPLICATION LAYER  │
                    │                      │
                    │ Node.js              │
                    │ Express.js           │
                    │ JWT Authentication   │
                    │ Validation           │
                    │ Business Logic       │
                    └──────────┬───────────┘
                               │
                              SQL
                               │
                               ▼
                    ┌──────────────────────┐
                    │      DATA LAYER      │
                    │                      │
                    │       MySQL          │
                    │                      │
                    │ Users                │
                    │ Departments          │
                    │ Categories           │
                    │ Grievances           │
                    │ Comments             │
                    │ Status History       │
                    └──────────────────────┘
```

---

# Application Flow

```text
Citizen
   │
   ▼
Register / Login
   │
   ▼
Citizen Dashboard
   │
   ▼
Submit Grievance
   │
   ├── Select Service / Category
   ├── Select Department
   ├── Set Priority
   ├── Enter Description
   ├── Select Location
   ├── Upload Supporting Files
   │
   ▼
Grievance Created
   │
   ▼
Unique Tracking Number
   │
   ▼
Track Grievance
   │
   ├── Submitted
   ├── Under Review
   ├── Assigned
   ├── In Progress
   └── Resolved
   │
   ▼
Feedback
```

---

#  Technologies Used

## Frontend

- **React.js** — User interface and reusable components
- **Vite** — Frontend development and build tool
- **JavaScript** — Application logic
- **HTML5** — Page structure
- **CSS3** — Styling and responsive design
- **Axios** — API communication
- **React Router** — Client-side routing
- **Context API** — Global application state
- **Leaflet** — Interactive maps and location selection

---

## Backend

- **Node.js** — JavaScript runtime
- **Express.js** — REST API framework
- **JavaScript** — Backend application logic
- **MySQL2** — MySQL database connectivity
- **JWT** — Authentication
- **bcryptjs** — Password hashing
- **dotenv** — Environment configuration
- **CORS** — Frontend/backend communication

---

## Database

- **MySQL**
- **MySQL2**
- **SQL**

### Main database entities

```text
Users
Departments
Grievance Categories
Grievances
Grievance Status History
Comments
```

---

#  Authentication & Security

The application uses multiple security mechanisms:

- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes
- Authentication middleware
- Backend validation
- Environment variables
- User-specific grievance access
- Secure logout
- CORS configuration

Sensitive configuration such as:

```text
Database password
JWT secret
```

is stored in environment variables and is not committed to GitHub.

---

#  Project Structure

```text
CitizenGrievanceSystem/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── seed/
│   │   ├── utils/
│   │   ├── docs/
│   │   ├── uploads/
│   │   ├── app.js
│   │   └── index.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── context/
│   │   └── pages/
│   │       ├── auth/
│   │       ├── citizen/
│   │       ├── officer/
│   │       ├── admin/
│   │       └── shared/
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

#  Installation & Setup

## Prerequisites

Install the following:

- Node.js
- npm
- MySQL
- Git
- Visual Studio Code

---

#  Clone the Repository

```bash
git clone https://github.com/Khushi-Kumari006/CitizenGrievanceSystem.git
```

Navigate into the project:

```bash
cd CitizenGrievanceSystem
```

---

#  Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

##  Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=citizen_grievance

JWT_SECRET=your_jwt_secret
```

>  Never upload your actual `.env` file or database password to GitHub.

---

#  Initialize Database

Run:

```bash
npm run db:init
```

This creates/verifies the required database and tables.

---

#  Seed Database

Run:

```bash
npm run seed
```

The seed process creates the initial departments and grievance categories.

---

#  Start Backend

Run:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

#  Frontend Setup

Open a second terminal.

From the project root:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

If Vite selects another available port, use the URL displayed in the terminal.

---

# Running the Complete Project

Two terminals should be running.

### Terminal 1 — Backend

```bash
cd CitizenGrievanceSystem/backend
npm run dev
```

### Terminal 2 — Frontend

```bash
cd CitizenGrievanceSystem/frontend
npm run dev
```

Then open the frontend URL shown by Vite.

---

# 🔌 REST API Communication

The frontend communicates with the backend using REST APIs.

```text
┌─────────────────────┐
│    React Frontend   │
└──────────┬──────────┘
           │
           │ HTTP / REST API
           ▼
┌─────────────────────┐
│   Express Backend   │
└──────────┬──────────┘
           │
           │ SQL
           ▼
┌─────────────────────┐
│       MySQL         │
└─────────────────────┘
```

### Main API areas

```text
Authentication
Users
Departments
Categories
Grievances
Comments
Status History
```

---

# 📍 Location Architecture

The location feature works through the following flow:

```text
Citizen
   │
   ▼
Submit Grievance
   │
   ▼
Leaflet Map
   │
   ├── Click Map
   ├── Drag Marker
   └── Use Current Location
   │
   ▼
Latitude + Longitude
   │
   ▼
Confirm Location
   │
   ▼
Existing Grievance Location Field
   │
   ▼
Backend API
   │
   ▼
MySQL
```

The existing grievance location field is used to retain the selected location information without breaking the existing grievance API structure.

---

#  Responsive Design

The application is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile

The layout adapts to different screen sizes while keeping navigation and grievance functionality accessible.

---

#  Project Objectives

The main objectives of CivicCare are:

- Provide citizens with an online grievance submission platform
- Reduce dependency on manual complaint registration
- Make grievance tracking easier
- Centralize grievance information
- Provide location information for civic complaints
- Improve transparency in the grievance process
- Provide organized grievance history
- Allow citizens to provide feedback
- Provide a simple and accessible user interface
- Support responsive web access

---

#  Advantages

- Easy online grievance submission
- Unique grievance tracking numbers
- Transparent grievance tracking
- Interactive location selection
- Current-location support
- Centralized database
- Secure authentication
- Organized grievance history
- Notifications
- Citizen feedback
- Civic services directory
- Help and FAQ section
- Light and dark themes
- Responsive interface
- REST API based architecture

---

#  Testing & Development

The project can be tested using:

- Browser-based testing
- REST API testing
- Postman
- npm build
- npm lint
- Manual feature testing

Frontend build:

```bash
npm run build
```

Frontend lint:

```bash
npm run lint
```

---

#  Current Project Status

## Implemented

### Authentication

- Citizen registration
- Citizen login
- JWT authentication
- Protected routes
- Logout
- Profile management

### Citizen Portal

- Dashboard
- Submit Grievance
- My Grievances
- Track Grievance
- Notifications
- Civic Services
- Feedback
- Help & FAQ
- Profile

### Grievance Management

- Department selection
- Category selection
- Priority selection
- Title and description
- Location/landmark
- Interactive map
- Current location
- Supporting attachments
- Unique tracking number
- Status tracking
- Status history
- Comments
- Feedback

### UI

- Responsive design
- Light mode
- Dark mode
- Theme persistence
- Reusable components
- Improved navigation
- Practical civic-tech interface

---

#  Future Enhancements

The following features can be added in future versions:

- Officer Dashboard
- Administrator Dashboard
- Automatic grievance assignment
- Advanced analytics
- Grievance statistics and charts
- Email notifications
- SMS notifications
- Real-time notifications
- QR code based grievance tracking
- Downloadable grievance receipt/PDF
- AI-based grievance classification
- AI citizen support chatbot
- Multilingual support
- Public grievance statistics
- Advanced map-based grievance analytics
- Mobile application

---

#  Learning Outcomes

Through this project, the following concepts were implemented and practiced:

- Full-Stack Web Development
- React.js
- Vite
- JavaScript
- Node.js
- Express.js
- REST APIs
- MySQL
- SQL
- JWT Authentication
- Password Hashing
- CRUD Operations
- API Integration
- Frontend-Backend Integration
- Database Connectivity
- React Router
- Context API
- Responsive Web Design
- Leaflet Maps
- Browser Geolocation
- Git
- GitHub
- Environment Variables

---

# Development Tools

- **Visual Studio Code** — Development environment
- **Git** — Version control
- **GitHub** — Source code hosting
- **MySQL** — Database
- **Postman** — API testing
- **Node.js / npm** — Runtime and package management
- **Google Antigravity** — Development assistance

---

#  Author

**Khushi Kumari**

B.Tech Computer Science and Engineering

---

#  Project Repository

GitHub:

https://github.com/Khushi-Kumari006/CitizenGrievanceSystem

---

#  License

This project is developed for **educational and academic purposes**.
