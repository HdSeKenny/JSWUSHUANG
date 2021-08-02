module.exports = {
  // https://github.com/vuejs/vue-cli/tree/master/packages/@vue/babel-preset-app
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'import',
      {
        libraryName: 'vxe-table',
        style: true,
      },
    ],
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk',
      },
    ],
  ],
}
