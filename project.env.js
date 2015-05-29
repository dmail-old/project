jsenv.mainModule = './main';
jsenv.baseURL = './';
jsenv.need('./local.env.js');

jsenv.linkSource('dmail/argv', 'modules/github/dmail/argv', 'index.js');
jsenv.linkOrigin('dmail/argv', 'github://dmail@argv', 'index.js');
//jsenv.linkOrigin('modules/github/dmail/argv', 'github://dmail@argv', 'index.js');