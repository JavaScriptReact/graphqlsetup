const { gql } = require("apollo-server-express");

module.exports = gql`
  type Text {
    content: String!
  }

  type Query {
    say_something(content: String!): Text
  }
`;
