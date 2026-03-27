// Matrix Digital Rain — Terminal Edition
// გაშვება: node matrix.js  |  გამოსასვლელი: ნებისმიერი ღილაკი

// ======================================================
// IMPORT — Python-ში: import readline
// Node.js-ში ჩაშენებული მოდული კლავიატურის წასაკითხად
// ======================================================
const readline = require('readline');

// ======================================================
// CONST vs LET
// const = Python-ის ანალოგი "მუდმივისა" — არ იცვლება
// let   = ჩვეულებრივი ცვლადი — შეიძლება შეიცვალოს
// ======================================================

// სტრიქონი — ისეთივე როგორც Python-ში
const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ======================================================
// ARROW FUNCTION — Python-ში: lambda n: int(random() * n)
// (n) => ... იგივეა რაც: function rand(n) { return ... }
// ======================================================
const rand     = (n) => Math.floor(Math.random() * n);  // შემთხვევითი მთელი 0-დან n-მდე
const randChar = ()  => CHARS[rand(CHARS.length)];       // შემთხვევითი სიმბოლო CHARS-იდან

// მასივი (Python-ში: list) — terminal-ის ფერების კოდები
const COLORS = ['\x1b[2m\x1b[32m', '\x1b[32m', '\x1b[92m', '\x1b[97m'];
//               მუქი მწვანე       მწვანე       ღია მწვანე   თეთრი
const RESET  = '\x1b[0m';  // ფერის გამორთვა

// ======================================================
// FUNCTION — Python-ში: def pick_color(frac, head):
// frac = რამდენად ახლოს არის სიმბოლო "თავთან" (0.0 - 1.0)
// head = True თუ ეს პირველი (ყველაზე ნათელი) სიმბოლოა
// ======================================================
function pickColor(frac, head) {
  if (head)       return COLORS[3];  // თავი — თეთრი
  if (frac > 0.6) return COLORS[2];  // ახლო კუდი — ღია მწვანე
  if (frac > 0.3) return COLORS[1];  // შუა კუდი — მწვანე
  return COLORS[0];                  // ბოლო კუდი — მუქი მწვანე
}

// terminal-ის ზომის დაბრუნება
// { cols, rows } — ეს არის OBJECT (Python-ში: dict)
// { cols: 80, rows: 24 } = {'cols': 80, 'rows': 24}
function getSize() {
  return { cols: process.stdout.columns || 80, rows: process.stdout.rows || 24 };
  //                                      || = "ან" — თუ undefined, გამოიყენე 80
}

// ======================================================
// CLASS — Python-ში ზუსტად იგივეა!
// ერთი "წვეთი" რომელიც ეკრანზე ჩამოდის
// ======================================================
class Drop {
  // constructor = Python-ის __init__(self, col, rows)
  // this        = Python-ის self
  constructor(col, rows) {
    this.col    = col;                        // რომელ სვეტში ჩამოდის
    this.speed  = Math.random() * 0.6 + 0.3; // სიჩქარე (0.3 - 0.9)
    this.length = rand(18) + 6;               // სიგრძე (6 - 24 სიმბოლო)
    this.y      = Math.random() * -rows;      // საწყისი პოზიცია (ეკრანს ზემოთ)

    // Array.from — Python-ის: [rand_char() for _ in range(self.length)]
    this.chars  = Array.from({ length: this.length }, randChar);
  }

  // method — Python-ის def update(self):
  update() {
    this.y += this.speed;  // ჩამოსვლა

    // 15% შანსი რომ შემთხვევითი სიმბოლო შეიცვალოს
    if (Math.random() < 0.15) {
      this.chars[rand(this.chars.length)] = randChar();
    }
  }

  // ეკრანიდან გამოვიდა?
  isDone(rows) {
    return Math.floor(this.y) - this.length > rows;
  }
}

