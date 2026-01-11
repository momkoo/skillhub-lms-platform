-- Add merchant_uid column to skillhub_payments table
ALTER TABLE skillhub_payments 
ADD COLUMN IF NOT EXISTS merchant_uid VARCHAR(255) UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_skillhub_payments_merchant_uid ON skillhub_payments(merchant_uid);

-- Update status column to be standardized if needed
ALTER TABLE skillhub_payments 
ALTER COLUMN status SET DEFAULT 'pending';
