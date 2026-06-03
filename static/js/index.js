window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}

function initExperimentCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(function(carousel) {
    const panels = Array.from(carousel.querySelectorAll('.experiment-video-panel'));
    const items = panels.length ? panels : Array.from(carousel.querySelectorAll('.experiment-video'));
    const prevButton = carousel.querySelector('.experiment-carousel-prev');
    const nextButton = carousel.querySelector('.experiment-carousel-next');
    const dotsContainer = carousel.querySelector('.experiment-carousel-dots');
    const playbackRate = parseFloat(carousel.dataset.playbackRate || '1');
    let activeIndex = 0;

    function applyPlaybackRate(video) {
      if (!video || playbackRate === 1) return;
      video.playbackRate = playbackRate;
    }

    carousel.querySelectorAll('video').forEach(function(video) {
      applyPlaybackRate(video);
      video.addEventListener('loadedmetadata', function() { applyPlaybackRate(video); });
      video.addEventListener('play', function() { applyPlaybackRate(video); });
    });

    function show(index) {
      activeIndex = (index + items.length) % items.length;
      items.forEach(function(item, i) {
        const isActive = i === activeIndex;
        item.classList.toggle('is-active', isActive);
        const video = item.matches('.experiment-video') ? item : item.querySelector('.experiment-video');
        if (!video) return;
        if (isActive) {
          video.currentTime = 0;
          applyPlaybackRate(video);
          video.classList.add('is-active');
          video.play().catch(function() {});
        } else {
          video.classList.remove('is-active');
          video.pause();
        }
      });
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.experiment-carousel-dot').forEach(function(dot, i) {
          dot.classList.toggle('is-active', i === activeIndex);
        });
      }
    }

    if (dotsContainer) {
      dotsContainer.innerHTML = items.map(function(_, i) {
        return '<button class="experiment-carousel-dot' + (i === 0 ? ' is-active' : '') + '" type="button" aria-label="Show video ' + (i + 1) + '"></button>';
      }).join('');
      dotsContainer.querySelectorAll('.experiment-carousel-dot').forEach(function(dot, i) {
        dot.addEventListener('click', function() { show(i); });
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function() { show(activeIndex - 1); });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function() { show(activeIndex + 1); });
    }

    show(0);
  });
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    $('a[href="#activemimic-video-player"]').on('click', function(event) {
      var target = document.getElementById('activemimic-video-player');
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    initExperimentCarousels();
    bulmaSlider.attach();

})
