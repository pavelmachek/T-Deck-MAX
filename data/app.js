/* -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil; -*- */
/*
 * Interface to C
 */

print("js: Starting init");

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

var __redraw = 0;
var __last_t = -1;
function __step(i) {
  __run_timers();
  if (__redraw > 0) {
    __redraw = 0;
    return 1;
  }
  return 0;
}

function __touch(d, x, y) {
  drag = {}
  drag.b = d;
  drag.x = x;
  drag.y = y;
  __onTouch(drag);
  return 0;
}

function __key(press, v) {
  /* FIXME */
  print('Key:', press, v);
  return 0;
}

/*
 * Timers
 */

var __timers = [];
var __nextTimerId = 1;

function __add_timer(callback, delay, repeating, args) {
    var id = __nextTimerId++;

    delay = Math.max(0, Number(delay) || 0);

    __timers.push({
        id: id,
        callback: callback,
        args: args,
        delay: delay,
        repeating: repeating,
        nextRun: Date.now() + delay,
        active: true
    });

    return id;
}

function setTimeout(callback, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    return __add_timer(callback, delay, false, args);
}

function setInterval(callback, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    return __add_timer(callback, delay, true, args);
}

function clearTimeout(id) {
    for (var i = 0; i < __timers.length; i++) {
        if (__timers[i].id === id) {
            __timers[i].active = false;
            break;
        }
    }
}

function clearInterval(id) {
    clearTimeout(id);
}

function __run_timers() {
    var now = Date.now();
    var dueTimers = [];
    var i, timer;

    // Snapshot due timers.
    for (i = 0; i < __timers.length; i++) {
        timer = __timers[i];

        if (timer.active && now >= timer.nextRun) {
            dueTimers.push(timer);
        }
    }

    // Execute callbacks.
    for (i = 0; i < dueTimers.length; i++) {
        timer = dueTimers[i];

        if (!timer.active) {
            continue;
        }

        if (timer.repeating) {
            timer.nextRun = Date.now() + timer.delay;
        } else {
            timer.active = false;
        }

        try {
            timer.callback.apply(null, timer.args);
        } catch (error) {
            if (typeof console !== "undefined") {
                console.error("Timer callback error:", error);
            }
        }
    }

    // Cleanup inactive timers.
    for (i = __timers.length - 1; i >= 0; i--) {
        if (!__timers[i].active) {
            __timers.splice(i, 1);
        }
    }
}

/*
 * Graphics tests / example; they should go to module somewhere
 */

var __ink_color = 0;

function now() { __redraw = 1; }

function sink(x, y) {
  __set_pixel(x, y, __ink_color);
}

function bink(x, y) {
  __set_pixel(x, y, __ink_color);
  __set_pixel(x + 1, y, __ink_color);
  __set_pixel(x, y + 1, __ink_color);
  __set_pixel(x + 1, y + 1, __ink_color);
}

function cls() {
  var color = __ink_color;
  for (var y = 0; y < __screen_height; y++) {
    for (var x = 0; x < __screen_width; x++) {
      __set_pixel(x, y, color);
    }
  }
  __redraw = 1;
  __ink_color = 1 - color;
  now();
}

function glyph() {
  var w = __screen_width, h = __screen_height;
  var steps = Math.max(w, h);
  if (steps > 1) {
    for (var i = 0; i < steps; i++) {
      var x = Math.floor(i * (w - 1) / (steps - 1));
      var y = Math.floor(i * (h - 1) / (steps - 1));
      sink(x, y);
      sink(x, h - 1 - y);
    }
  }

  var cx = (w - 1) / 2, cy = (h - 1) / 2;
  var radius = Math.floor(Math.min(w, h) / 4);
  var thickness = 1.5;
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var dx = x - cx, dy = y - cy;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(distance - radius) <= thickness) sink(x, y);
    }
  }
  now();
}

function grey() {
  for (var y = 0; y < __screen_height; y++) {
    for (var x = 0; x < __screen_width; x++) {
      if (((x + y) % 2) !== 0) sink(x, y);
    }
  }
  now();
}


/*
 * Graphics implementation
 *
 */

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
  size = size / 6;
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

