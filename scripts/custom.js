const loader = new Loader(9); loader.load();
let day = 0; let endless = false;


const scene_control = new SceneControl(
  {
    "Menu": () => {
      renderImage(images[8], new Vector4(540, 600, 1080, 500), 0);
      objects.push(new MenuButton(540, 1410, 400, 6, () => { endless = false; day = (localStorage.getItem("day") != null ? Number(localStorage.getItem("day")) : 0); scene_control.load("Day"); }));
      objects.push(new MenuButton(200, 1120, 300, 7, () => { window.location.href = "tg:resolve"; }));
      objects.push(new MenuButton(880, 1120, 300, 5, () => { endless = true; day = 0; scene_control.load("Day"); }));
    },
    "Game": () => {
      layers[1].context.fillStyle = "black"; layers[1].context.font = "60px serif";
      objects.push(new Background());
      objects.push(new Task());
      objects.push(new Card());
    },
    "Day": () => {
      day += 1; layers[1].context.fillStyle = "white"; layers[1].context.font = "150px serif";
      if(endless) { layers[1].context.fillText(`День ${day}`, float2int(resolution.x / 2), float2int(resolution.y / 2)); setTimeout(() => { scene_control.load("Game") }, 1000); }
      else {
        if(day < 8) {
          localStorage.setItem("day", day - 1); layers[1].context.fillText(`День ${day}`, float2int(resolution.x / 2), 250);
          objects.push(new MenuButton(540, 1600, 250, 4, () => { scene_control.load("Game"); }));
          layers[1].context.font = "60px serif";
          levels[day - 1][1].split("\n").forEach((line, i) => {
            layers[1].context.fillText(line, float2int(resolution.x / 2), float2int(resolution.y / 2) - 100 + i * 70);
          });
        }
        else scene_control.load("Win");
      }
    },
    "GameOver": () => {
      layers[1].context.fillStyle = "white"; layers[1].context.font = "100px serif";
      layers[1].context.fillText(`Вы проиграли!`, float2int(resolution.x / 2), 800);
      layers[1].context.fillText(`Дней прожито:`, float2int(resolution.x / 2), 920);
      layers[1].context.fillText(`${day}`, float2int(resolution.x / 2), 1040);
      objects.push(new MenuButton(540, 1600, 250, 4, () => { scene_control.load("Menu"); }));
    },
    "Win": () => {
      layers[1].context.fillStyle = "white"; layers[1].context.font = "100px serif";
      layers[1].context.fillText(`Вы выжили!`, float2int(resolution.x / 2), 250);
      layers[1].context.font = "60px serif";
      "Поздравляю!\nТеперь вы можете поиграть\nв бесконечный режим\nили посмотреть другие\nнаши игры\n\nСпасибо за игру!".split("\n").forEach((line, i) => {
        layers[1].context.fillText(line, float2int(resolution.x / 2), float2int(resolution.y / 2) - 200 + i * 70);
      });
      objects.push(new MenuButton(540, 1600, 250, 4, () => { scene_control.load("Menu"); }));
      day = 0; localStorage.setItem("day", 0);
    },
  }
);


const levels = [
  [2, "Число делится на 2 тогда,\nкогда последняя цифра\nделится на 2"],
  [3, "Число делится на 3 тогда,\nкогда его сумма цифр\nделится на 3"],
  [4, "Число делится на 4 тогда,\nкогда две последние цифры\nделятся на 4"],
  [5, "Число делится на 5 тогда,\nкогда последняя цифра\n5 или 0"],
  [6, "Число делится на 6 тогда,\nкогда число делится\nна 2 и 3"],
  [9, "Число делится на 9 тогда,\nкогда его сумма цифр\nделится на 9"],
  [10, "Число делится на 10 тогда,\nкогда последняя цифра\nравна 0"]
];


function start() {
  seed = Date.now(); for (let i = 0; i < 2; i++) { layers.push(new Layer()) }
  layers[0].context.fillStyle = "white"; layers[0].context.font = "80px serif"; layers[0].context.textAlign = "center"; layers[0].context.textBaseline = "middle";
  layers[1].context.textAlign = "center"; layers[1].context.textBaseline = "middle";
  objects.push(scene_control); scene_control.load("Menu");
}


class MenuButton extends Button {
  constructor(x, y, size, img, func) { super(x, y, 0, 0); this.start = true; this.finalSize = size; this.func = func; this.img = img; this.render(); }

  render() { renderImage(images[this.img], this.transform, 1); }
  animate(value) {
    clearTransform(this.transform, 1);
    this.transform.size.x += value; this.transform.size.y += value;
    this.render();
  }

