/* -*- mode: c; c-basic-offset: 4; indent-tabs-mode: nil; -*- */

#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include <duktape.h>
#include <Arduino.h>
#include <esp_timer.h>

#include "utilities.h"
#include "factory.h"
#include "glue.h"

#include <stdint.h>
#include <stddef.h>

#include <sys/time.h>
#include <time.h>

#include "ui_deckpro_port.h"

/*
   This version of javascript does not seem to understand:

   let
   () => { ... }

   FIXME: We need some kind of locking, so that __step is not called
   at the same time as __form_modem.
*/

extern const char app_js_start[] asm("_binary_data_app_js_start");
extern const char app_js_end[]   asm("_binary_data_app_js_end");

SemaphoreHandle_t js_lock;

size_t js_size = app_js_end - app_js_start;

static duk_context *ctx;
static uint8_t *screen;
static int sx, sy;

static char input[2048];
static size_t input_pos;

/* Screen access */

static duk_ret_t js_get_pixel(duk_context *ctx)
{
    int x = duk_require_int(ctx, 0);
    int y = duk_require_int(ctx, 1);

    if (x < 0 || x >= sx || y < 0 || y >= sy)
        return duk_error(ctx, DUK_ERR_RANGE_ERROR,
                         "pixel coordinates out of bounds");

    // FIXME
    int i = y * sx + x;
    duk_push_int(ctx, (screen[i / 8] & (0x80U >> (i % 8))) != 0);
    return 1;
}

static duk_ret_t js_set_pixel(duk_context *ctx)
{
    int x = duk_require_int(ctx, 0);
    int y = duk_require_int(ctx, 1);
    int value = duk_require_int(ctx, 2);

    if (x < 0 || x >= sx || y < 0 || y >= sy)
      return 1;
    /*
      We want to avoid drawing out of bounds, for compatibility with Bangle. 
        return duk_error(ctx, DUK_ERR_RANGE_ERROR,
                         "pixel coordinates out of bounds");
			*/
    if (value < 0 || value > 255)
        return duk_error(ctx, DUK_ERR_RANGE_ERROR,
                         "pixel value must be between 0 and 255");

    int i = y * sx + x;
    uint8_t mask = (uint8_t)(0x80U >> (i % 8));

    /* Preserve the original implementation's pixel polarity. */
    if (value == 0)
        screen[i / 8] |= mask;
    else
        screen[i / 8] &= (uint8_t)~mask;

    return 0;
}

static duk_ret_t js_get_hardware(duk_context *ctx)
{
    int reg = duk_require_int(ctx, 0);
    int val = -1;

    switch (reg) {
    case 0x0000: val = getCpuFrequencyMhz(); break;

    case 0x0100: val = peri_init_st[E_PERI_BQ27220]; break;
    case 0x0101: val = bq27220.getIsCharging(); break;
    case 0x0102: val = bq27220.getVoltage(); break;
    case 0x0103: val = bq27220.getTemperature(); break;
    case 0x0104: val = bq27220.getCurrent(); break;
    case 0x0105: val = bq27220.getStateOfCharge(); break; /* Percent remaining */
    case 0x0106: val = bq27220.getRemainingCapacity(); break;
    case 0x0107: val = bq27220.getDesignCapacity(); break;
    case 0x0108: val = bq27220.getFullChargeCapacity(); break;
    case 0x0109: val = bq27220.getStateOfHealth(); break;
    case 0x010a: val = bq27220.getCharingFinish(); break;

    case 0x0202: val = digitalRead(BOARD_BOOT_PIN); break;
      
    default:
        return duk_error(ctx, DUK_ERR_RANGE_ERROR,
			 "unknown value in get_hardware");
    }
    duk_push_int(ctx, val);
    return 1;
}

static duk_ret_t js_set_hardware(duk_context *ctx)
{
    int reg = duk_require_int(ctx, 0);
    int val = duk_require_int(ctx, 1);

    switch (reg) {
    case 0x0000: setCpuFrequencyMhz(val); return 0;
    case 0x0001: {
        struct timeval tv = {};
        
        tv.tv_sec = val;
        tv.tv_usec = 0;

        settimeofday(&tv, nullptr);
        return 0;
    }
        
    case 0x0200: analogWrite(BOARD_KEYBOARD_LED, val); return 0; /* 0..255 */
    case 0x0201: analogWrite(BOARD_EPD_BL, val); return 0; /* 0..255 */
    case 0x0300: if (val) A7682E_init(); return 0;
    }
    
    return duk_error(ctx, DUK_ERR_RANGE_ERROR,
		     "unknown value in set_hardware");
}