/*
 * Ink/special support for T-Dev-Max
 */

var ink = {
    color: 0, /* ink color */
    isInk: function () { return true; },
    update: function () { },
    setColor: function () {
        g.setBgColor(1-this.color, 1-this.color, 1-this.color);
        g.setColor(this.color, this.color, this.color);
    },
    cls: function () {
        g.fillRect(0, 0, g.getWidth(), g.getHeight());
        this.color = 1-this.color;
        this.setColor();
    }
};

/*
 * Input and dummy functions
 */

var bangle_on_map = {}

function bangle_on(event, callback) {
  bangle_on_map[event] = callback;
  if (event == "lock")
    callback();
}

function bangle_setUI(map) {
  if (map.drag) {
    bangle_on_map['drag'] = map.drag;
  }
}

function __onTouch(drag) {
  var d = bangle_on_map['drag'];
  if (d) {
    d(drag);
  }
  var d = bangle_on_map['touch'];
  if (d) {
    d(drag.b, drag);
  }
}

// Some functionality is available in pavel's Espruino tree
Bangle = {};
Bangle.setGPSPower = function () { print("setGPSpower() not implemented"); };
Bangle.loadWidgets = function () { };
Bangle.drawWidgets = function () { };
Bangle.setUI =  bangle_setUI;
Bangle.project = function () { print("project unimplemented, available elsewhere") };
Bangle.isCharging = function () { return false; }
Bangle.isCompassOn = function () { return false; }
Bangle.setCompassPower = function (v) {}
Bangle.getAccel = function (v) { print("getAccel() not implemented"); }
Bangle.on = bangle_on;
Bangle.buzz = function (v) { print("Buzz requested"); }
Bangle.getGPSFix = function () { print("gps not implemented"); }
Bangle.getCompass = function () { print("compass not implemented"); }
Bangle.isLocked = function() { return false; }
Bangle.getHealthStatus = function() { return { steps : 1234 } }
Bangle.http = function () { print("http not implemented, available elsewhere"); }
Puck = {}
Puck.light = function () { print("light not implemented"); }
WIDGETS = false;
E = {};
E.getBattery = function () { return 100; }
const BTN1 = 1;

g.reset();

/*

  modem
*/

