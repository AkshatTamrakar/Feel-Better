
const quotes = [
  "Where Mental Health Meets Meaningful AI",
  "You are not alone. Healing starts with connection.",
  "Express yourself — we'll always listen with care.",
  "You’ve survived 100% of your worst days. You’re stronger than you think..",
  "The world needs your light, even if it’s dim right now..",
  "It's okay to not be okay — just don't give up.",
  "Even the darkest night will end and the sun will rise",
  "Take a deep breath. Inhale peace. Exhale doubt",
 
];

let currentQuoteIndex = 0;

function changeQuote() {
  const quoteElement = document.getElementById("quote-text");
  currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
  quoteElement.textContent = quotes[currentQuoteIndex];
}

// Change quote every 10 seconds
setInterval(changeQuote, 7000);

function changeQuote() {
  const quoteElement = document.getElementById("quote-text");
  quoteElement.classList.add("fade-out");
  setTimeout(() => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      quoteElement.textContent = quotes[currentQuoteIndex];
      quoteElement.classList.remove("fade-out");
      quoteElement.classList.add("fade-in");
  }, 500);
  setTimeout(() => quoteElement.classList.remove("fade-in"), 1000);
}

function loaderAnimation() {
    var loader = document.querySelector("#loader")
    setTimeout(function () {
        loader.style.top = "-100%"
    }, 4200)
}


loaderAnimation()




Shery.imageEffect("#back" , {style: 5 ,config: {"a":{"value":0,"range":[0,30]},"b":{"value":-0.94,"range":[-1,1]},"zindex":{"value":-9996999,"range":[-9999999,9999999]},"aspect":{"value":2.0822367898480065},"ignoreShapeAspect":{"value":true},"shapePosition":{"value":{"x":0,"y":0}},"shapeScale":{"value":{"x":0.5,"y":0.5}},"shapeEdgeSoftness":{"value":0.13,"range":[0,0.5]},"shapeRadius":{"value":0,"range":[0,2]},"currentScroll":{"value":0},"scrollLerp":{"value":0.07},"gooey":{"value":true},"infiniteGooey":{"value":true},"growSize":{"value":2.6,"range":[1,15]},"durationOut":{"value":0.74,"range":[0.1,5]},"durationIn":{"value":0.89,"range":[0.1,5]},"displaceAmount":{"value":0.5},"masker":{"value":false},"maskVal":{"value":1,"range":[1,5]},"scrollType":{"value":0},"geoVertex":{"range":[1,64],"value":1},"noEffectGooey":{"value":false},"onMouse":{"value":1},"noise_speed":{"value":0.2,"range":[0,10]},"metaball":{"value":0.2,"range":[0,2],"_gsap":{"id":3}},"discard_threshold":{"value":0.48,"range":[0,1]},"antialias_threshold":{"value":0.01,"range":[0,0.1]},"noise_height":{"value":0.44,"range":[0,2]},"noise_scale":{"value":15.27,"range":[0,100]}},gooey:true})

gsap.to(".fleftelm", {
    scrollTrigger: {
      trigger: "#fimages",
      pin: true,
      start: "top top",
      end: "bottom bottom",
      endTrigger: ".last",
      scrub: 1,
    },
    y: "-300%",
    ease: Power1,
  });






  let sections = document.querySelectorAll(".fleftelm");
  Shery.imageEffect(".images", {
    style: 1,
    config: { onMouse: { value: 1 } },
    slideStyle: (setScroll) => {
      sections.forEach(function (section, index) {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          scrub: 1,
          onUpdate: function (prog) {
            setScroll(prog.progress + index);
          },
        });
      });
    },
  }); 


  // Select the body element
const body = document.body;

// Add an event listener for the scroll event
window.addEventListener('scroll', () => {
  // Get the current scroll position
  const scrollPosition = window.scrollY;

  // Change background color based on scroll position
  if (scrollPosition < 900) {
    body.style.backgroundColor = 'white'; // Light aqua
  } else if (scrollPosition < 1200) {
    body.style.backgroundColor = '#ffd3a3'; // Light coral
  } else if (scrollPosition < 1700) {
    body.style.backgroundColor = '#a3d6ff'; // Seafoam green
  }else if (scrollPosition < 2100) {
    body.style.backgroundColor = '#f0a3c0'; // Seafoam green
  }else if (scrollPosition < 2500) {
    body.style.backgroundColor = 'white'; // Seafoam green
  }


});



