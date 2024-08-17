//128578 - happy
//129324 - sweary
//128565 - swirly
//128128 - skull
//&#9760 - bones
//128169 - poop
//128165 - explosion
//128557 - crying
//128405 - middle finger
//128552 - fearful
//128534 - worried
//128520 - devil
//128127 - devil
//128526 - sunnies
//128528 - straight smile
//128536 - kiss
//129392 - heart boy
//129314 - sick
//129327 - head explode

class BaseGameObject {
    constructor(document, parentID) {
        this.document = document;
        this.parentID = parentID;
        this.parent = null;

        if (document) {
            this.parent = this.document.getElementById(parentID);
        }
    }

    clearParent() {
        if (this.parent) {
            this.parent.innerHTML = "";
            this.parent.onclick = null;
        }
    }
}

class Game extends BaseGameObject {
    constructor(document, parentID) {
        super(document, parentID);
        this.inProgress = false;
        this.level = 1;
        this.misses = 0;
        this.enemies = [];
        this.startTime = new Date();
        this.onUpdate = null;
        this.splashScreen = null;

        this._ENEMY_ID_BASE = "____enemy-";
        this._PLAYING_CLASS_NAME = "game-colour-change";

        this.clearParent();
        this.showSplashScreen();
    }

    enemyCount() {
        return this.enemies.length;
    }

    aliveEnemyCount() {
        let ret = 0;
        for (let i = 0; i < this.enemies.length; i++) {
            if (!this.enemies[i].isDead) {
                ret ++;
            }
        }
        return ret;
    }

    deadEnemyCount() {
        const count = this.aliveEnemyCount();
        return +this.enemies.length - +count;
    }

    score() {
        const count = this.deadEnemyCount();
        return +count - +this.misses;
    }

    speed() {
        return this.level;
    }

    movement() {
        return (this.enemyCount() > 3) ? 50 : 0;
    }

    showSplashScreen() {
        if (this.parent) {
            this.parent.style.backgroundImage = 'url("img/emoji-sniper.jpg")';
            this.parent.style.backgroundPosition = 'center';
            this.parent.style.backgroundRepeat = 'no-repeat';
            this.parent.style.backgroundSize = 'contain';
            this.parent.classList.remove(this._PLAYING_CLASS_NAME);
        }
    }

    hideSplashScreen() {
        if (this.parent) {
            this.parent.style.backgroundImage = '';
            this.parent.classList.add(this._PLAYING_CLASS_NAME);
        }
    }

    initParent() {
        this.clearParent();
        if (this.parent) {
            this.parent.onclick = this.onCheckShot.bind(event, this);
        }
    }

    onCheckShot(game, event) {
        if (game.inProgress) {
            const ctrl = document.elementFromPoint(Math.floor(event.clientX), Math.floor(event.clientY));
            if (ctrl) {
                if (!ctrl.id.startsWith(game._ENEMY_ID_BASE)) {
                    game.misses++;
                    game.doOnUpdate();
                }
            }
        }
    }

    onEnemyStartKill(enemy) {
        if (this.inProgress) {
            this.level = Math.ceil(this.enemyCount() / 5);
            this.doOnUpdate();
        }
    }

    onEnemyEndKill(enemy) {
        if (this.inProgress) {
            const count = +this.level - +this.aliveEnemyCount();
            this.spawnEnemies(count);
            this.doOnUpdate();
        }
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            const id = this._ENEMY_ID_BASE + this.enemyCount();
            const movement = this.movement();
            const speed = this.speed();
            const size = 50 - this.level;
            const enemy = new Enemy(this.document, this.parentID, id, movement, speed, size);
            enemy.onStartKill = this.onEnemyStartKill.bind(this);
            enemy.onEndKill = this.onEnemyEndKill.bind(this);
            enemy.spawn();
            this.enemies.push(enemy);
        }
    }

    start() {
        if (!this.inProgress) {
            this.level = 1;
            this.misses = 0;
            this.enemies = [];
            this.startTime = new Date();
            this.hideSplashScreen();
            this.stop();
            this.initParent();
            this.spawnEnemies(1);
            this.inProgress = true;
            game.doOnUpdate();
        }
    }

    stop() {
        if (this.inProgress) {
            for (let i = 0; i < this.enemies.length; i++) {
                if (!this.enemies[i].isDead) {
                    this.enemies[i].kill();
                }
            }
            this.inProgress = false;
            game.doOnUpdate();
            this.showSplashScreen();
        }
    }

    doOnUpdate() {
        if (typeof this.onUpdate === 'function') {
            const now = new Date();
            const seconds = (now.getTime() - this.startTime.getTime()) / 1000;
            this.onUpdate(this.inProgress, this.level, this.score(), seconds);
        }
    }
}

