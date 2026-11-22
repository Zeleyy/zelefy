export interface Server {
    serverId: number;
    serverName: string;
    serverUrl: string;
    isActive: boolean;
    createdAt: string;
}

export interface NewServer {
    serverName: string;
    serverUrl: string;
}
