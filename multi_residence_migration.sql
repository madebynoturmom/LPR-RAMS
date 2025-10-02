-- Multi-Residence Database Schema Migration
-- This script adds multi-residence support to the existing LPR system

-- 1. Create the residence table (master table for all residences)
CREATE TABLE residence (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    timezone TEXT DEFAULT 'UTC',
    settings JSONB DEFAULT '{}',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active'
);

-- 2. Create residence_admin table (super admins who can manage multiple residences)
CREATE TABLE residence_admin (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    profile_pic TEXT,
    is_super_admin BOOLEAN DEFAULT FALSE,
    residence_id TEXT REFERENCES residence(id) ON DELETE CASCADE, -- Each admin manages only ONE residence
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 3. Remove residence_admin_access table (not needed since each admin manages only one residence)
-- This table is removed from the original design

-- 4. Create residence_settings table for residence-specific configurations
CREATE TABLE residence_settings (
    id TEXT PRIMARY KEY,
    residence_id TEXT NOT NULL REFERENCES residence(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value JSONB,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(residence_id, setting_key)
);

-- 5. Add residence_id to existing tables

-- Update admin table to add residence_id (local admins)
ALTER TABLE admin ADD COLUMN residence_id TEXT REFERENCES residence(id) ON DELETE CASCADE;
ALTER TABLE admin ADD COLUMN created_at INTEGER;
ALTER TABLE admin ADD COLUMN updated_at INTEGER;

-- Update user table
ALTER TABLE "user" ADD COLUMN residence_id TEXT REFERENCES residence(id) ON DELETE CASCADE;
ALTER TABLE "user" ADD COLUMN unit_number TEXT; -- Apartment/unit number
ALTER TABLE "user" ADD COLUMN created_at INTEGER;
ALTER TABLE "user" ADD COLUMN updated_at INTEGER;

-- Update guard table
ALTER TABLE guard ADD COLUMN residence_id TEXT REFERENCES residence(id) ON DELETE CASCADE;
ALTER TABLE guard ADD COLUMN shift_start_time TEXT; -- e.g., "08:00"
ALTER TABLE guard ADD COLUMN shift_end_time TEXT;   -- e.g., "20:00"
ALTER TABLE guard ADD COLUMN created_at INTEGER;
ALTER TABLE guard ADD COLUMN updated_at INTEGER;

-- Update vehicle table
ALTER TABLE vehicle ADD COLUMN residence_id TEXT REFERENCES residence(id) ON DELETE CASCADE;
ALTER TABLE vehicle ADD COLUMN vehicle_type TEXT DEFAULT 'car'; -- car, motorcycle, truck
ALTER TABLE vehicle ADD COLUMN color TEXT;
ALTER TABLE vehicle ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE vehicle ADD COLUMN created_at INTEGER;
ALTER TABLE vehicle ADD COLUMN updated_at INTEGER;

-- Update guest_pass table
ALTER TABLE guest_pass ADD COLUMN residence_id TEXT REFERENCES residence(id) ON DELETE CASCADE;
ALTER TABLE guest_pass ADD COLUMN approved_by TEXT; -- guard/admin who approved
ALTER TABLE guest_pass ADD COLUMN entry_gate TEXT; -- which gate they entered
ALTER TABLE guest_pass ADD COLUMN notes TEXT;
ALTER TABLE guest_pass ADD COLUMN created_at INTEGER;

-- Update guest_pass_history table
ALTER TABLE guest_pass_history ADD COLUMN residence_id TEXT REFERENCES residence(id) ON DELETE CASCADE;
ALTER TABLE guest_pass_history ADD COLUMN approved_by TEXT;
ALTER TABLE guest_pass_history ADD COLUMN entry_gate TEXT;
ALTER TABLE guest_pass_history ADD COLUMN exit_gate TEXT;
ALTER TABLE guest_pass_history ADD COLUMN notes TEXT;
ALTER TABLE guest_pass_history ADD COLUMN created_at INTEGER;

-- Update event_log table
ALTER TABLE event_log ADD COLUMN residence_id TEXT REFERENCES residence(id) ON DELETE CASCADE;
ALTER TABLE event_log ADD COLUMN ip_address TEXT;
ALTER TABLE event_log ADD COLUMN user_agent TEXT;

-- Update session table to track residence context
ALTER TABLE session ADD COLUMN residence_id TEXT REFERENCES residence(id) ON DELETE CASCADE;

-- 6. Create indexes for better performance
CREATE INDEX idx_residence_admin_residence_id ON residence_admin(residence_id);
CREATE INDEX idx_residence_settings_residence_id ON residence_settings(residence_id);
CREATE INDEX idx_admin_residence_id ON admin(residence_id);
CREATE INDEX idx_user_residence_id ON "user"(residence_id);
CREATE INDEX idx_guard_residence_id ON guard(residence_id);
CREATE INDEX idx_vehicle_residence_id ON vehicle(residence_id);
CREATE INDEX idx_guest_pass_residence_id ON guest_pass(residence_id);
CREATE INDEX idx_guest_pass_history_residence_id ON guest_pass_history(residence_id);
CREATE INDEX idx_event_log_residence_id ON event_log(residence_id);
CREATE INDEX idx_session_residence_id ON session(residence_id);

-- 7. Insert sample residence data
INSERT INTO residence (id, name, address, phone, email, created_at, updated_at) VALUES 
('res_001', 'Sunrise Residences', '123 Main Street, City Center', '+1234567890', 'admin@sunrise.com', extract(epoch from now()), extract(epoch from now())),
('res_002', 'Green Valley Apartments', '456 Oak Avenue, Suburb', '+1234567891', 'admin@greenvalley.com', extract(epoch from now()), extract(epoch from now()));

-- 8. Create sample residence admins (each manages one residence)
INSERT INTO residence_admin (id, username, password_hash, name, email, residence_id, is_super_admin, created_at, updated_at) VALUES
('radm_001', 'admin_sunrise', '$2a$12$hash_here', 'Sunrise Administrator', 'admin@sunrise.com', 'res_001', FALSE, extract(epoch from now()), extract(epoch from now())),
('radm_002', 'admin_greenvalley', '$2a$12$hash_here', 'Green Valley Administrator', 'admin@greenvalley.com', 'res_002', FALSE, extract(epoch from now()), extract(epoch from now())),
('radm_super', 'superadmin', '$2a$12$hash_here', 'Super Administrator', 'super@lpr.com', NULL, TRUE, extract(epoch from now()), extract(epoch from now()));