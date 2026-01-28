-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    is_on_duty BOOLEAN DEFAULT FALSE,
    location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stocks table (relation between pharmacy and medication)
CREATE TABLE IF NOT EXISTS stocks (
    id SERIAL PRIMARY KEY,
    pharmacy_id INTEGER REFERENCES pharmacies(id) ON DELETE CASCADE,
    medication_id INTEGER REFERENCES medications(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pharmacy_id, medication_id)
);

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS pharmacies_location_idx ON pharmacies USING GIST (location);

-- Function for spatial search of medications in pharmacies
CREATE OR REPLACE FUNCTION search_pharmacies(
    search_query TEXT,
    user_lat FLOAT,
    user_lng FLOAT,
    radius_meters FLOAT
)
RETURNS TABLE (
    pharmacy_id INTEGER,
    pharmacy_name VARCHAR,
    address TEXT,
    phone VARCHAR,
    is_on_duty BOOLEAN,
    medication_id INTEGER,
    medication_name VARCHAR,
    price DECIMAL,
    quantity INTEGER,
    distance FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as pharmacy_id,
        p.name as pharmacy_name,
        p.address,
        p.phone,
        p.is_on_duty,
        m.id as medication_id,
        m.name as medication_name,
        s.price,
        s.quantity,
        ST_Distance(p.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distance
    FROM 
        pharmacies p
    JOIN 
        stocks s ON p.id = s.pharmacy_id
    JOIN 
        medications m ON s.medication_id = m.id
    WHERE 
        (m.name ILIKE search_query OR p.name ILIKE search_query)
        AND ST_DWithin(p.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_meters)
    ORDER BY 
        distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    pharmacy_id INTEGER REFERENCES pharmacies(id) ON DELETE CASCADE,
    medication_id INTEGER REFERENCES medications(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication and roles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT, -- Peut être nul pour les utilisateurs Google
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'patient',
    pharmacy_id INTEGER REFERENCES pharmacies(id) ON DELETE SET NULL,
    phone VARCHAR(50),
    address TEXT,
    medical_info TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table for chat
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    pharmacy_id INTEGER REFERENCES pharmacies(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_from_pharmacy BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pharmacy_id INTEGER REFERENCES pharmacies(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, ready, picked_up, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
