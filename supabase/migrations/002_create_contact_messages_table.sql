-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_date ON public.contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(customer_email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow INSERT for service role (used by Edge Function)
CREATE POLICY "Allow service role to insert contact messages"
    ON public.contact_messages
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Create policy to allow service role to SELECT all contact messages
CREATE POLICY "Allow service role to select contact messages"
    ON public.contact_messages
    FOR SELECT
    TO service_role
    USING (true);

-- Create policy to allow authenticated users to view their own messages
CREATE POLICY "Allow users to view their own contact messages"
    ON public.contact_messages
    FOR SELECT
    TO authenticated
    USING (customer_email = auth.jwt() ->> 'email');

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_messages_updated_at();
