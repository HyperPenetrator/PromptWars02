import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkApiHealth, sendChatMessage, lookupCivicInfo } from '../api';

global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('checkApiHealth returns Online when status is 200', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    const status = await checkApiHealth();
    expect(status).toBe('Online');
  });

  it('checkApiHealth returns Offline on fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    const status = await checkApiHealth();
    expect(status).toBe('Offline');
  });

  it('sendChatMessage calls the correct endpoint', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ response: 'Hello' })
    });

    const result = await sendChatMessage('Hi', []);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/chat'), expect.any(Object));
    expect(result.response).toBe('Hello');
  });

  it('lookupCivicInfo handles errors correctly', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(lookupCivicInfo('test')).rejects.toThrow('Civic API failed');
  });
});
