import { Server, Logger, helpers } from '../utils';

const MESSAGE = 'My name is Maksym. I work as front-end developer.';

const requestHandler = (request, response) => {
  helpers.pipe(
    helpers.pathToAbsolute,
    helpers.isPathExists,
    helpers.isFileReadable,
    helpers.readFile,
    fileContent => {
      response.setHeader('Content-Type', 'text/html');
      response.end(fileContent.replace('{message}', MESSAGE));
    }
  )('index.html');
};

const server = new Server(requestHandler);
server.listen(port => Logger.console(`Server is listening on ${port}`));
