import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Admin client – utilise la service role key
// À utiliser uniquement dans des Route Handlers/Server Actions (jamais côté client)
export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    { auth: { persistSession: false } }
  )



