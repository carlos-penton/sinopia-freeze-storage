import cmp from 'semver-compare';
import {readdirSync, statSync, readFileSync, writeFileSync} from 'fs';
import {join, basename, extname} from 'path';
import filter from 'lodash/filter';
import last from 'lodash/last';

/**
 * Rewrites a sinopia's `package.json` file so it only describes locally available versions.
 *
 * @param {Object} packageJson `package.json` content, as a JSON object.
 * @param {Array<string>} items Package directory entries.
 * @param {string} directory Package directory.
 * @param {{log:function, info:function, warn:function}} logger Logger to use for operation notification.
 */
function processPackageJson(packageJson, items, directory, logger=console) {
    logger.log(`Processing package ${packageJson.name}`);
    items = filter(items, item => extname(item) === '.tgz');
    items = items.map(item => item.substring(basename(directory).length + 1, item.length - 4));
    let versionsToRemove = [];
    let availableVersions = [];
    for (let version in packageJson.versions) {
        if (packageJson.versions.hasOwnProperty(version)) {
            if (items.indexOf(version) === -1) {
                versionsToRemove.push(version);
            } else {
                availableVersions.push(version);
            }
        }
    }
    if(versionsToRemove.length) {
        logger.info(`Removing ${versionsToRemove.length} versions`);
    }
    versionsToRemove.forEach(version => delete packageJson.versions[version]);
    availableVersions.sort(cmp);
    let localLatest = last(availableVersions);
    if(packageJson['dist-tags'].latest !== localLatest) {
        logger.info(`Updated "latest" tag from ${packageJson['dist-tags'].latest } to ${localLatest}`);
    }
    packageJson['dist-tags'].latest = localLatest;
    let packageJsonFile = join(directory, 'package.json');
    writeFileSync(packageJsonFile,JSON.stringify(packageJson, null, '  '), 'utf-8');
}

/**
 * Recursively rewrites all `package.json` files in a sinopia storage directory so they describes only locally
 * available package versions.
 *
 * @param {string} dirPath Path to sinopia storage directory.
 * @param {{log:function, info:function, warn:function}} logger Logger to use for operation notification.
 */
export default function processDir(dirPath, logger=console) {
    let items = readdirSync(dirPath);
    let packageJson = undefined;
    for(let item of items) {
        item = join(dirPath, item);
        let stat = statSync(item);
        if(stat.isDirectory()) {
            try {
                processDir(item, logger);
            } catch(err) {
                logger.warn(err.message);
            }
        } else if(basename(item) === 'package.json'){
            packageJson = JSON.parse(readFileSync(item,'utf-8'));
        }
    }
    if(packageJson) {
        processPackageJson(packageJson, items, dirPath, logger);
    }
}
