import axios from 'axios';

export const validateTokenQuery = async (query) => {
  try {
    const { data } = await axios.get(
      `https://api.coincap.io/v2/assets?search=${query}`
    );
    const tokensList = data.data;
    const token = tokensList.find(
      (t) =>
        t.symbol.toLowerCase() === query.toLowerCase() ||
        t.name.toLowerCase() === query.toLowerCase()
    );
    if (!token) return null;
    return token;
  } catch (error) {
    return null;
  }
};

export const getAllTokens = async () => {
  try {
    const { data } = await axios.get(`https://api.coincap.io/v2/assets`);
    return data.data;
  } catch (error) {
    return null;
  }
};
