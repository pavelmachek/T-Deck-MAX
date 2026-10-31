var ink_color = 0;

function __draw_hline(x1, x2, y, color) {
  var temp;

  if (x1 > x2) {
    temp = x1;
    x1 = x2;
    x2 = temp;
  }

  for (var x = x1; x <= x2; x++) {
    __set_pixel(x, y, color);
  }
}

function __fill_rect(x1, y1, x2, y2, color) {
  var temp;

  if (x1 > x2) {
    temp = x1;
    x1 = x2;
    x2 = temp;
  }
  if (y1 > y2) {
    temp = y1;
    y1 = y2;
    y2 = temp;
  }

  for (var y = y1; y <= y2; y++) {
    __draw_hline(x1, x2, y, color);
  }
}


function ink(x, y) {
  __set_pixel(x, y, ink_color);
}

function bink(x, y) {
  __set_pixel(x, y, ink_color);
  __set_pixel(x + 1, y, ink_color);
  __set_pixel(x, y + 1, ink_color);
  __set_pixel(x + 1, y + 1, ink_color);
}

function cls() {
  var color = ink_color;
  for (var y = 0; y < __screen_height; y++) {
    for (var x = 0; x < __screen_width; x++) {
      __set_pixel(x, y, color);
    }
  }
  redraw = 1;
  ink_color = 1 - color;
  now();
}

var redraw = 0;
function __step(i) {
  if (redraw > 0) {
    redraw = 0;
    return 1;
  }
  return 0;
}

function now() { redraw = 1; }

function glyph() {
  var w = __screen_width, h = __screen_height;
  var steps = Math.max(w, h);
  if (steps > 1) {
    for (var i = 0; i < steps; i++) {
      var x = Math.floor(i * (w - 1) / (steps - 1));
      var y = Math.floor(i * (h - 1) / (steps - 1));
      ink(x, y);
      ink(x, h - 1 - y);
    }
  }

  var cx = (w - 1) / 2, cy = (h - 1) / 2;
  var radius = Math.floor(Math.min(w, h) / 4);
  var thickness = 1.5;
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var dx = x - cx, dy = y - cy;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(distance - radius) <= thickness) ink(x, y);
    }
  }
  now();
}

function grey() {
  for (var y = 0; y < __screen_height; y++) {
    for (var x = 0; x < __screen_width; x++) {
      if (((x + y) % 2) !== 0) ink(x, y);
    }
  }
  now();
}

function __touch(d, x, y) {
  print('Touch:', d, x, y);
  bink(x, y);
  if (!d) now();
  return 0;
}

function __key(press, v) {
  print('Key:', press, v);
  return 0;
}

//g.getWidth = function() { return ; };
//g.getHeight = function() { return ; };

var __W = __screen_width;
var __H = __screen_height;
var __BPP = 1;
var __color;
var __bgColor;

function __draw_hline(x1, x2, y, color) {
  var t;
  var x;

  if (x1 > x2) {
    t = x1;
    x1 = x2;
    x2 = t;
  }

  y = Math.round(y);
  x1 = Math.ceil(x1);
  x2 = Math.floor(x2);

  if (y < 0 || y >= __H) return;
  if (x1 < 0) x1 = 0;
  if (x2 >= __W) x2 = __W - 1;

  for (x = x1; x <= x2; x++)
    __set_pixel(x, y, color);
}

function __fill_rect(x1, y1, x2, y2, color) {
  var t;
  var y;

  if (x1 > x2) {
    t = x1; x1 = x2; x2 = t;
  }
  if (y1 > y2) {
    t = y1; y1 = y2; y2 = t;
  }

  for (y = Math.ceil(y1); y <= Math.floor(y2); y++)
    __draw_hline(x1, x2, y, color);
}

function __draw_line(x1, y1, x2, y2, color) {
  var dx = Math.abs(x2 - x1);
  var sx = x1 < x2 ? 1 : -1;
  var dy = -Math.abs(y2 - y1);
  var sy = y1 < y2 ? 1 : -1;
  var err = dx + dy;
  var e2;

  x1 = Math.round(x1);
  y1 = Math.round(y1);
  x2 = Math.round(x2);
  y2 = Math.round(y2);

  while (true) {
    __set_pixel(x1, y1, color);
    if (x1 === x2 && y1 === y2) break;

    e2 = 2 * err;
    if (e2 >= dy) { err += dy; x1 += sx; }
    if (e2 <= dx) { err += dx; y1 += sy; }
  }
}

