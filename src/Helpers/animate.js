class animate {
  constructor({ timing, draw, duration }) {
    this.timingFn = this[timing];
    this.start = performance.now();
    this.draw = draw;
    this.duration = duration;
    // this.animator(props);
  }

  animator() {
    this.animate(this.start);
  }
  animate = time => {
    // timeFraction goes from 0 to 1
    let timeFraction = (time - this.start) / this.duration;
    if (timeFraction > 1) timeFraction = 1;

    // calculate the current animation state
    // debugger;
    let progress = this.timingFn(timeFraction);
    this.draw(progress); // draw it

    if (timeFraction < 1) {
      // this.animate(performance.now());
      requestAnimationFrame(() => this.animate(performance.now()));
    }
  };
  circ(timeFraction) {
    return 1 - Math.sin(Math.acos(timeFraction));
  }
}

export default animate;
