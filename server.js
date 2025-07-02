//                                              Bismillahirrahmanirrahim

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your own keys!
const SUPABASE_URL = 'https://hvxkdtggfueynkburzmx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eGtkdGdnZnVleW5rYnVyem14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzY1ODAsImV4cCI6MjA2NzAxMjU4MH0.fVFWTvK5Jk4AOTCXetRaWdTPT2H7qPE0VsSinKVEv2k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getMonthAndYear() {
  const now = new Date();
  return {
    month: now.toLocaleString('default', { month: 'long' }),
    year: now.getFullYear()
  };
}

app.post('/tap', async (req, res) => {
  const { month, year } = getMonthAndYear();

  let { data: row, error } = await supabase
    .from('global_taps')
    .select('*')
    .eq('month', month)
    .eq('year', year)
    .eq('is_active', true)
    .single();

  console.log("SELECT result:", row);
  console.log("SELECT error:", error);

  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: 'Select failed' });
  }

  if (!row) {
    const { data: inserted, error: insertError } = await supabase
      .from('global_taps')
      .insert([{ month, year, tap_count: 1, is_active: true }])
      .select()
      .single();

    console.log("INSERT error:", insertError);

    if (insertError) {
      return res.status(500).json({ error: 'Insert failed' });
    }

    return res.json({ new_count: 1 });
  } else {
    const newCount = row.tap_count + 1;

    const { error: updateError } = await supabase
      .from('global_taps')
      .update({ tap_count: newCount })
      .eq('id', row.id);

    console.log("UPDATE error:", updateError);
    
    if (updateError) {
      return res.status(500).json({ error: 'Update failed' });
    }

    return res.json({ new_count: newCount });
  }
});

app.get('/leaderboard', async (req, res) => {
  let { data, error } = await supabase
    .from('global_taps')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }

  res.json(data);
});

app.listen(3000, () => console.log('✅ Server running at http://localhost:3000'));

//                                              Wallahu A'lam