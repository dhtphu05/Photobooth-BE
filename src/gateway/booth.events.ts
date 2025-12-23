export interface ServerToClientEvents {
    state_updated: (data: { sessionId: string; filter?: string; frame?: string }) => void;
    start_countdown: () => void;
    show_result: (data: { imageUrl: string }) => void;
}

export interface ClientToServerEvents {
    join: (sessionId: string) => void;
    update_state: (data: { sessionId: string; filter?: string; frame?: string }) => void;
    trigger_countdown: (sessionId: string) => void;
    capture_done: (data: { sessionId: string; imageUrl: string }) => void;
}
