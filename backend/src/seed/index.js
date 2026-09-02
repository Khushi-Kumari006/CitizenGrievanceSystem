const { pool } = require('../config/database');
const Department = require('../models/Department');
const GrievanceCategory = require('../models/GrievanceCategory');
require('dotenv').config();

const INITIAL_DEPARTMENTS = [
  { name: 'Water Department', description: 'Handles water supply, pipeline issues, and water quality.' },
  { name: 'Road Department', description: 'Handles road maintenance, potholes, and street infrastructure.' },
  { name: 'Sanitation Department', description: 'Handles garbage collection, waste management, and public cleanliness.' },
  { name: 'Electricity Department', description: 'Handles power outages, electrical maintenance, and safety.' },
  { name: 'Public Transport Department', description: 'Handles buses, public transit routes, and transit stops.' },
];

const INITIAL_CATEGORIES = [
  { name: 'Water Supply', description: 'Issues related to municipal water supply and leakage.' },
  { name: 'Roads', description: 'Potholes, damaged roads, and pathway issues.' },
  { name: 'Garbage', description: 'Uncollected garbage, overflowing bins, and dump sites.' },
  { name: 'Electricity', description: 'Power failures, hanging wires, and transformer faults.' },
  { name: 'Street Lights', description: 'Faulty or broken street lighting.' },
  { name: 'Drainage', description: 'Blocked drains, overflowing sewage, and waterlogging.' },
  { name: 'Sanitation', description: 'Public toilets, hygiene, and pest control.' },
  { name: 'Public Transport', description: 'Bus delays, route concerns, and public transit facilities.' },
  { name: 'Other', description: 'Miscellaneous civic grievances.' },
];

async function seedDatabase() {
  console.log('Starting database seeding...');
  try {
    // Seed Departments (avoid duplicates)
    for (const dept of INITIAL_DEPARTMENTS) {
      const existing = await Department.findByName(dept.name);
      if (!existing) {
        await Department.create(dept);
        console.log(`+ Department seeded: ${dept.name}`);
      } else {
        console.log(`~ Department already exists: ${dept.name}`);
      }
    }

    // Seed Grievance Categories (avoid duplicates)
    for (const cat of INITIAL_CATEGORIES) {
      const existing = await GrievanceCategory.findByName(cat.name);
      if (!existing) {
        await GrievanceCategory.create(cat);
        console.log(`+ Category seeded: ${cat.name}`);
      } else {
        console.log(`~ Category already exists: ${cat.name}`);
      }
    }

    console.log('Database seeding finished successfully.');
  } catch (error) {
    console.error('Database seeding error:', error.message);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed process completed.');
      pool.end();
      process.exit(0);
    })
    .catch(() => {
      pool.end();
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  INITIAL_DEPARTMENTS,
  INITIAL_CATEGORIES,
};
