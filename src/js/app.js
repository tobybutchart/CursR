const logR = new LogR();

function launchExe(ctrl) {
    let exeType = ctrl.getAttribute("data-exe-type");
    if (exeType == "logs") {
        showLogModal();
    } else {
        Modal.show(exeType + "-modal");
    }
}

function showLogModal() {
    const logs = document.getElementById("logs");
    logs.innerHTML = logR.toHTML(true);
    Modal.show("logs-modal");
}

function clearLogs() {
    const logs = document.getElementById("logs");
    logR.clearLogs();

    if (logs) {
        logs.innerHTML = logR.toHTML(true);
    }
}

function downloadLogs() {
    logR.downloadLogs();
}

function openLogsInNewWindow() {
    logR.openLogsInNewWindow();
}

const ClickPoint = Object.freeze({
    TopLeft: 0,
    TopRight: 1,
    Middle: 2,
    Top: 3
});

const CursR = document.querySelector('#CursR');
let clickPoint = ClickPoint.TopLeft;

const settings = new Settings();

settings.setOnStatusMessage(onSettingsStatusMessage);
settings.setOnStatusWarning(onSettingsStatusWarning);

let timerEnabled = false;
let timer;

function moveCursR(x, y, z, settings) {
    moveCursRX(x, settings);
    moveCursRY(y, settings);
}

function moveCursRX(x, settings) {
    if (settings.fitToScreen) {
        if (x < 0) {
            logR.log(LogType.Warning, 'MAX LEFT REACHED: ' + x);
            x = 0;
        } else if ((+x + +CursR.offsetWidth) > window.innerWidth) {
            logR.log(LogType.Warning, 'MAX RIGHT REACHED: ' + x);
            x = window.innerWidth - CursR.offsetWidth;
        }
    }

    CursR.style.display = "block";

    let xPos = x + "px";
    let origXPos  = CursR.style.left;
    let mov = false;

    if (CursR.style.left != xPos) {
        CursR.style.left = xPos;
        mov = true;
    }

    if (mov == true) {
        logR.log(LogType.Debug, `Moved CursR to X: ${x} from X: ${origXPos}`);
    } else {
        logR.log(LogType.Debug, "No X movement detected");
    }
}

function moveCursRY(y, settings) {
    if (settings.fitToScreen) {
        if (y < 0) {
            logR.log(LogType.Warning, 'MAX TOP REACHED: ' + y);
            y = 0;
        } else if ((+y + +CursR.offsetHeight) > window.innerHeight) {
            logR.log(LogType.Warning, 'MAX BOTTOM REACHED: ' + y);
            y = window.innerHeight - CursR.offsetHeight;
        }
    }

    CursR.style.display = "block";

    let yPos = y + "px";
    let origYPos  = CursR.style.top;
    let mov = false;

    if (CursR.style.top != yPos) {
        CursR.style.top = yPos;
        mov = true;
    }

    if (mov == true) {
        logR.log(LogType.Debug, `Moved CursR to Y: ${y} from Y: ${origYPos}`);
    } else {
        logR.log(LogType.Debug, "No Y movement detected");
    }
}

function startTimer() {
    if (timerEnabled) {
        window.clearInterval(timer);
        document.getElementById('btn-start-timer').innerHTML = 'Start Timer&nbsp;<img src="img/timer.png" alt="">';
    } else {
        const interval = document.getElementById('move-polling-interval').value;
        timer = setInterval(testMove, interval);
        document.getElementById('btn-start-timer').innerHTML = 'Stop Timer&nbsp;<img src="img/timer.png" alt="">';
    }

    timerEnabled = !timerEnabled;
}

function startTimerFromGyro() {
    if (timerEnabled) {
        window.clearInterval(timer);
        document.getElementById('btn-start-timer-gyro').innerHTML = 'Start Timer&nbsp;<img src="img/timer.png" alt="">';
    } else {
        const interval = document.getElementById('move-polling-interval').value;
        timer = setInterval(testMoveFromGyro, interval);
        document.getElementById('btn-start-timer-gyro').innerHTML = 'Stop Timer&nbsp;<img src="img/timer.png" alt="">';
    }

    timerEnabled = !timerEnabled;
}

