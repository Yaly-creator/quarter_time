-- Create reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    reserved_date DATE NOT NULL,
    reserved_time TIME NOT NULL,
    reserved_at TIMESTAMPTZ NOT NULL,
    guests INTEGER NOT NULL CHECK (guests >= 1 AND guests <= 30),
    event_type TEXT DEFAULT 'standard',
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reserved_date);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON public.reservations(customer_email);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow INSERT for service role (used by Edge Function)
CREATE POLICY "Allow service role to insert reservations"
    ON public.reservations
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Create policy to allow service role to SELECT all reservations
CREATE POLICY "Allow service role to select reservations"
    ON public.reservations
    FOR SELECT
    TO service_role
    USING (true);

-- Create policy to allow authenticated users to view their own reservations
CREATE POLICY "Allow users to view their own reservations"
    ON public.reservations
    FOR SELECT
    TO authenticated
    USING (customer_email = auth.jwt() ->> 'email');

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
