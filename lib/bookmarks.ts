import { supabase } from "./supabaseClients";

export type Bookmark = {
  id: string;
  slug: string;
  type: "verdict" | "briefing";
  title: string;
  created_at: string;
};

export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  const { data } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Bookmark[];
}

export async function addBookmark(
  userId: string,
  slug: string,
  type: "verdict" | "briefing",
  title: string
) {
  await supabase.from("bookmarks").upsert(
    { user_id: userId, slug, type, title },
    { onConflict: "user_id,slug", ignoreDuplicates: true }
  );
}

export async function removeBookmark(userId: string, slug: string) {
  await supabase.from("bookmarks").delete().eq("user_id", userId).eq("slug", slug);
}

export async function isBookmarked(userId: string, slug: string): Promise<boolean> {
  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("slug", slug)
    .single();
  return !!data;
}