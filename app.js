/*global require, console, process */
(function () {

    'use strict';

    var app = {};

    /**
     * Define the necessary npm modules.
     * @type {{}}
     */
    app.modules = {};
    app.modules.sp = require('serialport');
    app.modules.app = require('express')();
    app.modules.http = require('http').Server(app.modules.app);
    app.modules.io = require('socket.io')(app.modules.http);
    app.modules.SerialPort = app.modules.sp.SerialPort;

    /**
     * Set up configuration.
     * @type {{socket: {port: number}, serial: {baudrate: number}}}
     */
    app.config = {
        // On which serial port socket.io would listen for your commands?
        socket: {
            port: 8080
        },
        // Serial transmission speed.
        serial: {
            baudrate: 115200
        }
    };


    app.core = {
        /**
         * Serial transceiver.
         */
        serial: null,
        listener: {
            socket: function () {
                /**
                 * Event handling for socket.io
                 */
                app.modules.io.on('connection', function (socket) {
                    console.info('> New socket.io connection: %s', socket.id);

                    socket.on('disconnect', function () {
                        console.info('> %s was disconnected.', socket.id);
                    });

                    socket.on('chat message', function (msg) {
                        console.log('%s: %s ', socket.id, msg);
                    });

                    socket.on('led:matrix', function (matrix) {
                        console.info('Emit LED matrix: ', matrix);
                        app.core.serial.write(matrix.join() + ',show,');
                    });
                });

                /**
                 * Register HTTP listener.
                 */
                app.modules.http.listen(app.config.socket.port, function () {
                    console.info('Listening your commands on *:%d, my Master!', app.config.socket.port);
                });
            }
        },
        actions: {
            onExit: function () {
                console.log('Bye!');
                app.core.serial.close();
                process.exit();
            },
            generateWebEndpoint: function () {
                app.modules.app.get('/', function (req, res) {
                    res.sendFile(__dirname + '/view/index.html');
                });
            },
            connectDevice: function (port) {
                if (!port) {
                    throw new Error('Could not found the proper Arduino\'s serial port :(');
                }

                this.generateWebEndpoint();

                app.core.serial = new app.modules.SerialPort(port, {
                    baudrate: app.config.serial.baudrate
                }, true);

                app.core.serial.on('open', function () {
                    console.log('SerialPort opened on %s', port);
                    app.core.listener.socket();
                });

                app.core.serial.on('close', function () {
                    console.log('SerialPort closed.');
                });
            },
            searchCompatibleDevice: function () {
                app.modules.sp.list(function (err, ports) {

                    if (err) {
                        throw new Error(err.message);
                    }

                    var arduino = ports.filter(function (port) {
                        return (/^arduino/i).test(port.manufacturer);
                    });

                    switch(arduino.length) {
                        case 0:
                            console.error('Plug in your Arduino board first!');
                            break;
                        case 1:
                            var board = arduino.pop();
                            console.log('Connecting to Arduino board %s on port %s', board.manufacturer, board.comName);
                            app.core.actions.connectDevice(board.comName);
                            break;
                        default:
                            console.error('There is more than one Arduino board plugged into your computer. Please reduce it to ONE!');
                    }

                });
            }
        },
        start: function () {
            this.actions.searchCompatibleDevice();
        }
    };

    app.core.start();

    process.on('SIGINT', app.core.actions.onExit);
}());