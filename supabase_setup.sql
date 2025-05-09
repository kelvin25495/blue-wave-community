
-- NOTE: This file is for reference only. Run these statements in your Supabase SQL editor.

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE,
    username TEXT,
    is_admin BOOLEAN DEFAULT false,
    PRIMARY KEY (id)
);

-- Create RLS policies for the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create sermons table if it doesn't exist
CREATE TABLE IF NOT EXISTS sermons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image_url TEXT,
    created_by UUID REFERENCES auth.users(id)
);

-- Create RLS policies for the sermons table
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sermons are viewable by everyone" 
ON sermons FOR SELECT 
USING (true);

CREATE POLICY "Sermons can be created by admins" 
ON sermons FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

CREATE POLICY "Sermons can be updated by admins" 
ON sermons FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

CREATE POLICY "Sermons can be deleted by admins" 
ON sermons FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

-- Create photos table if it doesn't exist
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create RLS policies for the photos table
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos are viewable by everyone" 
ON photos FOR SELECT 
USING (true);

CREATE POLICY "Photos can be created by admins" 
ON photos FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

CREATE POLICY "Photos can be updated by admins" 
ON photos FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

CREATE POLICY "Photos can be deleted by admins" 
ON photos FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

-- Create members table if it doesn't exist
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contributions table if it doesn't exist
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create view for members with their total contributions
CREATE OR REPLACE VIEW members_with_contributions AS
SELECT 
    m.id,
    m.name,
    m.email,
    COALESCE(SUM(c.amount), 0) as total_contribution
FROM 
    members m
LEFT JOIN 
    contributions c ON m.id = c.member_id
GROUP BY 
    m.id, m.name, m.email;

-- Create RLS policies for members and contributions
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Only admins can access and modify members and contributions
CREATE POLICY "Members can be accessed by admins" 
ON members FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

CREATE POLICY "Contributions can be accessed by admins" 
ON contributions FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

-- Create login_sessions table to track admin logins
CREATE TABLE IF NOT EXISTS login_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE
);

ALTER TABLE login_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Login sessions can be created by anyone" 
ON login_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Login sessions can be viewed by admins" 
ON login_sessions FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

-- Create trigger to set admin status for specified email
CREATE OR REPLACE FUNCTION public.set_admin_for_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'admin2025@44.com' THEN
    INSERT INTO public.profiles (id, is_admin, username)
    VALUES (NEW.id, TRUE, 'Admin')
    ON CONFLICT (id) DO UPDATE
    SET is_admin = TRUE;
  ELSE
    INSERT INTO public.profiles (id, is_admin, username)
    VALUES (NEW.id, FALSE, split_part(NEW.email, '@', 1))
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set admin status for the admin email
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.set_admin_for_email();