var at = {
    state: 0,
    callback: null,
    data: [],
    command: "NEVER",

    from_modem: function(flags, msg) {
        /* flags: 1 unhandled, 0 all messages */
        if (flags != 1)
            return;

      print("From modem ", flags, this.state, msg);

      // +CMTI: "SM",1
      // +CUSD: 1,"KREDIT: 50 Kc, platny do 26.11.2026
      // Volani naplno - neomezene volani v CR na 240..."
      //

      if (msg.startsWith("+CMTI")) {
        this.on_sms();
        return;
      }

      if (msg.startsWith("+CUSD")) {
        // FIXME: parse ussd
        this.on_ussd(msg.slice(10));
        return;
      }

      // FIXME: do state == 2 when expecting just an echo?
        if (this.state == 0) {
            if (msg == this.command) {
                this.state = 1;
                return;
            }
        } else {
            if (msg == "OK" || msg == "ERROR") {
                this.state = 0;
                this.callback(this.data);
                return;
            }
            this.data.push(msg);
        }
    },

  on_sms: function() {
    this.sms_notify();
  },

  on_ussd: function(msg) {
    print("Ussd:", msg);
    this.sms_notify();
  },

    cmd: function(c, cb) {
        if (this.state != 0) {
            print("AT when busy");
            return;
        }

        this.data = [];
        this.callback = cb;
        this.command = c;
        __write_at(0, c);
    },

  read_voltage: function(cb) {
    this.cmd("AT+CBC", function(data) {
        var voltage = null;

        for (var i = 0; i < data.length; i++) {
            var match = data[i].match(/\+CBC:\s*([\d.]+)V/i);
            if (match) {
                voltage = parseFloat(match[1]);
                break;
            }
        }

        cb(voltage);
    });
},

read_temperature: function(cb) {
    this.cmd("AT+CPMUTEMP", function(data) {
        var temperature = null;

        for (var i = 0; i < data.length; i++) {
            var match = data[i].match(/\+CPMUTEMP:\s*(-?\d+)/i);
            if (match) {
                temperature = parseInt(match[1], 10);
                break;
            }
        }

        cb(temperature);
    });
},

read_environment: function(cb) {
    this.read_voltage(function(voltage) {
        at.read_temperature(function(temperature) {
            cb({
                voltage: voltage,
                temperature: temperature
            });
        });
    });
},

  print_environment: function() { 
at.read_environment(function(env) {
    print("Supply voltage:", env.voltage, "V");
    print("Modem temperature:", env.temperature, " C");
});
  },

  read_sms: function(cb) {
    this.cmd('AT+CMGL="ALL"', function(data) {
        var messages = [];
        var current = null;

        for (var i = 0; i < data.length; i++) {
            var line = data[i];

            var match = line.match(
                /^\+CMGL:\s*(\d+),"([^"]+)","([^"]*)","([^"]*)","([^"]*)"$/
            );

            if (match) {
                if (current)
                    messages.push(current);

                current = {
                    index: parseInt(match[1], 10),
                    status: match[2],
                    number: match[3],
                    name: match[4],
                    date: match[5],
                    body: ""
                };
            } else if (current && line != "OK" && line != "ERROR") {
                if (current.body != "")
                    current.body += "\n";

                current.body += line;
            }
        }

        if (current)
            messages.push(current);

        cb(messages);
    });
  },

  print_sms: function() {
    at.read_sms(function(messages) {
    for (var i = 0; i < messages.length; i++) {
        var sms = messages[i];

        print("SMS index:", sms.index);
        print("Status:", sms.status);
        print("From:", sms.number);
        print("Date:", sms.date);
        print("Message:", sms.body);
    }
});
  },

  print: function(obj) {
        if (obj instanceof Array) {
            for (var i = 0; i < obj.length; i++)
                print(obj[i]);
        } else {
            print(obj);
        }
    },

  // FIXME: ussd does ok, and then reply comes
    ussd: function(code, cb) {
        this.cmd('AT+CUSD=1,"' + code + '",15', function(data) {
            var result = {
                status: null,
                message: null
            };

            for (var i = 0; i < data.length; i++) {
                var match = data[i].match(/^\+CUSD:\s*(\d+),"([\s\S]*)"(?:,\d+)?$/);

                if (match) {
                    result.status = parseInt(match[1], 10);
                    result.message = match[2];
                    break;
                }
            }

            if (cb)
                cb(result);
        });
    },

  // Does not work with longer names
  play_tone: function (name) {
    at.cmd('AT+CCMXPLAY="'+name+'",0,0', print);
  },

  sms_notify: function () {
    at.play_tone('Ding-01.wav');
  },
};

function __from_modem(flags, msg) {
  /* flags: 1 unhandled, 0 all messages */
  at.from_modem(flags, msg);
}

//at.cmd("AT+CBC", print);
//AT+CPSI -- gives useful status, but already handled by core, so not suitable

// at.ussd("*104*#", at.print);

/*
  misc hw
*/

var hw = {
    // CPU
    cpu: {
        get: function() {
            return __get_hardware(0);
        },
        set: function(mhz) {
            __set_hardware(0, mhz);
        }
    },

    // Battery register map
    battery: {
        valid:            0x100,
        charging:         0x101,
        voltage:          0x102,
        temperature:      0x103,
        current:          0x104,
        percent:          0x105,
        remaining:        0x106,
        design_capacity:  0x107,
        full_capacity:    0x108,
        health:           0x109,
        charging_finished: 0x10a,

        get: function(reg) {
            return __get_hardware(reg);
        }
    }
};

hw.battery.read_all = function() {
    var result = {};

    for (var key in hw.battery) {
        if (typeof hw.battery[key] == "number")
            result[key] = hw.battery.get(hw.battery[key]);
    }

    return result;
};

hw.battery.print_all = function() {
    var result = {};

  print("Battery:")
    for (var key in hw.battery) {
        if (typeof hw.battery[key] == "number")
          print(key, ":", hw.battery.get(hw.battery[key]));
    }

      print();

    return result;
};

