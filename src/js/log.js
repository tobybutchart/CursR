const LogType = {
    Debug: 'Debug',
    Info: 'Info',
    Warning: 'Warning',
    Error: 'Error'
};

function logTypeToColour(logType) {
    let ret;

    switch(logType) {
        case LogType.Debug:
            ret = "green";
            break;
        case LogType.Info:
            ret = "blue"
            break;
        case LogType.Warning:
            ret = "yellow"
            break;
        case LogType.Error:
            ret = "red"
            break;
        default:
            ret = "white";
    }

    return ret;
}

function log(logType, message, settings) {
    if (settings.enableLogs) {
        const logs = document.getElementById("logs");

        if (logs) {
            const clr = logTypeToColour(logType);
            const logTypeStr = logType.substring(0, 3).toUpperCase();
            const date = new Date().toLocaleString();

            logs.innerHTML += `<span style="color: ${clr}">[${date}] [${logTypeStr}] [${message}]</span><br>`;

            if (settings.logToConsole)
                console.log(message);
        }
    }
}

function clearLogs() {
    const logs = document.getElementById("logs");

    if (logs) {
        logs.innerHTML = "";
    }
}

function downloadLogs() {
    const logs = document.getElementById("logs");

    if (logs) {
        let filename = `logs_${(new Date().toJSON().slice(0, 10))}.txt`;
        let a = document.createElement('a');
        a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logs.innerHTML));
        a.setAttribute('download', filename);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

function openLogsInNewWindow() {
    const logs = document.getElementById("logs");

    if (logs) {
        let x = window.open();
        x.document.open();
        x.document.write(logs.innerHTML);
        x.document.close();
    }
}