function testMove() {
    const x = document.getElementById("move-x").value;
    const y = document.getElementById("move-y").value;
    const z = document.getElementById("move-z").value;

    try {
        moveCursR(x, y, z, settings);
    }
    catch(err) {
        alert(err.message);
    }
}

function testMoveFromGyro() {
    //value, calibrationPoint, min, max, sensitivity
    const a = document.getElementById("move-alpha").value;
    const b = document.getElementById("move-beta").value;
    const c = document.getElementById("move-gamma").value;
    const acp = document.getElementById("move-alpha-cp").value;
    const bcp = document.getElementById("move-beta-cp").value;
    const ccp = document.getElementById("move-gamma-cp").value;
    const x = alphaToX(a, acp, settings.alphaMin, settings.alphaMax, settings.sensitivity);
    const y = betaToY(b, bcp, settings.betaMin, settings.betaMax, settings.sensitivity);
    const z = gammaToZ(c, ccp, settings.gammaMin, settings.gammaMax, settings.sensitivity);

    try {
        //moveCursR(x, y, z, settings);

        moveCursRX(x, settings);
        moveCursRY(y, settings);
    }
    catch(err) {
        alert(err.message);
    }
}

function getValueFromPercent(max, percentage) {
    if (percentage > 100) {
        percentage = 100;
    }
    if (percentage < 0) {
        percentage = 0;
    }
    return (percentage / 100) * max;
}

function alphaToX(value, calibrationPoint, min, max, sensitivity) {
    let size;
    switch(sensitivity) {
        case 1:
            size = 200;
            break;
        case 2:
            size = 300;
            break;
        default://0
            size = 100;
    }

    const arr = rangeToLoopedArray(min, max, calibrationPoint, size);
    const index = arr.indexOf(Math.round(value));
    if (index <= -1) {
        return;
    }
    const ret = window.innerWidth - getValueFromPercent(window.innerWidth, index);

    return ret;
}

function betaToY(value, calibrationPoint, min, max, sensitivity) {
    let size;
    switch(sensitivity) {
        case 1:
            size = 200;
            break;
        case 2:
            size = 300;
            break;
        default://0
            size = 100;
    }

    const arr = rangeToLoopedArray(min, max, calibrationPoint, size);
    const index = arr.indexOf(Math.round(value));
    if (index <= -1) {
        return;
    }
    const ret = window.innerHeight - getValueFromPercent(window.innerHeight, index);

    return ret;
}

function gammaToZ(value, calibrationPoint, settings) {
    //this.gammaMin = gammaMin;
    //this.gammaMax = gammaMax;
    return value;
}

function rangeToLoopedArray(min, max, centre, size) {
    //sanitise
    min = Number(min);
    max = Number(max);
    centre = Number(centre);
    size = Number(size);

    let ret = [];
    let arr = [];

    for (let times = 0; times < 3; times++) {
        for (let i = min; i <= max; i++) {
            arr.push(i);
        }
    }

    let half = Math.round(size / 2);
    let count = 0;
    let mid = 0;

    //get point to slice
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == Math.floor(centre)) {
            count++;

            if (count == 2) {
                mid = i;
                break;
            }
        }
    }

    let start = (mid - half);
    let end = (start + size);

    for (let i = start; i < end; i++) {
        ret.push(arr[i]);
    }

    return ret;
}

