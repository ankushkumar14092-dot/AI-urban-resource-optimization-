import axios from 'axios'

export const apiClient = axios.create({
    baseURL: '/api',
    timeout: 8000,
})

// ── Traffic ──────────────────────────────────────────────────────────────────
export const fetchTrafficPredict = (data: Record<string, unknown>) =>
    apiClient.post('/traffic/predict', data).then(r => r.data)

// ── Energy ───────────────────────────────────────────────────────────────────
export const fetchEnergyPredict = (data: Record<string, unknown>) =>
    apiClient.post('/energy/predict', data).then(r => r.data)

export const fetchEnergyAnomaly = (data: Record<string, unknown>) =>
    apiClient.post('/energy/anomaly', data).then(r => r.data)

// ── Weather ──────────────────────────────────────────────────────────────────
export const fetchLiveWeather = (lat = 44.98, lon = -93.27) =>
    apiClient.get('/weather/live', { params: { lat, lon } }).then(r => r.data)

// ── Decision ─────────────────────────────────────────────────────────────────
export const fetchDecision = (data: Record<string, unknown>) =>
    apiClient.post('/decision/recommend', data).then(r => r.data)

// ── Water ─────────────────────────────────────────────────────────────────────
export const fetchWaterStatus = () =>
    apiClient.get('/water/status').then(r => r.data)

// ── Waste ─────────────────────────────────────────────────────────────────────
export const fetchWasteStatus = () =>
    apiClient.get('/waste/status').then(r => r.data)

export const fetchWasteRoute = () =>
    apiClient.get('/waste/route').then(r => r.data)

// ── Simulator ─────────────────────────────────────────────────────────────────
export const fetchWhatIf = (data: Record<string, unknown>) =>
    apiClient.post('/simulate/whatif', data).then(r => r.data)
