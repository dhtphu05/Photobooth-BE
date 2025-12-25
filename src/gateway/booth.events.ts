export interface ServerToClientEvents {
    // Existing
    state_updated: (data: { sessionId: string; filter?: string; frame?: string }) => void;
    start_countdown: () => void;
    show_result: (data: { imageUrl: string }) => void;

    // New - Remote Control Flow
    update_config: (data: { sessionId: string; selectedFrameId: string; selectedFilter: string }) => void;
    trigger_finish: () => void;
    processing_start: () => void;
    processing_done: () => void;
}

export interface ClientToServerEvents {
    join: (sessionId: string) => void;

    // Existing
    update_state: (data: { sessionId: string; filter?: string; frame?: string }) => void;
    trigger_countdown: (sessionId: string) => void;
    capture_done: (data: { sessionId: string; imageUrl: string }) => void;

    // New - Remote Control Flow
    update_config: (data: { sessionId: string; selectedFrameId: string; selectedFilter: string }) => void;
    trigger_finish: (sessionId: string) => void;
    processing_start: (sessionId: string) => void;
    processing_done: (sessionId: string) => void;
}
