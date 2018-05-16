# sinopia-freeze-storage

Makes your sinopia/verdaccio registry actually work when going offline. This tool updates sinopia's `package.json` storage files to
describe only locally available packages.

## Usage
Install the module:

```bash
npm install --global sinopia-freeze-storage
``` 

then use the cli:
```bash
freeze-storage /path/to/sinopia/storage/directory
```

## Why?
### **tl;dr:** 
If my registry worked when online, then it must work later when offline for **the same dependencies requirements**.


### **Long version (basically me complaining for not having internet access everywhere):**
I run a sinopia-like repository at work with internet connection. There I `npm install` all my required dependencies, meaning that 
all required modules are stored in the sinopia storage. More than that, this means sinopia will download the _exact_ module versions
I need for the project I'm working on. The problem starts when going offline some time later and try to `npm install` from scratch
(e.g no `yarn.lock` file): sinopia says it can't find the package I'm requesting, and this mostly happens because a newer version of
some module has been released and it's `latest` version isn't the one I locally have. Ok fine, I know my `package.json` is asking for
`some-package@^4.1.0` and there is `some-package@4.1.1` available so the newer should be installed instead, but damn I just want the one
I currently have at least! Also, I don't want to force the my package dependencies to match an exact version, and I can't force that for
my dependencies dependencies anyway.

## Using as a module
```Javascript
const freeze = require('sinopia-freeze-storage');
freeze('/path/to/storage/dir');
```
