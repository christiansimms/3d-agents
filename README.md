# json3d: A web app to view json files in 3d using Babylon.js

This setup is based on: https://doc.babylonjs.com/guidedLearning/usingVite
The idea is to have shared dependencies in the root, and then
subdirectories with their own which shares the parent directory's dependencies.
Subdirectory "starter" is just a simple one to start with, you can just copy it.

NOT YET: View it live at: https://christiansimms.github.io/json3d/

## Build Setup

If you want to run and test this locally:

``` bash
# One-time: install dependencies
npm install
cd starter
npm install

# serve with hot reload at localhost:8080
cd starter
npm run dev

# build for production with minification
npm run build
npm run preview  # if you want to test the build

# build for production and view the bundle analyzer report
npm run build --report

# run lint
npm run lint
```

## Maintainers Notes

To deploy latest version of website:

``` bash
npm run deploy
```