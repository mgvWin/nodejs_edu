import { Server, Logger } from '../utils';

const requestHandler = (request, response) => {
  response.end(JSON.stringify(request.headers));
};

const server = new Server(requestHandler);
server.listen(port => Logger.console(`Server is listening on ${port}`));
