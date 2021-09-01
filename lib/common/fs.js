import yaml from 'js-yaml';
import { promises as fs } from 'node:fs';
import { parse as parsePath, join, relative, resolve } from 'node:path';

/**
 * Get all files within subdirectories
 * @param {string} dir directory to crawl
 * @param {string[]} [_fileList] Array which keeps the list of files in-memory
 * @returns {Promise<string[]>}
 */
export async function walk(dir, _fileList = []) {
    const files = await fs.readdir(dir)
    for (const file of files) {
        const stat = await fs.stat(join(dir, file))
        if (stat.isDirectory()) {
            _fileList = await walk(join(dir, file), _fileList)
        }
        else {
            _fileList.push(join(dir, file))
        }
    }
    return _fileList;
}

/**
 * Write data to a file, making parent directories as needed
 * @param {string} filepath - absolute path to a file
 * @param { string | Uint8Array } data - data to write
 * @param { fs.WriteFileOptions } [options] - same as `fs.writeFile()` options
 * @return {Promise<void>}
 */
export async function outputFile(filepath, data, options) {
    const { dir } = parsePath(filepath);
    try {
        await fs.access(dir);
    } catch (error) {
        if(error.code === "ENOENT") await fs.mkdir(dir, { recursive: true })
        else throw new Error(error)
    }
    return await fs.writeFile(filepath, data, options);
}

/**
 * Read and parse a `.json` file
 * @param {string} filepath path to a file; passed directly to `fs.readFile()`
 * @returns {Promise<any>}
 */
export async function readJSON(filepath) {
    return JSON.parse(await fs.readFile(filepath, "utf-8"));
}

/**
 * Read and parse a `.yaml` file
 * @param {string} filepath path to a file; passed directly to `fs.readFile()`
 * @returns {Promise<any>}
 */
 export async function readYAML(filepath) {
    return yaml.load(await fs.readFile(filepath, "utf-8"), {
        filename: filepath
    });
}

/**
 * Copy a single file, creating directories if necessary
 * @param {string} from - input path (absolute)
 * @param {string} to - output path (absolute)
 */
export async function copyFile(from, to) {
    const fdata = await fs.readFile(from, "utf-8");
    await outputFile(to, fdata, "utf-8")
}

/**
 * Recurse and copy a directory of files
 * @param {string} from - input dir
 * @param {string} to - output dir
 */
export async function copyDir(from, to) {
    try {
        const paths = await walk(from);

        for(const p of paths) {
            const outpath = resolve(to, relative(from, p))
            await copyFile(p, outpath);
        }
    } catch (error) {
        throw error
    }
}

export default { walk, outputFile, readJSON, copyDir, copyFile, readYAML }
