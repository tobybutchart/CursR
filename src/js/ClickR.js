class ClickR {
    static click(ctrl, dblClick) {
        const eventName = dblClick ? "dblclick" : "click";
        const evt = new MouseEvent(eventName, {
            bubbles: true,
            cancelable: true,
            view: window
        });
        ctrl.dispatchEvent(evt);
    }

    static clickById(id, dblClick) {
        const ctrl = document.getElementById(id);
        if (ctrl) {
            ClickR.click(ctrl, dblClick);
        }
    }

    static clickByCoordinates(x, y, dblClick) {
        const ctrl = document.elementFromPoint(Math.floor(x), Math.floor(y));
        if (ctrl) {
            ClickR.click(ctrl, dblClick);
        }
    }

    static clickByClassName(className, dblClick) {
        const ctrls = document.querySelectorAll('.' + className);
        if (ctrls) {
            ctrls.forEach(function(ctrl) {
                ClickR.click(ctrl, dblClick);
            });
        }
    }
}
