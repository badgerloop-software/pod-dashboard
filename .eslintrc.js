module.exports = {
  extends: "airbnb-base",
  plugins: ["import"],
  env: {
    node: true,
    browser: true
  },
  rules: {
    "no-console": "off",
    "no-alert": "off",
    "no-unused-vars": "off",
  }
};