import { resolve } from 'node:path';

import nunjucks from 'nunjucks';

import { outputFile } from './common/fs.js';

/**
 * Engine for html templates and partials (wrapper for nunjucks)
 * @param {Object} options
 * @param {string} options.src
 * @param {string} options.out
 */
class Engine extends nunjucks.Environment {
    #options;

    constructor(options) {
        const fs = new nunjucks.FileSystemLoader(options.src);
        super(fs);

        this.#options = options;
    }

    get options() {
        return this.#options;
    }

    /**
     *
     * @param {string} fpath path to a template file
     * @param {*} [ctx={}] extra data to pass to the render function
     */
    renderToFile(fpath, ctx={}) {
        const to = resolve(this.#options.out, fpath);

        const res = this.render(fpath, ctx);
        outputFile(to, res, "utf-8");
    }
}

export default Engine;