function onPeerDataReceived(data) {
    try {
        const obj = JSON.parse(data);
        const x = alphaToX(obj.alpha, obj.alphaCalibrationPoint, settings.alphaMin, settings.alphaMax, settings.sensitivity);
        const y = betaToY(obj.beta, obj.betaCalibrationPoint, settings.betaMin, settings.betaMax, settings.sensitivity);
        const z = gammaToZ(obj.gamma, obj.gammaCalibrationPoint, settings);

        moveCursR(x, y, z, settings);

        if (obj.onClickEvent || obj.onDoubleClickEvent) {
            let offsetX = 0;
            let offsetY = 0;

            switch(clickPoint) {
                case ClickPoint.TopLeft:
                    offsetX = 0;
                    offsetY = 0;
                    break;
                case ClickPoint.TopRight:
                    offsetX = CursR.clientWidth;
                    offsetY = 0;
                    break;
                case ClickPoint.Middle:
                    offsetX = CursR.clientWidth / 2;
                    offsetY = CursR.clientHeight / 2;
                    break;
                case ClickPoint.Top:
                    offsetX = CursR.clientWidth / 2;
                    offsetY = 0;
                    break;
            }

            ClickR.clickByCoordinates(+x + +offsetX, +y + +offsetY, obj.onDoubleClickEvent);
        }
    }
    catch(err) {
        logR.log(LogType.Error, err.message);
    }
}

function onSettingsStatusMessage(status) {
    updateStatus("settings-modal-status", LogType.Debug, status);
}

function onSettingsStatusWarning(status) {
    updateStatus("settings-modal-status", LogType.Warning, status);
}

function initCursRCallbacks() {
    _onPeerDataReceived = onPeerDataReceived;
    _onDisconnected = hideCursR;
    _onConnectionClosed = hideCursR;

    _onDebug = function (message) {
        logR.log(LogType.Debug, message);
    };
    _onWarning = function (message) {
        logR.log(LogType.Warning, message);
    };
    _onError = function (message) {
        logR.log(LogType.Error, message);
    };

    _onDebugStatusUpdate = function (status) {
        updateStatus("cursr-modal-status", LogType.Debug, status);
    };
    _onWarningStatusUpdate = function (status) {
        updateStatus("cursr-modal-status", LogType.Warning, status);
    };

    _onErrorStatusUpdate = function (status) {
        updateStatus("cursr-modal-status", LogType.Error, status);
    };
}

function connectHost() {
    initCursRCallbacks();
    initReceiver();
}

function hideCursR() {
    CursR.style.display = "none";
}

function initConnection() {
    const id = document.getElementById("cursr-connection-id").value;
    joinPeer(id);
}

function sendGyroData() {
    sendData(movementData);
    movementData.onClickEvent = false;
    movementData.onDoubleClickEvent = false;
}

function calibrateCursR() {
    movementData.alphaCalibrationPoint = movementData.alpha;
    movementData.betaCalibrationPoint = movementData.beta;
    movementData.gammaCalibrationPoint = movementData.gamma;
}

function clickCursR() {
    movementData.onClickEvent = true;
}

function doubleClickCursR() {
    movementData.onDoubleClickEvent = true;
}

function connectCursR() {
    initCursRCallbacks();
    initSender();
    const interval = document.getElementById('settings-polling-interval').value;
    initConnection();
    setTimeout(initConnection, 1000);
    calibrateCursR();
    setInterval(sendGyroData, interval);
}

function disconnectCursR() {
    disconnectPeer();
    //CursR.style.display = "none";
}

function testLog() {
    const msg = document.getElementById("test-log-message").value;
    const lt = document.getElementById("test-log-type").value;
    let logType;

    if (lt == "Debug")
        logType = LogType.Debug;
    else if (lt == "Info")
        logType = LogType.Info;
    else if (lt == "Warning")
        logType = LogType.Warning;
    else if (lt == "Error")
        logType = LogType.Error;

    try {
        logR.log(logType, msg);
        document.getElementById("test-log-message").value = "";
    }
    catch(err) {
        alert(err.message);
    }
}

function testMultipleLogs() {
    const count = document.getElementById("test-log-multi-logs").value;

    for (let i = 0; i < count; i++) {
        let rnd = Math.floor(Math.random() * 5);
        let logType;

        switch(rnd) {
            case 1:
                logType = LogType.Debug;
                break;
            case 2:
                logType = LogType.Info;
                break;
            case 3:
                logType = LogType.Warning;
                break;
            case 4:
                logType = LogType.Error;
                break;
            default:
                logType = LogType.Debug;
        }

        let msg = UUID.create();

        try {
            logR.log(logType, msg);
        }
        catch(err) {
            alert(err.message);
        }
    }
}

