#  Citizen Grievance Management System

##  About the Project

The **Citizen Grievance Management System** is a full-stack web application that provides citizens with an online platform to register, submit, and track their grievances.

The system allows citizens to submit complaints by selecting the appropriate department and category, entering a grievance title and description, and tracking the status of their submitted grievances.

The main goal of this project is to make the grievance submission and tracking process simple, organized, transparent, and accessible through a web application.

---

##  Features

###  Citizen Features

- Citizen Registration
- Citizen Login
- Secure Authentication
- Citizen Dashboard
- Submit Grievance
- Select Department
- Select Grievance Category
- Add Grievance Title
- Add Grievance Description
- View Submitted Grievances
- View Grievance Details
- Track Grievance Status
- View Grievance Status History
- Add Comments
- View Profile
- Update Profile
- Logout

---

##  Grievance Process

The basic grievance process is:

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
   ├── Select Department
   ├── Select Category
   ├── Enter Title
   └── Enter Description
   │
   ▼
Grievance Submitted
   │
   ▼
Track Grievance
   │
   ▼
View Status & Status History
```

---

##  Grievance Status

A grievance can move through different stages:

```text
Submitted
    ↓
In Progress
    ↓
Resolved
```

The system maintains the status history of grievances so that citizens can track the progress of their complaints.

---

#  Technologies Used

##  Frontend Technologies

The frontend of the application is developed using:

- **React.js** – Used to build the user interface and reusable components.
- **Vite** – Used as the frontend development and build tool.
- **JavaScript** – Used for application logic and functionality.
- **HTML5** – Used for structuring the web pages.
- **CSS3** – Used for styling and responsive design.
- **Axios** – Used for making API requests between frontend and backend.
- **React Router** – Used for navigation between different pages.
- **Context API** – Used for managing application-wide state such as authentication.
- **Responsive Design** – Used to make the application accessible on different screen sizes.

### Frontend Responsibilities

- User registration and login interface
- Citizen dashboard
- Grievance submission form
- Department selection
- Category selection
- Grievance listing
- Grievance details
- Grievance status tracking
- Status history display
- Comments interface
- Profile management
- Navigation and routing
- API communication with backend

---

##  Backend Technologies

The backend of the application is developed using:

- **Node.js** – JavaScript runtime environment for the server.
- **Express.js** – Framework used to build the REST APIs.
- **JavaScript** – Used for backend application logic.
- **MySQL2** – Used to connect the Node.js application with MySQL.
- **JWT (JSON Web Token)** – Used for secure user authentication.
- **bcryptjs** – Used for password hashing.
- **dotenv** – Used to manage environment variables.
- **CORS** – Used to handle communication between frontend and backend.

### Backend Responsibilities

- User authentication
- User registration
- Login verification
- Password hashing
- JWT token generation
- Protected API routes
- Grievance creation
- Grievance retrieval
- Grievance status management
- Department management
- Category management
- Comments management
- Status history management
- Database communication
- Error handling
- Input validation

---

##  Database

The project uses **MySQL** as the relational database.

### Database Technologies

- **MySQL**
- **MySQL2**
- **SQL**

### Main Database Entities

- Users
- Departments
- Grievance Categories
- Grievances
- Grievance Status History
- Comments

The database stores citizen information, grievance details, departments, categories, comments, and grievance status history.

---

##  Authentication & Security

The application uses several security mechanisms:

- JWT-based authentication
- Password hashing using bcryptjs
- Protected API routes
- Environment variables for sensitive configuration
- User-specific grievance access
- Backend validation
- Authentication middleware
- Secure logout

Sensitive information such as database passwords and JWT secrets is stored in environment variables and is not uploaded to GitHub.

---

#  Project Structure

```text
CitizenGrievanceSystem/
│
├── backend/
│   │
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
│   │
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
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

#  Application Architecture

```text
┌───────────────────────┐
│       Citizen         │
│       Browser         │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│    React.js + Vite    │
│       Frontend        │
└───────────┬───────────┘
            │
            │ REST API
            ▼
┌───────────────────────┐
│   Node.js + Express   │
│       Backend         │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│        MySQL          │
│       Database        │
└───────────────────────┘
```

