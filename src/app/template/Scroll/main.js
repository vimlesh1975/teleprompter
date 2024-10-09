//add gspa
const scriptgsap = document.createElement('script');
scriptgsap.src = './js/gsap.min.js';
scriptgsap.setAttribute('type', 'text/javascript');

var data1 = [
  '2   दिल्ली में',
  '1   मुख्यमंत्री योगी आदित्यनाथ ने दी मुलायम सिंह को जन्मदिन की बधाई, जानिए क्या कहा',
  '3   चलने नहीं देंगे रामायण एक्सप्रेस, संतों की वेशभूषा में वेटरों पर साधुओं की चेतावनी',
  '4   मंत्रिमंडल विस्तार ',
  '5   Shaurya Chakra: शादी के 10 महीने में हुए शहीद, I LOVE YOU कहकर पत्नी ने दी थी अंतिम विदाई',
  '6   पाक को खदेड़ने ',

];

const dynamicscroll = () => {
  var originalGroup = document.getElementById('ccg_scroll');
  originalGroup
    .getElementsByTagName('text')[0]
    .getElementsByTagName('tspan')[0].textContent = data1[0];
  const newGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  newGroup.appendChild(originalGroup);
  document.getElementsByTagName('svg')[0].appendChild(newGroup);
  const dataElements = [];
  dataElements.push(originalGroup); // Make a deep copy

  for (let i = 0; i < data1.length - 1; i++) {
    const clonedGroup = originalGroup.cloneNode(true);
    clonedGroup.setAttribute('id', 'ccg_scroll' + i);
    const bbox = originalGroup.getBBox();
    const clonedX = bbox.x + bbox.width + 30;
    clonedGroup
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0]
      .setAttribute('x', clonedX);
    clonedGroup
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0].textContent = data1[i + 1];
    newGroup.appendChild(clonedGroup);
    dataElements.push(clonedGroup);

    originalGroup = document.getElementById('ccg_scroll' + i);
  }
  var targetX = -newGroup.getBBox().width - 10;

  var timeline = gsap.timeline({ repeat: -1 });

  const speed = 300;

  timeline.fromTo(
    newGroup,
    { x: 1920 },
    { x: targetX, duration: (-targetX + 1920) / speed, ease: 'linear' }
  );

  var children = newGroup.children;
  for (let i = children.length - 1; i > 0; i--) {
    newGroup.removeChild(children[i]);
  }
  var i = 1;
  timeline.eventCallback('onUpdate', function () {
    const tail =
      newGroup.transform.baseVal[0].matrix.e + newGroup.getBBox().width;
    if (tail < 1920) {
      if (i < dataElements.length) {
        newGroup.appendChild(dataElements[i]);
        if (i > 3) {
          newGroup
            .getElementsByTagName('g')
          [i - 4].getElementsByTagName('text')[0]
            .getElementsByTagName('tspan')[0].textContent = ' '; //space is necessary to maintainn the the width
        }
        i += 1;
        var nummerofLinesHavingContent = 0;
        Array.from(newGroup.children).forEach((element) => {
          if (
            element
              .getElementsByTagName('text')[0]
              .getElementsByTagName('tspan')[0].textContent !== ' '
          ) {
            nummerofLinesHavingContent += 1;
          }
        });
        console.log(
          'Nummer of Lines Having Content=',
          nummerofLinesHavingContent
        );
      } else if (tail < 0) {
        timeline.pause();
        newGroup.innerHTML = '';

        for (let i = 0; i < dataElements.length; i++) {
          dataElements[i]
            .getElementsByTagName('text')[0]
            .getElementsByTagName('tspan')[0].textContent = data1[i];
        }
        newGroup.appendChild(dataElements[0]);
        i = 1;
        setTimeout(() => {
          timeline.play();
        }, 100);
      }
    }
  });
};

const scrollbyGsapwithmanytexts = () => {
  const lefttoright = false;
  // const lefttoright=true;
  var originalGroup = document.getElementById('ccg_scroll');
  originalGroup
    .getElementsByTagName('text')[0]
    .getElementsByTagName('tspan')[0].textContent = data1[0];
  const newGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  newGroup.appendChild(originalGroup);
  document.getElementsByTagName('svg')[0].appendChild(newGroup);

  for (let i = 0; i < data1.length - 1; i++) {
    const clonedGroup = originalGroup.cloneNode(true);
    clonedGroup.setAttribute('id', 'ccg_scroll' + i);
    const bbox = originalGroup.getBBox();
    const clonedX = bbox.x + bbox.width + 30;
    clonedGroup
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0]
      .setAttribute('x', clonedX);
    clonedGroup
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0].textContent = data1[i + 1];
    newGroup.appendChild(clonedGroup);
    originalGroup = document.getElementById('ccg_scroll' + i);
  }
  var targetX = -newGroup.getBBox().width - 100;
  var timeline = gsap.timeline({ repeat: -1 });

  const speed = 300;
  if (lefttoright) {
    timeline.fromTo(
      newGroup,
      { x: targetX },
      { x: 1920, duration: (-targetX + 1920) / speed, ease: 'linear' }
    );
  } else {
    timeline.fromTo(
      newGroup,
      { x: 1920 },
      { x: targetX, duration: (-targetX + 1920) / speed, ease: 'linear' }
    );
  }
};

