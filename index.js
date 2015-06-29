jsenv.mode = jsenv.mode || 'install';
jsenv.baseURL = './';
jsenv.mainModule = './main.js';
jsenv.need('./config-project.js');
jsenv.need('./config-local.js');
// jsenv.loader.use('css');