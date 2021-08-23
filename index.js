import path, { relative, resolve } from "node:path";

import { watch as createWatcher } from "chokidar";
import log from "signale-logger";

import Engine from "./lib/Engine.js";
import Server from "./lib/Server.js";
import { copyDir, walk, copyFile, readJSON } from "./lib/common/fs.js";


/** @todo configured, not hard-coded */
const dirs = {
    html: resolve("src"),
    assets: resolve("static"),
    out: resolve("out"),
}

async function build() {
    await copyDir(dirs.assets, dirs.out)

    const templates = (await walk(dirs.html))
    .map(f => {
        return relative(dirs.html, f);
    })
    .filter(f => {
        /**
         * @todo Use underscore convention...
         * - If file starts with underscore, ignore file
         * - If folder starts with underscore, ignore children recursively
         */
        return !f.startsWith("_partials") && f !== "macros.html";
    })

    const env = new Engine({ src: dirs.html, out: dirs.out })
    env.addGlobal("bookmarks", await readJSON("./bookmarks.json"))

    for(const t of templates) {
        env.renderToFile(t);
    }
    log.success("Build complete")
}

/** @todo This list should be built programmatically, and rebuild when files change */
const ftree = [
    {
        filepath: "_partials/layout.html",
        dependents: [
            "index.html",
            "links.html"
        ]
    },
    {
        filepath: "_partials/test.html",
        dependents: [
            "index.html"
        ]
    }
];

function watch() {
    const watcher = createWatcher([dirs.html, dirs.assets]);
    log.watch("Recursively watching src and static directories");

    watcher.on("change", async (fpath, _fstats) => {
        const [rootdir, ...rest] = relative(process.cwd(), fpath).split(path.sep)
        const relpath = rest.join(path.sep);

        if(rootdir === path.basename(dirs.assets)) {
            const outpath = resolve(dirs.out, relpath);
            await copyFile(fpath, outpath);
            log.info("Copied asset", relpath);
        } else if(rootdir === path.basename(dirs.html)) {
            const env = new Engine({ src: dirs.html, out: dirs.out })

            /** @todo configured, not hard-coded */
            env.addGlobal("bookmarks", await readJSON("./bookmarks.json"))

            const fnode = ftree.find(o => o.filepath === relpath);

            if(!!fnode) {
                // file is a partial
                fnode.dependents.forEach(p => {
                    // render the templates which extend it
                    env.renderToFile(p);
                })
            } else {

                /** @todo partials which aren't imported should still be ignored */
                // file is a template
                env.renderToFile(relpath);
            }
        } else {
            log.error(new Error("path is not watched by chokidar: " + fpath));
        }
    })

    process.on("SIGINT", process.exit)

    process.on("exit", () => {
        log.success("Exiting...");
        watcher.unwatch();
        process.exit();
    })
}

function serve() {
    const s = new Server({ dir: dirs.out, port: 3000 })
    s.start();

    process.on("SIGINT", process.exit)

    process.on("exit", () => {
        log.success("Exiting...");
        s.stop()
    })
}

export default { serve, build, watch };
