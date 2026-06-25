
-- ROLES
CREATE TABLE public.roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom_role TEXT NOT NULL UNIQUE,
  desc_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert roles" ON public.roles FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));
CREATE POLICY "Admins can update roles" ON public.roles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));
CREATE POLICY "Admins can delete roles" ON public.roles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

-- SERVICE PARENTS
CREATE TABLE public.service_parents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom_service_parent TEXT NOT NULL,
  sigle_service_parent TEXT NOT NULL,
  desc_service_parent TEXT NOT NULL,
  contact_service_parent TEXT,
  adresse_service_parent TEXT,
  statut_chef_service_parent TEXT NOT NULL,
  nom_chef_service_parent TEXT NOT NULL,
  grade_chef_service_parent TEXT NOT NULL,
  fonction_chef_service_parent TEXT NOT NULL,
  contact_chef_service_parent TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.service_parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read service_parents" ON public.service_parents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert service_parents" ON public.service_parents FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));
CREATE POLICY "Admins can update service_parents" ON public.service_parents FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));
CREATE POLICY "Admins can delete service_parents" ON public.service_parents FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

-- SERVICES
CREATE TABLE public.services (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom_service TEXT NOT NULL,
  sigle_service TEXT NOT NULL,
  desc_service TEXT NOT NULL,
  contact_service TEXT,
  adresse_service TEXT,
  statut_chef_service TEXT NOT NULL,
  nom_chef_service TEXT NOT NULL,
  grade_chef_service TEXT NOT NULL,
  fonction_chef_service TEXT NOT NULL,
  contact_chef_service TEXT NOT NULL,
  service_parent_id BIGINT NOT NULL REFERENCES public.service_parents(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_roles_updated BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_sp_updated BEFORE UPDATE ON public.service_parents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Données fictives
INSERT INTO public.roles (nom_role, desc_role) VALUES
  ('ADMIN', 'Administrateur de l''application'),
  ('USER', 'Utilisateur standard'),
  ('SUPERVISEUR', 'Superviseur des opérations'),
  ('REFERANT', 'Référant métier');

INSERT INTO public.service_parents (nom_service_parent, sigle_service_parent, desc_service_parent, contact_service_parent, adresse_service_parent, statut_chef_service_parent, nom_chef_service_parent, grade_chef_service_parent, fonction_chef_service_parent, contact_chef_service_parent) VALUES
  ('Direction de la Police de l''Air et des Frontières', 'DPAF', 'Direction nationale chargée des frontières', '+221338690000', 'Aéroport AIBD, Diass', 'Titulaire', 'Cdt MBAYE', 'Commandant', 'Directeur', '+221770000001'),
  ('Direction Générale de la Sûreté Nationale', 'DGSN', 'Direction générale de la police nationale', '+221338231717', 'Dakar Plateau', 'Titulaire', 'Insp. NDIAYE', 'Inspecteur Général', 'Directeur Général', '+221770000002'),
  ('Direction des Douanes', 'DGD', 'Administration des douanes sénégalaises', '+221338890000', 'Dakar Port', 'Titulaire', 'Col. DIOP', 'Colonel', 'Directeur Général', '+221770000003');

INSERT INTO public.services (nom_service, sigle_service, desc_service, contact_service, adresse_service, statut_chef_service, nom_chef_service, grade_chef_service, fonction_chef_service, contact_chef_service, service_parent_id) VALUES
  ('Brigade Mobile Aéroport', 'BMA', 'Brigade mobile de l''aéroport AIBD', '+221338690010', 'AIBD Terminal', 'Titulaire', 'Lt SOW', 'Lieutenant', 'Chef de Brigade', '+221771111111', 1),
  ('Section Fraude Documentaire', 'SFD', 'Détection et traitement des fraudes documentaires', '+221338690020', 'AIBD Terminal', 'Titulaire', 'Lt FALL', 'Lieutenant', 'Chef de Section', '+221771111112', 1),
  ('Poste Frontière Rosso', 'PFR', 'Poste frontalier de Rosso', '+221339000010', 'Rosso, Saint-Louis', 'Intérimaire', 'Adj. KA', 'Adjudant', 'Chef de Poste', '+221771111113', 1),
  ('Brigade Stupéfiants', 'BS', 'Lutte contre les stupéfiants', '+221338231720', 'Dakar Plateau', 'Titulaire', 'Cmdt SARR', 'Commandant', 'Chef de Brigade', '+221771111114', 2),
  ('Bureau Douanes AIBD', 'BDA', 'Bureau des douanes à l''aéroport', '+221338890050', 'AIBD Cargo', 'Titulaire', 'Cap. BA', 'Capitaine', 'Chef de Bureau', '+221771111115', 3);
