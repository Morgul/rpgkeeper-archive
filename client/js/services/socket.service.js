// ---------------------------------------------------------------------------------------------------------------------
// A service wrapping the socket.io library.
//
// @module socket.service.js
// ---------------------------------------------------------------------------------------------------------------------

var SocketProvider = function() {

    var socketLib;
    var connectString;

    // -----------------------------------------------------------------------------------------------------------------
    // Provider API
    // -----------------------------------------------------------------------------------------------------------------

    this.setConnectionConfig = function(server, port)
    {
        connectString = server;

        if(port)
        {
            connectString += ':' + port;
        } // end if
    }; // end setConnectionConfig

    this.useMockSocket = function()
    {
        // Set the socket to a mock socket.io object
        socketLib = {
            connect: function()
            {
                return {
                    connectString: connectString,
                    events: {},
                    firedEvents: {},

                    // Store registered handlers in `events`.
                    on: function()
                    {
                        var args = Array.prototype.slice.call(arguments, 0);
                        var event = args[1];
                        if(!Array.isArray(this.events[event])) { this.events[event] = []; }
                        this.events[event].push(args);
                    },

                    // Store fired events in `firedEvents`.
                    emit: function()
                    {
                        var args = Array.prototype.slice.call(arguments, 0);
                        var event = args[1];
                        if(!Array.isArray(this.firedEvents[event])) { this.firedEvents[event] = []; }
                        this.firedEvents[event].push(args);
                    },

                    // Used to simulate an incoming message from socket.io.
                    $mockEmit: function()
                    {
                        var args = Array.prototype.slice.call(arguments, 0);
                        var event = args[1];
                        if(this.events[event])
                        {
                            this.events[event].forEach(function(args)
                            {
                                var callback = args[args.length - 1];
                                callback.apply(callback, args.slice(1, args.length - 1));
                            });
                        }
                    }
                };
            }
        };
    }; // end useMockSocket

    // Return the service instance
    this.$get = ['$timeout', '$rootScope', '$alerts', '$interval', function($timeout, $rootScope, $alerts, $interval)
    {

        // -------------------------------------------------------------------------------------------------------------


        // -------------------------------------------------------------------------------------------------------------

        function SocketService()
        {
            this.socket = undefined;
            this.reconnect = true;
            this.connected = true;

            // An array of events that were registered before we connected.
            this.earlyEvents = [];

        } // end SocketService

        SocketService.prototype.connect = function()
        {
            var self = this;

            // If we're not using the mock service, we should use socket.io.
            if(!socketLib)
            {
                socketLib = io;
            } // end if

            // ---------------------------------------------------------------------------------------------------------
            // Event Handlers
            // ---------------------------------------------------------------------------------------------------------

            function onConnected()
            {
                // Connect early event handlers
                self.earlyEvents.forEach(function(args)
                {
                    self.socket.on.apply(self.socket, args);
                });

                // Clear early events
                this.earlyEvents = [];

                this.connected = true;

                // By wrapping this in `$timeout(0)`, we schedule this to be run on the next digest cycle,
                // and handle the need for `$apply`.
                $timeout(function() { $rootScope.$broadcast('connected'); }, 0);

                $alerts.addAlert('success', 'Connected to server.', 3000);
            } // end onConnected

            function onError()
            {
                // By wrapping this in `$timeout(0)`, we schedule this to be run on the next digest cycle,
                // and handle the need for `$apply`.
                $timeout(function() { $rootScope.$broadcast('error'); }, 0);
            } // end onError

            function onDisconnected()
            {
                console.log('DISCONNECTED!!!!1111');

                var socketService = this;
                this.connected = false;

                // By wrapping this in `$timeout(0)`, we schedule this to be run on the next digest cycle,
                // and handle the need for `$apply`.
                $timeout(function() { $rootScope.$broadcast('disconnected'); }, 0);

                $alerts.addAlert('danger', 'Disconnected from server...', 3000, function(dismiss)
                {
                    if(!socketService.connected) {
                        var intHandle = $interval(function()
                        {
                            if(socketService.connected) {
                                angular.clearInterval(intHandle);
                                dismiss();
                            } // end if
                        });
                    }
                    else
                    {
                        dismiss();
                    } // end if
                });
            } // end onDisconnected

            function onReconnectFailed()
            {
                if(self.reconnect)
                {
                    // Try reconnecting in 2 seconds, and don't trigger a `$apply`.
                    $timeout(function()
                    {
                        self.socket = _connect();
                    }, 2000, false);
                } // end if
            } // end onReconnectFailed

            // ---------------------------------------------------------------------------------------------------------

            function _connect()
            {
                self.socket = socketLib.connect(connectString);

                // Setup socket.io event handers
                self.socket.on('connect', onConnected);
                self.socket.on('error', onError);
                self.socket.on('disconnect', onDisconnected);
                self.socket.on('reconnect_failed', onReconnectFailed);
            } // end _connect

            // ---------------------------------------------------------------------------------------------------------

            // Start the connection process
            _connect();
        }; // end connect

        SocketService.prototype.disconnect = function()
        {
            // Prevent our reconnect code from running
            this.reconnect = false;

            //TODO: Figure out how to disconnect, and prevent socket.io reconnects.
        }; // end disconnect

        SocketService.prototype.emit = function(event, var_args, callback)
        {
            var args = Array.prototype.slice.call(arguments, 0);

            // event is always the first arg, so we only have a callback if there's 2 or more arguments.
            if(args.length > 1)
            {
                var cb = args[args.length - 1];
                if(typeof cb == 'function')
                {
                    var wrappedCB = function()
                    {
                        var args = Array.prototype.slice.call(arguments, 0);

                        // By wrapping this in `$timeout(0)`, we schedule this to be run on the next digest cycle,
                        // and handle the need for `$apply`.
                        $timeout(function() { cb.apply(cb, args); }, 0);
                    };

                    // Replace the callback with our wrapped callback.
                    args.splice(-1, 1, wrappedCB);
                } // end if
            } // end if

            // Emit over socket.io
            if(this.socket)
            {
                this.socket.emit.apply(this.socket, args);
            } // end if
        }; // end emit

        SocketService.prototype.on = function(event, callback)
        {
            var wrappedCB = function()
            {
                var args = Array.prototype.slice.call(arguments, 0);

                // By wrapping this in `$timeout(0)`, we schedule this to be run on the next digest cycle,
                // and handle the need for `$apply`.
                $timeout(function() { callback.apply(callback, args); }, 0);
            };

            if(this.socket)
            {
                this.socket.on.apply(this.socket, [event, wrappedCB]);
            }
            else
            {
                // Handle the case where someone has registered for an event, but connection hasn't completed.
                this.earlyEvents.push(Array.prototype.slice.call(arguments, 0));
            } // end if
        }; // end on

        SocketService.prototype.channel = function(channel)
        {
            function SocketChannel(socket)
            {
                this.socket = socket
            } // end SocketChannel

            SocketChannel.prototype.on = this.on;
            SocketChannel.prototype.emit = this.emit;

            // If we're not using the mock service, we should use socket.io.
            if(!socketLib)
            {
                socketLib = io;
            } // end if

            var socket = socketLib.connect(channel);

            return new SocketChannel(socket);
        }; // end channel

        // -------------------------------------------------------------------------------------------------------------

        // Return the service instance.
        return new SocketService();
    }]; // end $get
};

angular.module('rpgkeeper.services').provider('$socket', SocketProvider);

// ---------------------------------------------------------------------------------------------------------------------