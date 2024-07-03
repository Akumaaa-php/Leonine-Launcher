// forge.config.js or electron-forge.config.js

module.exports = {
    packagerConfig: {
      platform: 'win32',
      // Add any additional configuration options for the packager here
    },
    makers: [
      {
        name: '@electron-forge/maker-squirrel',
        config: {
          name: 'Leonine', // Replace 'YourAppName' with the name of your app
          icon: './src/resources/logo.ico',
        }
      },
      // Add other makers for different platforms if needed
    ],
  };
  