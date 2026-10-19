#include <stdint.h>
#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

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
    if (value)
      screen[i / 8] |= 0x80U >> (i % 8);
    else
      screen[i / 8] &= ~(0x80U >> (i % 8));
    return 0;
}

static char lua_code[] =
  "function add(a, b)\n"
  "  return a + b\n"
  "end\n\n"

    "local w, h = screen_width, screen_height\n"
    "local white = 255\n"
    "\n"
    "-- Clear the screen\n"
    "for y = 0, h - 1 do\n"
    "  for x = 0, w - 1 do\n"
    "    set_pixel(x, y, 0)\n"
    "  end\n"
    "end\n"
    "\n"
    "-- Draw an X from corner to corner\n"
    "local steps = math.max(w, h)\n"
    "if steps > 1 then\n"
    "  for i = 0, steps - 1 do\n"
    "    local x = math.floor(i * (w - 1) / (steps - 1))\n"
    "    local y = math.floor(i * (h - 1) / (steps - 1))\n"
    "    set_pixel(x, y, white)\n"
    "    set_pixel(x, h - 1 - y, white)\n"
    "  end\n"
    "end\n"
    "\n"
    "-- Draw an outlined circle in the center\n"
    "local cx, cy = (w - 1) / 2, (h - 1) / 2\n"
    "local radius = math.floor(math.min(w, h) / 4)\n"
    "local thickness = 1.5\n"
    "for y = 0, h - 1 do\n"
    "  for x = 0, w - 1 do\n"
    "    local dx, dy = x - cx, y - cy\n"
    "    local distance = math.sqrt(dx * dx + dy * dy)\n"
    "    if math.abs(distance - radius) <= thickness then\n"
    "      set_pixel(x, y, white)\n"
    "    end\n"
    "  end\n"
    "end\n";

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

    lua_pushinteger(L, sx);
    lua_setglobal(L, "screen_width");

    lua_pushinteger(L, sy);
    lua_setglobal(L, "screen_height");

    // define a Lua function
    if (luaL_dostring(L, lua_code) != LUA_OK) {
        fprintf(stderr, "Lua error: %s\n", lua_tostring(L, -1));
        lua_close(L);
        return -1;
    }

    // call the Lua function: add(2, 3)
    lua_getglobal(L, "add");
    lua_pushnumber(L, 2);
    lua_pushnumber(L, 3);

    if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
        fprintf(stderr, "Call error: %s\n", lua_tostring(L, -1));
        lua_close(L);
        return -1;
    }

    double result = lua_tonumber(L, -1);
    printf("result = %g\n", result);
    return 0;
}

int lua_step(void) {
  return 0;
}

void lua_done(void) {
    lua_close(L);
}
