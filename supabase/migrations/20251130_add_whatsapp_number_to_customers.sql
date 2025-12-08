-- Add whatsapp_number column to customers table

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

-- Add comment
COMMENT ON COLUMN customers.whatsapp_number IS 'Additional WhatsApp number for customer communication';
