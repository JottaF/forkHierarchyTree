const path = require("path");
module.exports = {
  entry: path.resolve(__dirname, "./src/index.js"),
  mode: "development",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.worker\.js$/,
        exclude: /node_modules/,
        use: "worker-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js"],
    fallback: { fs: false },
  },
  output: {
    filename: "fork.js",
    path: path.resolve(__dirname, "static/scripts"),
    library: "ForkJS",
    libraryTarget: "var",
  },
};
