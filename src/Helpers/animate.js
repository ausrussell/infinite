class Animate {
  constructor({ timing, draw, duration, repeat, easeInOut, bounce }) {
    this.timing = timing;
    // this.timingFn = easeInOut ? this.easeInOut : this[timing];
    this.timingFn = bounce ? this.bounce : this[timing];

    this.start = performance.now();
    this.draw = draw;
    this.duration = duration;
    this.repeat = repeat;
    this.bounce = bounce;
    // this.animator(props);
  }

  animator() {
    this.animate(this.start);
  }
  animate = time => {
    if (!time) time = performance.now();
    // this.timeFraction goes from 0 to 1
    this.timeFraction = (time - this.start) / this.duration;
    if (this.timeFraction > 1) this.timeFraction = 1;
    let progress = this.timingFn(this.timeFraction);
    this.draw(progress); // draw it

    if (this.timeFraction < 1) {
      this.requestFrame = requestAnimationFrame(() =>
        this.animate(performance.now())
      );
    } else if (this.repeat) {
      this.start = performance.now();
      this.requestFrame = requestAnimationFrame(() => this.animate());
    }
  };

  bounce() {
    if (this.timeFraction <= 0.5) {
      // first half of the animation
      return this[this.timing](2 * this.timeFraction);
    } else {
      // second half of the animation
      return 1 - this[this.timing](1 - this.timeFraction * 2);
    }
  }

  easeInOut() {
    console.log("easeInOut", this.timeFraction);
    if (this.timeFraction <= 0.5) {
      // first half of the animation
      return this[this.timing](2 * this.timeFraction) / 2;
    } else {
      // second half of the animation
      return (2 - this[this.timing](2 * (1 - this.timeFraction))) / 2;
    }
  }

  end() {
    // debugger;
    // this.draw(1);
    this.repeat = false;
    let x = this.requestFrame;
    cancelAnimationFrame(x);
  }

  circ(timeFraction) {
    return 1 - Math.sin(Math.acos(timeFraction));
  }
  sine(timeFraction) {
    return 1 - Math.sin(timeFraction);
  }
}

export default Animate;