//print(hw.battery.print_all()); this prints extra "object object"

/*
 * Example application: time display
 */

if (0) { /* Note: due to js being... bad languagee, you can't just reenable this using if (1) */
  var cols = 3;
  var rows = 10;
  var lastSlot = -1;

  function drawClock() {
    var now = new Date();
    var slot = now.getMinutes() % (cols*rows);
    // 29->30 transition is wrong, it goes from all white to all black
    var ink = Math.floor(now.getMinutes() / (cols*rows)) % 2;
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

    // Redraw only when the minute changes.
    if (slot === lastSlot) return;
    lastSlot = slot;

    g.setBgColor(1-ink, 1-ink, 1-ink);
    g.clear();

    for (i = 0; i < 30; i++) {
      col = i % cols;
      row = Math.floor(i / cols);

      x1 = Math.floor(col * cellW);
      y1 = Math.floor(row * cellH);
      x2 = Math.floor((col + 1) * cellW) - 1;
      y2 = Math.floor((row + 1) * cellH) - 1;

      if (i < slot) {
        g.setColor(ink, ink, ink);
        g.fillRect(x1, y1, x2, y2);
      }

      if (0) {
        g.setColor(1, 1, 1);
        g.drawRect(x1, y1, x2, y2);
      }

      if (i === slot) {
        time = ("0" + now.getHours()).slice(-2) + ":" +
          ("0" + now.getMinutes()).slice(-2);

        print("Time", time);

        g.setColor(ink, ink, ink);
        g.setFont("bitmap", 3);
        g.setFontAlign(0, 0);
        g.drawString(time, (x1 + x2) / 2, (y1 + y2) / 2);
      }
    }

    g.flip();
    __redraw = 1;
  }

//  drawClock();
//  setInterval(drawClock, 1000);
}


/*
 * Example application: drawing
 
Bangle.js2, give me simple, black & white drawing application. Should
allow brush selection and white/black color select.

*/

if (0) { /* Note: due to js being... bad languagee, you can't just reenable this using if (1) */
  var W = g.getWidth();
  var H = g.getHeight();
  var WIDGETS = 0;
  var TOOLBAR = WIDGETS+26;
  var color = 0;
  var brush = 2;
  var brushes = [1, 2, 4];
  var last = null;

  function black() {
    g.setColor(0, 0, 0);
  }

  function white() {
    g.setColor(1, 1, 1);
  }

  function toolbar() {
    white();
    g.fillRect(0, WIDGETS, W, TOOLBAR);

    black();
    g.drawLine(0, TOOLBAR, W, TOOLBAR);

    g.setFont("Vector", (TOOLBAR - WIDGETS) * 0.5);

    var y1 = WIDGETS + 4;
    var y2 = y1 + 4;
    var y3 = WIDGETS + TOOLBAR - 4;

    // Black brush
    g.fillRect(5, y1, 40, y3);
    g.setColor(1, 1, 1);
    g.drawString("B", 19, y2);

    // White brush
    g.setColor(1, 1, 1);
    g.fillRect(48, y1, 83, y3);
    black();
    g.drawRect(48, y1, 83, y3);
    g.drawString("W", 58, y2);

    // Brush size
    black();
    g.drawString("S" + brush, 91, y2);

    // Clear
    g.drawRect(137, y1, 171, y3);
    g.drawString("CLR", 140, y2);
  }

  function clearCanvas() {
    white();
    g.fillRect(0, TOOLBAR+1, W - 1, H - 1);
  }

  function drawPoint(x, y, px, py) {
    g.setColor(color, color, color);
    //g.setLineWidth(brushes[brush - 1]);

    if (px !== undefined) {
      g.drawLine(px, py, x, y);
    } else {
      g.fillCircle(x, y, brushes[brush - 1]);
    }
  }

  function redraw() {
    toolbar();
  }

  function touch(e) {
    if (e.y < WIDGETS || e.y > TOOLBAR) return;

    if (e.x < 46) {
      print("Draw");
      color = 0;
    } else if (e.x < 87) {
      print("Erase");
      color = 1;
    } else if (e.x < 134) {
      brush++;
      if (brush > 3) brush = 1;
      print("Brush", brush);
    } else {
      print("Clear");
      clearCanvas();
    }

    last = null;
    redraw();
  }

  function drag(e) {
    if (e.b) {
      if (e.y > TOOLBAR) {
        var y = e.y;
        var x = e.x;

        drawPoint(x, y,
                  last ? last.x : undefined,
                  last ? last.y : undefined);

        last = {x:x, y:y};
      } else touch(e);
    } else {
      ink.update();
      last = null;
    }
  }

  // Start application
  g.clear(1);
  clearCanvas();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  toolbar();

  Bangle.on('drag', drag);

  if (0)
  Bangle.setUI({
    mode: "custom",
    back: function() {
      load();
    },
    drag: drag
  });
}

