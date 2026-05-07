const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const SALT_ROUNDS = 10;

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, pharmacy_id: user.pharmacy_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, full_name, role = 'patient' } = req.body;
  if (!email || !password || !full_name)
    return res.status(400).json({ error: 'Champs requis manquants' });

  try {
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email déjà utilisé' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [email, password_hash, full_name, role === 'super_admin' ? 'patient' : role]
    );

    const user = rows[0];
    res.status(201).json({ token: makeToken(user), user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email et mot de passe requis' });

  try {
    const { rows } = await db.query(
      `SELECT u.*, p.name AS pharmacy_name
       FROM users u
       LEFT JOIN pharmacies p ON p.id = u.pharmacy_id
       WHERE u.email = $1`,
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    res.json({ token: makeToken(user), user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.*, p.name AS pharmacy_name
       FROM users u
       LEFT JOIN pharmacies p ON p.id = u.pharmacy_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(safeUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /auth/profile
router.patch('/profile', requireAuth, async (req, res) => {
  const { full_name, phone, address, medical_info } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           medical_info = COALESCE($4, medical_info)
       WHERE id = $5
       RETURNING *`,
      [full_name, phone, address, medical_info, req.user.id]
    );
    res.json(safeUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
