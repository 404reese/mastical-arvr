export default {
    root: '.',                 // Pointing to the project root where index.html is located
    server: {
      open: true,              // Automatically opens the browser when the server starts
      port: 5173,              // Explicitly set the port to 5173
    },
    build: {
      outDir: './dist',        // Output the build to the 'dist' folder in the root
    },
    publicDir: './assets',     // Static assets (like images) are in the 'assets' folder at the root level
  };
  