/*
 * Real application: phone monitor
 */

// Draw an envelope at (x, y), scaled to `size`.
// Pass true for `ussd` to add a # badge.
function drawEnvelope(x, y, size, ussd) {
    var w = size;
    var h = Math.round(size * 0.68);
    var mid = Math.round(w / 2);
    var flapY = Math.round(h * 0.48);

    // Envelope outline
    g.drawRect(x, y, x + w, y + h);

    // Top flap: the two lines meet at its tip
    g.drawLine(x, y, x + mid, y + flapY);
    g.drawLine(x + w, y, x + mid, y + flapY);

    if (0) {
        // Lower folds stop short of the flap tip
        var gap = Math.max(2, Math.round(w * 0.12));
        g.drawLine(x, y + h, x + mid - gap, y + flapY + gap);
        g.drawLine(x + w, y + h, x + mid + gap, y + flapY + gap);
    }

    if (ussd) {
        // # badge at the lower-right
        var bx = x + w - Math.round(size * 0.16);
        var by = y + h - Math.round(size * 0.16);
        var r = Math.max(5, Math.round(size * 0.22));

        g.fillCircle(bx, by, r);
        g.setColor(g.theme.bg);
        g.drawLine(bx - 2, by - 3, bx - 1, by + 3);
        g.drawLine(bx + 2, by - 3, bx + 3, by + 3);
        g.drawLine(bx - 4, by - 1, bx + 4, by - 1);
        g.drawLine(bx - 4, by + 2, bx + 4, by + 2);
        g.setColor(g.theme.fg);
    }
}

function drawHandset(x, y, size) {
    var s = size / 24;
    function p(v) { return Math.round(v * s); }

    // Receiver silhouette, traced around its outside and back along its inside
    var points = [
        [5, 3], [3, 4], [2, 7], [3, 11],
        [6, 15], [10, 19], [14, 21], [18, 22],
        [21, 20], [22, 18], [19, 14], [16, 15],
        [14, 17], [11, 16], [8, 13], [7, 10],
        [9, 8], [8, 5]
    ];

    var polygon = [];
    for (var i = 0; i < points.length; i++) {
        polygon.push(x + p(points[i][0]), y + p(points[i][1]));
    }

    g.fillPoly(polygon);
}

