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
