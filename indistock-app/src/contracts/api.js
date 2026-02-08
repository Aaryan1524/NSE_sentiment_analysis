/**
 * API CONTRACT - Stock History Endpoint
 * 
 * This file defines the shared interface between backend and frontend.
 * Both Gemini workers will use this contract to ensure compatibility.
 * 
 * Created by: Manager (Antigravity)
 * Used by: Worker 1 (Backend), Worker 2 (Frontend)
 */

// API Endpoint: GET /api/history/:ticker?range=7d|30d|90d|1y
// 
// Response Shape:
// {
//   ticker: string,
//   range: string,
//   data: Array<{
//     time: string,      // ISO date string "2026-02-01"
//     open: number,
//     high: number,
//     low: number,
//     close: number,
//     volume: number
//   }>
// }

export const API_ENDPOINTS = {
    HISTORY: '/api/history'  // + /:ticker?range=7d
};

export const TIME_RANGES = {
    WEEK: '7d',
    MONTH: '30d',
    QUARTER: '90d',
    YEAR: '1y'
};

export const DEFAULT_RANGE = '30d';
