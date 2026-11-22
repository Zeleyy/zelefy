export type SearchSource = "all" | "local" | "remote";
export type SearchType = "tracks" | "playlists" | "users";

export interface SearchTabProps {
    query: string;
    source: Exclude<SearchSource, "remote">;
    isTyping: boolean;
}
