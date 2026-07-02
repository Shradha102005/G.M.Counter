// services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zcxfbhhvoeqohxnftjyp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_x2bDceBOFdsTp1I71fPeGw_Y0Hwf2F6';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
