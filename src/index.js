import React from "react";
import ReactDOM from "react-dom";
import Tip from "./components/Tip";
import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import WebSocketLink from "apollo-link-ws";
import Cache from "apollo-cache-inmemory";
import { getOperationAST } from "graphql";
import "./index.css";
import config from "./services/config";
//import registerServiceWorker from "./registerServiceWorker";
const GRAPHQL_ENDPOINT = config.graphql_uri;
const WEBSOCKET_ENDPOINT = config.websocket_uri;
const hasSubscriptionOperation = operation => {
  const operationAST = getOperationAST(operation.query, operation.operationName);
  return !!operationAST && operationAST.operation === "subscription";
};
const link = ApolloLink.split(
  hasSubscriptionOperation,
  new WebSocketLink({
    uri: WEBSOCKET_ENDPOINT,
    options: { reconnect: true }
  }),
  new HttpLink({
    uri: GRAPHQL_ENDPOINT
  })
);
const client = new ApolloClient({
  link,
  cache: new Cache(window.__APOLLO_STATE)
});
ReactDOM.render(
  <ApolloProvider client={client}>
    <Tip />
  </ApolloProvider>,
  document.getElementById("root")
);
//registerServiceWorker();
