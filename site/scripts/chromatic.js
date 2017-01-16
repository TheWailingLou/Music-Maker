var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var c = [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00, 4186.01];
var db = [17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92];
var d = [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.02, 4698.63];
var eb = [19.45, 38.89, 77.78, 155.56, 311.13, 622.24, 1244.51, 2489.02, 4978.03];
var e = [20.60, 41.20, 82.41, 164.81, 329.63, 659.25, 1318.51, 2637.02, 5274.04];
var f = [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83, 5587.65];
var gb = [23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96, 5919.91];
var g = [24.50, 49.00, 98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96, 6271.93];
var ab = [25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44, 6644.88];
var a = [27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00, 7040.00];
var bb = [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31, 7458.62];
var b = [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07, 7902.13];

var Chrm = [c, db, d, eb, e, f, gb, g, ab, a, bb, b];

var ChrmDeepCopy = function(Chrm) {
  var arrWhole = [];
  for (var i = 0; i < 12; i++) {
    var arr = [];
    for (var j=0; j < Chrm[i].length; j++) {
      arr.push(Chrm[i][j]);
    }
    arrWhole.push(arr);
  }
  return arrWhole;
}

var keyGen = function(key='c', majMin='maj') {
  var ChrmCopy = ChrmDeepCopy(Chrm);
  var k = key.toLowerCase();
  var sChrm = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
  var arr = []
  for (var i=0; i < Chrm.length; i++) {
    if (sChrm[i] === k) {
      break;
    }
  }
  var m = majMin.toLowerCase()
  var steps;
  if (m === 'maj') {
    steps = [0, 2, 2, 1, 2, 2, 2, 1];
  } else if (m === 'min') {
    steps = [0, 2, 1, 2, 2, 1, 2, 2];
  } else {
    steps = [0, 3, 2, 2, 3, 2];
  }
  var n = i;
  var n2 = 0;
  arr.push(ChrmCopy[i])
  for (var j = 0; j < steps.length - 2; j++) {
    n += steps[j];
    n2 = n + steps[j+1];
    if (ChrmCopy[n%12][0] > ChrmCopy[n2%12][0]) {
      ChrmCopy[n2%12].splice(0, 1)
      arr.push(ChrmCopy[n2%12]);
    } else {
      arr.push(ChrmCopy[n2%12]);
    }
  }
  arr.push(ChrmCopy[i].slice(1));
  return arr;
}

var chordGen = function(key) {
  var arr = []
  var k = key.length
  for (var i = 0; i < k; i++) {
    arr.push([key[i], key[(i+2)%(k-1)], key[(i+4)%(k-1)]])
  }
  return arr;
}

var beat = function(tempo=120) {
  var whole = 240/tempo;
  var half = 120/tempo;
  var quarter = 60/tempo;
  var eighth = 60/(tempo*2);
  var teenth = 60/(tempo*4);
  var thirtysecond = 60/(tempo*8);
  var arr = {
    0.03125: thirtysecond,
    0.0625: teenth,
    0.125: eighth,
    0.25: quarter,
    0.5: half,
    1: whole
  };
  return arr;
};

var ChordsMelodyAndBass = function(key, tempo=120, bar=0) {

  var barVal = beat(tempo)[1];
  var half = beat(tempo)[.5];
  var quarter = beat(tempo)[.25];
  var eighth = beat(tempo)[.125];
  var teenth = beat(tempo)[.0625];

  ////// CHORDS:

  var FinChordArr = [];
  var ChordList = chordGen(key);
  var ChordArr = [];

  var CstartTime = 0 + (barVal * bar);
  var CendTime = quarter + (barVal * bar);
  FinChordArr.push([[ChordList[0][0][3],ChordList[0][1][3],ChordList[0][2][3]],CstartTime, CendTime]);
  ChordArr.push(ChordList[0]);

  for (var i = 0; i < 3; i++) {
    var chordVal = Math.floor(Math.random()*key.length);
    CstartTime += quarter;
    CendTime += quarter;
    FinChordArr.push([[ChordList[chordVal][0][3],ChordList[chordVal][1][3],ChordList[chordVal][2][3]], CstartTime, CendTime]);
    ChordArr.push(ChordList[chordVal]);
  }

  /////// MELODY:

  var MelodyArr = [];

  var chordPlace = 0;
  var barPlace = 0;
  var arr = [4, 8, 16];

  for (var j = 0; j < 4; j++) {
    chordPlace = 0;
    while (chordPlace < .25) {
      var noteVal = Math.floor(Math.random()*3);
      var note = ChordArr[j][noteVal][4];
      var startTime = (barVal * barPlace) + (barVal * bar);
      var endBeat = 2;
      while (endBeat > (.25 - chordPlace)) {
        endBeat = 1/(arr[Math.floor(Math.random()*3)]);
      }
      var endTime = startTime + beat(tempo)[endBeat];
      MelodyArr.push([note, startTime, endTime]);
      chordPlace += endBeat;
      barPlace += endBeat;
    }
  }

  //// Bass Line :

  var BassArr = [];
  var chordPlace = 0;
  var barPlace = 0;
  var arr = [4, 8];

  for (var j = 0; j < 4; j++) {
    chordPlace = 0;
    while (chordPlace < .25) {
      var noteVal = Math.floor(Math.random()*3);
      var note = ChordArr[j][noteVal][1];
      var startTime = (barVal * barPlace) + (barVal * bar);
      var endBeat = 2;
      while (endBeat > (.25 - chordPlace)) {
        endBeat = 1/(arr[Math.floor(Math.random()*2)]);
      }
      var endTime = startTime + beat(tempo)[endBeat];
      BassArr.push([note, startTime, endTime]);
      chordPlace += endBeat;
      barPlace += endBeat;
    }
  }


  var allThree = [FinChordArr, MelodyArr, BassArr];
  console.log(allThree);
  return allThree;
}