static duk_ret_t js_write_at(duk_context *ctx)
{
    int reg = duk_require_int(ctx, 0);
    const char *val = duk_require_string(ctx, 1);
    int ret;

    ret = phone_script_cmd(val);
    /* Use val here, before returning. */

    if (!ret) 
      return 0;  /* No JavaScript return value */
    else {
      return duk_error(ctx, DUK_ERR_RANGE_ERROR,
		       "wrongness with at command FIXME");
    }
}


static duk_ret_t js_print(duk_context *ctx)
{
    duk_idx_t count = duk_get_top(ctx);

    for (duk_idx_t i = 0; i < count; ++i) {
        if (i != 0)
            Serial.print(' ');

        Serial.print(duk_safe_to_string(ctx, i));
    }
    Serial.println();

    return 0;
}

static duk_ret_t js_cprint(duk_context *ctx)
{
    const char *text = duk_safe_to_string(ctx, 0);
    Serial.println(text);
    return 0;
}

static duk_ret_t js_enter_sleep(duk_context *ctx)
{
    int reg = duk_require_int(ctx, 0);
    int val = duk_require_int(ctx, 1);

    if (!hw_system_sleep(reg, val))
        return 0;
    
    return duk_error(ctx, DUK_ERR_RANGE_ERROR,
		     "error in enter_sleep");
}

static void js_register_globals(void)
{
    duk_push_c_function(ctx, js_print, DUK_VARARGS);
    duk_put_global_string(ctx, "print");

    duk_push_c_function(ctx, js_cprint, 1);
    duk_put_global_string(ctx, "__cprint");

    duk_push_c_function(ctx, js_get_pixel, 2);
    duk_put_global_string(ctx, "__get_pixel");

    duk_push_c_function(ctx, js_set_pixel, 3);
    duk_put_global_string(ctx, "__set_pixel");

    duk_push_c_function(ctx, js_get_hardware, 1);
    duk_put_global_string(ctx, "__get_hardware");

    duk_push_c_function(ctx, js_set_hardware, 2);
    duk_put_global_string(ctx, "__set_hardware");

    duk_push_c_function(ctx, js_write_at, 2);
    duk_put_global_string(ctx, "__write_at");

    duk_push_c_function(ctx, js_enter_sleep, 2);
    duk_put_global_string(ctx, "__enter_sleep");
    
    duk_push_int(ctx, sx);
    duk_put_global_string(ctx, "__screen_width");

    duk_push_int(ctx, sy);
    duk_put_global_string(ctx, "__screen_height");
}

static int __js_eval(const char *code)
{
    if (duk_peval_string(ctx, code) != 0) {
        Serial.print("JavaScript error: ");
        Serial.println(duk_safe_to_string(ctx, -1));
        duk_pop(ctx);
        return -1;
    }

    duk_pop(ctx);
    return 0;
}

int js_init(uint8_t *_screen, int _sx, int _sy)
{
    if (!_screen || _sx <= 0 || _sy <= 0)
        return -1;

    js_lock = xSemaphoreCreateMutex();
    if (xSemaphoreTake(js_lock, pdMS_TO_TICKS(5000)) != pdTRUE) {
        printf("Could not get javascript lock.\n");
        return -1;
    }
    
    screen = _screen;
    sx = _sx;
    sy = _sy;

    ctx = duk_create_heap_default();
    if (!ctx)
        return -1;

    js_register_globals();

    if (__js_eval(app_js_start) != 0)
        return -1;

    __js_eval("print('js: Scripting initialized.');");
    xSemaphoreGive(js_lock);
    return 0;
}

