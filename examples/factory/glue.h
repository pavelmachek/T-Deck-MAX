extern int js_init(uint8_t *screen, int sx, int sy);
extern int js_step(void);
extern int js_touch(int down, int x, int y);
extern int js_key(int press, int c);
extern int js_from_modem(int flags, const char *msg);
extern void js_too_long(uint64_t start_us, char *msg);

extern void gpio_dump(void);

