const LogType = Object.freeze({
    Debug: { name: "Debug", value: 0, colour: "green", shortString: "DEB" },
    Info: { name: "Info", value: 1, colour: "blue", shortString: "INF" },
    Warning: { name: "Warning", value: 2, colour: "yellow", shortString: "WAR" },
    Error: { name: "Error", value: 3, colour: "red", shortString: "ERR" }
});

class Log {
    constructor(dateTime, logType, message) {
        this.dateTime = dateTime;
        this.logType = logType;
        this.message = message;
    }

    toString() {
        return `[${this.dateTime}] [${this.logType.shortString}] [${this.message}]`;
    }
}

class LogR {
    constructor() {
        this.enableLogs = true;
        this.logToConsole = false;
        this.logLevel = 0;
        this.logs = [];
        this.debugCount = 0;
        this.infoCount = 0;
        this.warningCount = 0;
        this.errorCount = 0;
    }

    shouldLog(logType) {
        return logType.value >= this.logLevel;
    }

    log(logType, message) {
        if (this.enableLogs && this.shouldLog(logType)) {
            //const date = new Date().toLocaleString();
            let date = new Date().toISOString();
            date = date.replace("T", " ");
            date = date.replace("Z", "");
            const log = new Log(date, logType, message);

            this.logs.push(log);

            switch(logType) {
                case LogType.Debug:
                    this.debugCount++;
                    break;
                case LogType.Info:
                    this.infoCount++;
                    break;
                case LogType.Warning:
                    this.warningCount++;
                    break;
                case LogType.Error:
                    this.errorCount++;
                    break;
            }

            if (this.logToConsole) {
                console.log(log.toString());
            }
        }
    }

    clearLogs() {
        this.logs = [];
        this.debugCount = 0;
        this.infoCount = 0;
        this.warningCount = 0;
        this.errorCount = 0;
    }

    toString() {
        let ret = "";
        for (let i = 0; i < this.logs.length; i++) {
            ret += `${this.logs[i].toString()}\n`;
        }
        return ret;
    }

    toHTML(useInlineStyle) {
        let ret = "";
        for (let i = 0; i < this.logs.length; i++) {
            const tag = useInlineStyle ? `style="color: ${this.logs[i].logType.colour}"` : `class="logr-entry"`;
            ret += `<span ${tag}>${this.logs[i].toString()}</span><br>\n`;
        }
        return ret;
    }

    toTable(useInlineStyle) {
        const tableTag = useInlineStyle ? 'style="border-collapse: collapse; text-align: left; background-color: #d7d7d7; font-family: monospace;"' : 'class="logr-tbl"';
        const cellTag = useInlineStyle ? 'style="padding: 10px; border: 1px solid black;"' : 'class="logr-tbl-cell"';

        let ret = `<table ${tableTag}><tr><th ${cellTag}>Date Time</th><th ${cellTag}>Log Type</th><th ${cellTag}>Message</th></tr>`;
        for (let i = 0; i < this.logs.length; i++) {
            const rowTag = useInlineStyle ? `style="color: ${this.logs[i].logType.colour}"` : 'class="logr-tbl-row"';
            ret += `<tr ${rowTag}><td ${cellTag}>${this.logs[i].dateTime}</td><td ${cellTag}>${this.logs[i].logType.shortString}</td><td ${cellTag}>${this.logs[i].message}</td></tr>\n`;
        }
        return ret + "</table>";
    }

    toDocument() {
        const tbl = this.toTable(true);
        const title = new Date().toJSON().slice(0, 10);
        const header = `<table style="font-family: monospace;">\n<tr><td>Date:</td><td>${title}</td></tr>\n<tr><td>Entries:</td><td>${this.logs.length}</td></tr>\n<tr><td>Debug Messages:</td><td>${this.debugCount}</td></tr>\n<tr><td>Info Messages:</td><td>${this.infoCount}</td></tr>\n<tr><td>Warning Messages:</td><td>${this.warningCount}</td></tr>\n<tr><td>Error Messages:</td><td>${this.errorCount}</td></tr>\n</table>\n`;

        return `<!DOCTYPE html>\n<head>\n<meta charset="utf-8">\n<title>LogR: ${title}</title>\n<head><link rel="icon" type="image/x-icon" href="favicon.ico">\n</head>\n<html>\n<body>\n${header}\n<br>\n<br>\n${tbl}\n</body>\n</html>`;
    }

    downloadLogs() {
        if (this.logs.length > 0) {
            const filename = `LogR_${(new Date().toJSON().slice(0, 10))}.txt`;
            const anchor = document.createElement('a');
            const contents = encodeURIComponent(this.toString());

            anchor.setAttribute('href', 'data:text/plain;charset=utf-8,' + contents);
            anchor.setAttribute('download', filename);
            anchor.style.display = 'none';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
        }
    }

    openLogsInNewWindow() {
        if (this.logs.length > 0) {
            const x = window.open();
            x.document.open();
            x.document.write(this.toDocument());
            x.document.close();
        }
    }
}
