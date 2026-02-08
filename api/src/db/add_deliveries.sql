CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    courier_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Le livreur
    pickup_address TEXT NOT NULL, -- Adresse Pharmacie
    delivery_address TEXT NOT NULL, -- Adresse Patient
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, picked_up, delivered
    courier_lat FLOAT,
    courier_lng FLOAT,
    delivery_fee DECIMAL(10, 2) DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour trouver rapidement les livraisons dispos
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
