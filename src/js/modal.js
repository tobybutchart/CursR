class Modal {
    static show(id) {
        const elem = document.getElementById(id);
        if (elem) {
            elem.style.display = "block";
        }
    }

    static hide(id) {
        const elem = document.getElementById(id);
        if (elem) {
            elem.style.display = "none";
        }
        this.clearOnHide(id);
    }

    static toggle(id) {
        const elem = document.getElementById(id);
        if (elem) {
            let display = elem.style.display;

            if (display == "none" || display == "") {
                display = "block";
            } else if (display == "block") {
                display = "none";
            }

            elem.style.display = display;
        }
        this.clearOnHide(id);
    }

    static clearOnHide(id) {
        // data-clear-on-hide="true"
        document.getElementById(id).querySelectorAll('*').forEach(function(elem) {
            if (elem.dataset.clearOnHide) {
                if (elem.tagName.toLowerCase() == "input" && elem.type.toLowerCase() == "checkbox") {
                    elem.checked = false;
                } else if (elem.tagName.toLowerCase() == "select") {
                    elem.selectedIndex = -1;
                } else if (elem.tagName.toLowerCase() == "span") {
                    elem.innerHTML = "";
                } else {
                    elem.value = "";
                }
            }
        });
    }

    static toggleFullscreen(id) {
        //TODO
    }

    static minimise(id) {
        //TODO
    }

    static maximise(id) {
        //TODO
    }

    static registerHideOnClick(id) {
        window.onclick = function(event) {
            if (event.target.id == id) {
                Modal.hide(id);
            }
        }
    }
}
