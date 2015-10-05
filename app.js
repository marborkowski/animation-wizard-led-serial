(function() {

    var sp = require('serialport');
    var app = require('express')();
    var http = require('http').Server(app);
    var io = require('socket.io')(http);
    var SerialPort = sp.SerialPort;
    var port = 8080;

    var serial;

    var _self = this;

    _self.init = function(serialPort) {

        if(!serialPort) {
            throw new Error('Could not found the proper Arduino\'s serial port :(');
        }

        app.get('/', function (req, res) {
            res.sendFile(__dirname + '/view/index.html');
        });

        serial = new SerialPort(serialPort, {
            baudrate: 9600
        }, true);

        /**
         * Event handling for SerialPort
         */
        serial.on('open', function() {
            console.log('SerialPort opened on %s', serialPort);
            setTimeout(function() {
                serial.write('Hello, Arduino!\r');
            },8000);
        });

        serial.on('close', function() {
            console.log('SerialPort closed.');
        });

        /**
         * Event handling for socket.io
         */
        io.on('connection', function (socket) {
            console.info('> New socket.io connection: %s', socket.id);

            socket.on('disconnect', function () {
                console.info('> %s was disconnected.', socket.id);
            });

            socket.on('chat message', function (msg) {
                console.log('%s: %s ', socket.id, msg);
            });
        });

        /**
         * Register HTTP listener.
         */
        http.listen(port, function () {
            console.info('Listening your commands on *:%d, my Master!', port);
        });
    };

    sp.list(function (err, ports) {
        var arduino = ports.filter(function(port) {
            return /^arduino/i.test(port.manufacturer);
        });

        switch(arduino.length) {
            case 0:
                console.error('Plug in your Arduino board first!');
                break;
            case 1:
                var board = arduino.pop();
                console.log('Connecting to Arduino board %s on port %s', board.manufacturer, board.comName);
                _self.init(board.comName);
                break;
            default:
                console.error('There is more than one Arduino board plugged into your computer. Please reduce it to ONE!');
        }

    });

    process.on('SIGINT', function() {
        console.log('Bye!');
        serial.close();
        process.exit();
    });

})();