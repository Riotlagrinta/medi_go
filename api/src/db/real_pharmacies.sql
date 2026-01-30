-- Nettoyage des anciennes données
DELETE FROM stocks;
DELETE FROM pharmacies CASCADE;

-- Insertion des vraies pharmacies de Lomé (Coordonnées approximatives par quartier)
INSERT INTO pharmacies (name, address, phone, is_on_duty, location) VALUES
('Pharmacie de la Paix', 'Rue des Hydrocarbures, Quartier Administratif', '+228 22 21 21 21', true, ST_SetSRID(ST_MakePoint(1.2215, 6.1285), 4326)),
('Pharmacie de l''Avenir', 'Avenue de la Libération, centre-ville', '+228 22 21 00 00', false, ST_SetSRID(ST_MakePoint(1.2255, 6.1372), 4326)),
('Pharmacie du Grand Marché', 'Avenue de la Somme, Grand Marché', '+228 22 21 34 56', true, ST_SetSRID(ST_MakePoint(1.2200, 6.1250), 4326)),
('Pharmacie des Étoiles', 'Boulevard Gnassingbé Eyadéma, Cité OUA', '+228 22 26 78 90', false, ST_SetSRID(ST_MakePoint(1.2350, 6.1650), 4326)),
('Pharmacie Saint Joseph', 'Quartier Adidoadin, près du carrefour', '+228 22 25 12 34', true, ST_SetSRID(ST_MakePoint(1.2050, 6.1850), 4326)),
('Pharmacie Populaire', 'Boulevard du 13 Janvier, Hanoukopé', '+228 22 21 11 11', false, ST_SetSRID(ST_MakePoint(1.2150, 6.1350), 4326)),
('Pharmacie Bethesda', 'Quartier Hedzranawoé', '+228 22 26 45 67', false, ST_SetSRID(ST_MakePoint(1.2450, 6.1750), 4326)),
('Pharmacie de la Victoire', 'Quartier Tokoin, Boulevard Circulaire', '+228 22 21 89 00', true, ST_SetSRID(ST_MakePoint(1.2280, 6.1450), 4326)),
('Pharmacie des Oliviers', 'Quartier Agoè-Nyivé, Route de la Chance', '+228 22 25 00 11', false, ST_SetSRID(ST_MakePoint(1.2100, 6.2200), 4326)),
('Pharmacie Kodjoviakopé', 'Quartier Kodjoviakopé, près de la mer', '+228 22 21 55 66', false, ST_SetSRID(ST_MakePoint(1.2050, 6.1200), 4326)),
('Pharmacie du Boulevard', 'Boulevard de la Kara, Tokoin', '+228 22 22 33 44', true, ST_SetSRID(ST_MakePoint(1.2300, 6.1550), 4326)),
('Pharmacie Akodesséwa', 'Quartier Akodesséwa, près du marché aux fétiches', '+228 22 27 11 22', false, ST_SetSRID(ST_MakePoint(1.2650, 6.1400), 4326)),
('Pharmacie de l''Aéroport', 'Route de l''Aéroport, Tokoin', '+228 22 26 99 88', true, ST_SetSRID(ST_MakePoint(1.2550, 6.1600), 4326)),
('Pharmacie Hanoukopé', 'Quartier Hanoukopé', '+228 22 21 09 09', false, ST_SetSRID(ST_MakePoint(1.2180, 6.1320), 4326)),
('Pharmacie de la Marina', 'Avenue de la Marina', '+228 22 21 44 55', false, ST_SetSRID(ST_MakePoint(1.2100, 6.1150), 4326)),
('Pharmacie Agoè Assiyéyé', 'Quartier Agoè, près du marché', '+228 22 50 12 34', true, ST_SetSRID(ST_MakePoint(1.2150, 6.2350), 4326)),
('Pharmacie Bel-Air', 'Quartier Tokoin-Ouest', '+228 22 22 00 11', false, ST_SetSRID(ST_MakePoint(1.2200, 6.1500), 4326)),
('Pharmacie des Cocotiers', 'Quartier Tokoin-Cassablanca', '+228 22 21 77 88', false, ST_SetSRID(ST_MakePoint(1.2320, 6.1420), 4326)),
('Pharmacie du Centre', 'Grand Marché, rue du commerce', '+228 22 21 01 01', true, ST_SetSRID(ST_MakePoint(1.2220, 6.1230), 4326)),
('Pharmacie de la Nouvelle Marche', 'Quartier Amoutivé', '+228 22 21 66 77', false, ST_SetSRID(ST_MakePoint(1.2240, 6.1300), 4326));

-- Quelques médicaments pour tester
INSERT INTO medications (name, description, price, category) VALUES
('Paracétamol 500mg', 'Antalgique', 500, 'Douleurs'),
('Amoxicilline 500mg', 'Antibiotique', 1500, 'Infections'),
('Artésunate', 'Antipaludéen', 2500, 'Paludisme'),
('Sirop toux sèche', 'Antitussif', 3000, 'Respiratoire');

-- Stock aléatoire
INSERT INTO stocks (pharmacy_id, medication_id, quantity, price)
SELECT p.id, m.id, floor(random() * 100), m.price
FROM pharmacies p, medications m;
