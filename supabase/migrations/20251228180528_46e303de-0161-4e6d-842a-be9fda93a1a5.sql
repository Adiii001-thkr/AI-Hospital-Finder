-- Drop the existing public select policy
DROP POLICY IF EXISTS "Anyone can view hospitals" ON public.hospitals;

-- Create a new policy that allows authenticated users to view all hospital data
CREATE POLICY "Authenticated users can view hospitals" 
ON public.hospitals 
FOR SELECT 
TO authenticated
USING (true);

-- Note: Public/anonymous users will no longer have access to the hospitals table
-- This prevents automated harvesting of contact information