function updateStatus(id, logType, status) {
    const ctrl = document.getElementById(id);
    if (ctrl != null && ctrl != undefined) {
        ctrl.innerHTML = status;
        ctrl.style.color = logType.colour;
    }
}

function initCursRHost() {
    const lbl = document.getElementById('cursr-host-connection-id');
    const s = "CursR-" + UUID.randomStr(3, 2);
    lbl.innerHTML = "cursr-123-456";//s;
}

function initLabels() {
    document.getElementById('about-version').innerHTML = Meta.getMeta('version');
    document.getElementById('about-year').innerHTML = new Date().getFullYear();
    document.getElementById('bios-year').innerHTML = new Date().getFullYear();
}

function initBios(settings) {
    if (settings.bypassSplash) {
        document.getElementById("bios").style.display = "none";
        document.getElementById("splash").style.display = "none";
    } else {
        setTimeout(function() {
            document.getElementById("bios-text").innerHTML += '<p class="bios-text-md">RAM.........................16mb</p>';
        }, 1000);

        setTimeout(function() {
            document.getElementById("bios-text").innerHTML += '<p class="bios-text-md">Storage...............256mb</p>';
        }, 2000);

        setTimeout(function() {
            document.getElementById("bios-text").innerHTML += '<p class="bios-text-md">Processor..........Intel 80486 66MHz</p>';
        }, 3000);

        setTimeout(function() {
            document.getElementById("bios-text").innerHTML += '<br><br><br><br><p class="bios-text-md">Sound Blaster Pro AudioPCI 250 detected</p>';
        }, 4000);

        setTimeout(function() {
            document.getElementById("bios-text").innerHTML += '<br><br><br><br><p class="bios-text-md">Booting from tobybutchart.github.io</p>';
        }, 4500);

        setTimeout(function() {
            document.getElementById("bios").style.display = "none";
        }, 5000);

        setTimeout(function() {
            document.getElementById("splash").style.display = "none";
        }, 8000);
    }
}

function setClock(clock) {
    clock.innerHTML = new Date().toLocaleTimeString([], { timeStyle: 'short' });
}

function initClock() {
    const clock = document.getElementById("clock");
    //set initial clock - have to wait for first minute to pass otherwise
    setClock(clock)
    setInterval( function() { setClock(clock); }, 10000);
}

document.body.addEventListener('mousemove', function (recursive) {
    const modal = document.getElementById('test-modal');

    if (modal.style.display == "block") {
        let clientX = recursive['clientX'];
        let clientY = recursive['clientY'];
        document.getElementById('cursor-x').setAttribute('value', clientX);
        document.getElementById('cursor-y').setAttribute('value', clientY);
    }
});

initLabels();
initBios(settings);
initCursR();
initCursRHost();
initClock();

function changeCursR(type, useBorder) {
    let innerHTML;
    switch(type) {
        case 0://heart
            innerHTML = '&#128151;';
            clickPoint = ClickPoint.TopLeft;
            break;
        case 1://diamond
            innerHTML = '&#128310;';
            clickPoint = ClickPoint.Top;
            break;
        case 2://crosshair
            innerHTML = '<img src="img/crosshair.png" alt="">';
            clickPoint = ClickPoint.Middle;
            break;
        case 3://laser pointer
            innerHTML = '<img src="img/laser-pointer.png" alt="">';
            clickPoint = ClickPoint.Middle;
            break;
        case 4://cursor
            innerHTML = '<img src="img/cursor-big.png" alt="">';
            clickPoint = ClickPoint.TopLeft;
            break;
        case 5://poop
            innerHTML = '&#128169;';
            clickPoint = ClickPoint.Top;
            break;
        case 6://rocket
            innerHTML = '&#128640;';
            clickPoint = ClickPoint.TopRight;
            break;
        case 7://baguette
            innerHTML = '&#129366;';
            clickPoint = ClickPoint.TopLeft;
            break;
        case 8://aubergine
            innerHTML = '&#127814;';
            clickPoint = ClickPoint.TopLeft;
            break;
        default://default Cursor
            innerHTML = '<img src="img/cursor-big.png" alt="">';
            clickPoint = ClickPoint.TopLeft;
    }

    let className = (useBorder) ? "CursR-border" : "";

    CursR.innerHTML = innerHTML;
    CursR.className = className;
}

