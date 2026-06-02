-- Smart CRM - Client Lead Management System MySQL Schema
-- Generated: 2026-06-02

CREATE DATABASE IF NOT EXISTS smart_crm;
USE smart_crm;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Pending', 'Inactive') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sessions Table (for database-persisted session-based authentication)
CREATE TABLE IF NOT EXISTS sessions (
    token VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CREATE INDEXES for faster lookups
CREATE INDEX idx_clients_user ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_sessions_token ON sessions(token);

-- SEED DATA
-- Default Admin User (Password is 'Admin123', SHA-256 hash stored here)
INSERT INTO users (id, full_name, email, password_hash, created_at)
VALUES (
    'admin-user-id',
    'CRM Manager',
    'demo@smartcrm.com',
    '25f38a531cfd2bf3e83b4b574268e82103f678ed703c3702a0a2df3ebb26c36f', -- Hash of 'Admin123'
    NOW()
) ON DUPLICATE KEY UPDATE id=id;

-- Seed Client Leads
INSERT INTO clients (id, user_id, full_name, email, phone, company_name, status, created_at)
VALUES 
('c1', 'admin-user-id', 'Sarah Connor', 'sarah.connor@cyberdyne.com', '+1 (555) 019-2834', 'Cyberdyne Systems', 'Active', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('c2', 'admin-user-id', 'Tony Stark', 'tony@starkindustries.com', '+1 (555) 382-9102', 'Stark Industries', 'Active', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('c3', 'admin-user-id', 'Bruce Wayne', 'bruce@wayneenterprises.com', '+1 (555) 728-1192', 'Wayne Enterprises', 'Pending', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
('c4', 'admin-user-id', 'Peter Parker', 'peter.parker@dailybugle.com', '+1 (555) 918-2039', 'Daily Bugle', 'Inactive', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('c5', 'admin-user-id', 'Diana Prince', 'diana.prince@themysis.org', '+1 (555) 867-5309', 'Themysis Exhibits', 'Pending', DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE id=id;
