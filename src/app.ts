import express from 'express';
import cors from 'cors';
import useragent from 'express-useragent';
import v1api from './routers/v1api';
import client from './db/db';

const app = express();
const port = process.env.PORT || 3000;
client.on('connect', function() {
  console.log('Connected!');
});

const whitelist = ['http://localhost:4200', 'https://localhost:4200'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(useragent.express());

app.use('/', v1api);
app.listen(port);
console.log("server started on port");
