import { supabase } from "./supabase";

export async function getCurrentPlayer() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { data: player, error } = await supabase
    .from("joueurs")
    .select("*")
    .eq("email", user.email)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return player;
}