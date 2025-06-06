
-- Function to create members table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_members_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the members table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );
  
  -- Set up RLS policies
  ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
  
  -- Create a policy that allows authenticated users to select
  DROP POLICY IF EXISTS "Allow authenticated users to view members" ON public.members;
  CREATE POLICY "Allow authenticated users to view members" ON public.members
    FOR SELECT USING (auth.role() = 'authenticated');
    
  -- Create a policy that allows authenticated users to insert
  DROP POLICY IF EXISTS "Allow authenticated users to insert members" ON public.members;
  CREATE POLICY "Allow authenticated users to insert members" ON public.members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
  -- Create a policy that allows authenticated users to update
  DROP POLICY IF EXISTS "Allow authenticated users to update members" ON public.members;
  CREATE POLICY "Allow authenticated users to update members" ON public.members
    FOR UPDATE USING (auth.role() = 'authenticated');
    
  -- Create a policy that allows authenticated users to delete
  DROP POLICY IF EXISTS "Allow authenticated users to delete members" ON public.members;
  CREATE POLICY "Allow authenticated users to delete members" ON public.members
    FOR DELETE USING (auth.role() = 'authenticated');
END;
$$;

-- Function to create contributions table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_contributions_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if members table exists first
  PERFORM create_members_table();

  -- Create the contributions table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    week TEXT,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );
  
  -- Set up RLS policies
  ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
  
  -- Create a policy that allows authenticated users to select
  DROP POLICY IF EXISTS "Allow authenticated users to view contributions" ON public.contributions;
  CREATE POLICY "Allow authenticated users to view contributions" ON public.contributions
    FOR SELECT USING (auth.role() = 'authenticated');
    
  -- Create a policy that allows authenticated users to insert
  DROP POLICY IF EXISTS "Allow authenticated users to insert contributions" ON public.contributions;
  CREATE POLICY "Allow authenticated users to insert contributions" ON public.contributions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
  -- Create a policy that allows authenticated users to update
  DROP POLICY IF EXISTS "Allow authenticated users to update contributions" ON public.contributions;
  CREATE POLICY "Allow authenticated users to update contributions" ON public.contributions
    FOR UPDATE USING (auth.role() = 'authenticated');
    
  -- Create a policy that allows authenticated users to delete
  DROP POLICY IF EXISTS "Allow authenticated users to delete contributions" ON public.contributions;
  CREATE POLICY "Allow authenticated users to delete contributions" ON public.contributions
    FOR DELETE USING (auth.role() = 'authenticated');
    
  -- Create a view for members with contributions
  DROP VIEW IF EXISTS public.members_with_contributions;
  CREATE OR REPLACE VIEW public.members_with_contributions AS
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
    
  -- Create a view for monthly contributions
  DROP VIEW IF EXISTS public.monthly_contributions;
  CREATE OR REPLACE VIEW public.monthly_contributions AS
    SELECT 
      TO_CHAR(date, 'YYYY-MM') as month,
      COALESCE(SUM(amount), 0) as total
    FROM 
      contributions
    GROUP BY 
      TO_CHAR(date, 'YYYY-MM')
    ORDER BY 
      month;
END;
$$;

-- Function to create events table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_events_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the events table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    event_type TEXT DEFAULT 'regular'
  );
  
  -- Set up RLS policies
  ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
  
  -- Create a policy that allows authenticated users to select
  DROP POLICY IF EXISTS "Allow authenticated users to view events" ON public.events;
  CREATE POLICY "Allow authenticated users to view events" ON public.events
    FOR SELECT USING (auth.role() = 'authenticated');
    
  -- Create a policy that allows authenticated users to insert
  DROP POLICY IF EXISTS "Allow authenticated users to insert events" ON public.events;
  CREATE POLICY "Allow authenticated users to insert events" ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
  -- Create a policy that allows authenticated users to update
  DROP POLICY IF EXISTS "Allow authenticated users to update events" ON public.events;
  CREATE POLICY "Allow authenticated users to update events" ON public.events
    FOR UPDATE USING (auth.role() = 'authenticated');
    
  -- Create a policy that allows authenticated users to delete
  DROP POLICY IF EXISTS "Allow authenticated users to delete events" ON public.events;
  CREATE POLICY "Allow authenticated users to delete events" ON public.events
    FOR DELETE USING (auth.role() = 'authenticated');
END;
$$;

-- Function to get all users (to be used by admin)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT json_build_object(
    'id', au.id,
    'email', au.email,
    'name', p.name,
    'phone', p.phone
  )
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  ORDER BY au.created_at DESC;
END;
$$;