function __make_color(r, green, b) {
  if (green >= 0.5)
    return 1;
  return 0;
}

function __ellipse(x1, y1, x2, y2, filled, color) {
  var left = Math.min(x1, x2);
  var right = Math.max(x1, x2);
  var top = Math.min(y1, y2);
  var bottom = Math.max(y1, y2);
  var cx = (left + right) / 2;
  var cy = (top + bottom) / 2;
  var rx = (right - left) / 2;
  var ry = (bottom - top) / 2;
  var y;
  var q;
  var half;
  var x;

  if (rx === 0 || ry === 0) {
    if (filled) __fill_rect(left, top, right, bottom, color);
    else {
      __draw_line(left, top, right, bottom, color);
      __draw_line(left, bottom, right, top, color);
    }
    return;
  }

  for (y = Math.ceil(top); y <= Math.floor(bottom); y++) {
    q = 1 - ((y - cy) * (y - cy)) / (ry * ry);
    if (q < 0) continue;

    half = rx * Math.sqrt(q);
    if (filled) {
      __draw_hline(Math.ceil(cx - half), Math.floor(cx + half), y, color);
    } else {
      __set_pixel(Math.round(cx - half), y, color);
      __set_pixel(Math.round(cx + half), y, color);
    }
  }

  if (!filled) {
    for (x = Math.ceil(left); x <= Math.floor(right); x++) {
      q = 1 - ((x - cx) * (x - cx)) / (rx * rx);
      if (q >= 0) {
        half = ry * Math.sqrt(q);
        __set_pixel(x, Math.round(cy - half), color);
        __set_pixel(x, Math.round(cy + half), color);
      }
    }
  }
}

function __polygon(poly, closed, filled, color) {
  var n = Math.floor(poly.length / 2);
  var i;
  var j;
  var x1;
  var y1;
  var x2;
  var y2;
  var ymin;
  var ymax;
  var y;
  var xs;
  var k;
  var tmp;

  if (n < 2) return;

  if (!filled) {
    for (i = 0; i < n - 1; i++) {
      __draw_line(poly[i * 2], poly[i * 2 + 1],
                  poly[i * 2 + 2], poly[i * 2 + 3], color);
    }
    if (closed) {
      __draw_line(poly[(n - 1) * 2], poly[(n - 1) * 2 + 1],
                  poly[0], poly[1], color);
    }
    return;
  }

  ymin = ymax = poly[1];
  for (i = 1; i < n; i++) {
    y = poly[i * 2 + 1];
    if (y < ymin) ymin = y;
    if (y > ymax) ymax = y;
  }

  for (y = Math.ceil(ymin); y <= Math.floor(ymax); y++) {
    xs = [];

    for (i = 0; i < n; i++) {
      j = (i + 1) % n;
      x1 = poly[i * 2];
      y1 = poly[i * 2 + 1];
      x2 = poly[j * 2];
      y2 = poly[j * 2 + 1];

      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y))
        xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }

    xs.sort(function (a, b) { return a - b; });

    for (k = 0; k + 1 < xs.length; k += 2)
      __draw_hline(Math.ceil(xs[k]), Math.floor(xs[k + 1]), y, color);
  }
}