const EnemyState = Object.freeze({
    Hover: { name: "Hover", value: -1, emojis: ["&#129324;", "&#128557;", "&#128552;", "&#128534;", "&#128520;", "&#128127;", "&#128545;"] },
    Healthy: { name: "Healthy", value: 0, emojis: ["&#128578;"] },
    KillShot: { name: "KillShot", value: 1, emojis: ["&#128565;", "&#129314;", "&#129327;"] },
    DeathThrow1: { name: "DeathThrow1", value: 2, emojis: ["&#128128;"] },
    DeathThrow2: { name: "DeathThrow2", value: 3, emojis: ["&#128165;"] }
});

class EnemyStateHelper {
    static max() {
        let ret = -1;
        const values = Object.values(EnemyState);

        for (let i = 0; i < values.length; i++) {
            if (values[i].value > ret) {
                ret = values[i].value;
            }
        }

        return ret;
    }

    static fromValue(value) {
        let ret = EnemyState.Healthy;
        const values = Object.values(EnemyState);

        for (let i = 0; i < values.length; i++) {
            if (values[i].value == value) {
                const name = values[i].name;
                ret = EnemyState[name];
                break;
            }
        }

        return ret;
    }

    static debug() {
        console.log(Object.keys(EnemyState));
        console.log(Object.values(EnemyState));
        console.log(EnemyState);
    }

    static hoverCount() {
        return EnemyState.Hover.emojis.length;
    }

    static deathThrowCount() {
        return EnemyState.KillShot.emojis.length;
    }
}

class Enemy extends BaseGameObject {
    constructor(document, parentID, enemyID, movementInterval, speed, size) {
        super(document, parentID);
        this.enemyID = enemyID;
        this.container = null;
        this.enemyState = EnemyState.Healthy;
        this.debug = false;//true;
        this.canMove = movementInterval > 0;
        this.speed = speed;
        this.isDead = false;
        this.size = 70;
        this.fontSize = size;
        this.movementTimer = null;
        this.movementInterval = movementInterval;
        this.bounceX = this.randomBounceValue();
        this.bounceY = this.randomBounceValue();
        this.movingUp = true;
        this.movingLeft = true;
        this.hoverIndex = Math.floor(Math.random() * EnemyStateHelper.hoverCount());
        this.deathSequence = Math.floor(Math.random() * EnemyStateHelper.deathThrowCount());

        //callback functions
        this.onStartKill = null;
        this.onEndKill = null;
    }

    randomBounceValue() {
        return Math.floor(Math.random() * 10) + 1;
    }

    startXPos() {
        if (this.parent) {
            const width = (this.parent.clientWidth - this.size);
            return Math.floor(Math.random() * width) + 'px';
        }
    }

    startYPos() {
        if (this.parent) {
            const height = (this.parent.clientHeight - this.size);
            return Math.floor(Math.random() * height) + 'px';
        }
    }

    spawn() {
        if (this.document && this.parent) {
            this.clear();

            this.container = this.document.createElement("div");
            this.container.id = this.enemyID;

            //styles
            this.container.style.width = this.size + "px";
            this.container.style.height = this.size + "px";
            this.container.style.fontSize = this.fontSize + "px";
            this.container.style.cursor = "default";
            this.container.style.position = "absolute";
            this.container.style.left = this.startXPos();
            this.container.style.top = this.startYPos();

            this.container.style.webkitUserSelect = "none";
            this.container.style.mozUserSelect = "none";
            this.container.style.msUserSelect = "none";
            this.container.style.oUserSelect = "none";
            this.container.style.userSelect = "none";

            if (this.debug) {
                this.container.style.background = "red";
            }

            this.updateFromState(EnemyState.Healthy);

            //events
            this.container.onclick = this.kill.bind(this);
            this.container.onmouseenter = this.onMouseEnter.bind(this);
            this.container.onmouseleave = this.onMouseLeave.bind(this);
            this.container.onmouseover = this.onMouseOver.bind(this);
            this.container.onmouseout = this.onMouseOut.bind(this);
            this.parent.appendChild(this.container);

            if (this.canMove) {
                this.startMoveTimer();
            }
        }
    }

