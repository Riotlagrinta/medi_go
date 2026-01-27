-- Seed Pharmacies (Lomé, Togo)
INSERT INTO pharmacies (name, address, phone, is_on_duty, location) VALUES
('Pharmacie de l''Avenir', 'Avenue de la Libération, Lomé', '+228 22 21 00 00', true, ST_SetSRID(ST_MakePoint(1.2255, 6.1372), 4326)),
('Pharmacie de la Paix', 'Rue des Hydrocarbures, Lomé', '+228 22 22 11 11', false, ST_SetSRID(ST_MakePoint(1.2355, 6.1472), 4326)),
('Pharmacie du Centre', 'Boulevard du 13 Janvier, Lomé', '+228 22 20 22 22', false, ST_SetSRID(ST_MakePoint(1.2155, 6.1272), 4326));

-- Seed Medications
INSERT INTO medications (name, description, price, category) VALUES
('Paracétamol 500mg', 'Antalgique et antipyrétique', 500.00, 'Douleurs'),
('Amoxicilline 500mg', 'Antibiotique', 1500.00, 'Antibiotiques'),
('Ibuprofène 400mg', 'Anti-inflammatoire', 800.00, 'Douleurs'),
('Sirop contre la toux', 'Antitussif', 2500.00, 'Voies respiratoires');

-- Seed Stocks
INSERT INTO stocks (pharmacy_id, medication_id, quantity) VALUES
(1, 1, 100),
(1, 2, 50),
(2, 1, 30),
(2, 3, 20),
(3, 1, 80),
(3, 4, 15);
