// https://github.com/WebReflection/pyscript-xmas-2023/blob/main/js/snowFlakes.js
const { PI, ceil, cos, sin, random } = Math;
const { assign } = Object;

class Flake {
  constructor(width, height, radius, density) {
    this.x = random() * width;
    this.y = random() * height;
    this.r = radius;
    this.d = density;
  }
  drawInto(context) {
    const { x, y, r } = this;
    context.moveTo(x, y);
    context.arc(x, y, r, 0, PI * 2, true);
  }
  update(angle) {
    this.y += cos(angle + this.d) + 1 + (this.r / 2);
    this.x += sin(angle) * 2;
  }
}

export default class SnowFlakes {
  constructor(canvas, density = 50, radius = 5) {
    const { width, height } = canvas.getBoundingClientRect();
    this.c = canvas.getContext('2d');
    this.w = (canvas.width = ceil(width));
    this.h = (canvas.height = ceil(height));
    this.f = [];
    this.a = 0;
    this.i = 0;
    this.t = '';
    for (let i = 0; i < density; i++) {
      const r = (random() * (radius - 1)) + 1;
      const d = (random() * (density - 1)) + 1;
      this.f.push(new Flake(this.w, this.h, r, d));
    }
  }
  start() {
    const draw = () => {
      this.i = requestAnimationFrame(draw);
      this.a += 0.01;
      const { c: context, f: flakes, w: width, h: height } = this;
      context.clearRect(0, 0, width, height);
      if (this.t) this.write();
      context.fillStyle = 'rgba(255,255,255,0.7)';
      context.beginPath();
      for (const flake of flakes) {
        const r2 = flake.r * 2;
        flake.drawInto(context);
        flake.update(this.a);
        if(flake.x > (width + r2) || flake.x < -r2 || flake.y > height) {
          if(random() < .66)
            assign(flake, { x: random() * width, y: -5 });
          else if (sin(this.a) > 0)
            assign(flake, { x: -r2, y: random() * height });
          else
            assign(flake, { x: width + r2, y: random() * height });
        }
      }
      context.fill();
      context.closePath();
    };
    draw();
    return this;
  }
  stop() {
    cancelAnimationFrame(this.i);
    return this;
  }
  write(text = this.t) {
    const size = 48;
    const hSize = size / 2;
    const { c: context, w: width, h: height } = this;
    context.strokeStyle = 'rgba(255,255,255,0.7)';
    context.fillStyle = 'rgba(0,0,0,0.7)';
    context.font = `bold ${size}px MerryChristmasFlake`;
    context.textAlign = 'center';
    context.textBaseline = 'bottom';
    context.fillText(text, width / 2, height - hSize, width);
    context.strokeText(text, width / 2, height - hSize, width);
    this.t = text;
    return this;
  }
}
