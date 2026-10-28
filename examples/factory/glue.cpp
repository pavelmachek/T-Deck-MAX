#include <stdint.h>
#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include "utilities.h"
//#include "peripheral.h"

#include "glue.h"

static lua_State *L;
static uint8_t *screen;
static int sx, sy;

static int l_get_pixel(lua_State *L) {
    int x = (int)luaL_checkinteger(L, 1);
    int y = (int)luaL_checkinteger(L, 2);

    // FIXME
    if (x < 0 || x >= sx || y < 0 || y >= sy)
        return luaL_error(L, "pixel coordinates out of bounds");

    // fixme
    lua_pushinteger(L, screen[y * sx + x]);
    return 1;
}

static int l_set_pixel(lua_State *L) {
    int x = (int)luaL_checkinteger(L, 1);
    int y = (int)luaL_checkinteger(L, 2);
    int value = (int)luaL_checkinteger(L, 3);

    if (x < 0 || x >= sx || y < 0 || y >= sy)
        return luaL_error(L, "pixel coordinates out of bounds");
    if (value < 0 || value > 255)
        return luaL_error(L, "pixel value must be between 0 and 255");

    int i = y * sx + x;
    if (!value)
      screen[i / 8] |= 0x80U >> (i % 8);
    else
      screen[i / 8] &= ~(0x80U >> (i % 8));
    return 0;
}

static int l_cprint(lua_State *L) {
    const char *text = luaL_checkstring(L, 1);
    if (text)
      printf("%s\n", text);
    else
      printf("cprint: no argument?\n");
    return 0;  // no Lua return values
}

// Also available:
// print() -- works even outside cprint
// print(os.time())
// print(os.date("%Y-%m-%d %H:%M:%S"))
// print(math.random())

static char lua_code[] =
  "function add(a, b)\n"
  "  return a + b\n"
  "end\n\n"

    "local ink_color = 0\n"
    "\n"
    "function ink(x, y)\n"
    "  set_pixel(x, y, ink_color)\n"
    "end\n"
    "\n"
    "function bink(x, y)\n"
    "  set_pixel(x, y, ink_color)\n"
    "  set_pixel(x+1, y, ink_color)\n"
    "  set_pixel(x, y+1, ink_color)\n"
    "  set_pixel(x+1, y+1, ink_color)\n"
    "end\n"
    "\n"
    "function cls()\n"
    "  local color = ink_color\n"
    "  local w, h = screen_width, screen_height\n"
    "  for y = 0, h - 1 do\n"
    "      for x = 0, w - 1 do\n"
    "        set_pixel(x, y, color)\n"
    "      end\n"
    "  end\n"
    "  redraw = 1\n"
    "  ink_color = 1 - color\n"
    "  now()\n"
    "end\n"
    "\n"
  "redraw = 0\n"
  "function step(i)\n"
  "  if redraw > 0 then\n"
  "    redraw = 0\n"
  "    return 1\n"
  "  end\n"
  "  return 0\n"
  "end\n\n"
    "function now()\n"
    "  redraw = 1\n"
    "end\n"
    "\n"
    "function glyph()\n"
    " local w, h = screen_width, screen_height\n"
    " -- Draw an X from corner to corner\n"
    " local steps = math.max(w, h)\n"
    " if steps > 1 then\n"
    "  for i = 0, steps - 1 do\n"
    "    local x = math.floor(i * (w - 1) / (steps - 1))\n"
    "    local y = math.floor(i * (h - 1) / (steps - 1))\n"
    "    ink(x, y)\n"
    "    ink(x, h - 1 - y)\n"
    "  end\n"
    " end\n"
    "\n"
    " -- Draw an outlined circle in the center\n"
    " local cx, cy = (w - 1) / 2, (h - 1) / 2\n"
    " local radius = math.floor(math.min(w, h) / 4)\n"
    " local thickness = 1.5\n"
    " for y = 0, h - 1 do\n"
    "  for x = 0, w - 1 do\n"
    "    local dx, dy = x - cx, y - cy\n"
    "    local distance = math.sqrt(dx * dx + dy * dy)\n"
    "    if math.abs(distance - radius) <= thickness then\n"
    "      ink(x, y)\n"
    "    end\n"
    "  end\n"
    " end\n"
    " now()\n"
    "end\n"
    "\n"
    "function grey()\n"
    "  local w, h = screen_width, screen_height\n"
    "  for y = 0, h - 1 do\n"
    "      for x = 0, w - 1 do\n"
    "        if ((x + y) % 2) ~= 0 then\n"
    " 	  ink(x, y)\n"
    "	 end\n"
    "      end\n"
    "  end\n"
    "  now()\n"
    "end\n"
    "\n"
    "function touch(d, x, y)\n"
    "  print(\"Touch:\", d, x, y)\n"
    "  bink(x, y)\n"
    "  return 0\n"
    "end\n"
    "\n"
    "function key(press, v)\n"
    "  print(\"Key:\", press, v)\n"
    "  return 0\n"
    "end\n"
    "\n"
  "\n";

