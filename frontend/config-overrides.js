module.exports = function override(config, env) {
  // Ignore source map warnings for ExcelJS
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /exceljs\.min\.js\.map/,
    /ENOENT: no such file or directory/
  ];
  
  // Disable source map generation for external libraries
  if (config.module && config.module.rules) {
    config.module.rules.forEach(rule => {
      if (rule.use && Array.isArray(rule.use)) {
        rule.use.forEach(use => {
          if (use.loader && use.loader.includes('source-map-loader')) {
            use.options = use.options || {};
            use.options.filterSourceMappingUrl = (relativeSourcePath, resourcePath) => {
              return !resourcePath.includes('exceljs');
            };
          }
        });
      }
    });
  }
  
  return config;
}; 