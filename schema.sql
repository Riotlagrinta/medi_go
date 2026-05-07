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
