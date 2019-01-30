import { Server, Logger } from '../utils';

const product = {
  id: 1,
  name: 'Supreme T-Shirt',
  brand: 'Supreme',
  price: 99.99,
  options: [{ color: 'blue' }, { size: 'XL' }]
};

const requestHandler = (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(product));
};

const server = new Server(requestHandler);
server.listen(port => Logger.console(`Server is listening on ${port}`));