---

#  Installation and Setup

##  Prerequisites

Make sure the following software is installed:

- Node.js
- npm
- MySQL
- Git
- Visual Studio Code

---

##  Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Khushi-Kumari006/CitizenGrievanceSystem.git
```

### 2. Navigate to the Project

```bash
cd CitizenGrievanceSystem
```

### 3. Navigate to Backend

```bash
cd backend
```

### 4. Install Backend Dependencies

```bash
npm install
```

### 5. Configure Environment Variables

Create a `.env` file inside the `backend` folder.

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

> **Important:** Never upload your actual `.env` file or database password to GitHub.

### 6. Initialize the Database

```bash
npm run db:init
```

### 7. Seed the Database

```bash
npm run seed
```

### 8. Start the Backend

```bash
npm run dev
```

Backend server:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

#  Frontend Setup

Open a **new terminal**.

### 1. Navigate to Frontend

```bash
cd CitizenGrievanceSystem/frontend
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Start the Frontend

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

---

#  Running the Project

The backend and frontend should be running at the same time.

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

Then open the frontend URL displayed by Vite in your browser.

---

#  API Communication

The frontend communicates with the backend through REST APIs.

```text
React Frontend
      │
      │ HTTP Requests
      ▼
Express REST API
      │
      ▼
MySQL Database
```

The backend provides APIs for:

- Authentication
- Users
- Departments
- Categories
- Grievances
- Comments
- Grievance Status
- Status History

---

#  Responsive Design

The application is designed to work on different screen sizes:

-  Desktop
-  Laptop
-  Mobile
-  Tablet

The user interface is designed to provide a simple and accessible experience across devices.

---

#  Project Objectives

The main objectives of the project are:

- Provide an online platform for citizens to submit grievances.
- Reduce dependency on manual grievance registration.
- Make grievance tracking easier.
- Maintain grievance information in a centralized database.
- Provide a simple and user-friendly interface.
- Improve transparency in the grievance process.
- Provide citizens with an organized way to monitor their complaints.

---

#  Advantages

- Easy online grievance submission
- Centralized grievance information
- Faster access to grievance details
- Transparent grievance tracking
- Secure authentication
- Organized database management
- User-friendly interface
- Accessible through web browsers
- Responsive design

---

#  Future Enhancements

The following features can be added in future versions:

- Officer Dashboard
- Administrator Dashboard
- Grievance Assignment
- Email Notifications
- SMS Notifications
- File and Image Attachments
- Advanced Search and Filtering
- Grievance Priority Management
- Analytics and Reports
- Citizen Feedback and Rating System
- FAQ and Help Center
- Mobile Application

---

#  Project Status

### Current Version

The current version focuses on the **Citizen Portal**.

### Implemented Features

- Citizen Registration
- Citizen Login
- Secure Authentication
- Citizen Dashboard
- Grievance Submission
- Department Selection
- Category Selection
- Grievance Tracking
- Grievance Status History
- Comments
- Profile Management
- Logout

### Future Features

Officer and Administrator functionality can be added in future versions.

---

#  Learning Outcomes

Through this project, the following concepts were implemented and understood:

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
- Git
- GitHub
- Environment Variables
- Responsive Web Design

---

#  Development Tools

The project was developed using:

- **Visual Studio Code** – Code editor
- **Git** – Version control
- **GitHub** – Source code hosting
- **MySQL** – Database
- **Postman** – API testing
- **Node.js / npm** – Backend runtime and package management

---

#  Future Scope

The system can be expanded into a complete digital grievance management platform by adding:

- Officer and administrator portals
- Automatic grievance assignment
- Real-time notifications
- Email and SMS updates
- Advanced grievance analytics
- Location-based grievance management
- Priority-based grievance handling
- Mobile application
- Public grievance statistics
- Citizen feedback system

---

#  Author

**Khushi Kumari**

B.Tech Computer Science and Engineering

---

#  License

This project is developed for **educational and academic purposes**.