function drawWatch(x, y, width, now, signalLevel, battery) {
    var hour = now.getHours();
    var minute = now.getMinutes();

    var height = width;
    var circleSize = width / 20;

    var left = x - width / 2;
    var right = x + width / 2;
    var top = y - height / 2;
    var bottom = y + height / 2;

    print("Drawwatch: ink");

    ink.setColor();

    // Hour
    g.setFont("Vector", height * 0.70);
    g.setFontAlign(0, 0);
    g.drawString(hour.toString(), x, y);

    // Minute indicator square
    var mx1 = left;
    var mx2 = right;
    var my1 = top;
    var my2 = bottom;

    // Draw minute progress clockwise
    // Starts at the center of the top edge
    function drawMinutes(x1, y1, x2, y2, minute) {
        var width = x2 - x1;
        var height = y2 - y1;

        var perimeter = 2 * (width + height);
        var length = (minute / 60) * perimeter;

        var cx = (x1 + x2) / 2;

        // At zero minutes: just a dot
        if (minute === 0) {
            g.fillCircle(cx, y1, circleSize);
            return;
        }

        // Clockwise path starting at top center
        var segments = [
            [cx, y1, x2, y1],
            [x2, y1, x2, y2],
            [x2, y2, x1, y2],
            [x1, y2, x1, y1],
            [x1, y1, cx, y1]
        ];

        var lengths = [
            width / 2,
            height,
            width,
            height,
            width / 2
        ];

        for (var i = 0; i < segments.length; i++) {
            var s = segments[i];
            var segmentLength = lengths[i];

            if (length <= 0)
                break;

            var len = length / segmentLength;
            var fraction = Math.min(1, len);
            var lx = s[0] + (s[2] - s[0]) * fraction;
            var ly = s[1] + (s[3] - s[1]) * fraction;

            g.drawLine(
                s[0],
                s[1],
                lx,
                ly
            );
            if (len <= 1) {
                g.fillCircle(lx, ly, circleSize);
            }

            length -= segmentLength;
        }
    }

    // Vertical indicator
    function drawIndicator(x, level) {
        var top = y - height / 2;
        var bottom = y + height / 2;

        var y = bottom - (level / 100) * (bottom - top);

        g.drawLine(x, top, x, bottom);
        g.fillCircle(x, y, circleSize);
    }

    print("Drawwatch: min");
    
    drawMinutes(mx1, my1, mx2, my2, minute);

    print("Drawwatch: ind1");

    if (0) {
    // Signal indicator
    drawIndicator(
        left - 12,
        signalLevel
    );

    // Battery indicator
    drawIndicator(
        right + 12,
        battery
    );
    }

    print("Drawwatch: all ok");
    
}

var watch = {
    // Configuration
    // In reality, +30 pixels horizontally, +15 vertically

    battery: 0,
    signal: -100,
    timer: undefined,

    block: 0,
    numx: 3,
    numy: 4,

    last_hour: -1,

    base_x: 0,
    base_y: 0,
    size: 0,

    move: function() {
        this.height = this.width;
        this.fontSize = this.height * 0.70;
        this.circleSize = this.width / 20;
    },

    jump_to: function() {
        var x = this.block % this.numx;
        var y = Math.floor(this.block / this.numx);

        var w = (g.getWidth() / this.numx);
        this.base_x = x*w;
        this.base_y = y*w;
        this.size = w;
        this.width = w - 30;
        this.x = (x+0.5)*w;
        this.y = (y+0.5)*w;
        this.move();
    },

    jump: function(sx, sy) {
        while (1) {
            if (this.block + 1 >= this.numx*this.numy) {
                this.block = 0;
                ink.cls();
                this.jump_to();
                return;
            }
            this.block += 1;

            x = this.block % this.numx;
            y = Math.floor(this.block / this.numx);
            print("Thinking about", x, y, this.block); 
            if (x + sx > this.numx)
                continue;
            if (y + sy > this.numy) {
                this.block = 999;
                continue;
            }

            this.jump_to();
            return;
        }
    },

    newSms: function() {
        this.jump(1, 1);
        drawEnvelope(this.base_x, this.base_y, this.size, false);
        this.jump(1, 1);
    },

    newCall: function() {
        this.jump(1, 1);
        drawHandset(this.base_x, this.base_y, this.size);
        this.jump(1, 1);
    },

    init: function() {
        var self = this;

        this.timer = setInterval(function() {
            self.battery = E.getBattery();
            self.signal = -50;
            self.draw();
        }, 1000);
    },

    draw: function() {
        var now = new Date();

        var hour = now.getHours();
        var minute = now.getMinutes();

        if (hour != this.last_hour) {
            this.jump(1,1);
        }
        this.last_hour = hour;

        drawWatch(this.x, this.y, this.width, now, this.signalLevel(), this.battery);
    },

    // Convert RSSI to percentage
    signalLevel: function() {
        var level = (this.signal + 100) * 100 / 60;
        return Math.max(0, Math.min(100, level));
    },

    stop: function() {
        if (this.timer)
            clearInterval(this.timer);
    }
};

g.reset();

// Start
//watch.init();

// FIXME: There really should be ^@ at end of file, but that interferes with git
 
