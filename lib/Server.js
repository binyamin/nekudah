import { createServer } from "node:http";

import handler from "serve-handler";
import log from "signale-logger";

/**
 * Serve a folder using http over a specified port
 * @param {{ dir: string, port: 3000 }} config
 */
class Server {
    #port;
    #server;

    constructor({ dir, port=3000 }) {
        this.#port = port;

        this.#server = createServer((request, response) => {
            log.log({prefix: request.method, message: request.url });
            return handler(request, response, { public: dir })
        })
    }

    get listening() {
        return this.#server.listening;
    }

    start() {
        this.#server.listen(this.#port, () => {
            log.start(`Server listening on port ${this.#port}`);
        });
        return;
    }

    stop() {
        this.#server.close();
        return;
    }
}

export default Server
