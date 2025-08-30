import React from "react";

export const Icon = {
    Back: () => (
        <svg viewBox="0 0 24 24" width="18" height="18" className="mr-2">
            <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
    ),
    Play: () => (
        <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
            <path fill="currentColor" d="M8 5v14l11-7z" />
        </svg>
    ),
    Upload: () => (
        <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
            <path fill="currentColor" d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7 7-7Z" />
        </svg>
    ),
    Download: () => (
        <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
            <path fill="currentColor" d="M5 20h14v-2H5m7-14-5 5h3v4h4v-4h3l-5-5Z" />
        </svg>
    ),
};
