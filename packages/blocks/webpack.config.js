const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const DependencyExtractionWebpackPlugin = require("@wordpress/dependency-extraction-webpack-plugin");
const RtlCssPlugin = require("rtlcss-webpack-plugin");

const defaultConfig = require("@wordpress/scripts/config/webpack.config");

const entry = require("./.webpack/entry");
const outputFilename = require("./.webpack/output-filename");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const plugins = defaultConfig.plugins.filter((plugin) => {
  return (
    plugin.constructor.name !== "CleanWebpackPlugin" &&
    plugin.constructor.name !== "MiniCssExtractPlugin" &&
    plugin.constructor.name !== "DependencyExtractionWebpackPlugin" &&
    plugin.constructor.name !== "RtlCssPlugin"
  );
});

const vendorFiles = [];
module.exports = {
  ...defaultConfig,
  output: {
    path: path.join(__dirname, "..", "..", "dist"),
    filename: outputFilename,
  },
  entry,
  plugins: [
    ...plugins,
    new MiniCssExtractPlugin({
      filename: (pathData) => {
        if (pathData.chunk.name.startsWith("./style-")) {
          const name = pathData.chunk.name.substring(8);
          return `${name}/style.css`;
        }
        return "[name]/editor.css";
      },
    }),
    new DependencyExtractionWebpackPlugin({
      combineAssets: false,
      combinedOutputFile: null,
      externalizedReport: false,
      injectPolyfill: false,
      outputFormat: "php",
      outputFilename: null,
      useDefaults: true,
      requestToExternal(request) {
        if (request === "@zolo/library") {
          return "zolo";
        }
      },
    }),
    // new FileManagerPlugin({
    //   events: {
    //     onEnd: {
    //       copy: [...vendorFiles],
    //     },
    //   },
    //   runTasksInSeries: true,
    //   runOnceInWatchMode: false,
    // }),
    new RtlCssPlugin({
      // filename: "[name].rtl.css", // Output RTL file with this name
      filename: (pathData) => {
        if (pathData.chunk.name.startsWith("./style-")) {
          const name = pathData.chunk.name.substring(8);
          return `${name}/style.rtl.css`;
        }
        return "[name]/editor.rtl.css";
      },
    }),
  ],
};
