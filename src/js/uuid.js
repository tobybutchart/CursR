class UUID {
    static create() {
        //crypto not supported on Android
        if (typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }

        return Array.from(Array(32)).map((e, i) => {
            let someRandomValue = i === 12 ? 4 : (+new Date() + Math.random() * 16) % 16 | 0;

            return `${~[8, 12, 16, 20].indexOf(i) ? "-" : ""}${(i === 16 ? someRandomValue & 0x3 | 0x8 : someRandomValue).toString(16)}`;
        }).join("");
    }

    static randomStr(subStrLength, sectionCount) {
        let s = "";

        for (let i = 0; i < sectionCount; i++) {
            s += Math.random().toString(36).substr(2, subStrLength);

            if (i < (sectionCount - 1)) {
                s += "-";
            }
        }

        return s;
    }
}
