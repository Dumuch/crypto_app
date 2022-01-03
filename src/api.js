const API_KEY =
  "7213aa3924c78cecda0bc528cbba4bccd6bb4c833ba8ceec5571999995742fc9";

const tickersHandlers = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);

  if (type !== AGGREGATE_INDEX || !newPrice) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => {
    fn(newPrice);
  });
});

export const loadCoinList = () => {
  return fetch(`https://min-api.cryptocompare.com/data/all/coinlist`).then(
    (r) => r.json()
  );
};

const sendToWebSocket = (message) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    socket.addEventListener(
      "open",
      () => {
        socket.send(message);
      },
      { once: true }
    );
  }
};

const subscribeToTickerOnWebSocket = (ticker, to = "USD") => {
  const message = JSON.stringify({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~${to}`],
  });

  sendToWebSocket(message);
};

const unSubscribeToTickerOnWebSocket = (ticker, to = "USD") => {
  const message = JSON.stringify({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~${to}`],
  });

  sendToWebSocket(message);
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWebSocket(ticker);
};

export const unSubscribeToTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unSubscribeToTickerOnWebSocket(ticker);
};
