import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoterData } from '../useVoterData';

// Mock Firebase module
vi.mock('../../firebase', () => ({
  saveUserData: vi.fn(),
}));

describe('useVoterData Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with default data when localStorage is empty', () => {
    const { result } = renderHook(() => useVoterData(null));
    expect(result.current.voterData.steps).toHaveLength(4);
    expect(result.current.voterData.savedBooth).toBeNull();
  });

  it('updates booth and marks step 2 as completed', () => {
    const { result } = renderHook(() => useVoterData(null));
    
    act(() => {
      result.current.updateBooth('Test Booth', 'Test Address');
    });

    expect(result.current.voterData.savedBooth.name).toBe('Test Booth');
    expect(result.current.voterData.steps.find(s => s.id === 2).completed).toBe(true);
  });

  it('persists data to localStorage on change', () => {
    const { result } = renderHook(() => useVoterData(null));
    
    act(() => {
      result.current.updateBooth('Test Booth', 'Test Address');
    });

    const saved = JSON.parse(localStorage.getItem('voter_data_global'));
    expect(saved.savedBooth.name).toBe('Test Booth');
  });
});
