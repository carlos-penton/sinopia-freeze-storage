import loggy from 'loggy';
import processDir from '../main';
import {statSync} from 'fs';

const APP_NAME = 'freeze-storage';

/**
 * Validates the app arguments and returns the relevant ones.
 *
 * @returns {string|undefined} The storage directory path or `undefined` if any validation fails.
 */
function handleArgv() {
    if (process.argv.length !== 3) {
        console.error(`Wrong argument count. Usage:\n\n${APP_NAME} /path/to/storage\n`);
    } else {
        let storagePath = process.argv[2];
        try {
            if (!statSync(storagePath).isDirectory()) {
                console.error(`${storagePath} is not a directory.`);
            }
            return storagePath;
        } catch (err) {
            console.error(err.message);
        }
    }
    loggy.errorHappened = true;
    return undefined;
}


// Setup fancy logging...
loggy.notifications= false;  // so no one complains because of native-notifier
let oldWarn = loggy.warn;
loggy.warn = message => {
    oldWarn(message);
    loggy.errorHappened = true;
};

// ...then do it
try {
    let storagePath = handleArgv();
    if(storagePath) {
        processDir(storagePath, loggy);
        if (loggy.errorHappened) {
            throw new Error('Some packages could not be processed');
        }
        loggy.success('Operation completed successfully!');
    }
} catch(err) {
    loggy.error('Operation completed with errors. See output for details.');
    console.error(err.message);
}

process.on('exit', () => {
    process.exit(loggy.errorHappened? 1 : 0);
});
