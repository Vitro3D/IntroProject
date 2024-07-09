
// server-main.js
// Sets up the server and listens for requests.

import express from 'express';
import BinaryFile from '../public/javascript/util/binary-file.js'
import path from 'path';
import https from 'https';
import fs from 'fs';
import colors from 'colors';	// Extends string class so it can output text to the console in different colors. eg. "RED STRING!".red
import { Server as SocketIO } from 'socket.io';
import { memoryUsage } from "node:process";

import os from 'node:os';


const prod = false;	// Set to true in a production environment.

/* -- Initilize the Express web application framework ---------------- */

var app = express();

const port = normalizePort(process.env.PORT || '443');
app.set('port', port);

// Options: https://expressjs.com/en/4x/api.html#express.urlencoded
// - Has an inflate option which may be interesting.
app.use(express.urlencoded({ extended: false }));

// Icon displayed on the webpages.
//app.use(favicon(path.join(process.cwd(), 'public', 'assets', 'vitroSim.ico')));

// Directory where static files will be served from.
app.use(express.static(path.join(process.cwd(), '/public')));

// Custom paths
const router = express.Router();
{
	// Typing '[serverloc]/test' in the address bar should return 'TEST DATA' in the page.
	router.get('/test', function (req, res) {
		res.send("TEST DATA");
	});
}
app.use('/', router);

app.use('/data', function (req, res) {
	res.send("Requested data!");
})

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});


if (prod) {
	// Production error handler will not return a stacktrace
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.send(JSON.stringify({
			message: err.message,
			error: {}
		}));
	});
}
else {
	// Development error handler will return a stack trace of the error.
	// eg: {"message":"Not Found","error":{"status":404}}
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.send(JSON.stringify({
			message: err.message,
			error: err
		}));
	});
}

/* -- Create the server and attach the Express web app framework to it --------------------- */

var serverOptions = {};
if (prod) {
	// valid certificate here
}
else {
	var certDir = path.join(process.cwd(), "server", "certs");
	// serverOptions.key = fs. readFileSync(path.join(certDir, 'pkcs8.key'));
	// serverOptions.cert = fs.readFileSync(path.join(certDir, 'publickey.crt'));
	// serverOptions.ca = fs.readFileSync(path.join(certDir, 'publickey.crt'))
	serverOptions.key = fs. readFileSync(path.join(certDir, 'testkey.key'));
	serverOptions.cert = fs.readFileSync(path.join(certDir, 'testcert.cert'));
	serverOptions.ca = fs.readFileSync(path.join(certDir, 'testcert.cert'))
}

const server = https.createServer(serverOptions, app);
//const io = require('socket.io')(server);

// Listen on provided port, on all network interfaces.
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/* -- Helper functions ------------------------------------ */

// Normalize a port into a number, string, or false.
function normalizePort(val) {
	const port = parseInt(val, 10);
	if (isNaN(port)) 
		return val;		// named pipe
	if (port >= 0) 
		return port;	// port number
	return false;
}

// Event listener for HTTP server "error" event.
function onError(error) {
	if (error.syscall !== 'listen') 
		throw error;
	
	var bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges or port is in use by another program (eg. IIS)');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

// Event listener for HTTP server "listening" event.
function onListening() {
	var addr = server.address();
	var bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	console.log('Listening Https on ' + bind);
}


/* -- Define Socket.IO and the communication between the server and the client -- */

var io = new SocketIO(server);

// Output the number of cores available so the client can know what a good number of threads to use is.
console.log(`Logical cores available: ${os.cpus().length}`.green);

io.on('connection', function (socket) {

	console.log(`Client connected. Socket: ${ socket.id.substring(0, 6) }`.green);

	// Client has disconnected.
	socket.on('disconnect', function () {
		console.log(`Client disconnected. Socket: ${ socket.id.substring(0, 6) }`.green)
	});
	
	socket.on('test', function (buffer /* ArrayBuffer */) {
		var file = new BinaryFile(buffer);
		var a = file.readFloat(); 
		var b = file.readFloat();

		var responseFile = new BinaryFile();
		responseFile.writeString(`${a} + ${b} = ${a + b}`);
		this.emit("test recieved", responseFile.getBuffer());	// respond to the client
	});

	socket.on('test2', function (data) {	// val is a float.
		var s = parseInt(data.a, 10) * parseInt(data.b, 10);
		this.emit("test2 received", `${data.a} * ${data.b} = ${s}`);	// can return values like strings.
	});


})


