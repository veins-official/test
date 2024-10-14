// Maths
function abs(value) { return value >= 0 ? value : -value; }

function sqr(value) { return value * value; }

function sign(value) { return value > 0 ? 1 : (value < 0 ? -1 : 0); }

let seed = 0; function random() { return ((seed = (71 * seed + 1) % 100000) / 100000); }

function float2int(value) { return value - value % 1; }

function lerp(start, end, amt) { return (1 - amt) * start + amt * end; }
// Maths


// Render
const resolution = new Vector2(1080, 1920);
const layers = [];
class Layer {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");

    document.querySelector("body").appendChild(this.canvas);
    this.canvas.width = resolution.x; this.canvas.height = resolution.y;
    this.context.imageSmoothingEnabled = false;
  }
}
layers.push(new Layer());

function renderImage(image, transform, layer) {
  layers[layer].context.drawImage(image,
    transform.position.x - transform.size.x / 2,
    transform.position.y - transform.size.y / 2,
    transform.size.x,
    transform.size.y);
}

function clearTransform(transform, layer) {
  layers[layer].context.clearRect(
    transform.position.x - transform.size.x / 2,
    transform.position.y - transform.size.y / 2,
    transform.size.x,
    transform.size.y);
}
// Render


// Input
class Mouse extends GameObject {
  constructor() {
    super(0, 0, 0, 0); this.down = false;

    document.addEventListener("mousemove", (event) => mouse.move(event.clientX, event.clientY));
    document.addEventListener("mousedown", () => mouse.down = true);
    document.addEventListener("mouseup", () => mouse.down = false);

    document.addEventListener("touchmove", (event) => mouse.touch(event));
    document.addEventListener("touchstart", (event) => { mouse.touch(event); mouse.down = true; });
    document.addEventListener("touchend", () => mouse.down = false);
  }

  move(x, y) {
    this.transform.position.x = float2int((x - layers[0].canvas.offsetLeft) / (layers[0].canvas.offsetWidth / layers[0].canvas.width));
    this.transform.position.y = float2int((y - layers[0].canvas.offsetTop) / (layers[0].canvas.offsetHeight / layers[0].canvas.height));
  }

  touch(event) { if (event.touches.length > 0) this.move(event.touches[0].clientX, event.touches[0].clientY); }

  collision() { }
}
const mouse = new Mouse(); objects.push(mouse);
// Input


// UI
class Button extends GameObject {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.lastMouseState = false;
    this.pressed = false;
    this.collide = false;
  }

  update() {
    if (this.pressed) {
      if (this.onInterrupt != null & !this.collide) this.onInterrupt();
      else if (this.onRelease != null & !mouse.down) this.onRelease();
    }

    this.pressed = this.pressed ? this.collide & mouse.down : false;
    this.collide = false;
  }

  collision(other) {
    if (other.constructor.name === "Mouse") {
      this.collide = true;
      if (mouse.down & !this.pressed & !this.lastMouseState) {
        this.pressed = true; if (this.onPress != null) this.onPress();
      }
    }
  }

  lateUpdate() { this.lastMouseState = mouse.down; }
}
// UI


// Engine
const images = [];
class Loader {
  constructor(images_count) { this.images_count = images_count; this.progress = 0; layers[0].context.fillStyle = "white"; layers[0].context.font = "400px Monaco, monospace"; layers[0].context.textBaseline = "middle"; layers[0].context.textAlign = "center"; }
  load() { for (let i = 0; i < this.images_count; i++) { images.push(new Image()); images[i].src = `resources/images/${i}.png`; images[i].onload = () => this.setLoadProgress(this.progress + 1); } }
  setLoadProgress(progress) { this.progress = progress; if (this.progress === this.images_count) start(); else this.render(); }
  render() { clearTransform(new Vector4(float2int(resolution.x / 2), float2int(resolution.y / 2), resolution.x, resolution.y), 0); layers[0].context.fillText(`${float2int(this.progress / this.images_count * 100)}%`, float2int(resolution.x / 2), float2int(resolution.y / 2)); }
}

class SceneControl extends GameObject {
  constructor(scenes) { super(float2int(resolution.x / 2), float2int(resolution.y / 2), resolution.x, resolution.y); this.clear = false; this.move = false; this.scene = "Load"; this.scenes = scenes; }

  load(scene) { this.scene = scene; this.clear = false; this.move = true; this.transform.position.y = float2int(resolution.y * 1.5); }

  clearObjects() { for (let i = 2; i < objects.length; i++) { delete objects[i]; objects.splice(i, 1); i--; } for (let i = 0; i < layers.length; i++) clearTransform(this.transform, i); }

  update() {
    if (this.move) {
      clearTransform(this.transform, layers.length - 1); this.transform.position.y -= float2int(resolution.y / 8);
      if (!this.clear & this.transform.position.y <= float2int(resolution.y / 2)) { this.clear = true; this.clearObjects(); this.scenes[this.scene](); }
      if (this.transform.position.y <= -float2int(resolution.y / 2)) this.move = false; layers[layers.length - 1].context.fillStyle = "white";
      layers[layers.length - 1].context.fillRect(this.transform.position.x - this.transform.size.x / 2, this.transform.position.y - this.transform.size.y / 2, this.transform.size.x, this.transform.size.y);
    }
  }
}
// Engine
