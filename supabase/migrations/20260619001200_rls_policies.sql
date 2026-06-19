ALTER TABLE profiles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments                ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_knowledge       ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeds                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE first_aid_recommendations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_processing_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own pets" ON pets
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own assessments" ON assessments
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated read knowledge" ON veterinary_knowledge
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read breeds" ON breeds
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read first aid" ON first_aid_recommendations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read emergency contacts" ON emergency_contacts
  FOR SELECT USING (auth.role() = 'authenticated');
