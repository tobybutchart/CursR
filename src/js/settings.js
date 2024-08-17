class Settings {
    constructor() {
        this.fadeOnInactive;
        this.fitToScreen;
        this.sensitivity;
        this.pollingInterval;
        this.cursrType;
        this.cursrBorder;
        this.bypassSplash;
        this.enableLogs;
        this.logToConsole;
        this.logLevel;
        this.alphaMin;
        this.alphaMax;
        this.betaMin;
        this.betaMax;
        this.gammaMin;
        this.gammaMax;

        this._onStatusMessage = null;
        this._onStatusWarning = null;
        this._SETTINGS_STR = "settings";

        this.setDefaults();
        this.getSettings();
        this.settingsToScreen();
    }

    setDefaults() {
        this.fadeOnInactive = false;
        this.fitToScreen = true;
        this.sensitivity = 1;
        this.pollingInterval = 250;
        this.cursrType = 0;
        this.cursrBorder = false;
        this.bypassSplash = false;
        this.enableLogs = true;
        this.logToConsole = true;
        this.logLevel = 0;
        this.alphaMin = 0;
        this.alphaMax = 360;
        this.betaMin = -180;
        this.betaMax = 180;
        this.gammaMin = -90;
        this.gammaMax = 90;
    }

    setOnStatusMessage(func) {
        this._onStatusMessage = func;
    }

    setOnStatusWarning(func) {
        this._onStatusWarning = func;
    }

    onStatusMessage(message) {
        if (typeof this._onStatusMessage === 'function') {
            this._onStatusMessage(message);
        }
    }

    onStatusWarning(message) {
        if (typeof this._onStatusWarning === 'function') {
            this._onStatusWarning(message);
        }
    }

    getSettings() {
        if (localStorage.getItem(this._SETTINGS_STR) != null) {
            const settings = JSON.parse(localStorage.getItem(this._SETTINGS_STR));
            for (let prop in settings) {
                if (Settings.prototype.hasOwnProperty.call(settings, prop)) {
                    this[prop] = settings[prop];
                }
            }
        }
    }

    saveSettings() {
        localStorage.setItem(this._SETTINGS_STR, JSON.stringify(this));
        this.onStatusMessage("Settings saved");
    }

    screenToSettings() {
        const elems = document.querySelectorAll('*');

        for (let i = 0; i < elems.length; i++) {
            if (elems[i].dataset.settings) {
                if (elems[i].tagName.toLowerCase() == "input" && elems[i].type.toLowerCase() == "checkbox") {
                     this[elems[i].dataset.setting] = elems[i].checked;
                } else if (elems[i].tagName.toLowerCase() == "select") {
                     this[elems[i].dataset.setting] = elems[i].selectedIndex;
                } else {
                     this[elems[i].dataset.setting] = elems[i].value;
                }
            }
        }
    }

    settingsToScreen() {
        const elems = document.querySelectorAll('*');

        for (let i = 0; i < elems.length; i++) {
            if (elems[i].dataset.settings) {
                if (elems[i].tagName.toLowerCase() == "input" && elems[i].type.toLowerCase() == "checkbox") {
                    elems[i].checked = this[elems[i].dataset.setting];
                } else if (elems[i].tagName.toLowerCase() == "select") {
                    elems[i].selectedIndex = this[elems[i].dataset.setting];
                } else {
                    elems[i].value = this[elems[i].dataset.setting];
                }
            }
        }
    }

    clearSettings() {
        localStorage.removeItem(this._SETTINGS_STR);
        this.setDefaults();
        this.saveSettings();
        this.onStatusWarning("Settings deleted");
    }
}
