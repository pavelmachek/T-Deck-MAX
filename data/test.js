__draw_hline(0, 100, 120, 0);

__set_pixel(10, 10, 0);

for (var x = 10; x <= 20; x++) print(x);

g.setColor(0,0,0);
print(__make_color(0,0,0));
print(__make_color(1,1,1));

g.reset();
g.setPixel(10, 10);
g.drawLine(0,0, __W-1, __H-1);
g.drawCircle(120, 120, 60); now();
g.fillRect(120, 120, 160, 160); now();
g.clear(); now();
g.drawEllipse(100, 100, 199, 160); now();
g.fillCircle(120, 120, 60); now();
r = [ 120, 0, 200, 120, 10, 70, 20, 30 ]; g.fillPoly(r, 1); now();

g.setFont("", 5); g.drawString("hello world", 10, 10); now();

g.setFont("", 3); g.drawString("hello world", 10, 70); now();

now(); print(new Date()); drawClock();

print("cpu mhz:", __get_hardware(0));
__set_hardware(0, 40);
__set_hardware(0, 10);
# __set_hardware(0, 1); breaks system

print("bat is valid", __get_hardware(0x100));
print("bat is charging", __get_hardware(0x101));
print("bat voltage", __get_hardware(0x102));
print("bat temperature", __get_hardware(0x103));
print("bat current", __get_hardware(0x104));
print("bat percent", __get_hardware(0x105));
print("remaining capacity", __get_hardware(0x106));
print("design capacity", __get_hardware(0x107));
print("full capacity", __get_hardware(0x108));
print("state of health", __get_hardware(0x109));
print("charging finished", __get_hardware(0x10a));

print("boot pin", __get_hardware(0x202));

__set_hardware(0x200, 0);
__set_hardware(0x201, 0);
__set_hardware(0x200, 48);
__set_hardware(0x201, 48);

__set_hardware(0x300, 1);
__write_at(0, "ATI");

at.cmd('AT+CCMXPLAY="c:/Low-soft-ding-02.wav",0,0', print);
at.cmd('AT+CCMXPLAY="Ding-01.wav",0,0', print);

print("ABC".startsWith("AB"))


drawEnvelope(0, 0, 100, false); now();
drawHandset(100, 0, 100); now();
drawWatch(100, 200, 100, new Date(), 30, 30); now();

watch.draw(); now();
watch.newSms(); now();
watch.newCall(); now();

function sayDate() { print("Date: ", new Date()); }
setTimeout(sayDate, 10000);

print(__timers);

__run_timers(); now();

at.ussd("*104*#", at.print);
at.cmd("AT+CPSI?", at.print);

at.cmd("AT+CPSI?", at.periodic_2);
at.print(at.last_status.mode);
at.print(at.last_status.operation);
at.print(at.last_status.available);

/*
  PC:  0x42007c45  PS      : 0x00060e30  A0      : 0x82007fa2  A1      : 0x3fced 
A2      : 0x3fcedb14  A3      : 0x3fcbe510  A4      : 0x00000001  A5      : 0x00000 
A6      : 0x3fcb6c24  A7      : 0x3fcb120c  A8      : 0x82007c45  A9      : 0x3fced 
A10     : 0x00000000  A11     : 0x3fcedb38  A12     : 0x00000000  A13     : 0x00000 
A14     : 0x3fc9fd68  A15     : 0x3fc9fd70  SAR     : 0x0000000a  EXCCAUSE: 0x00000 
EXCVADDR: 0x00000000  LBEG    : 0x400554b9  LEND    : 0x400554dd  LCOUNT  : 0x82006 


Backtrace: 0x42007c42:0x3fceda90 0x42007f9f:0x3fcedb10 0x42044a5c:0x3fcedc40

AT+CUSD=1,"*104*#",15

*/

print(Date.now() / 1000);

AT+CSCLK=2

at.cmd("AT+CNMP?", print);
# GSM only
at.cmd("AT+CNMP=13", print);
# LTE only
at.cmd("AT+CNMP=38", print);

at.cmd("ATI", print);
at.cmd("AT+CLAC", print);
at.cmd("AT+CLAC=?", print);

