-- Create licenses table
CREATE TABLE public.licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'expired', 'revoked')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_devices INTEGER DEFAULT 3,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create device registrations table
CREATE TABLE public.device_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  ip_address TEXT,
  last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(license_id, device_fingerprint)
);

-- Create license audit log
CREATE TABLE public.license_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own licenses"
  ON public.licenses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own devices"
  ON public.device_registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.licenses 
      WHERE licenses.id = device_registrations.license_id 
      AND licenses.user_id = auth.uid()
    )
  );

-- Create functions
CREATE OR REPLACE FUNCTION generate_license_key()
RETURNS TEXT AS $$
DECLARE
  key TEXT;
  unique_key BOOLEAN := FALSE;
BEGIN
  WHILE NOT unique_key LOOP
    -- Generate a random 16 character key
    key := UPPER(
      SUBSTRING(
        encode(gen_random_bytes(12), 'hex') 
        FROM 1 FOR 4
      ) || '-' ||
      SUBSTRING(
        encode(gen_random_bytes(12), 'hex') 
        FROM 5 FOR 4
      ) || '-' ||
      SUBSTRING(
        encode(gen_random_bytes(12), 'hex') 
        FROM 9 FOR 4
      ) || '-' ||
      SUBSTRING(
        encode(gen_random_bytes(12), 'hex') 
        FROM 13 FOR 4
      )
    );
    
    -- Check if key already exists
    IF NOT EXISTS (SELECT 1 FROM public.licenses WHERE license_key = key) THEN
      unique_key := TRUE;
    END IF;
  END LOOP;
  
  RETURN key;
END;
$$ LANGUAGE plpgsql VOLATILE;
