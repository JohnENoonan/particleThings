class MouseSpeed {
  constructor() {
    this.cb = () => {};
    this.mVel = new THREE.Vector3(0,0,0);
    // this.speedX = 0;
    // this.speedY = 0;
    this.oldVel = new THREE.Vector3(0,0,0);
    // this.oldX = 0;
    // this.oldY = 0;
    this.firstCalc = true;
    this.timerId;
    this.calcSpeed = this.calcSpeed.bind(this);
  }
  calcSpeed(e) {
    if (!this.firstCalc) {
      // this.speedX = e.clientX - this.oldX;
      // this.speedY = e.clientY - this.oldY;
      this.mVel.set(e.clientX - this.oldVel.x,
                    -1*(e.clientY - this.oldVel.y),
                     0);
      // this.oldX = e.clientX;
      // this.oldY = e.clientY;
      this.oldVel.set(e.clientX, e.clientY, 0);
      this.cb();
      this.setToZero();
    } else {
      // this.oldX = e.clientX;
      // this.oldY = e.clientY;
      this.oldVel.set(e.clientX, e.clientY, 0);
      this.firstCalc = false;
    }
  }

  setToZero() {
    clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      // this.speedX = 0;
      // this.speedY = 0;
      this.mVel.set(0,0,0);
      this.cb();
    }, 50);
  }
  init(
    cb = () => {
      console.log(
        `pass a callback function on init to access speedX and speedY.`
      );
    }
  ) {
    this.cb = cb;
    window.addEventListener("mousemove", this.calcSpeed);
  }
  destroy(cb) {
    window.removeEventListener("mousemove", this.calcSpeed);
    cb();
  }
};