var Tone = function(frequency, start=0, stop=1) {
  oscillator = context.createOscillator();
  oscillator.frequency.value = frequency;
  oscillator.connect(context.destination);
  currentTime = context.currentTime;
  var real = new Float32Array([0,0,0,0,1,0,0,0]);
  var imag = new Float32Array([0,1,0,0,0,1,0,0]);
  var wave = context.createPeriodicWave(real, imag);
  oscillator.setPeriodicWave(wave);
  oscillator.start(currentTime + start);
  oscillator.stop(currentTime + stop);
  oscillator.disconnect;
}

var MelodyPlayer = function(Melody, bar=0, tempo=120) {
  var add = beat(tempo)[1] * bar
  for (var j = 0; j < Melody.length; j++) {
    Tone(Melody[j][0], (Melody[j][1]+add), (Melody[j][2]+add));
  }
}

var ChordPlayer = function(Melody, bar=0, tempo=120) {
  var add = beat(tempo)[1] * bar
  for (var j = 0; j < Melody.length; j++) {
    Tone(Melody[j][0][0], (Melody[j][1]+add), (Melody[j][2]+add));
    Tone(Melody[j][0][1], (Melody[j][1]+add), (Melody[j][2]+add));
    Tone(Melody[j][0][2], (Melody[j][1]+add), (Melody[j][2]+add));
  }
}

var SingleChord = function(key, chord=0, len=1, tempo=120, bar=0) {
  var chords = chordGen(key);
  var arr = [];
  var startTime = beat(tempo)[1] * bar;
  var endTime = (beat(tempo)[1] * len) + (beat(tempo)[1] * bar);

  arr.push([[chords[chord][0][3], chords[chord][1][3], chords[chord][2][3]],
    startTime, endTime]);
  return arr;

}


//////// This is what causese everything to generate and play: ///////////////


var key = keyGen('d', 'maj');
var key2 = keyGen('b', 'min');

var tune1 = ChordsMelodyAndBass(key);
var tune2 = ChordsMelodyAndBass(key);

var brighten1 = ChordsMelodyAndBass(key2);
var brighten2 = ChordsMelodyAndBass(key2);

var bc1 = brighten1[0];
var bm1 = brighten1[1];
var bb1 = brighten1[2];

var bc2 = brighten2[0];
var bm2 = brighten2[1];
var bb2 = brighten2[2];



var chords1 = tune1[0];
var melody1 = tune1[1];
var bass1 = tune1[2];

var chords2 = tune2[0];
var melody2 = tune2[1];
var bass2 = tune2[2];


console.log(chords1);
console.log(melody1);
console.log(chords2);
console.log(melody2);


ChordPlayer(chords1);
MelodyPlayer(melody1);
MelodyPlayer(bass1);
ChordPlayer(chords2, 1);
MelodyPlayer(melody2, 1);
MelodyPlayer(bass2, 1);

ChordPlayer(chords1, 2);
MelodyPlayer(melody1, 2);
MelodyPlayer(bass1, 2);

ChordPlayer(chords2, 3);
MelodyPlayer(melody2, 3);
MelodyPlayer(bass2, 3);

ChordPlayer(chords1, 4);
MelodyPlayer(bass1, 4);
ChordPlayer(chords2, 5);
MelodyPlayer(bass2, 5);
ChordPlayer(chords1, 6);
MelodyPlayer(bass1, 6);
ChordPlayer(chords2, 7);
MelodyPlayer(bass2, 7);

ChordPlayer(chords1, 8);
MelodyPlayer(melody1, 8);
MelodyPlayer(bass1, 8);

ChordPlayer(chords2, 9);
MelodyPlayer(melody2, 9);
MelodyPlayer(bass2, 9);

ChordPlayer(chords1, 10);
MelodyPlayer(melody1, 10);
MelodyPlayer(bass1, 10);

ChordPlayer(chords2, 11);
MelodyPlayer(melody2, 11);
MelodyPlayer(bass2, 11);

MelodyPlayer(bass1, 12);
MelodyPlayer(bass2, 13);

MelodyPlayer(bass1, 14);
MelodyPlayer(bass2, 15);

MelodyPlayer(bass1, 16);
MelodyPlayer(melody1, 16);
MelodyPlayer(bass2, 17);
MelodyPlayer(melody2, 17);

MelodyPlayer(bass1, 18);
MelodyPlayer(melody1, 18);
MelodyPlayer(bass2, 19);
MelodyPlayer(melody2, 19);

ChordPlayer(bc1, 20);
MelodyPlayer(bm1, 20);
MelodyPlayer(bb1, 20);

ChordPlayer(bc2, 21);
MelodyPlayer(bm2, 21);
MelodyPlayer(bb2, 21);

ChordPlayer(bc1, 22);
MelodyPlayer(bm1, 22);
MelodyPlayer(bb1, 22);

ChordPlayer(bc2, 23);
MelodyPlayer(bm2, 23);
MelodyPlayer(bb2, 23);

ChordPlayer(chords1, 24);
ChordPlayer(chords2, 25);
ChordPlayer(SingleChord(key, 0, 1.5), 26);
