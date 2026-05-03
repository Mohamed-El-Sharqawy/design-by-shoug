ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP(3);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_purpose VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_attempts INT NOT NULL DEFAULT 0;

-- Mark all existing users as verified (they registered before verification existed)
UPDATE users SET email_verified = true WHERE email_verified = false;