function testClickRByID() {
    const id = document.getElementById("test-clickr-id").value;
    const dbl = document.getElementById("test-clickr-double").checked;
    const close = document.getElementById("test-clickr-close").checked;

    if (close) {
        Modal.hide("test-modal");
    }

    ClickR.clickById(id, dbl);

    if (close) {
        Modal.show("test-modal");
    }
}

function testClickRByCoordinates() {
    const x = document.getElementById("test-clickr-x").value;
    const y = document.getElementById("test-clickr-y").value;
    const dbl = document.getElementById("test-clickr-double").checked;
    const close = document.getElementById("test-clickr-close").checked;

    if (close) {
        Modal.hide("test-modal");
    }

    ClickR.clickByCoordinates(x, y, dbl);

    if (close) {
        Modal.show("test-modal");
    }
}

function testClickRByClassName() {
    const className = document.getElementById("test-clickr-class").value;
    const dbl = document.getElementById("test-clickr-double").checked;
    const close = document.getElementById("test-clickr-close").checked;

    if (close) {
        Modal.hide("test-modal");
    }

    ClickR.clickByClassName(className, dbl);

    if (close) {
        Modal.show("test-modal");
    }
}

function initCursR() {
    changeCursR(settings.cursrType, settings.cursrBorder);
}

function actionSettings() {
    changeCursR(settings.cursrType, settings.cursrBorder);

    logR.enableLogs = settings.enableLogs;
    logR.logToConsole = settings.logToConsole;
    logR.logLevel = settings.logLevel;
}

function saveSettings() {
    settings.screenToSettings();
    settings.saveSettings();
    actionSettings();
}

function clearSettings() {
    settings.clearSettings();
    settings.settingsToScreen();
    actionSettings();
}

let movementData = {alpha: 0, alphaCalibrationPoint: 0, beta: 0, betaCalibrationPoint: 0, gamma: 0, gammaCalibrationPoint: 0, onClickEvent: false, onDoubleClickEvent: false};

function handleOrientation(event) {
    const modal = document.getElementById('test-modal');

    if (modal.style.display == "block") {
        if (event.alpha != null)
            document.getElementById('gyro-alpha').setAttribute('value', event.alpha);
        if (event.beta != null)
            document.getElementById('gyro-beta').setAttribute('value', event.beta);
        if (event.gamma != null)
            document.getElementById('gyro-gamma').setAttribute('value', event.gamma);
    }

    if (event.alpha != null)
        movementData.alpha = event.alpha;
    if (event.beta != null)
        movementData.beta = event.beta;
    if (event.gamma != null)
        movementData.gamma = event.gamma;
}

function onGameUpdate(inProgress, level, score, playTime) {
    const lbl = document.getElementById("game-modal-status");
    if (lbl) {
        const gameState = (inProgress) ? "Game Started" : "Game Stopped";
        const timeStr = (inProgress) ? "" : ` | Time: ${playTime}(s)`;
        lbl.innerHTML = `${gameState} | Level: ${level} | Score: ${score}${timeStr}`;
    }
}

Modal.registerHideOnClick("start-modal");

game = new Game(document, "game");
game.onUpdate = onGameUpdate;

function startGame() {
    const btn = document.getElementById("btn-start-game");
    if (!game.inProgress) {
        game.start();
        if (btn) {
            btn.innerHTML = 'Stop&nbsp;<img src="img/stop.png" alt="">';
        }
    } else {
        game.stop();
        if (btn) {
            btn.innerHTML = 'Start&nbsp;<img src="img/start.png" alt="">';
        }
    }
}

if (window.DeviceOrientationEvent == undefined) {
    alert("no DeviceOrientationEvent");
} else {
    window.addEventListener("deviceorientation", handleOrientation);
}
