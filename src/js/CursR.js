class _CursR_ {
    constructor() {
        this.peer = null;
        this.lastPeerId = null;
        this.peerId = null;
        this.connected = false;
        this.conn = null;
        this.userClosedConn = false;
        this.joined = false;

        /* callback functions start */
        this._onPeerDataReceived = null;
        this._onConnectionClosed = null;
        this._onDisconnected = null;

        this._onDebug = null;
        this._onWarning = null;
        this._onError = null;

        this._onDebugStatusUpdate = null;
        this._onWarningStatusUpdate = null;
        this.onErrorStatusUpdate = null;
        /* callback functions end */
    }

    disconnect() {
        if (this.peer) {
            this.userClosedConn = true;
            this.peer.disconnect();
        }
    }

    initReceiver(id) {
        // Create own peer object with connection to shared PeerJS server
        this.peer = new Peer(id, {
            debug: 2
        });

        this.peer.on('open', function (id) {
            // Workaround for peer.reconnect deleting previous id
            if (this.peer.id === null) {
                this.onDebug('Received null id from peer open');
                this.peer.id = this.lastPeerId;
            } else {
                this.lastPeerId = this.peer.id;
            }

            this.onDebug('ID: ' + this.peer.id);
            this.connected = true;
            this.onDebug("Awaiting connection...");
            this.onDebugStatusUpdate("Awaiting connection...");
        });

        this.peer.on('connection', function (c) {
            // Allow only a single connection
            if (this.conn && this.conn.open) {
                c.on('open', function() {
                    c.send("Already connected to another client");
                    setTimeout(function() { c.close(); }, 500);
                });
                return;
            }

            this.conn = c;
            this.onDebug("Connected to: " + this.conn.peer);
            this.onDebugStatusUpdate("Connected to: " + this.conn.peer);

            this.conn.on('data', function (data) {
                this.onDebug("Data recieved[receiver]: " + data);
                this.onPeerDataReceived(data);
            });

            this.conn.on('close', function () {
                this.onDebug("Connection closed");
                this.onWarningStatusUpdate("Connection closed");
                this.onConnectionClosed();
                this.conn = null;
            });
        });

        this.peer.on('disconnected', function () {
            this.onDebug('Connection disconnected');
            this.onWarningStatusUpdate("Connection disconnected");
            this.onDisconnected();

            // Workaround for peer.reconnect deleting previous id
            this.peer.id = this.lastPeerId;
            this.peer._lastServerId = this.lastPeerId;

            if (!this.userClosedConn) {
                this.peer.reconnect();
            }

            this.connected = false;
        });

        this.peer.on('close', function() {
            this.conn = null;
            this.onDebug('Connection closed');
            this.onWarningStatusUpdate("Connection closed");
        });

        this.peer.on('error', function (err) {
            this.onDebug(err.message);
            this.onErrorStatusUpdate(err.message);
        });
    }

    initSender() {
        // Create own peer object with connection to shared PeerJS server
        this.peer = new Peer(null, {
            debug: 2
        });

        this.peer.on('open', function (id) {
            // Workaround for peer.reconnect deleting previous id
            if (this.peer.id === null) {
                this.onDebug('Received null id from peer open');
                this.peer.id = this.lastPeerId;
            } else {
                this.lastPeerId = this.peer.id;
            }

            this.onDebug('ID: ' + this.peer.id);
            this.onDebugStatusUpdate("Connected: " + this.peer.id);
        });

        this.peer.on('connection', function (c) {
            // Disallow incoming connections
            c.on('open', function() {
                c.send("Sender does not accept incoming connections");
                setTimeout(function() {
                    c.close();
                }, 500);
            });
        });

        this.peer.on('disconnected', function () {
            this.onDebug('Connection disconnected');
            this.onWarningStatusUpdate("Connection disconnected");
            this.onDisconnected();

            // Workaround for peer.reconnect deleting previous id
            this.peer.id = this.lastPeerId;
            this.peer._lastServerId = this.lastPeerId;

            if (!this.userClosedConn) {
                this.peer.reconnect();
            }
        });

        this.peer.on('close', function() {
            this.conn = null;
            this.onDebug('Connection closed');
            this.onWarningStatusUpdate("Connection closed");
            this.onConnectionClosed();
        });

        this.peer.on('error', function (err) {
            this.onError(err.message);
            this.onErrorStatusUpdate(err.message);
        });
    };

    joinPeer(id) {
        // Close old connection
        if (!this.joined) {
            if (this.conn) {
                this.conn.close();
            }

            // Create connection to destination peer specified in the input field
            this.conn = peer.connect(id, {
                reliable: true
            });
        }

        this.conn.on('open', function () {
            this.joined = true;
            this.onDebug("Connected to: " + this.conn.peer);

            this.conn.send(JSON.stringify('Hello from Austria!'));
            this.onDebug("Sent: Hello from Austria!");
            this.onDebugStatusUpdate("Connected to: " + this.conn.peer);

            //userClosedConn = true;
            //peer.disconnect();
        });

        // Handle incoming data (messages only since this is the signal sender)
        this.conn.on('data', function (data) {
            this.onDebug("Data received[sender]: " + data);
        });

        this.conn.on('close', function () {
            this.onDebug("Connection closed");
            this.onWarningStatusUpdate("Connection closed");
            this.joined = false;
        });
    }

    sendData(obj) {
        if (this.conn != null) {
            if (this.joined) {
                try {
                    this.conn.send(JSON.stringify(obj));
                    this.onDebug("Sent: " + JSON.stringify(obj));
                }
                catch(err) {
                    this.onError(err.message);
                    this.onErrorStatusUpdate(err.message);
                }
            } else {
                this.onError("Peer is not connected");
                this.onWarningStatusUpdate("Peer is not connected");
            }
        }
        else {
            this.onError("No connection");
            this.onWarningStatusUpdate("No connection");
        }
    }

    /* callback functions start */
    onPeerDataReceived(data) {
        if (typeof this._onPeerDataReceived === 'function') {
            this._onPeerDataReceived(data);
        }
    }

    onConnectionClosed() {
        if (typeof this._onConnectionClosed === 'function') {
            this._onConnectionClosed();
        }
    }

    onDisconnected() {
        if (typeof this._onDisconnected === 'function') {
            this._onDisconnected();
        }
    }

    onDebug(message) {
        if (typeof this._onDebug === 'function') {
            this._onDebug(message);
        }
    }

    onWarning(message) {
        if (typeof this._onWarning === 'function') {
            this._onWarning(message);
        }
    }

    onError(message) {
        if (typeof this._onError === 'function') {
            this._onError(message);
        }
    }

    onDebugStatusUpdate(status) {
        if (typeof this._onDebugStatusUpdate === 'function') {
            this._onDebugStatusUpdate(status);
        }
    }

    onWarningStatusUpdate(status) {
        if (typeof this._onWarningStatusUpdate === 'function') {
            this._onWarningStatusUpdate(status);
        }
    }

    onErrorStatusUpdate(status) {
        if (typeof this._onErrorStatusUpdate === 'function') {
            this._onErrorStatusUpdate(status);
        }
    }
    /* callback functions end */
}

