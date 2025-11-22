-- Custom SQL migration file, put your code below! --

-- Seed an initial admin user and a local account with password

-- Insert provided user
INSERT INTO "user" (
    id, name, email, email_verified, image, created_at, updated_at, admin
) VALUES (
    'ksvRFWystegfkOsHCEzKhaxRWtAYGrn0',
    'admin2',
    'admin2@gmail.com',
    0,
    NULL,
    1763744855,
    1763744855,
    1
);