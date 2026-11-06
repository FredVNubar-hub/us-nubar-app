import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tgirhsfnltuxgaviwfdm.supabase.co";

const supabaseKey = "sb_publishable_76xbu3XhL6Jmy95GB8Qw6A_ebKCJM3f";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);