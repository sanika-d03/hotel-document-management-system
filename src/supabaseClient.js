import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qlgeuuxiznrlzxcvwqrq.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZ2V1dXhpem5ybHp4Y3Z3cXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODUxMzAsImV4cCI6MjA4NzI2MTEzMH0.3NJm-BJJPXeJu94qpALGrDim0LvpghmUiG_MN1ewOn0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);