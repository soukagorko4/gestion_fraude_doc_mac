-- Allow users to delete their own fraudes/details, with admin override handled at app level via RLS using profiles table
CREATE POLICY "Users can delete own fraudes"
ON public.fraudes FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

CREATE POLICY "Users can delete own details"
ON public.details FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

-- Allow admins to update any fraude/detail
CREATE POLICY "Admins can update any fraude"
ON public.fraudes FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

CREATE POLICY "Admins can update any detail"
ON public.details FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));