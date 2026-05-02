-- Add is_active column to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Insert admin user (password is 'admin123' hashed with SHA-256)
INSERT INTO users (name, email, hashed_password, role, is_active) 
VALUES ('Admin User', 'admin@eduhub.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;