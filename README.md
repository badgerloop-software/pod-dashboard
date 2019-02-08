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
cd pod-dashboard/src
npm install
npm start
```


## Testing &nbsp; [![Build Status](https://travis-ci.com/badgerloop-software/pod-dashboard.svg?branch=travis-ci)](https://travis-ci.com/badgerloop-software/pod-dashboard)
- Configured with eslint for formatting tests
- Configured with jest for unit testing and coverage
- CI handled by Travis

It is currently configured to run a pretest that uses eslint to check for any formating and stylistic errors. If that passes without any issues, then it runs jest which completes all unit tests that are setup (none except for a test called add.js for now) and then displays the coverage (what percent is unit tested). 

### Some commands to know:
To run just lint: 
```
npm run pretest
```
or 
```
npn run lint
```
\
To run just coverage test:
```  
npm run coverage
```
\
To run lint and unit tests with coverage: 
```
npm test
```
\
To view coverage report  open the following HTML file:
```
pod-dashboard/coverage/lcov-report/index.html
```