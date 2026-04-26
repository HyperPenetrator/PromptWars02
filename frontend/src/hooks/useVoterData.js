import { useState, useEffect } from 'react';
import { saveUserData } from '../firebase';

const INITIAL_VOTER_DATA = {
  steps: [
    { id: 1, title: 'Register to Vote', completed: true, description: 'Ensure your name is in the electoral roll.' },
    { id: 2, title: 'Find Polling Booth', completed: false, description: 'Locate your assigned voting station.' },
    { id: 3, title: 'Verify Identity', completed: false, description: 'Check if you have a valid EPIC card.' },
    { id: 4, title: 'Cast Your Vote', completed: false, description: 'Visit your booth on election day.' }
  ],
  savedBooth: null
};

/**
 * Custom hook for managing voter data state and persistence.
 * @param {Object} user - The current Firebase user.
 */
export function useVoterData(user) {
  const [voterData, setVoterData] = useState(() => {
    const saved = localStorage.getItem('voter_data_global');
    return saved ? JSON.parse(saved) : INITIAL_VOTER_DATA;
  });

  useEffect(() => {
    localStorage.setItem('voter_data_global', JSON.stringify(voterData));
    if (user?.uid) {
      saveUserData(user.uid, voterData);
    }
  }, [voterData, user]);

  const updateBooth = (name, address) => {
    setVoterData(prev => ({
      ...prev,
      savedBooth: { name, address },
      steps: prev.steps.map(s => s.id === 2 ? { ...s, completed: true } : s)
    }));
  };

  return { voterData, setVoterData, updateBooth };
}