const scrollbyGsapwithsingletext = () => {
  const lefttoright = false;
  // const lefttoright=true;
  var originalGroup = document.getElementById('ccg_scroll');
  originalGroup
    .getElementsByTagName('text')[0]
    .getElementsByTagName('tspan')[0].textContent = data1.join('  ');
  const newGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  newGroup.appendChild(originalGroup);
  document.getElementsByTagName('svg')[0].appendChild(newGroup);

  var targetX = -newGroup.getBBox().width - 100;
  var timeline = gsap.timeline({ repeat: -1 });
  const speed = 300;
  if (lefttoright) {
    timeline.fromTo(
      newGroup,
      { x: targetX },
      { x: 1920, duration: (-targetX + 1920) / speed, ease: 'linear' }
    );
  } else {
    timeline.fromTo(
      newGroup,
      { x: 1920 },
      { x: targetX, duration: (-targetX + 1920) / speed, ease: 'linear' }
    );
  }
};

let messages = data1;
// let messages = [];
var _speed = 700;
var _gap = 100;
// var _ltr = false;
var _ltr = true;
var putImage = true;
// var putImage=false;

const nickbMethod = () => {
  _onAir = false;
  _counter = 1;
  _stopatcounter = 0;

  const _screen = 2100;
  // let messages = data1;

  function start() {
    _onAir = true;
    // updateimage("ccg_image", "Australia.png")

    next();
  }
  window.start = start;

  function stop() {
    _onAir = false;
    // console.log(_counter);
    _stopatcounter = _counter;
  }
  window.stop = stop;

  document
    .getElementById('ccg_scroll')
    .getElementsByTagName('text')[0]
    .getElementsByTagName('tspan')[0].textContent = '';
  function next() {
    // let it run to end if not on air
    if (!_onAir) return;
    _counter++;

    var originalGroup = document.getElementById('ccg_scroll');
    var originalGroup2 = document.getElementById('ccg_image');
    const ctm = originalGroup2.getCTM();

    gsap.set(originalGroup2, { x: 3000 }); // so that it is not visible on screen

    originalGroup
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0].textContent = '';
    const nextDiv = originalGroup.cloneNode(true);
    const nextDiv2 = originalGroup2.cloneNode(true);
    nextDiv2.removeAttribute('id');
    if (putImage) {
      nextDiv.appendChild(nextDiv2);
    }
    let nextMsg = messages.shift();
    messages.push(nextMsg);
    nextDiv.setAttribute('id', 'tc' + _counter);
    nextDiv
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0].textContent = nextMsg;

    nextDiv
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0]
      .setAttribute('x', 0);

    gsap.set(nextDiv2, { x: -100, y: 0, scaleX: ctm.a, scaleY: ctm.d });

    document.getElementsByTagName('svg')[0].appendChild(nextDiv);
    let msgWidth = nextDiv.getBBox().width;
    gsap.set(nextDiv, { x: _ltr ? -msgWidth : _screen });
    let timeline = gsap.timeline({ paused: true });
    timeline.to(nextDiv, {
      duration: getDuration(msgWidth),
      x: _ltr ? (_screen) : -(msgWidth),
      ease: 'none',
    });
    timeline.play();
    timeline.eventCallback('onComplete', offScreen, [nextDiv.id]);
    timeline.call(next, [], getNextMsgTime(msgWidth));
  }

  function getDuration(width) {
    let size = _screen + width;
    return size / _speed;
  }

  function getNextMsgTime(width) {
    return (width + _gap) / _speed;
  }

  function offScreen(id) {
    // console.log('Removing div ' + id);
    let ticker = document.getElementsByTagName('svg')[0];
    let tickerMsg = document.getElementById(id);
    ticker.removeChild(tickerMsg);
    if (_onAir === false && id === 'tc' + _stopatcounter)
      document
        .getElementsByTagName('svg')[0]
        .removeChild(document.getElementById('scroll_strip'));
  }

  // start();
};

scriptgsap.onload = function () {
  //   scrollbyGsapwithmanytexts();
  // scrollbyGsapwithsingletext();
  // dynamicscroll();
  nickbMethod();
};
document.body.appendChild(scriptgsap);
