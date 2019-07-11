const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      loader: "less-loader",
      options: {
        lessLoaderOptions: {
          modifyVars: {
            "@primary-color": "#1DA57A",
            "@link-color": "#1DA57A",
            "@border-radius-base": "2px",
            "@component-background": "#fff7ff",
            "@body-background": "#37474f",
            "@layout-body-background": "#37474F"
          },
          javascriptEnabled: true
        }
      }
    }
  ]
};
