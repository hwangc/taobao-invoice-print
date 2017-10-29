import { graphql, compose, gql } from "react-apollo";
import Main from "../../components/Main";

const QUERY = gql`
  query DoQuery($date: String!, $turn: Int!) {
    queryLpTotal(date: $date, turn: $turn) {
      totalLP
    }
    queryTurnByDate(date: $date) {
      turn
    }
  }
`;

const QUERY_LP_TOTAL = gql`
  query DoLpTotalQuery($date: String!, $turn: Int!) {
    queryLpTotal(date: $date, turn: $turn) {
      totalLP
    }
  }
`;

const SUBSCRIPTION = gql`
  subscription DoSubscription($date: String!, $turn: Int!) {
    subscribeLpTotal(date: $date, turn: $turn) {
      totalLP
    }
  }
`;

const withQueryData = graphql(QUERY, {
  options: ({ date, turn }) => ({
    variables: {
      date: date,
      turn: turn
    }
  })
});

const withSubscriptionData = graphql(QUERY_LP_TOTAL, {
  name: "newLpTotal",
  options: ({ date, turn }) => ({
    variables: {
      date: date,
      turn: turn
    }
  }),
  props: props => {
    return {
      subscribeNewLpTotal: ({ date, turn }) => {
        console.log("I subscribe date:turn ", date, ":", turn);
        return props.newLpTotal.subscribeToMore({
          document: SUBSCRIPTION,
          variables: {
            date: date,
            turn: turn
          },
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) {
              return prev;
            }
            const newLpTotal = subscriptionData.data.subscribeLpTotal;
            console.log("update query prev: ", prev, " new: ", subscriptionData);
            console.log("subscribe ", subscriptionData, "Date: ", date, "turn: ", turn);
            console.log(
              "new subscribtipn data ",
              Object.assign({}, prev, {
                queryLpTotal: Object.assign({}, prev.queryLpTotal, {
                  totalLP: newLpTotal.totalLP
                })
              })
            );
            return Object.assign({}, prev, {
              queryLpTotal: Object.assign({}, prev.queryLpTotal, {
                totalLP: newLpTotal.totalLP
              })
            });
          }
        });
      }
    };
  }
});
const withData = compose(withQueryData, withSubscriptionData);
const MainWithData = withData(Main);

export default MainWithData;
