# Pod 4 Operator's Dashboard
*Authors: Eric Udlis, Luke Houge, Alex Vesel*

### Platform/Technologies:
- Electron
- Node.js
- eslint
- Travis

## Run Instructions
``` 
git clone https://github.com/badgerloop-software/pod-dashboard.git
cd pod-dashboard
npm install
npm start
```


## Testing &nbsp; [![Build Status](https://travis-ci.com/badgerloop-software/pod-dashboard.svg?branch=travis-ci)](https://travis-ci.com/badgerloop-software/pod-dashboard)
- Currently configured with eslint for formatting tests
- No unit testing currently
- CI handled by Travis
- To run just lint: 
```
npm run pretest
```
- To run lint and unit tests (when added): 
```
npm test
```