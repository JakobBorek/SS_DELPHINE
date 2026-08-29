export default [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        AbortController: "readonly",
        CSS: "readonly",
        document: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        getComputedStyle: "readonly",
        IntersectionObserver: "readonly",
        requestAnimationFrame: "readonly",
        window: "readonly"
      }
    },
    rules: {
      "no-dupe-keys": "error",
      "no-undef": "error",
      "no-unreachable": "error",
      "no-unused-vars": "error"
    }
  }
];
