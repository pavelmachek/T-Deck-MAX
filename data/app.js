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
  return 
         (green >= 0.5 ? 1 : 0);
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

  // untested
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

  // untested
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

g.reset();

// FIXME: There really should be ^@ at end of file, but that interferes with git
