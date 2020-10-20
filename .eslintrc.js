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
        "no-undef": "off",
        "import/no-unresolved": "off",
        "prefer-const": "off",
        "prefer-destructuring": ["error", { "object": true, "array": false }],
        "linebreak-style": "off",
        "no-plusplus": "off",
        "indent": ["error", 4],
        "brace-style": "off",
        "curly": "off",
        "comma-dangle": "off",
        "max-len": "off",
        "nonblock-statement-body-position": "off"
    }
};
