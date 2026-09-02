# Citizen Grievance System - Backend Documentation

## 1. Database Setup

### Create MySQL Database
Run the following SQL command in your MySQL client (CLI, MySQL Workbench, or phpMyAdmin):

```sql
CREATE DATABASE IF NOT EXISTS citizen_grievance
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Configure Credentials
Update `backend/.env` with your local MySQL credentials:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=citizen_grievance
```

### Initialize Database Tables
To create all tables without dropping any existing tables or data:

```bash
npm run db:init
```

### Seed Initial Categories and Departments
To populate the initial civic departments and grievance categories:

```bash
npm run seed
```

---

## 2. Running the Backend

### Install Dependencies
```bash
npm install
```

### Development Mode (with nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

---

## 3. Testing Health Endpoint

```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Citizen Grievance Backend is running"
}
```
