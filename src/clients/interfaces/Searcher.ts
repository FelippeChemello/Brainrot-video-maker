export interface SearcherClient {
    searchImage(query: string, id?: string | number): Promise<{ mediaSrc?: string }>;
}