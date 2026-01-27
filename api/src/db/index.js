"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing. Check your .env file.');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Helper for raw queries if needed (via RPC or specific client methods)
const query = async (text, params) => {
    // Note: Supabase client doesn't use raw SQL strings directly for security.
    // We will mostly use the client's builder pattern.
    // For complex PostGIS queries, we might need to use RPC (Database Functions).
    return { rows: [] };
};
exports.query = query;
exports.default = exports.supabase;
//# sourceMappingURL=index.js.map