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
    "no-undef": "off",
    "import/no-unresolved": "off",
    "prefer-const": "off",
    "prefer-destructuring": ["error", { "object": true, "array": false }]
  }
};