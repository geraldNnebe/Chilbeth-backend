const mongoose = require('mongoose');

var dbURI = 'mongodb://localhost/Chilbeth';
if (process.env.NODE_ENV === 'production' || process.env.IN_PRODUCTION_MODE === 'true')
    dbURI = process.env.MONGODB_URI
mongoose.connect(dbURI, { useNewUrlParser: true });

/* Events */
mongoose.connection.on('connected', () => { // monitors for a successful connection through Mongoose 
    console.log(`Mongoose connected to ${dbURI}`);
});
mongoose.connection.on('error', err => { // monitors for a connection error
    console.log('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => { // monitors for a disconnection event
    console.log('Mongoose disconnected');
});

// Function to shutdown Mongoose
const gracefulShutdown = (msg, callback) => {
    mongoose.connection.close(() => { // When gracefulShutdown is called, close the mongoose connection first
        console.log(`Mongoose disconnected through ${msg}`);
        callback(); // Then call the callback, which is intended to kill this node process
    });
};

// For nodemon restarts
process.once('SIGUSR2', () => { // Listens to a SIGUSR2 event. nodemon uses SIGUSR2
    gracefulShutdown('nodemon restart', () => { // Sends a message for gracefully shuting down Mongoose, and a callback to kill the process
        process.kill(process.pid, 'SIGUSR2'); // This callback emits another SIGUSR2
    });
});

// For regular app termination
process.on('SIGINT', () => { // Listens to a SIGINT event
    gracefulShutdown('app termination', () => {
        process.exit(0); // Kill this process
    });
});

// For Heroku app termination
process.on('SIGTERM', () => { // Listens to a SIGTERM event
    gracefulShutdown('Heroku app shutdown', () => {
        process.exit(0); // Kill this process
    });
});

/*
Now when the application terminates, it gracefully closes the Mongoose connection
before it ends.
Similarly, when nodemon restarts the application due to changes in the
source files, the application closes the current Mongoose connection first. The nodemon
listener is using process.once as opposed to process.on, as you want to listen
for the SIGUSR2 event only once in the application, since it will be emitted twice; the
first SIGUSR2 is for our application's use, while the second is for nodemon's use.
Since nodemon listens for this same event, you don’t want to capture it each time, thus
preventing nodemon from working properly.
*/

/* Tip: To kill a process running on port 3000 in case you have an error stating that a process is using
        that port: fuser 3000/tcp to view the PID, fuser -k 3000/tcp to kill the process */

require("./users");
require("./schemas");
