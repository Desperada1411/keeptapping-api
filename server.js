//                                              Bismillahirrahmanirrahim

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

const SUPABASE_URL = 'https://hvxkdtggfueynkburzmx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // ⚠️ Replace with full key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getMonthAndYear() {
  const now = new Date();
  return {
    month: now.toLocaleString('default', { month: 'long' }),
    year: now.getFullYear()
  };
}

// ✅ GET /tap → Return current count
app.get('/tap', async (req, res) => {
  const { month, year } = getMonthAndYear();

  try {
    const { data, error } = await supabase
      .from('global_taps')
      .select('tap_count')
      .eq('month', month)
      .eq('year', year)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    res.json({ current_count: data.tap_count });
  } catch (err) {
    console.error('GET /tap error:', err);
    res.status(500).json({ error: 'Failed to fetch current count' });
  }
});

// ✅ POST /tap → Add 1
app.post('/tap', async (req, res) => {
  const { month, year } = getMonthAndYear();

  try {
    let { data: row, error } = await supabase
      .from('global_taps')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!row) {
      const { data: inserted, error: insertError } = await supabase
        .from('global_taps')
        .insert([{ month, year, tap_count: 1, is_active: true }])
        .select()
        .single();

      if (insertError) throw insertError;

      return res.json({ new_count: 1 });
    }

    const newCount = row.tap_count + 1;

    const { error: updateError } = await supabase
      .from('global_taps')
      .update({ tap_count: newCount })
      .eq('id', row.id);

    if (updateError) throw updateError;

    res.json({ new_count: newCount });
  } catch (err) {
    console.error('POST /tap error:', err);
    res.status(500).json({ error: 'Failed to increase tap count' });
  }
});

// ✅ GET /leaderboard → All months
app.get('/leaderboard', async (req, res) => {
  try {
    let { data, error } = await supabase
      .from('global_taps')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('GET /leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});

//                                              Wallahu A'lam
