export const isTest = false;
const test_graphql_uri = `http://localhost:4040/graphql`;
const test_websocket_uri = `ws://localhost:4040/subscriptions`;
const production_graphql_uri = `http://tip-server.ppb.st/graphql`;
const production_websocket_uri = `ws://tip-server.ppb.st/ws/subscriptions`;
const test_top_api_uri = `http://localhost:4040/top`;
const production_top_api_uri = `http://tip-server.ppb.st/top`;
export const graphql_uri = isTest ? test_graphql_uri : production_graphql_uri;
export const websocket_uri = isTest ? test_websocket_uri : production_websocket_uri;
export const top_api_uri = isTest ? test_top_api_uri : production_top_api_uri;

const config = {
  isTest,
  graphql_uri,
  websocket_uri,
  top_api_uri
};
export default config;