  lateUpdate() {
    super.lateUpdate();
    if (!this.start) return;
    clearTransform(this.transform, 1);
    if (this.transform.size.x < this.finalSize) this.transform.size.x += float2int(this.finalSize / 20);
    if (this.transform.size.y < this.finalSize) this.transform.size.y += float2int(this.finalSize / 20);
    this.start = this.transform.size.x < this.finalSize & this.transform.size.y < this.finalSize;
    this.render();
  }

  onRelease() { this.animate(50); this.func.call(); }
  onInterrupt() { this.animate(50); }
  onPress() { this.animate(-50); }
}


class Task extends GameObject {
  constructor() { super(float2int(resolution.x / 2), 150, 0, 0); this.divider = endless ? [2, 3, 4, 5, 6, 9, 10][float2int(random() * 7)] : levels[day - 1][0]; this.render(); }

  render() {
    layers[0].context.fillText(`Дай мне посылки,`, this.transform.position.x, this.transform.position.y);
    layers[0].context.fillText(`которые делятся`, this.transform.position.x, this.transform.position.y + 90);
    layers[0].context.fillText(`на ${this.divider}`, this.transform.position.x, this.transform.position.y + 180);
  }
}

class Card extends Button {
  constructor() {
    super(float2int(resolution.x / 2), float2int(resolution.y * 1.5), 500, 500);
    this.move = false; this.startPosition = new Vector2(0, 0);
    this.number = 0; this.correct = true; this.generateNumber();
    this.count = 0;
  }

  update() {
    super.update();
    layers[1].context.clearRect(
      this.transform.position.x - this.transform.size.x / 2 - 100,
      this.transform.position.y - this.transform.size.y / 2 - 100,
      this.transform.size.x + 200,
      this.transform.size.y + 200);
    if (this.move) {
      this.transform.position.x = mouse.transform.position.x + this.startPosition.x;
      this.transform.position.y = mouse.transform.position.y + this.startPosition.y;
      this.move = mouse.down;
    } else {
      if (abs(this.transform.position.x - 540) > 250) {
        this.checkAnswer(sign(this.transform.position.x - 540) > 0)
      } else {
        this.transform.position.x = float2int(lerp(this.transform.position.x, float2int(resolution.x / 2), 0.1));
        this.transform.position.y = float2int(lerp(this.transform.position.y, float2int(resolution.y / 2 + 300), 0.1));
      }
    }
  }

  lateUpdate() {
    super.lateUpdate();
    layers[1].context.save();
    layers[1].context.translate(this.transform.position.x, this.transform.position.y);
    layers[1].context.rotate((this.transform.position.x - 540) / 20 * Math.PI / 180.0);
    layers[1].context.drawImage(images[0], -this.transform.size.x / 2, -this.transform.size.y / 2, this.transform.size.x, this.transform.size.y);
    layers[1].context.fillText(this.number, 130, 0);
    if (this.transform.position.x > 540) {
      layers[1].context.globalAlpha = (this.transform.position.x - 540) / 540 * 2;
      layers[1].context.drawImage(images[2], -this.transform.size.x / 2, -this.transform.size.y / 2, this.transform.size.x, this.transform.size.y);
    } else if (this.transform.position.x < 540) {
      layers[1].context.globalAlpha = (540 - this.transform.position.x) / 540 * 2;
      layers[1].context.drawImage(images[3], -this.transform.size.x / 2, -this.transform.size.y / 2, this.transform.size.x, this.transform.size.y);
    }
    layers[1].context.globalAlpha = 1;

    layers[1].context.restore();
  }

  checkAnswer(answer) {
    this.transform.position.x = float2int(resolution.x / 2);
    this.transform.position.y = float2int(resolution.y * 1.5);
    if (answer == this.correct) { this.generateNumber(); this.move = false; this.count += 1; if(this.count >= 10) scene_control.load("Day"); }
    else scene_control.load("GameOver");
  }

  generateNumber() {
    this.correct = random() > 0.5;
    this.number = objects[3].divider * (1 + float2int(random() * 1000)) + (this.correct ? 0 : 1 + float2int(random() * objects[3].divider - 1));
  }

  onPress() { this.move = true; this.startPosition.x = this.transform.position.x - mouse.transform.position.x; this.startPosition.y = this.transform.position.y - mouse.transform.position.y; }
}


class Background extends GameObject {
  constructor() { super(float2int(resolution.x / 2), float2int(resolution.y / 2), resolution.x, resolution.y); this.render(); }
  render() { renderImage(images[1], this.transform, 0); }
}
