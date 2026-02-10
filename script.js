const sections = Array.from(document.querySelectorAll('.site-section'));
const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
const exploreBtn = document.querySelector('.explore-btn');

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

// Apply admin-managed content (news, gallery, video) from localStorage
function applyAdminContentOverrides() {
  try {
    // News cards
    const newsContainer = document.querySelector('#news .card-grid');
    const storedNews = localStorage.getItem('maramadakki_news_items');
    if (newsContainer && storedNews) {
      const items = JSON.parse(storedNews);
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
    }

    // Gallery images
    const galleryContainer = document.querySelector('#gallery .gallery-grid');
    const storedGallery = localStorage.getItem('maramadakki_gallery_items');
    if (galleryContainer && storedGallery) {
      const images = JSON.parse(storedGallery);
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
    }

    // Video URL / uploaded video
    const storedVideoUrl = localStorage.getItem('maramadakki_video_url');
    if (storedVideoUrl) {
      const videoContainer = document.querySelector('#video .video-embed');
      if (videoContainer) {
        // If this is a data URL from an uploaded file, render a <video> element
        if (storedVideoUrl.startsWith('data:video')) {
          videoContainer.innerHTML = '';
          const videoEl = document.createElement('video');
          videoEl.controls = true;
          videoEl.src = storedVideoUrl;
          videoEl.style.width = '100%';
          videoEl.style.height = '100%';
          videoContainer.appendChild(videoEl);
        } else {
          // Otherwise, treat it as an iframe URL (e.g., YouTube embed)
          const videoIframe = videoContainer.querySelector('iframe');
          if (videoIframe) {
            videoIframe.src = storedVideoUrl;
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to apply admin content overrides:', err);
  }
}

window.addEventListener('load', applyAdminContentOverrides);
