export const supabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  auth: {
    // URLs de redirecionamento para diferentes ambientes
    redirectUrls: [],
    // URL padrão para desenvolvimento
    redirectTo: '',
  },
}; 