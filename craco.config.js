const CracoLessPlugin = require('craco-antd');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#4527a0' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};