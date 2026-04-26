/**
 * API Service Layer
 * Centralizes all backend communication for the Election Assistant.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8001' : '');

export const checkApiHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/health`);
    return res.ok ? 'Online' : 'Error';
  } catch {
    return 'Offline';
  }
};

export const sendChatMessage = async (prompt, history) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history })
  });
  
  if (!response.ok) throw new Error('Chat API failed');
  return response.json();
};

export const lookupCivicInfo = async (address) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/civic-info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  
  if (!response.ok) throw new Error('Civic API failed');
  return response.json();
};

export const geocodeAddress = async (address) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
    const data = await res.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (e) {
    console.error("Geocoding failed", e);
    return null;
  }
};