at.periodic_1()

__write_at(0, "ATI");

at_periodic();
at.sms_notify();

__enter_sleep(1000, 3);

// Example
const timestamp = qltsToUnixTimestamp(
    "26/10/26,21:07:57+04,0"
);

print(at.parse_time("+QLTS: 26/10/26,21:07:57+04,0"));
at.cmd("AT+QLTS", print);

print(new Date());
__set_timezone(1, "GMT-1");

__enter_sleep(60000, 0x10);


t.sleep(0x10); now(); // ok, basics work; -34 mA
t.sleep(0x30); // ok
t.sleep(0x70); // 0x40 -- kills input, probably whole system
t.sleep(0xb0);
t.sleep(0xfb0); now(); // ok .. possibly kills display
t.sleep(0x1fb0); now(); // i2c has problem, system works
t.sleep(0x3fb0); now(); // wire has problems, i2c stops responding, but system works
t.sleep(0xffb0); now(); // locks system; wire has problems

__enter_sleep(50000000, 0x3fb0); // cca 2.3mA, good.

__enter_sleep(50000000,  0x5b0); // cca 14mA

print("bat percent", __get_hardware(0x105));
print("remaining capacity", __get_hardware(0x106));
__enter_sleep(50000000,  0xdb0); // ~ 20mA?

__enter_sleep(50000000, 0x3fb8); // ??

__set_hardware(0x301, 1);

t.sleep(0xffb8); now(); // on resume, touchscreen has problem
t.sleep(0xffba); now();

# After boot:

========== GPIO DUMP ==========
GPIO00 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO01 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO02 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO03 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO04 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO05 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO06 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO07 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO08 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO09 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO10 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO11 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO12 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO13 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO14 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO15 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO16 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO17 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO18 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO19 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO20 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO21 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO26 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO27 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO28 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO29 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO30 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO31 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO32 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO33 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO34 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO35 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO36 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO37 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO38 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO39 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
===============================

# Before sleep:

GPIO00 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO01 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO02 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO03 | DIR=OUT | IN=1 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO04 | DIR=OUT | IN=1 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO05 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=1 | OD=0
GPIO06 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO07 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO08 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO09 | DIR=OUT | IN=1 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO10 | DIR=OUT | IN=1 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO11 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO12 | DIR=IN  | IN=1 | OUT=0 | PU=1 | PD=0 | OD=0
GPIO13 | DIR=OUT | IN=1 |
GPIO14 | DIR=OUT | IN=1 | OUT=1 | PU=0 | PD=0 | OD=1
GPIO15 | DI
GPIO16 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO17 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO18 | DIR=OUT | IN=
GPIO19 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO20 | DI
GPIO21 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO26 | DI
GPIO27 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO28 | DI
GPIO29 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO30 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO31 | DIR=IN  | IN=
GPIO32 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO33 | DI
GPIO36 | DIR=OUT | IN=1 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO37 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO38 | DIR=IN  | IN=
GPIO39 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0

# After sleep:

GPIO00 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO01 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO02 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO03 | DIR=IN  | IN=0 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO04 | DIR=IN  | IN=0 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO05 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO06 | DIR=IN  | IN=0 
GPIO05 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO06 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO07 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO08 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO09 | DIR=IN  | IN=1 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO10 | DIR=IN  | IN=0 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO11 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO12 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO13 | DIR=IN  | IN=1 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO14 | DIR=IN  | IN=1 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO15
GPIO18 | DIR=OUT | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
PIO19 | DI
GPIO20 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO21 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO26 | DIR=IN  | IN=
GPIO27 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO28 | DI
GPIO29 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO30 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO31 | DIR=IN  | IN=
GPIO32 | DIR=IN  | IN=1 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO33 | DI
GPIO34 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO35 | DI
GPIO36 | DIR=IN  | IN=0 | OUT=1 | PU=0 | PD=0 | OD=0
GPIO37 | DI
GPIO38 | DIR=IN  | IN=0 | OUT=0 | PU=0 | PD=0 | OD=0
GPIO39 | DI===========
====================
