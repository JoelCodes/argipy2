
const WebSocket = require('ws');
const {createStore} = require('redux');
const {gameLogicReducer, addPlayer, removePlayer, randomInt, stateForPlayer} = require('./game-logic');

const wss = new WebSocket.Server({ port: 8080 });
const store = createStore(gameLogicReducer);

const consonants = 'bcdfghjklmnpqrstvwxyz\''
const vowels = 'aeiouyr'
function makeName(n = 3){
  if(n <= 0) return '';

  return consonants[randomInt(consonants.length)] + vowels[randomInt(vowels.length)] + makeName(n - 1);
}
wss.on('connection', function connection(ws) {
  const name = makeName();
  const playerAction = addPlayer(name);
  const {payload: {id}} = playerAction;
  const subscription = store.subscribe(() => {
    ws.send(JSON.stringify(stateForPlayer(store.getState(), id)));
  })
  store.dispatch(playerAction);

  ws.on('message', function incoming(message) {
    try {
      const action = JSON.parse(message);
      store.dispatch({...action, payload: {...action.payload, id }});
    } catch(error){

    }
  });
  ws.on('close', () => {
    subscription();
    store.dispatch(removePlayer(id));
  });
});