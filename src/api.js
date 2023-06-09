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

let socket = null;
export async function pricesSubscribe(tokens, cb) {
  const tokensData = await getAllTokens();

  if (tokensData) {
    const pricesData = {};
    tokens.forEach((t) => {
      const id = t.id;
      const tokenData = tokensData.find((td) => td.id === id);
      if (tokenData) {
        const price = Number(tokenData.priceUsd);

        pricesData[id] =
          price < 1 ? price.toPrecision(4) : Number(price.toFixed(2));
      }
    });
    cb(pricesData);
  }

  const assets = tokens.map((t) => t.id);
  if (!assets.length) {
    if (socket !== null) socket.close();
    return;
  }

  if (socket !== null) socket.close();
  socket = new WebSocket(
    `wss://ws.coincap.io/prices?assets=${assets.join(',')}`
  );

  socket.onmessage = (msg) => {
    const pricesData = JSON.parse(msg.data); // { ethereum: '1920.56', bitcoin: '27840.12' }
    cb(pricesData);
  };
}
