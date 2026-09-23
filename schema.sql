-- ============================================================
-- MediGo - Schéma PostgreSQL pour Neon
-- ============================================================

-- Extension pour les UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  address       TEXT,
  medical_info  TEXT,
  photo_url     TEXT,
  role          VARCHAR(20) NOT NULL DEFAULT 'patient'
                  CHECK (role IN ('patient', 'pharmacy_admin', 'super_admin')),
  pharmacy_id   INTEGER,                          -- lien vers pharmacies (ajouté après)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PHARMACIES
-- ============================================================
CREATE TABLE pharmacies (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  address     TEXT NOT NULL,
  phone       VARCHAR(20),
  lat         DECIMAL(10, 7) NOT NULL,
  lng         DECIMAL(10, 7) NOT NULL,
  is_on_duty  BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lien users -> pharmacies
ALTER TABLE users
  ADD CONSTRAINT fk_users_pharmacy
  FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;

-- ============================================================
-- MEDICATIONS (catalogue)
-- ============================================================
CREATE TABLE medications (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  category    VARCHAR(100),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STOCKS (médicaments par pharmacie)
-- ============================================================
CREATE TABLE pharmacy_stocks (
  id            SERIAL PRIMARY KEY,
  pharmacy_id   INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  medication_id INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  quantity      INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  price         DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pharmacy_id, medication_id)
);

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE TABLE reservations (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pharmacy_id   INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  medication_id INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'picked_up')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPOINTMENTS (rendez-vous)
-- ============================================================
CREATE TABLE appointments (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pharmacy_id      INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  appointment_date TIMESTAMPTZ NOT NULL,
  reason           TEXT,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRESCRIPTIONS (ordonnances)
-- ============================================================
CREATE TABLE prescriptions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'ready', 'rejected', 'picked_up')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MESSAGES (chat patient <-> pharmacie)
-- ============================================================
CREATE TABLE messages (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pharmacy_id      INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  content          TEXT NOT NULL,
  is_from_pharmacy BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEX pour les performances
-- ============================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_pharmacy_id ON users(pharmacy_id);

CREATE INDEX idx_pharmacies_on_duty ON pharmacies(is_on_duty);
CREATE INDEX idx_pharmacies_verified ON pharmacies(is_verified);
CREATE INDEX idx_pharmacies_coords ON pharmacies(lat, lng);

CREATE INDEX idx_stocks_pharmacy ON pharmacy_stocks(pharmacy_id);
CREATE INDEX idx_stocks_medication ON pharmacy_stocks(medication_id);

CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_pharmacy ON reservations(pharmacy_id);
CREATE INDEX idx_reservations_status ON reservations(status);

CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_pharmacy ON appointments(pharmacy_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

CREATE INDEX idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_pharmacy ON prescriptions(pharmacy_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

CREATE INDEX idx_messages_pharmacy ON messages(pharmacy_id);
CREATE INDEX idx_messages_user ON messages(user_id);

-- ============================================================
-- FONCTION : updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_pharmacies_updated_at
  BEFORE UPDATE ON pharmacies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_stocks_updated_at
  BEFORE UPDATE ON pharmacy_stocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DONNÉES DE TEST (seed)
-- ============================================================

-- Super admin
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('admin@medigo.tg', '$2b$10$CHANGE_THIS_HASH', 'Super Admin MediGo', 'super_admin');

-- Pharmacies de test à Lomé
INSERT INTO pharmacies (name, address, phone, lat, lng, is_on_duty, is_verified) VALUES
  ('Pharmacie du Bénin',      'Rue du Commerce, Lomé',   '+228 22 21 00 01', 6.1372,  1.2255,  TRUE,  TRUE),
  ('Pharmacie de la Paix',    'Boulevard de la Paix',    '+228 22 21 00 02', 6.1450,  1.2300,  FALSE, TRUE),
  ('Pharmacie Centrale',      'Avenue de la Libération', '+228 22 21 00 03', 6.1300,  1.2200,  FALSE, TRUE),
  ('Pharmacie Saint-Joseph',  'Quartier Tokoin',         '+228 22 21 00 04', 6.1520,  1.2150,  FALSE, FALSE);

-- Médicaments de test
INSERT INTO medications (name, description, category) VALUES
  ('Paracétamol 500mg',  'Antalgique et antipyrétique', 'Antalgique'),
  ('Amoxicilline 500mg', 'Antibiotique à large spectre', 'Antibiotique'),
  ('Insuline NovoMix',   'Insuline biphasique', 'Diabétologie'),
  ('Doliprane 1000mg',   'Antalgique fort', 'Antalgique'),
  ('Quinine 300mg',      'Antipaludéen', 'Antiparasitaire');

-- Stocks de test
INSERT INTO pharmacy_stocks (pharmacy_id, medication_id, quantity, price) VALUES
  (1, 1, 50,  500),
  (1, 2, 20, 3500),
  (1, 3,  5, 12000),
  (2, 1, 30,  450),
  (2, 4, 40,  800),
  (3, 1, 100,  400),
  (3, 2,  8,  3200),
  (3, 5, 25,  1500);

-- ============================================================
-- MIGRATION : mot de passe oublié (à exécuter sur une base déjà
-- existante — idempotent, sans risque si déjà appliqué)
-- ============================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token_hash    VARCHAR(64),
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token_hash);

-- ============================================================
-- MIGRATION : rate limiting sur les routes sensibles (auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  key          VARCHAR(255) PRIMARY KEY,
  count        INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MIGRATION : remplacement des pharmacies de test par de vraies
-- pharmacies togolaises (source : OpenStreetMap, licence ODbL).
-- Complété/mis à jour ensuite par l'import hebdomadaire de garde.
-- ============================================================
-- 272 pharmacies réelles importées depuis OpenStreetMap (ODbL — © OpenStreetMap contributors)
-- Généré le 2026-09-23T15:00:51.336Z

DELETE FROM pharmacies WHERE name IN ('Pharmacie du Bénin', 'Pharmacie de la Paix', 'Pharmacie Centrale', 'Pharmacie Saint-Joseph');

INSERT INTO pharmacies (name, address, phone, lat, lng, is_on_duty, is_verified) VALUES
  ('Pharmacie Lafia', 'Quartier non précisé, Kara, Togo', NULL, 9.5475895, 1.1945918, FALSE, FALSE),
  ('Pharmacie Kara Centre', 'Quartier non précisé, Kara, Togo', NULL, 9.5536476, 1.1953894, FALSE, FALSE),
  ('pharmacie Espoir', 'Quartier non précisé, Kara, Togo', NULL, 9.547034, 1.1892523, FALSE, FALSE),
  ('Pharmacie de la Kozah', 'Quartier non précisé, Kara, Togo', NULL, 9.5495003, 1.189673, FALSE, FALSE),
  ('pharmacie Santé Plus', 'Quartier non précisé, Kara, Togo', NULL, 9.5525021, 1.2041304, FALSE, FALSE),
  ('Pharmacie Bethel', 'Quartier non précisé, Lomé, Togo', NULL, 6.1755861, 1.1809121, FALSE, FALSE),
  ('Pharmacie Avépozo', 'Quartier non précisé, Lomé, Togo', NULL, 6.169885, 1.3453851, FALSE, FALSE),
  ('Pharmacie de Djidjolé', 'Quartier non précisé, Lomé, Togo', NULL, 6.1805575, 1.1952619, FALSE, FALSE),
  ('Pharmacie Mathilda', 'Quartier non précisé, Lomé, Togo', '+228222511584', 6.1825406, 1.1999865, FALSE, FALSE),
  ('Pharmacie Agoè-Nyivé', 'Quartier non précisé, Lomé, Togo', NULL, 6.2256655, 1.2108244, FALSE, FALSE),
  ('Pharmacie Emmaus', 'Quartier non précisé, Lomé, Togo', NULL, 6.2358935, 1.1940329, FALSE, FALSE),
  ('Pharmacie de la Nation', 'Quartier non précisé, Lomé, Togo', '+22822259965', 6.1922583, 1.1910253, FALSE, FALSE),
  ('Pharmacie Solidarité', 'Quartier non précisé, Lomé, Togo', NULL, 6.1966467, 1.1867889, FALSE, FALSE),
  ('pharmacie le Château', 'Quartier non précisé, Lomé, Togo', NULL, 6.1370596, 1.2490261, FALSE, FALSE),
  ('Pharmacie Océane', 'Quartier non précisé, Lomé, Togo', NULL, 6.1333763, 1.2464503, FALSE, FALSE),
  ('Pharmacie de l''OCAM', 'Quartier non précisé, Lomé, Togo', NULL, 6.1300843, 1.2394172, FALSE, FALSE),
  ('Pharmacie Vétérinaire Bon Berger', 'Quartier non précisé, Lomé, Togo', NULL, 6.130345, 1.2401711, FALSE, FALSE),
  ('La Grace', 'Quartier non précisé, Lomé, Togo', NULL, 6.219508, 1.2091379, FALSE, FALSE),
  ('Pharmacie Shalom', 'Quartier non précisé, Lomé, Togo', NULL, 6.2176737, 1.203511, FALSE, FALSE),
  ('PAHARMACIE HEDRANAWOE', 'Quartier non précisé, Lomé, Togo', '+22822264961', 6.1797097, 1.2387931, FALSE, FALSE),
  ('Pharmacie Chinoise', 'Quartier non précisé, Lomé, Togo', NULL, 6.181645, 1.2349348, FALSE, FALSE),
  ('Pharmacie des Lilas', 'Quartier non précisé, Lomé, Togo', NULL, 6.1830548, 1.2354178, FALSE, FALSE),
  ('Pharmacie Emmanuel', 'Quartier non précisé, Lomé, Togo', NULL, 6.1201259, 1.2049911, FALSE, FALSE),
  ('Pharmacie Kodjoviakopé', 'Quartier non précisé, Lomé, Togo', NULL, 6.1216541, 1.2093005, FALSE, FALSE),
  ('Pharmacie Du Point E', 'Quartier non précisé, Lomé, Togo', NULL, 6.1812949, 1.1905973, FALSE, FALSE),
  ('Pharmacie Excellence', 'Quartier non précisé, Lomé, Togo', NULL, 6.241401, 1.2012058, FALSE, FALSE),
  ('Pharmacie AZON-CONDJI', 'Quartier non précisé, Aného, Togo', NULL, 6.2404981, 1.6235337, FALSE, FALSE),
  ('Pharmacie d''Aného Woezon', 'Quartier non précisé, Aného, Togo', NULL, 6.2373889, 1.6125532, FALSE, FALSE),
  ('Pharmacie Amessiame', 'Quartier non précisé, Aného, Togo', NULL, 6.2358875, 1.6074398, FALSE, FALSE),
  ('Pharmacie DEO GRATIAS', 'Quartier non précisé, Lomé, Togo', NULL, 6.1364687, 1.2564935, FALSE, FALSE),
  ('Pharmacie Lebon Samaritain', 'Avenue Augustino De Souza', NULL, 6.1399624, 1.2465171, FALSE, FALSE),
  ('Pharmacie Saint Antoine', 'Quartier non précisé, Lomé, Togo', NULL, 6.1325182, 1.2235165, FALSE, FALSE),
  ('Pharmacie des Etoiles', '10 Ave de Nouvelle Marche, Lomé, Togo, Lomé', NULL, 6.1321132, 1.2204839, FALSE, FALSE),
  ('Pharmacie pour tous', 'Quartier non précisé, Lomé, Togo', NULL, 6.1355957, 1.213159, FALSE, FALSE),
  ('Pharmacie Justin', 'Quartier non précisé, Lomé, Togo', '+22822210001', 6.1471346, 1.2069724, FALSE, FALSE),
  ('K BINET pharmacie Chinoise', 'Quartier non précisé, Lomé, Togo', NULL, 6.1576204, 1.2561289, FALSE, FALSE),
  ('La Misericorde', 'Quartier non précisé, Lomé, Togo', NULL, 6.1568116, 1.2526204, FALSE, FALSE),
  ('Pharmacie des Orchidées', 'Quartier non précisé, Lomé, Togo', NULL, 6.2113261, 1.1771699, FALSE, FALSE),
  ('Pharmacie Adidogomé', 'Quartier non précisé, Lomé, Togo', NULL, 6.1850322, 1.166273, FALSE, FALSE),
  ('Pharmacie La Référence', 'Quartier non précisé, Lomé, Togo', NULL, 6.2002775, 1.1487142, FALSE, FALSE),
  ('Pharmacie Dieudonné', 'Quartier non précisé, Lomé, Togo', NULL, 6.2158499, 1.1723495, FALSE, FALSE),
  ('Pharmacie Laus Deo', 'Quartier non précisé, Lomé, Togo', NULL, 6.2070435, 1.1831321, FALSE, FALSE),
  ('Pharmacie Le Galien', 'Quartier non précisé, Lomé, Togo', NULL, 6.2013791, 1.1882347, FALSE, FALSE),
  ('Pharmacie Le Millenaire', 'Quartier non précisé, Lomé, Togo', NULL, 6.2068745, 1.1896092, FALSE, FALSE),
  ('Notre Dame de LOURDES', 'Quartier non précisé, Lomé, Togo', NULL, 6.2167697, 1.1887731, FALSE, FALSE),
  ('Pharmacie des Roses', 'Quartier non précisé, Lomé, Togo', NULL, 6.2205598, 1.1698952, FALSE, FALSE),
  ('Pharmacie Jahnap', 'Quartier non précisé, Lomé, Togo', NULL, 6.1755097, 1.1979032, FALSE, FALSE),
  ('Pharmacie ACTUELLE', 'Quartier non précisé, Lomé, Togo', NULL, 6.1925569, 1.1440521, FALSE, FALSE),
  ('Pharmacie APOLLON', 'Quartier non précisé, Lomé, Togo', NULL, 6.2026328, 1.1669399, FALSE, FALSE),
  ('Pharmacie BESDA', 'Quartier non précisé, Lomé, Togo', NULL, 6.1956179, 1.1541753, FALSE, FALSE),
  ('Pharmacie DE LA CITE', 'Quartier non précisé, Lomé, Togo', '+22822250125', 6.1711741, 1.1900577, FALSE, FALSE),
  ('Pharmacie DES ECOLES', 'Quartier non précisé, Lomé, Togo', NULL, 6.1920133, 1.1583729, FALSE, FALSE),
  ('Pharmacie EPIPHANIA', 'Quartier non précisé, Lomé, Togo', NULL, 6.1805044, 1.1634997, FALSE, FALSE),
  ('Pharmacie Eli-Beraca', 'Quartier non précisé, Lomé, Togo', NULL, 6.1808077, 1.171924, FALSE, FALSE),
  ('Pharmacie SILOE', 'Quartier non précisé, Lomé, Togo', NULL, 6.2068325, 1.1408981, FALSE, FALSE),
  ('Pharmacie VICTOIRE', 'Quartier non précisé, Lomé, Togo', NULL, 6.1925919, 1.1716493, FALSE, FALSE),
  ('Pharmacie Bon Pasteur', 'Quartier non précisé, Lomé, Togo', NULL, 6.1290342, 1.224335, FALSE, FALSE),
  ('Pharmacie ST Raphaël', 'Quartier non précisé, Lomé, Togo', NULL, 6.1283697, 1.2297759, FALSE, FALSE),
  ('Pharmacie d''ADJOLOLO', 'Quartier non précisé, Lomé, Togo', NULL, 6.1262755, 1.201075, FALSE, FALSE),
  ('Pharmacie Tulipe', 'Quartier non précisé, Lomé, Togo', NULL, 6.140502, 1.2407825, FALSE, FALSE),
  ('Pharmacie Kpehenou', 'Quartier non précisé, Lomé, Togo', NULL, 6.1385238, 1.2369409, FALSE, FALSE),
  ('Pharmacie du Boulevard', 'Quartier non précisé, Lomé, Togo', NULL, 6.1361355, 1.2280208, FALSE, FALSE),
  ('Pharmacie Jeanne d''Arc', 'Quartier non précisé, Lomé, Togo', NULL, 6.1275889, 1.2355771, FALSE, FALSE),
  ('Pharmacie ADONAI', 'Quartier non précisé, Lomé, Togo', NULL, 6.2319049, 1.2104777, FALSE, FALSE),
  ('Pharmacie APOU ANTOINE', 'Quartier non précisé, Lomé, Togo', NULL, 6.2240432, 1.1927747, FALSE, FALSE),
  ('Pharmacie DELALI', 'Quartier non précisé, Lomé, Togo', NULL, 6.2078133, 1.1952131, FALSE, FALSE),
  ('Pharmacie St Michel', 'Quartier non précisé, Lomé, Togo', NULL, 6.2138768, 1.2083415, FALSE, FALSE),
  ('Pharmacie la CHARITE', 'Quartier non précisé, Lomé, Togo', NULL, 6.2254357, 1.2048486, FALSE, FALSE),
  ('Pharmacie de la Libération', 'Quartier non précisé, Lomé, Togo', NULL, 6.1535266, 1.2171496, FALSE, FALSE),
  ('Pharmacie Sainte Marie', 'Quartier non précisé, Lomé, Togo', NULL, 6.148443, 1.2188809, FALSE, FALSE),
  ('Pharmacie Ossan', 'Quartier non précisé, Lomé, Togo', NULL, 6.2010778, 1.1807802, FALSE, FALSE),
  ('Pharmacie Lumen', 'Quartier non précisé, Lomé, Togo', NULL, 6.1571711, 1.2020895, FALSE, FALSE),
  ('Pharmacie Horizon', 'Quartier non précisé, Lomé, Togo', NULL, 6.1289734, 1.2106287, FALSE, FALSE),
  ('Pharmacie de Gbossime', 'Quartier non précisé, Lomé, Togo', NULL, 6.1594338, 1.2056622, FALSE, FALSE),
  ('La Prospérité', 'Quartier non précisé, Lomé, Togo', NULL, 6.1528815, 1.2295043, FALSE, FALSE),
  ('Avé Maria', 'Quartier non précisé, Lomé, Togo', NULL, 6.1439701, 1.2061066, FALSE, FALSE),
  ('Pharmacie du Campus', 'Quartier non précisé, Lomé, Togo', NULL, 6.1629227, 1.2133371, FALSE, FALSE),
  ('Pharmacie du 3ème Arrondissement', 'Bd. du 13 Janvier, près de l''Immeuble FIATA, Lomé', '+228 22 21 52 27', 6.1351465, 1.2319409, FALSE, FALSE),
  ('Pharmacie Verseau', 'Quartier non précisé, Lomé, Togo', NULL, 6.1668171, 1.3345793, FALSE, FALSE),
  ('Pharmacie de l''Eden', 'Quartier non précisé, Lomé, Togo', NULL, 6.1612431, 1.3157197, FALSE, FALSE),
  ('Dieu source de vie', 'Quartier non précisé, Tsévié, Togo', NULL, 6.4607865, 0.9085845, FALSE, FALSE),
  ('depot de pharmacie', 'Quartier non précisé, Tsévié, Togo', NULL, 6.4555075, 0.9097333, FALSE, FALSE),
  ('Dogopé-névaémé', 'Quartier non précisé, Tsévié, Togo', NULL, 6.448672, 0.9068577, FALSE, FALSE),
  ('Pharmacie des Oliviers', 'Quartier non précisé, Lomé, Togo', '+22822270434', 6.1520013, 1.2621376, FALSE, FALSE),
  ('Amessiamé', 'Quartier non précisé, Lomé, Togo', NULL, 6.1435652, 1.2442562, FALSE, FALSE),
  ('CRYSTAL', 'Quartier non précisé, Lomé, Togo', NULL, 6.1473201, 1.2489498, FALSE, FALSE),
  ('PHARMACIE MAWULE', 'Quartier non précisé, Lomé, Togo', NULL, 6.1529221, 1.2450423, FALSE, FALSE),
  ('Pharmacie chinoise', 'Quartier non précisé, Lomé, Togo', NULL, 6.1468792, 1.2439071, FALSE, FALSE),
  ('Pharmacie Biova', 'Quartier non précisé, Lomé, Togo', NULL, 6.1501967, 1.2544647, FALSE, FALSE),
  ('Dépot Pharmaceutique OCAM Vogan', 'Quartier non précisé, Vogan, Togo', NULL, 6.3337413, 1.5286228, FALSE, FALSE),
  ('Pharmacie Arevis', 'Quartier non précisé, Vogan, Togo', '+22891079097', 6.332525, 1.5265736, FALSE, FALSE),
  ('Dépot de pharmacie Dieu est capable', 'Quartier non précisé, Vogan, Togo', NULL, 6.3419979, 1.5288685, FALSE, FALSE),
  ('ISSA Touré', 'Quartier non précisé, Sokodé, Togo', NULL, 8.9821271, 1.1407194, FALSE, FALSE),
  ('PHARMACIE NOUVELLE', 'Quartier non précisé, Sokodé, Togo', NULL, 8.9867061, 1.1361647, FALSE, FALSE),
  ('pharmacie tchaoudjo', 'Quartier non précisé, Sokodé, Togo', NULL, 8.9871054, 1.13966, FALSE, FALSE),
  ('Pharmacie du Zio', 'Quartier non précisé, Tsévié, Togo', NULL, 6.4286104, 1.2129391, FALSE, FALSE),
  ('Pharmacie la Vie', 'Quartier non précisé, Notsé, Togo', NULL, 6.9506738, 1.1726825, FALSE, FALSE),
  ('Pharmacie Sainte Rita', 'Quartier non précisé, Lomé, Togo', NULL, 6.1397897, 1.2284304, FALSE, FALSE),
  ('Pharmacie Divina Gracia', 'Quartier non précisé, Lomé, Togo', NULL, 6.2329466, 1.1889724, FALSE, FALSE),
  ('Pharmacie Baguida', 'Quartier non précisé, Lomé, Togo', NULL, 6.1701542, 1.3258488, FALSE, FALSE),
  ('Le Savent', 'Quartier non précisé, Dapaong, Togo', NULL, 10.8689228, 0.2023346, FALSE, FALSE),
  ('Pharmacie le soleil', 'Quartier non précisé, Dapaong, Togo', NULL, 10.8645119, 0.2036139, FALSE, FALSE),
  ('PHARMACIE MAGNIFICAT', 'Quartier non précisé, Lomé, Togo', NULL, 6.1793429, 1.1508203, FALSE, FALSE),
  ('Dépôt Concordia Anié', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.7646674, 1.19286, FALSE, FALSE),
  ('La Confiance', 'Quartier non précisé, Lomé, Togo', NULL, 6.1913266, 1.2083016, FALSE, FALSE),
  ('Pharmacie CITRUS', 'Quartier non précisé, Lomé, Togo', NULL, 6.205489, 1.2537564, FALSE, FALSE),
  ('Amo', 'Quartier non précisé, Lomé, Togo', NULL, 6.1438775, 1.2122823, FALSE, FALSE),
  ('Pharmacie Du CHU Campus', 'Quartier non précisé, Lomé, Togo', NULL, 6.1791785, 1.2127032, FALSE, FALSE),
  ('Pharmacie Mawunyo', '70423464 Voix Express de la CEDEAO, Lomé', NULL, 6.2535502, 1.173347, FALSE, FALSE),
  ('Raoudha', 'Boulevard du Sio', NULL, 6.1945897, 1.2539059, FALSE, FALSE),
  ('Horizon santé', 'Quartier non précisé, Sokodé, Togo', NULL, 9.0263404, 1.4245586, FALSE, FALSE),
  ('Pharmacie Hôpital', 'Quartier non précisé, Lomé, Togo', NULL, 6.144339, 1.2091479, FALSE, FALSE),
  ('PHARMACIE EL SHAMMAH', 'Quartier non précisé, Lomé, Togo', NULL, 6.2090184, 1.1598501, FALSE, FALSE),
  ('Pharmacie Vita-Flore', 'Quartier non précisé, Lomé, Togo', NULL, 6.2220049, 1.1653079, FALSE, FALSE),
  ('Pharmacie du point E', 'Quartier non précisé, Lomé, Togo', NULL, 6.1813716, 1.1907229, FALSE, FALSE),
  ('Pharmacie Hosanna', 'Quartier non précisé, Lomé, Togo', '+22822515040', 6.1940704, 1.1379555, FALSE, FALSE),
  ('Pharmacie Bonté', 'Quartier non précisé, Lomé, Togo', NULL, 6.1896245, 1.1537508, FALSE, FALSE),
  ('Pharmacie Abraham', 'Quartier non précisé, Lomé, Togo', NULL, 6.2346078, 1.1753172, FALSE, FALSE),
  ('Pharmacie Notre-Dame', 'Quartier non précisé, Lomé, Togo', '+22822427404', 6.1846287, 1.2471451, FALSE, FALSE),
  ('Pharmacie de l''aéroport', 'Quartier non précisé, Lomé, Togo', NULL, 6.1689721, 1.245859, FALSE, FALSE),
  ('Pharmacie de l''amitié', 'Quartier non précisé, Lomé, Togo', NULL, 6.1538483, 1.2228235, FALSE, FALSE),
  ('Pharmacie des Apotres', 'Quartier non précisé, Lomé, Togo', NULL, 6.1461027, 1.2663128, FALSE, FALSE),
  ('Pharmacie Idéale', 'Quartier non précisé, Sokodé, Togo', NULL, 9.005526, 1.1354786, FALSE, FALSE),
  ('Pharmacie Akodessewa', 'Quartier non précisé, Lomé, Togo', NULL, 6.1531167, 1.2674237, FALSE, FALSE),
  ('Pharmacie 2000', 'Quartier non précisé, Lomé, Togo', NULL, 6.1639565, 1.2684523, FALSE, FALSE),
  ('Lumière', 'Quartier non précisé, Lomé, Togo', NULL, 6.2013351, 1.1952309, FALSE, FALSE),
  ('Pharmacie El-Shadai', 'Quartier non précisé, Lomé, Togo', NULL, 6.1694828, 1.2031998, FALSE, FALSE),
  ('Pharmacie N.d Trinité', 'Quartier non précisé, Lomé, Togo', NULL, 6.151525, 1.2388725, FALSE, FALSE),
  ('Pharmacie Klokpe', 'Quartier non précisé, Lomé, Togo', NULL, 6.191227, 1.260828, FALSE, FALSE),
  ('Pharmacie du Centre', 'Quartier non précisé, Lomé, Togo', NULL, 6.1284905, 1.2218713, FALSE, FALSE),
  ('Pharmacie Conseil', 'Quartier non précisé, Lomé, Togo', NULL, 6.1936831, 1.1304653, FALSE, FALSE),
  ('Pharmacie du peuple', 'Quartier non précisé, Lomé, Togo', NULL, 6.1588757, 1.2382663, FALSE, FALSE),
  ('Pharmacie Maëlys', 'Quartier non précisé, Lomé, Togo', '+22823388075', 6.1679518, 1.2754774, FALSE, FALSE),
  ('Pharmacie de la Paix', 'Quartier non précisé, Lomé, Togo', NULL, 6.1693196, 1.2259701, FALSE, FALSE),
  ('Populaire', 'Quartier non précisé, Lomé, Togo', NULL, 6.1253793, 1.2283295, FALSE, FALSE),
  ('Pharmacie Hygea', 'Quartier non précisé, Lomé, Togo', NULL, 6.17841, 1.329995, FALSE, FALSE),
  ('Pharmacie Bel Air', 'Quartier non précisé, Lomé, Togo', NULL, 6.1234164, 1.2232593, FALSE, FALSE),
  ('Faya Médecine', 'Quartier non précisé, Tsévié, Togo', NULL, 6.4322507, 1.2120263, FALSE, FALSE),
  ('Pharmacie Believe', 'Quartier non précisé, Tsévié, Togo', NULL, 6.4173323, 1.2110811, FALSE, FALSE),
  ('DEPOT DE PHARMARCIE TERMINUS', 'Quartier non précisé, Kpalimé, Togo', NULL, 6.9060446, 0.6409659, FALSE, FALSE),
  ('Pharmacie LAVOISIE', 'Kpalimé - Atakpamé, Kpalimé', NULL, 6.9098906, 0.6317811, FALSE, FALSE),
  ('Pharmacie OWA', 'Quartier non précisé, Sokodé, Togo', NULL, 8.3267161, 0.9853829, FALSE, FALSE),
  ('Pharmacie du Nouveau Marché', 'Quartier non précisé, Kara, Togo', NULL, 9.5608154, 1.1918324, FALSE, FALSE),
  ('Pharmacie Hanoukopé', 'Quartier non précisé, Lomé, Togo', NULL, 6.1370338, 1.2189602, FALSE, FALSE),
  ('Pharmacie Renaissance', 'Quartier non précisé, Kara, Togo', NULL, 9.5383495, 1.196284, FALSE, FALSE),
  ('Pharmacie Maïna', 'Quartier non précisé, Lomé, Togo', '+22870436534', 6.1920094, 1.1774504, FALSE, FALSE),
  ('Pharmacie Zossimé', 'Quartier non précisé, Lomé, Togo', NULL, 6.2333568, 1.1489943, FALSE, FALSE),
  ('Pharmacie Immaculée Conception/OCDI', 'Quartier non précisé, Kpalimé, Togo', NULL, 6.9062106, 0.641613, FALSE, FALSE),
  ('Dépôt Pharmacie Espérance', 'Quartier non précisé, Kpalimé, Togo', NULL, 6.8999567, 0.6351537, FALSE, FALSE),
  ('Dépôt de pharmacie', 'Quartier non précisé, Mango, Togo', NULL, 10.3534443, 0.4701537, FALSE, FALSE),
  ('Pharmacie Lamoya', 'Quartier non précisé, Mango, Togo', '+22827777297', 10.3558388, 0.4751895, FALSE, FALSE),
  ('Pharmacie Santé Plus', 'Quartier non précisé, Mango, Togo', NULL, 10.3620679, 0.4741435, FALSE, FALSE),
  ('Pharmacie Terminus', 'Quartier non précisé, Kpalimé, Togo', NULL, 6.9060463, 0.6411529, FALSE, FALSE),
  ('Pharmacie Kékéli', 'Quartier non précisé, Kpalimé, Togo', NULL, 6.9189874, 0.6340893, FALSE, FALSE),
  ('Pharmacie La Flamme d''Amour', 'Quartier non précisé, Lomé, Togo', NULL, 6.1762419, 1.3657305, FALSE, FALSE),
  ('Pharmacie villageois', 'Quartier non précisé, Lomé, Togo', NULL, 6.1734229, 1.1697008, FALSE, FALSE),
  ('Pharmacie Mathilda', 'Quartier non précisé, Lomé, Togo', NULL, 6.1824402, 1.1996998, FALSE, FALSE),
  ('Pharmacie Vétérinaire et clinique la référence', 'Quartier non précisé, Lomé, Togo', '+22890030375', 6.2294278, 1.2110093, FALSE, FALSE),
  ('Pharmacie Ganfat', 'Quartier non précisé, Lomé, Togo', NULL, 6.2374252, 1.162816, FALSE, FALSE),
  ('Pharmacie Nabine', 'Quartier non précisé, Lomé, Togo', NULL, 6.2182105, 1.18285, FALSE, FALSE),
  ('Pharmacie Isis', 'Quartier non précisé, Lomé, Togo', NULL, 6.1572745, 1.2331672, FALSE, FALSE),
  ('Dépôt de pharmacie', 'Quartier non précisé, Kara, Togo', NULL, 9.6589584, 1.3130456, FALSE, FALSE),
  ('Pharmacie Villageoise', 'Quartier non précisé, Kara, Togo', NULL, 9.6653563, 1.3133839, FALSE, FALSE),
  ('Dépôt Pharmaceutique', 'Quartier non précisé, Kara, Togo', NULL, 9.6578482, 1.3080034, FALSE, FALSE),
  ('Pharmacie Ropheka', 'Quartier non précisé, Kara, Togo', NULL, 9.6597243, 1.3058965, FALSE, FALSE),
  ('Dispensaire Ashifa de Sirka', 'Quartier non précisé, Kara, Togo', NULL, 9.5639266, 1.324735, FALSE, FALSE),
  ('Pharmacie Villageoise', 'Quartier non précisé, Kara, Togo', NULL, 9.5963036, 1.2380054, FALSE, FALSE),
  ('Dispensaire de Soumdina Haut', 'Quartier non précisé, Kara, Togo', NULL, 9.6572189, 1.21378, FALSE, FALSE),
  ('USP Soumdina bas', 'Quartier non précisé, Kara, Togo', NULL, 9.6450706, 1.2561147, FALSE, FALSE),
  ('Dépôt de pharmacie', 'Quartier non précisé, Sokodé, Togo', NULL, 8.6583762, 1.0190041, FALSE, FALSE),
  ('Pharmacie La Main de Dieu', 'Quartier non précisé, Lomé, Togo', NULL, 6.235027, 1.2003304, FALSE, FALSE),
  ('Dépôt de pharmacie Dieu nous aime', 'Quartier non précisé, Tsévié, Togo', NULL, 6.3427514, 1.1128147, FALSE, FALSE),
  ('Dépôt pharmaceutique de Niamtougou', 'Quartier non précisé, Kara, Togo', NULL, 9.7652705, 1.1088458, FALSE, FALSE),
  ('Pharmacie Bétania', 'Quartier non précisé, Lomé, Togo', '0022822438940', 6.1924973, 1.1814503, FALSE, FALSE),
  ('Dépôt de pharmacie', 'Quartier non précisé, Kpalimé, Togo', NULL, 6.9309546, 0.657571, FALSE, FALSE),
  ('Dépôt de pharmacie', 'Quartier non précisé, Tsévié, Togo', NULL, 6.4328421, 0.926384, FALSE, FALSE),
  ('Dépôt de pharmacie', 'Quartier non précisé, Tsévié, Togo', NULL, 6.4475964, 0.9157621, FALSE, FALSE),
  ('Pharmacie Saint Paul', 'Quartier non précisé, Lomé, Togo', NULL, 6.1518801, 1.2324318, FALSE, FALSE),
  ('Pharmacie de la Providence', 'Quartier non précisé, Lomé, Togo', NULL, 6.1606822, 1.2338052, FALSE, FALSE),
  ('Pharmacie Saint Joseph', 'Quartier non précisé, Lomé, Togo', NULL, 6.1772954, 1.2051749, FALSE, FALSE),
  ('Pharmacie forever', 'Quartier non précisé, Lomé, Togo', NULL, 6.1597269, 1.2261792, FALSE, FALSE),
  ('Dépôt de pharmacie', 'Quartier non précisé, Dapaong, Togo', NULL, 10.9128703, 0.309822, FALSE, FALSE),
  ('Pharmacie Amen', 'Quartier non précisé, Tsévié, Togo', NULL, 6.3201665, 1.223432, FALSE, FALSE),
  ('Pharmacie Wend Barka', 'Quartier non précisé, Dapaong, Togo', NULL, 11.1087141, 0.0130979, FALSE, FALSE),
  ('Pharmacie Lafe Zaka', 'Quartier non précisé, Dapaong, Togo', NULL, 11.1101163, 0.0212002, FALSE, FALSE),
  ('Pharmacie Vétérinaire', 'Quartier non précisé, Sokodé, Togo', NULL, 8.3438625, 1.0088251, FALSE, FALSE),
  ('Pharmacie La Pharmacie Tulipe', 'Quartier non précisé, Lomé, Togo', NULL, 6.2605816, 1.1631053, FALSE, FALSE),
  ('Pharmacie Volontas Déï', 'Quartier non précisé, Lomé, Togo', NULL, 6.2021934, 1.1731723, FALSE, FALSE),
  ('Dépôt de pharmacie', 'Quartier non précisé, Sokodé, Togo', NULL, 8.6636145, 1.0179278, FALSE, FALSE),
  ('Dépôt de Pharmacie', 'Quartier non précisé, Atakpamé, Togo', NULL, 8.2288769, 1.134875, FALSE, FALSE),
  ('Dépôt de Pharmacie', 'Quartier non précisé, Sokodé, Togo', NULL, 9.1185074, 1.3287867, FALSE, FALSE),
  ('Pharmacie Denis', 'Quartier non précisé, Lomé, Togo', NULL, 6.2476092, 1.1617103, FALSE, FALSE),
  ('Pharmacie Groupe C', 'Quartier non précisé, Lomé, Togo', '+22899982087', 6.1881338, 1.195267, FALSE, FALSE),
  ('Pharmacie Vigueur', 'Quartier non précisé, Lomé, Togo', NULL, 6.1925922, 1.200811, FALSE, FALSE),
  ('Pharmacie Verte', 'Quartier non précisé, Lomé, Togo', NULL, 6.1858972, 1.2070966, FALSE, FALSE),
  ('Mawunyo', 'Quartier non précisé, Lomé, Togo', NULL, 6.2548621, 1.1713337, FALSE, FALSE),
  ('Pharmacie sainte famille', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.530133, 1.1244831, FALSE, FALSE),
  ('Pharmacie du Grand Marché', 'Quartier non précisé, Lomé, Togo', NULL, 6.1257122, 1.225493, FALSE, FALSE),
  ('Pharmacie BAKOE', 'Quartier non précisé, Tsévié, Togo', NULL, 6.2853899, 1.141689, FALSE, FALSE),
  ('Pharmcie TAKOE', 'Quartier non précisé, Lomé, Togo', NULL, 6.2531159, 1.2085497, FALSE, FALSE),
  ('PHARMACIE DEO GRACIAS', 'Quartier non précisé, Lomé, Togo', NULL, 6.2068776, 1.2391657, FALSE, FALSE),
  ('Pharmacie de tchodzo', 'Quartier non précisé, Sokodé, Togo', NULL, 8.9869788, 1.1398475, FALSE, FALSE),
  ('Pharmacie Deo Gratias', 'Quartier non précisé, Lomé, Togo', '+22896800893', 6.2068923, 1.2389625, FALSE, FALSE),
  ('St kizito', 'Quartier non précisé, Lomé, Togo', '+22822219963', 6.1643794, 1.2202836, FALSE, FALSE),
  ('Pharmacie Amitié', 'Quartier non précisé, Lomé, Togo', '+22822217447', 6.1535809, 1.2225734, FALSE, FALSE),
  ('Laborex Togo', 'Rue des Hydrocarbures,  Quartier TOKOIN GBONVIÉ,, Lomé', '+22822202510', 6.1556219, 1.2259235, FALSE, FALSE),
  ('Pharmacie UNIVERS-SANTÉ', 'Quartier non précisé, Lomé, Togo', NULL, 6.1825881, 1.2145868, FALSE, FALSE),
  ('Pharmacie Campus', 'Quartier non précisé, Lomé, Togo', NULL, 6.1628842, 1.2134211, FALSE, FALSE),
  ('Pharmacie CHU Campus', 'Quartier non précisé, Lomé, Togo', '+22822254739', 6.1793105, 1.2125855, FALSE, FALSE),
  ('Pharmacie verte', 'Quartier non précisé, Lomé, Togo', '+22822250326', 6.1860259, 1.207062, FALSE, FALSE),
  ('Pharmacie la confiance', 'Quartier non précisé, Lomé, Togo', '+22822253932', 6.1914338, 1.2084422, FALSE, FALSE),
  ('Pharmacie paniel', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.5318945, 1.1221815, FALSE, FALSE),
  ('Dépôt de pharmacie Assoce', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.5394017, 1.148524, FALSE, FALSE),
  ('Sainte famille', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.530007, 1.1243994, FALSE, FALSE),
  ('Pharmacie CHR Atakpame', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.5327266, 1.1263182, FALSE, FALSE),
  ('Pharmacie Agbonou', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.5086727, 1.1531598, FALSE, FALSE),
  ('Pharmacie du Grand plateau', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.5170019, 1.1497771, FALSE, FALSE),
  ('Dépôt de pharmacie d''agbonou', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.5168671, 1.1482009, FALSE, FALSE),
  ('Pharmacie N''koko-Ewe', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.5255714, 1.1491744, FALSE, FALSE),
  ('Pharmacie Nko kowoé', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.5255256, 1.1492542, FALSE, FALSE),
  ('Dépôt de pharmacie', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.537704, 1.1511067, FALSE, FALSE),
  ('Pharmacie Enouli', 'Quartier non précisé, Lomé, Togo', NULL, 6.2005233, 1.2014823, FALSE, FALSE),
  ('Pharmacie El-Nissi', 'Quartier non précisé, Lomé, Togo', NULL, 6.2129413, 1.1338098, FALSE, FALSE),
  ('Pharmacie apou antoine', 'Quartier non précisé, Lomé, Togo', NULL, 6.2240425, 1.1922048, FALSE, FALSE),
  ('Pharmacie le rocher', 'Quartier non précisé, Lomé, Togo', NULL, 6.2463084, 1.2092832, FALSE, FALSE),
  ('Pharmacie saint Michel', 'Quartier non précisé, Lomé, Togo', NULL, 6.2154223, 1.2083881, FALSE, FALSE),
  ('Pharmacie Principale', 'Quartier non précisé, Lomé, Togo', NULL, 6.1779708, 1.3753905, FALSE, FALSE),
  ('Pharmacie de l''Union', 'Quartier non précisé, Lomé, Togo', NULL, 6.1603547, 1.2634107, FALSE, FALSE),
  ('Iris Pharmacie', 'Quartier non précisé, Lomé, Togo', NULL, 6.2028574, 1.1612956, FALSE, FALSE),
  ('Pharmacie Vétérinaire PROVET', 'AVENUE MAMAN N'' DANIDA, DOULASSAME', NULL, 6.1423139, 1.2299288, FALSE, FALSE),
  ('Pharmacie AKOFA', 'Avenue Maman N''DANIDA, DOULASSAME', NULL, 6.1431126, 1.2299573, FALSE, FALSE),
  ('Pharmacie Notre dame', 'Rue de la foire, Hedzranawoé', NULL, 6.1822585, 1.2551459, FALSE, FALSE),
  ('Pharmacie du Reconfort', 'Quartier non précisé, Kara, Togo', '+22893459393', 9.5589911, 1.2120948, FALSE, FALSE),
  ('Pharmacie le Jourdain', 'Quartier non précisé, Lomé, Togo', NULL, 6.1676824, 1.2319461, FALSE, FALSE),
  ('Pharmacie la ruche', 'Quartier non précisé, Lomé, Togo', '91430404', 6.1889722, 1.2720809, FALSE, FALSE),
  ('Pharmacie Fidélia', 'Quartier non précisé, Lomé, Togo', NULL, 6.1662742, 1.2665629, FALSE, FALSE),
  ('Pharmacie Fidélia', 'Quartier non précisé, Lomé, Togo', NULL, 6.1663785, 1.2665691, FALSE, FALSE),
  ('Pharmacie Christ Roi', 'Quartier non précisé, Notsé, Togo', NULL, 6.9502358, 1.1702664, FALSE, FALSE),
  ('Pharmacie Bon Secours', 'Quartier non précisé, Lomé, Togo', '+22870457674', 6.1534769, 1.2036048, FALSE, FALSE),
  ('Pharmacie Vitale', 'Quartier non précisé, Lomé, Togo', NULL, 6.1293615, 1.227606, FALSE, FALSE),
  ('Pharmacie saint pierre', 'Quartier non précisé, Lomé, Togo', '70432637', 6.1956832, 1.2463408, FALSE, FALSE),
  ('Pharmacie APOTHEKA', 'Quartier non précisé, Lomé, Togo', '+28822615757', 6.1955673, 1.2390746, FALSE, FALSE),
  ('Pharmacie Kouessan', 'Quartier non précisé, Lomé, Togo', NULL, 6.2034712, 1.2418582, FALSE, FALSE),
  ('Pharmacie assurance', 'Quartier non précisé, Tsévié, Togo', NULL, 6.3219628, 1.2176996, FALSE, FALSE),
  ('Pharmacie Régina Pacis', 'Quartier non précisé, Tsévié, Togo', NULL, 6.3191268, 1.2171957, FALSE, FALSE),
  ('Pharmacie Elemawussi', 'Quartier non précisé, Tsévié, Togo', NULL, 6.3291033, 1.2186433, FALSE, FALSE),
  ('Pharmacie de la Mairie', 'Quartier non précisé, Lomé, Togo', NULL, 6.131458, 1.214806, FALSE, FALSE),
  ('Pharmacie Notre dame de Lourdes', 'Quartier non précisé, Lomé, Togo', NULL, 6.213282, 1.1887839, FALSE, FALSE),
  ('Pharmacie Peniel', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.5318831, 1.1221045, FALSE, FALSE),
  ('Pharmacie la santé', 'Quartier non précisé, Lomé, Togo', NULL, 6.1310293, 1.2273383, FALSE, FALSE),
  ('Pharmacie gbeze', 'Quartier non précisé, Lomé, Togo', NULL, 6.1710665, 1.2347833, FALSE, FALSE),
  ('Pharmacie Eva', 'Quartier non précisé, Lomé, Togo', NULL, 6.2458357, 1.1144944, FALSE, FALSE),
  ('Pharmacie Santé', 'Quartier non précisé, Lomé, Togo', NULL, 6.1313375, 1.2275772, FALSE, FALSE),
  ('Dépôt de pharmacie', 'Quartier non précisé, Vogan, Togo', NULL, 6.4745789, 1.568935, FALSE, FALSE),
  ('Pharmacie Zénith', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.7674968, 1.1929274, FALSE, FALSE),
  ('Pharmacie Source de Vie', 'Quartier non précisé, Lomé, Togo', NULL, 6.1471583, 1.2034767, FALSE, FALSE),
  ('Pharmacie la santé plus proche', 'N5 Kpalimé-Atakpamé', NULL, 7.1339883, 0.7317874, FALSE, FALSE),
  ('Dépôt de Pharmacie la Gloire', 'Quartier non précisé, Kpalimé, Togo', NULL, 7.1283177, 0.7277636, FALSE, FALSE),
  ('Pharmacie la persévérance', 'Quartier non précisé, Kpalimé, Togo', NULL, 6.915694, 0.6337259, FALSE, FALSE),
  ('Pharmacie Saint Michel', 'Quartier non précisé, Atakpamé, Togo', NULL, 7.5738129, 0.6764977, FALSE, FALSE),
  ('Pharmacie Nellys', 'Quartier non précisé, Lomé, Togo', '99909080', 6.2143127, 1.1121838, FALSE, FALSE),
  ('Pharmacie de Vogan', 'Quartier non précisé, Vogan, Togo', NULL, 6.3355209, 1.5287653, FALSE, FALSE),
  ('Pharmacie vétérinaire', 'Quartier non précisé, Vogan, Togo', NULL, 6.3355682, 1.5287135, FALSE, FALSE),
  ('Pharmacie Santibon', 'Quartier non précisé, Mango, Togo', '+22893565600', 10.5543295, 0.3050441, FALSE, FALSE),
  ('Pharmacie N''ba', 'Quartier non précisé, Lomé, Togo', NULL, 6.2717354, 1.1487432, FALSE, FALSE),
  ('Pharmacie Sotouboua', 'Quartier non précisé, Sokodé, Togo', NULL, 8.5602753, 0.9753369, FALSE, FALSE),
  ('Pharmacie Gratitude', 'Quartier non précisé, Lomé, Togo', NULL, 6.2646431, 1.1359024, FALSE, FALSE),
  ('Pharmacie', 'Quartier non précisé, Lomé, Togo', NULL, 6.2429333, 1.1981493, FALSE, FALSE),
  ('Pharmacie Anfoin', 'Anfoin Kpota, non loin de l''école primaire', '79975244', 6.32857, 1.6078327, FALSE, FALSE),
  ('Pharmacie des écoles', 'Quartier non précisé, Lomé, Togo', NULL, 6.1919732, 1.1583794, FALSE, FALSE),
  ('Pharmacie Agoè-Nyivé', 'Quartier non précisé, Lomé, Togo', NULL, 6.2262121, 1.21046, FALSE, FALSE),
  ('Pharmacie Maïna', 'Quartier non précisé, Lomé, Togo', NULL, 6.2290243, 1.1985549, FALSE, FALSE);