var g = {
  setPixel: function (x, y) {
    __set_pixel(x, y, __color);
    return g;
  },

  clear: function (reset) {
    if (reset) g.reset();
    __fill_rect(0, 0, __W, __H, __bgColor);
    return g;
  },

  clearRect: function (x1, y1, x2, y2) {
    __fill_rect(x1, y1, x2, y2, __bgColor);
    return g;
  },

  drawCircle: function (x, y, rad) { // FIXME: broken
    var points = [];
    var steps = Math.max(12, Math.ceil(2 * Math.PI * Math.abs(rad) * 2));
    var i;
    var a;

    for (i = 0; i < steps; i++) {
      a = 2 * Math.PI * i / steps;
      points.push(x + Math.cos(a) * rad);
      points.push(y + Math.sin(a) * rad);
    }

    __polygon(points, true, false, __color);
    return g;
  },

  drawEllipse: function (x1, y1, x2, y2) {
    __ellipse(x1, y1, x2, y2, false, __color);
    return g;
  },

  drawLine: function (x1, y1, x2, y2) {
    __draw_line(x1, y1, x2, y2, __color);
    return g;
  },

  drawPoly: function (poly, closed) {
    __polygon(poly, !!closed, false, __color);
    return g;
  },

  drawRect: function (x1, y1, x2, y2) {
    __draw_hline(x1, x2, y1, __color);
    __draw_hline(x1, x2, y2, __color);
    __draw_line(x1, y1, x1, y2, __color);
    __draw_line(x2, y1, x2, y2, __color);
    return g;
  },

  fillCircle: function (x, y, rad) {
    var yy;
    var half;
    rad = Math.abs(rad);

    for (yy = Math.ceil(y - rad); yy <= Math.floor(y + rad); yy++) {
      half = rad * Math.sqrt(Math.max(
        0, 1 - ((yy - y) * (yy - y)) / (rad * rad || 1)
      ));
      __draw_hline(Math.ceil(x - half), Math.floor(x + half), yy, __color);
    }
    return g;
  },

  fillEllipse: function (x1, y1, x2, y2) {
    __ellipse(x1, y1, x2, y2, true, __color);
    return g;
  },

  fillPoly: function (poly) {
    __polygon(poly, true, true, __color);
    return g;
  },

  fillRect: function (x1, y1, x2, y2) {
    __fill_rect(x1, y1, x2, y2, __color);
    return g;
  },

  flip: function (all) {
    return g;
  },

  getBgColor: function () { return __bgColor; },
  getBPP: function () { return __BPP; },
  getColor: function () { return __color; },
  getHeight: function () { return __H; },

  getPixel: function (x, y) {
    return __get_pixel(x, y);
  },

  getWidth: function () { return __W; },

  reset: function () {
    __color = 0;
    __bgColor = 1;
    return g;
  },

  setBgColor: function (r, green, b) {
    __bgColor = __make_color(r, green, b);
    return g;
  },

  setColor: function (r, green, b) {
    __color = __make_color(r, green, b);
    return g;
  },

  setPixel: function (x, y, col) {
    __set_pixel(x, y, col === undefined ? __color : col);
    return g;
  }
};

var __font3x5 = {
  "A":"2,5,7,5,5", "B":"6,5,6,5,6", "C":"3,4,4,4,3",
  "D":"6,5,5,5,6", "E":"7,4,6,4,7", "F":"7,4,6,4,4",
  "G":"3,4,5,5,3", "H":"5,5,7,5,5", "I":"7,2,2,2,7",
  "J":"1,1,1,5,2", "K":"5,5,6,5,5", "L":"4,4,4,4,7",
  "M":"5,7,7,5,5", "N":"5,7,7,7,5", "O":"2,5,5,5,2",
  "P":"6,5,6,4,4", "Q":"2,5,5,3,1", "R":"6,5,6,5,5",
  "S":"3,4,2,1,6", "T":"7,2,2,2,2", "U":"5,5,5,5,7",
  "V":"5,5,5,5,2", "W":"5,5,7,7,5", "X":"5,5,2,5,5",
  "Y":"5,5,2,2,2", "Z":"7,1,2,4,7",

  "0":"7,5,5,5,7", "1":"2,6,2,2,7", "2":"6,1,7,4,7",
  "3":"6,1,3,1,6", "4":"5,5,7,1,1", "5":"7,4,6,1,6",
  "6":"3,4,7,5,7", "7":"7,1,2,2,2", "8":"7,5,7,5,7",
  "9":"7,5,7,1,6",

  "-":"0,0,7,0,0", "_":"0,0,0,0,7", ".":"0,0,0,0,2",
  ":":"0,2,0,2,0", "!":"2,2,2,0,2", "?":"6,1,2,0,2",
  "/":"1,1,2,4,4", "+":"0,2,7,2,0", " ":"0,0,0,0,0"
};

