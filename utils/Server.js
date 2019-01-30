import http from 'http';
import * as mainConfig from '../config/main.json';

export default class Server {
  constructor(requestHandler = () => {}, port = mainConfig.port) {
    this.port = port;
    this.httpServer = http.createServer(requestHandler);

    process.on('SIGINT', () => {
      setTimeout(() => {
        if (this.httpServer && this.httpServer.listening) {
          this.httpServer.close();
          process.exit();
        }
      });
    });
  }

  listen(connectionHandler = () => {}) {
    this.httpServer.listen(this.port, err => {
      if (err) {
        throw Error(err);
      }

      connectionHandler(this.port);
    });
  }
}
