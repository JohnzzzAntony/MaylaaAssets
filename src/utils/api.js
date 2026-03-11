const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';


export const fetchAssets = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/${category}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching assets for ${category}:`, error);
    return [];
  }
};

export const fetchAllAssets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assets/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching all assets:`, error);
      return [];
    }
};

export const saveAssets = async (category, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/${category}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error saving assets for ${category}:`, error);
    throw error;
  }
};
