import { ApolloClient, InMemoryCache } from "@apollo/client";
import { GRAPHQL_API_ENDPOINT } from "@/constants/constants";

const client = new ApolloClient({
  uri: GRAPHQL_API_ENDPOINT,
  cache: new InMemoryCache(),
  headers: {
    "x-hasura-role": "public",
  },
});

export default client;
