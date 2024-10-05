import express from "express";

const app = express();
const port = 3000;

// Basic route for the home page
app.get('/', (req, res) => {
    // This is a simple route that returns a message when someone accesses the root URL "/"
  res.send('Welcome to my server!');
});

// Start the server and listen on the specified port
app.listen(port, () => {
    // This callback function runs when the server successfully starts
  console.log(`Server is running on port ${port}`);
});