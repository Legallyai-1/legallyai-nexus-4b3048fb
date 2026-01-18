-- Create webhook_logs table to store deployment events
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payload JSONB NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),  -- When webhook was received
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()    -- When record was created in DB
);

-- Add index for faster queries
CREATE INDEX idx_webhook_logs_received_at ON public.webhook_logs(received_at DESC);
CREATE INDEX idx_webhook_logs_source ON public.webhook_logs(source);

-- Enable Row Level Security
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read
CREATE POLICY "Authenticated users can read webhook logs"
    ON public.webhook_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for service role to insert
CREATE POLICY "Service role can insert webhook logs"
    ON public.webhook_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);