/* This does a call with array of integers */
static int js_call(const char *name, int nargs, int *args, int *result)
{
    if (!ctx)
        return -1;

    if (xSemaphoreTake(js_lock, pdMS_TO_TICKS(5000)) != pdTRUE) {
        printf("Could not get javascript lock.\n");
        return -1;
    }

    duk_get_global_string(ctx, name);
    if (!duk_is_function(ctx, -1)) {
        duk_pop(ctx);
        Serial.print("JavaScript function not found: ");
        Serial.println(name);
        xSemaphoreGive(js_lock);
        return -1;
    }

    for (int i = 0; i < nargs; ++i)
        duk_push_int(ctx, args[i]);

    if (duk_pcall(ctx, nargs) != 0) {
        Serial.print("JavaScript error: ");
        Serial.println(duk_safe_to_string(ctx, -1));
        duk_pop(ctx);
        xSemaphoreGive(js_lock);
        return -1;
    }

    *result = duk_to_int(ctx, -1);
    duk_pop(ctx);
    xSemaphoreGive(js_lock);
    return 0;
}

static int js_call_string(const char *name, int val, const char *arg, int *result)
{
    if (!ctx)
        return -1;
    if (xSemaphoreTake(js_lock, pdMS_TO_TICKS(5000)) != pdTRUE) {
        printf("Could not get javascript lock.\n");
        return -1;
    }

    duk_get_global_string(ctx, name);
    if (!duk_is_function(ctx, -1)) {
        duk_pop(ctx);
        Serial.print("JavaScript function not found: ");
        Serial.println(name);
    xSemaphoreGive(js_lock);
        return -1;
    }

    duk_push_int(ctx, val);
    duk_push_string(ctx, arg);

    if (duk_pcall(ctx, 2) != 0) {
        Serial.print("JavaScript error: ");
        Serial.println(duk_safe_to_string(ctx, -1));
        duk_pop(ctx);
    xSemaphoreGive(js_lock);
        return -1;
    }

    *result = duk_to_int(ctx, -1);
    duk_pop(ctx);
    xSemaphoreGive(js_lock);
    return 0;
}

void js_too_long(uint64_t start_us, char *msg)
{
    uint64_t stop_us = esp_timer_get_time();
    if (stop_us - start_us > 5000)
        printf("js: too long: %s, %ld usec\n", msg, (long) stop_us - start_us);
}

int js_from_modem(int flags, const char *msg)
{
    int result;
    uint64_t start_us = esp_timer_get_time();
    js_call_string("__from_modem", flags, msg, &result);
    js_too_long(start_us, "js_from_modem");
    return result;
}

static int js_exec_input(void)
{
    if (xSemaphoreTake(js_lock, pdMS_TO_TICKS(5000)) != pdTRUE) {
        printf("Could not get javascript lock.\n");
        return -1;
    }

    input[input_pos] = '\0';
    printf("\n# exec, %u chars\n", (unsigned)input_pos);

    int rc = __js_eval(input);
    if (rc == 0)
        printf("# done\n");
    xSemaphoreGive(js_lock);

    return rc;
}

/* Returns 1 if the screen should be redrawn. */
int js_step(void)
{
    if (!ctx)
        return -1;

    /* FIXME: this is not compatible with AT passthrough mode */
    while (Serial.available()) {
        int c = Serial.read();

        if (c == 2) { /* Ctrl-B executes the accumulated input. */
            uint64_t start_us = esp_timer_get_time();
            if (input_pos < sizeof(input))
                js_exec_input();
            else
                Serial.println("Input buffer full");
            js_too_long(start_us, "js_step: user input");

            input_pos = 0;
            continue;
        }

        Serial.write((char)c);

        if (input_pos < sizeof(input) - 1) {
            input[input_pos++] = (char)c;
        } else {
            Serial.println("\nInput buffer full; input discarded");
            input_pos = 0;
        }
    }

    int args[] = { 666 };
    int result = 0;
    uint64_t start_us = esp_timer_get_time();
    if (js_call("__step", 1, args, &result) != 0)
        return -1;
    js_too_long(start_us, "js_step: __step");

    return result;
}

int js_touch(int down, int x, int y)
{
    int args[] = { down, x, y };
    int result = 0;

    if (js_call("__touch", 3, args, &result) != 0)
        return -1;

    return result;
}

int js_key(int press, int v)
{
    int args[] = { press, v };
    int result = 0;

    if (js_call("__key", 2, args, &result) != 0)
        return -1;

    return result;
}

void js_done(void)
{
    if (ctx) {
        duk_destroy_heap(ctx);
        ctx = NULL;
    }

    screen = NULL;
    sx = sy = 0;
    input_pos = 0;
}
