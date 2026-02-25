const sections = Array.from(document.querySelectorAll('.site-section'));
const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
const exploreBtn = document.querySelector('.explore-btn');

const logoEl = document.querySelector('.logo');
if (logoEl) {
  logoEl.style.cursor = 'pointer';
  // Single click — go to home (no admin shortcuts)
  logoEl.addEventListener('click', () => {
    setActiveSection('home');
  });

  // Double-click the logo to open the admin login page
  logoEl.addEventListener('dblclick', () => {
    window.location.href = 'admin-login.html';
  });
}

const setActiveSection = (targetId) => {
  sections.forEach((section) => {
    section.classList.toggle('active', section.id === targetId);
  });

  navLinks.forEach((link) => {
    link.classList.toggle(
      'active-link',
      link.dataset.target === targetId
    );
  });
};

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const targetId = link.dataset.target;
    if (targetId) {
      setActiveSection(targetId);
    }
  });
});

// Mobile menu toggle behaviour
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

function createNavBackdrop() {
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }
  return backdrop;
}

if (menuToggle && mainNav) {
  const backdrop = createNavBackdrop();

  const openMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'true');
    mainNav.classList.add('open');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden'; // prevent background scroll
    // move focus to first link for accessibility
    const firstLink = mainNav.querySelector('a');
    if (firstLink) firstLink.focus();
  };

  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('open');
    backdrop.classList.remove('visible');
    document.body.style.overflow = ''; // restore scroll
    menuToggle.focus();
  };

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) closeMenu(); else openMenu();
  });

  // Close menu when a nav link is clicked (mobile)
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768 && mainNav.classList.contains('open')) {
        closeMenu();
      }
    });
  });

  // Clicking the backdrop closes the menu
  backdrop.addEventListener('click', () => {
    if (mainNav.classList.contains('open')) closeMenu();
  });

  // Allow Escape to close the menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      closeMenu();
    }
  });

  // Close menu if viewport is resized larger than mobile
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mainNav.classList.contains('open')) {
      closeMenu();
    }
  });
}

if (exploreBtn) {
  exploreBtn.addEventListener('click', () => setActiveSection(exploreBtn.dataset.target || 'news'));
}

// subtle fade-in when the page loads
window.addEventListener('load', () => {
  setActiveSection('home');
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 200);
});

// Bus Search Functionality
const busSearch = document.getElementById('busSearch');
const busDestinationGroups = document.querySelectorAll('.bus-destination-group');
const busRows = document.querySelectorAll('.bus-destination-group tbody tr');

if (busSearch) {
  busSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      // Show all groups and rows when search is empty
      busDestinationGroups.forEach((group) => {
        group.classList.remove('hidden');
      });
      busRows.forEach((row) => {
        row.classList.remove('hidden');
      });
      return;
    }

    // Search by destination or bus name
    busDestinationGroups.forEach((group) => {
      const destination = group.dataset.destination;
      const destinationTitle = group.querySelector('.destination-title').textContent.toLowerCase();
      let hasVisibleRows = false;

      // Check if search matches destination
      const matchesDestination = destination.includes(searchTerm) || 
                                 destinationTitle.includes(searchTerm);

      // Filter rows within this group
      const rowsInGroup = group.querySelectorAll('tbody tr');
      rowsInGroup.forEach((row) => {
        const busName = row.dataset.busName.toLowerCase();
        const rowText = row.textContent.toLowerCase();
        
        const matchesBusName = busName.includes(searchTerm);
        const matchesRow = rowText.includes(searchTerm);

        if (matchesDestination || matchesBusName || matchesRow) {
          row.classList.remove('hidden');
          hasVisibleRows = true;
        } else {
          row.classList.add('hidden');
        }
      });

      // Show/hide the entire destination group
      if (hasVisibleRows || matchesDestination) {
        group.classList.remove('hidden');
      } else {
        group.classList.add('hidden');
      }
    });
  });
}

// Contact form -> open email client with prefilled details
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const fromEmail = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    const toEmail = 'maramadakki@gmail.com';
    const subject = encodeURIComponent(
      `Message from ${name || 'Maramadakki website visitor'}`
    );

    const bodyLines = [];
    if (message) bodyLines.push(message);
    if (fromEmail) {
      bodyLines.push('', `From: ${fromEmail}`);
    }

    const body = encodeURIComponent(bodyLines.join('\n'));

    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
  });
}

// Apply admin-managed content (news, gallery, video) from localStorage or remote API
async function applyAdminContentOverrides() {
  try {
    // helper that renders the news array into the page
    const renderNews = (items) => {
      const newsContainer = document.querySelector('#news .card-grid');
      if (!newsContainer) return;
      if (Array.isArray(items) && items.length > 0) {
        newsContainer.innerHTML = '';
        items.forEach((item) => {
          const article = document.createElement('article');
          article.className = 'card';

          const titleEl = document.createElement('h3');
          titleEl.textContent = item.title || '';

          const bodyEl = document.createElement('p');
          bodyEl.textContent = item.description || '';

          article.appendChild(titleEl);
          article.appendChild(bodyEl);
          newsContainer.appendChild(article);
        });
      }
    };

    // gallery renderer
    const renderGallery = (images) => {
      const galleryContainer = document.querySelector('#gallery .gallery-grid');
      if (!galleryContainer) return;
      if (Array.isArray(images) && images.length > 0) {
        galleryContainer.innerHTML = '';
        images.forEach((img) => {
          const figure = document.createElement('figure');
          const imageEl = document.createElement('img');
          imageEl.src = img.src || '';
          imageEl.alt = img.alt || '';
          figure.appendChild(imageEl);
          galleryContainer.appendChild(figure);
        });
      }
    };

    // video renderer
    const renderVideo = (url) => {
      if (!url) return;
      const videoContainer = document.querySelector('#video .video-embed');
      if (!videoContainer) return;
      if (url.startsWith('data:video')) {
        videoContainer.innerHTML = '';
        const videoEl = document.createElement('video');
        videoEl.controls = true;
        videoEl.src = url;
        videoEl.style.width = '100%';
        videoEl.style.height = '100%';
        videoContainer.appendChild(videoEl);
      } else {
        const videoIframe = videoContainer.querySelector('iframe');
        if (videoIframe) videoIframe.src = url;
      }
    };

    // try loading from remote API first
    let remoteData;
    try {
      const resp = await fetch('/api/data');
      if (resp.ok) {
        remoteData = await resp.json();
      }
    } catch (e) {
      // network failure, fall back to localStorage
    }

    if (remoteData) {
      renderNews(remoteData.newsItems || []);
      renderGallery(remoteData.galleryItems || []);
      renderVideo(remoteData.videoUrl || '');
      return;
    }

    // fallback: localStorage only
    const storedNews = localStorage.getItem('maramadakki_news_items');
    if (storedNews) {
      renderNews(JSON.parse(storedNews));
    }

    const storedGallery = localStorage.getItem('maramadakki_gallery_items');
    if (storedGallery) {
      renderGallery(JSON.parse(storedGallery));
    }

    const storedVideoUrl = localStorage.getItem('maramadakki_video_url');
    if (storedVideoUrl) {
      renderVideo(storedVideoUrl);
    }
  } catch (err) {
    console.error('Failed to apply admin content overrides:', err);
  }
}

window.addEventListener('load', applyAdminContentOverrides);