int lua_init(uint8_t *_screen, int _sx, int _sy) {
    L = luaL_newstate();
    luaL_openlibs(L);

    screen = _screen;
    sx = _sx;
    sy = _sy;

    lua_pushcfunction(L, l_get_pixel);
    lua_setglobal(L, "get_pixel");

    lua_pushcfunction(L, l_set_pixel);
    lua_setglobal(L, "set_pixel");
    
    lua_pushcfunction(L, l_cprint);
    lua_setglobal(L, "cprint");

    lua_pushinteger(L, sx);
    lua_setglobal(L, "screen_width");

    lua_pushinteger(L, sy);
    lua_setglobal(L, "screen_height");

    // define a Lua function
    if (luaL_dostring(L, lua_code) != LUA_OK) {
        fprintf(stderr, "Lua error: %s\n", lua_tostring(L, -1));
        return -1;
    }

    // call the Lua function: add(2, 3)
    lua_getglobal(L, "add");
    lua_pushnumber(L, 2);
    lua_pushnumber(L, 3);

    if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
        fprintf(stderr, "Call error: %s\n", lua_tostring(L, -1));
        return -1;
    }

    double result = lua_tonumber(L, -1);
    printf("result = %g\n", result);
    return 0;
}

static char input[2048];
static int input_pos;

int lua_exec_input(void) {
    printf("\n# exec, %d chars\n", input_pos);
    if (luaL_dostring(L, input) != LUA_OK) {
        fprintf(stderr, "Lua error: %s\n", lua_tostring(L, -1));
	return -1;
    }
    printf("# done\n");
    return 0;
}

// returns 1 if screen should be redrawn
int lua_step(void) {
    if (!L)
      return -1;
  
    // fixme: lua_step is not called often enough, so this drops characters
    while (Serial.available()) {
        int c = Serial.read();
	if (c == 2) { // ctrl-b
	  input[input_pos++] = 0;
	  lua_exec_input();
	  input_pos = 0;
	  continue;
	}

	printf("%c", c);
	Serial.write(c);
	input[input_pos++] = c;
    }

    lua_getglobal(L, "step");
    lua_pushnumber(L, 666);

    if (lua_pcall(L, 1, 1, 0) != LUA_OK) {
        fprintf(stderr, "Call error: %s\n", lua_tostring(L, -1));
        return -1;
    }

    double result = lua_tonumber(L, -1);
    return result;
}

extern int lua_touch(int down, int x, int y) {
    if (!L)
      return -1;
  
    lua_getglobal(L, "touch");
    lua_pushnumber(L, down);
    lua_pushnumber(L, x);
    lua_pushnumber(L, y);

    if (lua_pcall(L, 3, 1, 0) != LUA_OK) {
        fprintf(stderr, "Call error: %s\n", lua_tostring(L, -1));
        return -1;
    }

    double result = lua_tonumber(L, -1);
    return result;
}  

extern int lua_key(int press, int v) {
    if (!L)
      return -1;

    lua_getglobal(L, "key");
    lua_pushnumber(L, press);
    lua_pushnumber(L, v);

    if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
        fprintf(stderr, "Call error: %s\n", lua_tostring(L, -1));
        return -1;
    }

    double result = lua_tonumber(L, -1);
    return result;
}  

void lua_done(void) {
    lua_close(L);
}

