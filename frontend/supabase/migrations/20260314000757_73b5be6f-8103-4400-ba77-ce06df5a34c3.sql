
-- Reference tables
CREATE TABLE public.nationalites (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label text NOT NULL UNIQUE
);

CREATE TABLE public.societes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label text NOT NULL UNIQUE
);

CREATE TABLE public.vols (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  numero text NOT NULL,
  destination text NOT NULL
);

CREATE TABLE public.documents (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label text NOT NULL UNIQUE
);

CREATE TABLE public.type_fraudes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label text NOT NULL UNIQUE
);

-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  full_name text,
  role text NOT NULL DEFAULT 'USER',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fraudes table
CREATE TABLE public.fraudes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prenom_fraudeur text NOT NULL,
  nom_fraudeur text NOT NULL,
  genre_fraudeur text NOT NULL DEFAULT 'NR',
  date_naiss_fraudeur date,
  nationalite_id bigint NOT NULL REFERENCES public.nationalites(id),
  date_fraude date,
  lieu_fraude text NOT NULL,
  provenance_destination text NOT NULL,
  desc_fraude text,
  societe_id bigint NOT NULL REFERENCES public.societes(id),
  vol_id bigint NOT NULL REFERENCES public.vols(id),
  zone text NOT NULL DEFAULT 'NR',
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Details table
CREATE TABLE public.details (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  document_id bigint NOT NULL REFERENCES public.documents(id),
  num_document_faux text NOT NULL,
  type_fraude_id bigint NOT NULL REFERENCES public.type_fraudes(id),
  fraude_id bigint NOT NULL REFERENCES public.fraudes(id) ON DELETE CASCADE,
  nationalite_id bigint NOT NULL REFERENCES public.nationalites(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.nationalites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.type_fraudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.details ENABLE ROW LEVEL SECURITY;

-- Reference tables: readable by all authenticated
CREATE POLICY "Authenticated can read nationalites" ON public.nationalites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read societes" ON public.societes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read vols" ON public.vols FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read type_fraudes" ON public.type_fraudes FOR SELECT TO authenticated USING (true);

-- Profiles: users read own, insert own
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Fraudes: authenticated can insert own, read all
CREATE POLICY "Authenticated can read fraudes" ON public.fraudes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert own fraudes" ON public.fraudes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fraudes" ON public.fraudes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Details: authenticated can insert own, read all
CREATE POLICY "Authenticated can read details" ON public.details FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert own details" ON public.details FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own details" ON public.details FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