    clear() {
        this.updateFromState(null);
        this.stopMoveTimer();
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }

    onMouseOver() {
        if (!this.isDead) {
            this.updateFromState(EnemyState.Hover);
        }
    }

    onMouseOut() {
        if (!this.isDead) {
            this.updateFromState(EnemyState.Healthy);
        }
    }

    onMouseEnter() {

    }

    onMouseLeave() {

    }

    updateFromState(enemyState) {
        this.enemyState = enemyState;

        if (this.container) {
            let html = "";

            if (this.enemyState) {
                let index = 0;

                if (this.enemyState == EnemyState.Hover) {
                    index = this.hoverIndex;
                } else if (this.enemyState == EnemyState.KillShot) {
                    index = this.deathSequence;
                }

                html = this.enemyState.emojis[index];
            }

            if (this.debug) {
                html += this.enemyID;
            }

            this.container.innerHTML = html;
        }
    }

    move() {
        if (this.canMove && this.parent && this.container) {
            const currentLeft = this.container.style.left.replace("px", "");
            const currentTop = this.container.style.top.replace("px", "");

            let newLeft = currentLeft;
            let newTop = currentTop;

            //x axis
            if (this.movingLeft) {
                const sum = +currentLeft + +this.bounceX + +this.speed;
                const max = +this.parent.clientWidth - +this.container.clientWidth;

                if (sum > max) {
                    newLeft = Number(newLeft) - Number(this.bounceX) - Number(this.speed);
                    this.movingLeft = false;
                    this.bounceX = this.randomBounceValue();
                } else {
                    newLeft = sum;
                }
            } else {
                const sum = +newLeft - +this.bounceX - +this.speed;
                const min = 0;

                if (sum < min) {
                    newLeft = Number(newLeft) + Number(this.bounceX) + Number(this.speed);
                    this.movingLeft = true;
                    this.bounceX = this.randomBounceValue();
                } else {
                    newLeft = sum;
                }
            }

            //y axis
            if (this.movingUp) {
                const sum = +currentTop + +this.bounceY;
                const max = +this.parent.clientHeight - +this.container.clientHeight;

                if (sum > max) {
                    newTop = Number(newTop) - Number(this.bounceY);
                    this.movingUp = false;
                    this.bounceY = this.randomBounceValue();
                } else {
                    newTop = sum;
                }
            } else {
                const sum = +newTop - +this.bounceY;
                const min = 0;

                if (sum < min) {
                    newTop = Number(newTop) + Number(this.bounceY);
                    this.movingUp = true;
                    this.bounceY = this.randomBounceValue();
                } else {
                    newTop = sum;
                }
            }

            this.container.style.left = newLeft + "px";
            this.container.style.top = newTop + "px";
        }
    }

    startMoveTimer() {
        this.movementTimer = setInterval(this.move.bind(this), this.movementInterval);
    }

    stopMoveTimer() {
        clearInterval(this.movementTimer);
    }

    kill() {
        if (this.container && !this.isDead) {
            this.canMove = false;
            this.isDead = true;
            let counter = 0;
            const max = EnemyStateHelper.max();
            setTimeout(this.doOnStartKill.bind(this), counter);
            for (let i = 1; i <= max; i++) {
                this.enemyState = EnemyStateHelper.fromValue(i);
                const state = this.enemyState;
                setTimeout(this.updateFromState.bind(this, state), counter);
                counter += 500;
            }
            setTimeout(this.clear.bind(this), counter);
            setTimeout(this.doOnEndKill.bind(this), counter);
        }
    }

    doOnStartKill() {
        if (typeof this.onStartKill === 'function') {
            this.onStartKill(this);
        }
    }

    doOnEndKill() {
        if (typeof this.onEndKill === 'function') {
            this.onEndKill(this);
        }
    }
}
