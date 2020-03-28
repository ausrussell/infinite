const CracoAntDesignPlugin = require("craco-antd");





module.exports = {
  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeTheme: {
          "@layout-body-background": "#263238",
          "@primary-color": "#1DA57A",
          "@link-color": "#1DA57A"
        }
      }
    }
  ]
};
