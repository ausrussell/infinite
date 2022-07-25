const CracoLessPlugin = require('craco-antd');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#018a9e' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};