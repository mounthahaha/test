const path = require('path');

module.exports = {
  excelProjectToken: '1uRcRXwYZS4H25cl_nFkYeDDQZLBuXugGbst7dT9_tOo',
  useApiKey: 'AIzaSyCIEIcu681TDPkDaJOlaqEAsZ-yVFlRCG4',
  sheet: ['BCMS', 'BCMS_G'],
  distFile: path.resolve(process.cwd(), 'lang.js'), // 檔案輸出至單一檔案 (moduleMode為true時會自動省略)
  distFolder: 'src/i18n/lang', // 檔案輸出資料夾
};
