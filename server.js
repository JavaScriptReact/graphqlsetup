const { createServer } = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const env_data = require("./config");

mongoose
  .connect(env_data.MONGODB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected ..."));

mongoose.connection.on("error", (err) => console.log("Network Error : ", err));

const app = express();
const http_server = createServer(app);

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser(env_data.COOKIE_SECRET));
app.use(
  session({
    secret: env_data.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
      secret: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");

const server = new ApolloServer({
  resolvers,
  typeDefs,
  subscriptions: {
    path: "/subscriptions",
  },
});

server.start().then(function () {
  server.applyMiddleware({ app });
  server.installSubscriptionHandlers(http_server);

  http_server.listen(env_data.PORT, () => {
    console.log(
      `Server is listening on PORT: ${env_data.PORT}, GraphQL: ${server.graphqlPath}, Subs: ${server.subscriptionsPath}`
    );
  });
});
