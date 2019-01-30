import { Server, Logger } from '../utils';

const requestHandler = (request, response) => {
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.end('Hello World!');
};

const server = new Server(requestHandler);
server.listen(port => Logger.console(`Server is listening on ${port}`));
