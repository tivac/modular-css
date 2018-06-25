module.exports = {
  "extends": [
    "@tivac",
    "plugin:jest/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 8
  },
  "env": {
    "node": true,
    "jest": true
  },
  "plugins": [
    "jest"
  ],
  "rules": {
    "one-var": [
      "warn",
      {
        "var": "always",
        "let": "never",
        "const": "never"
      }
    ],
    "keyword-spacing": [
      "warn",
      {
        "before": true,
        "after": false,
        "overrides": {
          "return": {
            "after": true
          },
          "else": {
            "after": true
          },
          "try": {
            "after": true
          },
          "case": {
            "after": true
          },
          "from": {
            "after": true
          },
          "import": {
            "after": true
          },
          "export": {
            "after": true
          },
          "const": {
            "after": true
          },
          "let": {
            "after": true
          }
        }
      }
    ],
    "space-before-function-paren": [
      "warn",
      {
        "anonymous": "never",
        "named": "never",
        "asyncArrow": "always"
      }
    ]
  }
};
