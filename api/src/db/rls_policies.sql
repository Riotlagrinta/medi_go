-- Politiques RLS (Row Level Security) pour MediGo

-- Activer RLS sur toutes les tables
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- 1. Pharmacies : Tout le monde peut voir, seul SuperAdmin peut modifier (ou les admins via l'API sécurisée)
CREATE POLICY "Pharmacies sont visibles par tous" ON pharmacies FOR SELECT USING (true);

-- 2. Medications : Tout le monde peut voir
CREATE POLICY "Médicaments sont visibles par tous" ON medications FOR SELECT USING (true);

-- 3. Stocks : Tout le monde peut voir, seuls les admins de la pharmacie peuvent modifier
CREATE POLICY "Stocks sont visibles par tous" ON stocks FOR SELECT USING (true);

-- 4. Users : Un utilisateur ne peut voir que son propre profil
CREATE POLICY "Utilisateurs voient leur propre profil" ON users FOR SELECT USING (auth.uid()::text = id::text);

-- 5. Reservations : Patients voient les leurs, Pharmacies voient celles qui leur sont destinées
CREATE POLICY "Patients voient leurs réservations" ON reservations FOR SELECT USING (auth.uid()::text = patient_id::text);

-- 6. Messages : Isolation par conversation/pharmacie
CREATE POLICY "Messages visibles par les participants" ON messages FOR SELECT USING (
    auth.uid()::text = sender_id::text OR 
    EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.pharmacy_id = messages.pharmacy_id)
);

-- 7. Prescriptions : Très sensible
CREATE POLICY "Prescriptions voient par patient ou pharmacie" ON prescriptions FOR SELECT USING (
    auth.uid()::text = patient_id::text OR 
    EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.pharmacy_id = prescriptions.pharmacy_id)
);
