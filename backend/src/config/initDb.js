const mysql = require('mysql2/promise');
require('dotenv').config();

const createTablesSQL = [
  // 1. departments
  `CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_departments_active (active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 2. grievance_categories
  `CREATE TABLE IF NOT EXISTS grievance_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categories_active (active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 3. users
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    role ENUM('CITIZEN', 'OFFICER', 'ADMIN') NOT NULL DEFAULT 'CITIZEN',
    department_id INT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department
      FOREIGN KEY (department_id) REFERENCES departments(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_department_id (department_id),
    INDEX idx_users_active (active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 4. grievances
  `CREATE TABLE IF NOT EXISTS grievances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_number VARCHAR(50) NOT NULL UNIQUE,
    citizen_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    department_id INT NOT NULL,
    assigned_officer_id INT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED') NOT NULL DEFAULT 'SUBMITTED',
    location VARCHAR(255) NULL,
    attachment_path VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_grievances_citizen
      FOREIGN KEY (citizen_id) REFERENCES users(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    CONSTRAINT fk_grievances_category
      FOREIGN KEY (category_id) REFERENCES grievance_categories(id)
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
    CONSTRAINT fk_grievances_department
      FOREIGN KEY (department_id) REFERENCES departments(id)
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
    CONSTRAINT fk_grievances_assigned_officer
      FOREIGN KEY (assigned_officer_id) REFERENCES users(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE,
    INDEX idx_grievances_grievance_number (grievance_number),
    INDEX idx_grievances_citizen_id (citizen_id),
    INDEX idx_grievances_category_id (category_id),
    INDEX idx_grievances_department_id (department_id),
    INDEX idx_grievances_assigned_officer_id (assigned_officer_id),
    INDEX idx_grievances_status (status),
    INDEX idx_grievances_priority (priority),
    INDEX idx_grievances_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 5. grievance_status_history
  `CREATE TABLE IF NOT EXISTS grievance_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by INT NOT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_grievance
      FOREIGN KEY (grievance_id) REFERENCES grievances(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    CONSTRAINT fk_history_changed_by
      FOREIGN KEY (changed_by) REFERENCES users(id)
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
    INDEX idx_history_grievance_id (grievance_id),
    INDEX idx_history_changed_by (changed_by)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 6. comments
  `CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_grievance
      FOREIGN KEY (grievance_id) REFERENCES grievances(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    CONSTRAINT fk_comments_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    INDEX idx_comments_grievance_id (grievance_id),
    INDEX idx_comments_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
];

async function initializeDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'citizen_grievance';

  console.log(`Connecting to MySQL server at ${host}:${port}...`);
  let connection;

  try {
    // Connect without specifying database to create database if not exists
    connection = await mysql.createConnection({ host, port, user, password });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`Database '${database}' verified/created successfully.`);

    await connection.changeUser({ database });

    for (const sql of createTablesSQL) {
      await connection.query(sql);
    }
    console.log('All database tables verified/created successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed.');
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = {
  initializeDatabase,
};