var __fontScale = 1;
var __fontAlignX = -1;
var __fontAlignY = -1;

function __glyphWidth() {
  return 4 * __fontScale; // 3 pixels plus one-pixel spacing, scaled
}

function __draw_glyph(ch, x, y) {
  var rows = __font3x5[ch] || __font3x5[" "];
  var row;
  var col;
  var bit;
  var sx;
  var sy;

  rows = rows.split(",");

  for (row = 0; row < 5; row++) {
    for (col = 0; col < 3; col++) {
      bit = 1 << (2 - col);
      if ((parseInt(rows[row], 10) & bit) !== 0) {
        for (sy = 0; sy < __fontScale; sy++) {
          for (sx = 0; sx < __fontScale; sx++) {
            __set_pixel(
              x + col * __fontScale + sx,
              y + row * __fontScale + sy,
              __color
            );
          }
        }
      }
    }
  }
}

g.setFont = function (name, size) {
  __fontScale = Math.max(1, Math.floor(size || 1));
  return g;
};

g.setFontAlign = function (x, y) {
  __fontAlignX = x || 0;
  __fontAlignY = y || 0;
  return g;
};

g.drawString = function (text, x, y) {
  var s = String(text);
  var width = s.length ? (s.length * 4 - 1) * __fontScale : 0;
  var height = 5 * __fontScale;
  var i;
  var ch;

  if (__fontAlignX === 0) x -= width / 2;
  else if (__fontAlignX > 0) x -= width;

  if (__fontAlignY === 0) y -= height / 2;
  else if (__fontAlignY > 0) y -= height;

  x = Math.round(x);
  y = Math.round(y);

  for (i = 0; i < s.length; i++) {
    ch = s.charAt(i).toUpperCase();
    __draw_glyph(ch, x + i * 4 * __fontScale, y);
  }

  return g;
};

g.wrapString = function (text, maxWidth) {
  var words = String(text).split(/\s+/);
  var lines = [];
  var line = "";
  var word;
  var candidate;
  var maxChars = Math.floor(maxWidth / (4 * __fontScale));

  if (maxChars < 1) maxChars = 1;

  for (var i = 0; i < words.length; i++) {
    word = words[i];
    candidate = line ? line + " " + word : word;

    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
};

g.reset();

if (1) {
  var cols = 3;
  var rows = 6;
  var lastSlot = -1;

  function drawClock() {
    var now = new Date();
    var slot = now.getMinutes() % (cols*rows);
    var w = g.getWidth();
    var h = g.getHeight();
    var cellW = w / cols;
    var cellH = h / rows;
    var i;
    var col;
    var row;
    var x1;
    var y1;
    var x2;
    var y2;
    var time;

    print("Draw...");

    // Redraw only when the minute changes.
    if (slot === lastSlot) return;
    lastSlot = slot;

    g.setBgColor(0, 0, 0);
    g.clear();

    for (i = 0; i < 30; i++) {
      print("Slot", i, slot);
      
      col = i % cols;
      row = Math.floor(i / cols);

      x1 = Math.floor(col * cellW);
      y1 = Math.floor(row * cellH);
      x2 = Math.floor((col + 1) * cellW) - 1;
      y2 = Math.floor((row + 1) * cellH) - 1;

      if (i < slot) {
        print("Completed");
        g.setColor(0, 1, 0); // completed: green
        g.fillRect(x1, y1, x2, y2);
      }

      print("New ones");
      g.setColor(1, 1, 1);
      g.drawRect(x1, y1, x2, y2);

      if (i === slot) {
        print("This slot");

        time = ("0" + now.getHours()).slice(-2) + ":" +
          ("0" + now.getMinutes()).slice(-2);

        print("Time", time);
        
        g.setFont("bitmap", 3);
        g.setFontAlign(0, 0);
        g.drawString(time, (x1 + x2) / 2, (y1 + y2) / 2);
      }
      print("Paint done");
    }

    g.flip();
  }

//  drawClock();
//  setInterval(drawClock, 1000);
}


// FIXME: There really should be ^@ at end of file, but that interferes with git
