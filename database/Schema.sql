-- ============================================
-- Fleet Management System - Database Schema
-- Version: 1.0
-- Created: 2026-02-01
-- Description: Complete database schema for fleet management
-- ============================================

-- ============================================
-- DATABASE CREATION
-- ============================================
-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FleetManagementDB')
BEGIN
    CREATE DATABASE FleetManagementDB
END
GO

USE FleetManagementDB;
GO

-- ============================================
-- TABLE: Roles
-- ============================================
CREATE TABLE Roles (
    role_id INT PRIMARY KEY IDENTITY(1,1),
    role_name NVARCHAR(50) UNIQUE NOT NULL,
    display_name NVARCHAR(50) NULL,  
    description NVARCHAR(255) NULL,
    created_at DATETIME DEFAULT GETDATE() NOT NULL
);
GO

-- Index for role lookups
CREATE INDEX idx_roles_name ON Roles(role_name);
GO

-- ============================================
-- TABLE: Users
-- ============================================
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1, 1),

    -- Authentication
    username NVARCHAR(50) UNIQUE NOT NULL,
    email NVARCHAR(100) UNIQUE ,  
    password_hash NVARCHAR(255) NOT NULL,

    -- Personal Info
    first_name NVARCHAR(50) NULL,
    last_name NVARCHAR(50) NULL,
    phone NVARCHAR(20) NULL,  

    -- Role
    role_id INT NOT NULL,

    -- Account Status
    is_active BIT DEFAULT 1 NOT NULL,

    -- Timestamps
    created_at DATETIME DEFAULT GETDATE() NOT NULL,
    updated_at DATETIME DEFAULT GETDATE() NOT NULL,
    deleted_at DATETIME NULL,
    
    -- Audit
    created_by INT NULL,
    updated_by INT NULL,

    -- Foreign Keys
    CONSTRAINT FK_Users_Role FOREIGN KEY (role_id) REFERENCES Roles(role_id),
    CONSTRAINT FK_Users_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(user_id),
    CONSTRAINT FK_Users_UpdatedBy FOREIGN KEY (updated_by) REFERENCES Users(user_id)
);
GO

-- Indexes
CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_users_role_id ON Users(role_id);
CREATE INDEX idx_users_is_active ON Users(is_active);
CREATE INDEX idx_users_deleted_at ON Users(deleted_at);  
GO

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE TRIGGER trg_Users_UpdatedAt
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users
    SET updated_at = GETDATE()
    FROM Users u
    INNER JOIN inserted i ON u.user_id = i.user_id;
END;
GO