let peer = null;
let lastPeerId = null;
let peerId = null;
let connected = false;
let conn = null;
let userClosedConn = false;
let joined = false;

let _onPeerDataReceived = null;
let _onConnectionClosed = null;
let _onDisconnected = null;

let _onDebug = null;
let _onWarning = null;
let _onError = null;

let _onDebugStatusUpdate = null;
let _onWarningStatusUpdate = null;
let _onErrorStatusUpdate = null;

function disconnectPeer() {
    if (peer) {
        userClosedConn = true;
        peer.disconnect();
    }
}

function onPeerDataReceived(data) {
    if (typeof _onPeerDataReceived === 'function') {
        _onPeerDataReceived(data);
    }
}

function onConnectionClosed() {
    if (typeof _onConnectionClosed === 'function') {
        _onConnectionClosed();
    }
}

function onDisconnected() {
    if (typeof _onDisconnected === 'function') {
        _onDisconnected();
    }
}

function onDebug(message) {
    if (typeof _onDebug === 'function') {
        _onDebug(message);
    }
}

function onWarning(message) {
    if (typeof _onWarning === 'function') {
        _onWarning(message);
    }
}

function onError(message) {
    if (typeof _onError === 'function') {
        _onError(message);
    }
}

function onDebugStatusUpdate(status) {
    if (typeof _onDebugStatusUpdate === 'function') {
        _onDebugStatusUpdate(status);
    }
}

function onWarningStatusUpdate(status) {
    if (typeof _onWarningStatusUpdate === 'function') {
        _onWarningStatusUpdate(status);
    }
}

function onErrorStatusUpdate(status) {
    if (typeof _onErrorStatusUpdate === 'function') {
        _onErrorStatusUpdate(status);
    }
}