// ======================================================
// ფრეიმის (ერთი კადრის) აგება
// drops = ყველა Drop ობიექტის მასივი
// ======================================================
function buildFrame(drops, cols, rows) {
  // Map — Python-ის dict. გასაღები: რიცხვი, მნიშვნელობა: object
  const grid = new Map();

  // for...of — Python-ის: for drop in drops:
  for (const drop of drops) {
    const head = Math.floor(drop.y);  // წვეთის "თავის" მწკრივი

    for (let i = 0; i < drop.length; i++) {
      const r = head - i;  // i=0 თავი, i=1,2... კუდი
      if (r < 0 || r >= rows || drop.col >= cols) continue;  // Python-ის: continue

      // grid-ში ვინახავთ: გასაღები = პოზიცია, მნიშვნელობა = სიმბოლოს ინფო
      grid.set(r * cols + drop.col, {
        ch:   drop.chars[i],          // სიმბოლო
        frac: 1 - i / drop.length,    // სიახლოვე თავთან (1.0 = თავი, 0.0 = ბოლო)
        head: i === 0                 // i === 0 ნიშნავს "ეს თავია" (Python-ში: i == 0)
      });
    }
  }

  // ======================================================
  // STRING CONCATENATION — Python-ში: out += "..."
  // \x1b[H = cursor-ს ეკრანის დასაწყისში გადაიყვანს
  // ======================================================
  let out = '\x1b[H';

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid.get(r * cols + c);

      // TERNARY OPERATOR: condition ? value_if_true : value_if_false
      // Python-ში: value_if_true if condition else value_if_false
      out += cell ? pickColor(cell.frac, cell.head) + cell.ch + RESET : ' ';
    }
    out += '\r\n';  // ახალი ხაზი
  }
  return out;
}

// ======================================================
// მთავარი ფუნქცია
// ======================================================
function main() {
  // DESTRUCTURING — Python-ის: cols, rows = get_size().values()
  // { cols, rows } = obj  ნიშნავს: cols = obj.cols, rows = obj.rows
  let { cols, rows } = getSize();

  process.stdout.write('\x1b[?25l\x1b[2J');  // cursor დამალვა + ეკრანის გასუფთავება

  // ცარიელი მასივი — Python-ის: drops = []
  const drops = [];

  // საწყისი წვეთების შექმნა
  for (let c = 0; c < cols; c++) {
    if (Math.random() < 0.25) {       // 25% შანსი ყოველ სვეტში
      const d = new Drop(c, rows);    // ახალი Drop ობიექტი
      d.y = Math.random() * rows;     // შუა ეკრანიდან დაიწყოს
      drops.push(d);                  // Python-ის: drops.append(d)
    }
  }

  // ======================================================
  // setInterval — ყოველ 50ms გაუშვი ეს ფუნქცია (20 fps)
  // Python-ში ანალოგი: while True: ... time.sleep(0.05)
  // () => { ... } = arrow function ყოველ tick-ზე
  // ======================================================
  const timer = setInterval(() => {
    ({ cols, rows } = getSize());  // ეკრანის ზომა განახლდეს (თუ terminal resize მოხდა)

    // 40% შანსი ახალი წვეთი დაემატოს
    if (Math.random() < 0.4) {
      drops.push(new Drop(rand(cols), rows));
    }

    // უკუ loop — splice-ს გამო (სიის შეცვლა loop-ში)
    // Python-ში: for i in range(len(drops)-1, -1, -1):
    for (let i = drops.length - 1; i >= 0; i--) {
      drops[i].update();
      if (drops[i].isDone(rows)) {
        drops.splice(i, 1);  // Python-ის: drops.pop(i)
      }
    }

    process.stdout.write(buildFrame(drops, cols, rows));
  }, 50);

  // გამოსვლის ფუნქცია
  const cleanup = () => {
    clearInterval(timer);                              // timer-ის გაჩერება
    process.stdout.write('\x1b[?25h\x1b[2J\x1b[H');  // cursor დაბრუნება, ეკრანის გასუფთავება
    process.exit(0);                                   // Python-ის: sys.exit(0)
  };

  // კლავიატურის მოსმენა
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  process.stdin.once('keypress', cleanup);  // ნებისმიერ ღილაკზე გამოვიდეს
  process.on('SIGINT', cleanup);            // Ctrl+C-ზეც გამოვიდეს
}

// ფუნქციის გამოძახება — Python-ში: if __name__ == '__main__': main()
main();