-- Migration: Add email field to contacts table
-- Created: 2024-02-25
-- Description: Adds optional email field to contacts table with validation

-- Add email column to contacts table
ALTER TABLE contacts
ADD COLUMN email VARCHAR(255) DEFAULT NULL
AFTER phone;

-- Create index on email for faster lookups
CREATE INDEX idx_contacts_email ON contacts(email);

-- Add comment to document the column
ALTER TABLE contacts
MODIFY COLUMN email VARCHAR(255)
COMMENT 'Optional email address of the contact';
