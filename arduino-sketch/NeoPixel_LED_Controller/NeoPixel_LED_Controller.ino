/**
 NeoPixel LED Controller
 
 The MIT License (MIT)

 Copyright (c) 2015 Marcin Borkowski <marborkowski@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
 
/**
  Download the latest Adafruit NeoPixel Library: 
  https://github.com/adafruit/Adafruit_NeoPixel
*/  
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif

/**
  Which pin on the Arduino is connected to the NeoPixels?
  On a Trinket or Gemma we suggest changing this to 1
*/
#define PIN    6

/**
  How many NeoPixels are attached to the Arduino?
*/
#define NUMPIXELS    300

/**
  When we setup the NeoPixel library, we tell it how many pixels, and which pin to use to send signals.
  Note that for older NeoPixel strips you might need to change the third parameter--see the strandtest
  example for more information on possible values.
*/
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);

String receivedData;
void setup() {
  Serial.begin(115200); 
  
  // This initializes the NeoPixel library.
  pixels.begin(); 
  pixels.show();   
 
}
boolean clean = true;
void loop() {
  while(Serial.available()) {
    if(!clean) {
      for(int i=0;i<=NUMPIXELS;i++) {
        pixels.setPixelColor(i, 0);
      }
      clean = true;
    }
    
    receivedData = Serial.readStringUntil(',');
    
    if(receivedData != "show") {
      pixels.setPixelColor(receivedData.toInt(), pixels.Color(102, 204, 0));
    } else {
      pixels.show();
      clean = false;
    }
        
    Serial.flush();
  } 
}
 
