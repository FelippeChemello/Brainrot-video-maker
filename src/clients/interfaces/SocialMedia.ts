export type Metric = { 
    title: string, 
    views: number, 
    likes: number, 
    comments: number, 
    shares: number,
}

export interface SocialMediaClient {
    getMetrics(): Promise<Array<Metric>>
}