function initReceiver() {
    let p = document.getElementById("cursr-host-connection-id");

    // Create own peer object with connection to shared PeerJS server
    peer = new Peer(p.innerHTML, {
        debug: 2
    });

    peer.on('open', function (id) {
        // Workaround for peer.reconnect deleting previous id
        if (peer.id === null) {
            onDebug('Received null id from peer open');
            peer.id = lastPeerId;
        } else {
            lastPeerId = peer.id;
        }

        onDebug('ID: ' + peer.id);
        connected = true;
        onDebug("Awaiting connection...");
        onDebugStatusUpdate("Awaiting connection...");
    });

    peer.on('connection', function (c) {
        // Allow only a single connection
        if (conn && conn.open) {
            c.on('open', function() {
                c.send("Already connected to another client");
                setTimeout(function() { c.close(); }, 500);
            });
            return;
        }

        conn = c;
        onDebug("Connected to: " + conn.peer);
        onDebugStatusUpdate("Connected to: " + conn.peer);

        conn.on('data', function (data) {
            onDebug("Data recieved[receiver]: " + data);
            onPeerDataReceived(data);
        });

        conn.on('close', function () {
            onDebug("Connection closed");
            onWarningStatusUpdate("Connection closed");
            onConnectionClosed();
            conn = null;
        });
    });

    peer.on('disconnected', function () {
        onDebug('Connection disconnected');
        onWarningStatusUpdate("Connection disconnected");
        onDisconnected();

        // Workaround for peer.reconnect deleting previous id
        peer.id = lastPeerId;
        peer._lastServerId = lastPeerId;

        if (!userClosedConn) {
            peer.reconnect();
        }

        connected = false;
    });

    peer.on('close', function() {
        conn = null;
        onDebug('Connection closed');
        onWarningStatusUpdate("Connection closed");
    });

    peer.on('error', function (err) {
        onDebug(err.message);
        onErrorStatusUpdate(err.message);
    });
}

function initSender() {
    // Create own peer object with connection to shared PeerJS server
    peer = new Peer(null, {
        debug: 2
    });

    peer.on('open', function (id) {
        // Workaround for peer.reconnect deleting previous id
        if (peer.id === null) {
            onDebug('Received null id from peer open');
            peer.id = lastPeerId;
        } else {
            lastPeerId = peer.id;
        }

        onDebug('ID: ' + peer.id);
        onDebugStatusUpdate("Connected: " + peer.id);
    });

    peer.on('connection', function (c) {
        // Disallow incoming connections
        c.on('open', function() {
            c.send("Sender does not accept incoming connections");
            setTimeout(function() {
                c.close();
            }, 500);
        });
    });

    peer.on('disconnected', function () {
        onDebug('Connection disconnected');
        onWarningStatusUpdate("Connection disconnected");
        onDisconnected();

        // Workaround for peer.reconnect deleting previous id
        peer.id = lastPeerId;
        peer._lastServerId = lastPeerId;

        if (!userClosedConn) {
            peer.reconnect();
        }
    });

    peer.on('close', function() {
        conn = null;
        onDebug('Connection closed');
        onWarningStatusUpdate("Connection closed");
        onConnectionClosed();
    });

    peer.on('error', function (err) {
        onError(err.message);
        onErrorStatusUpdate(err.message);
    });
};

function joinPeer(id) {
    // Close old connection
    if (!joined) {
        if (conn) {
            conn.close();
        }

        // Create connection to destination peer specified in the input field
        conn = peer.connect(id, {
            reliable: true
        });
    }

    conn.on('open', function () {
        joined = true;
        onDebug("Connected to: " + conn.peer);

        conn.send(JSON.stringify('Hello from Austria!'));
        onDebug("Sent: Hello from Austria!");
        onDebugStatusUpdate("Connected to: " + conn.peer);

        //userClosedConn = true;
        //peer.disconnect();
    });

    // Handle incoming data (messages only since this is the signal sender)
    conn.on('data', function (data) {
        onDebug("Data received[sender]: " + data);
    });

    conn.on('close', function () {
        onDebug("Connection closed");
        onWarningStatusUpdate("Connection closed");
        joined = false;
    });
}

function sendData(obj) {
    if (conn != null)
    {
        if (joined) {
            try {
                conn.send(JSON.stringify(obj));
                onDebug("Sent: " + JSON.stringify(obj));
            }
            catch(err) {
                onError(err.message);
                onErrorStatusUpdate(err.message);
            }
        } else {
            onError("Peer is not connected");
            onWarningStatusUpdate("Peer is not connected");
        }
    }
    else {
        onError("No connection");
        onWarningStatusUpdate("No connection");
    }
}
