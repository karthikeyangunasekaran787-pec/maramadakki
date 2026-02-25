// Simple front-end admin panel using localStorage

const ensureAdminAuthenticated = () => {
  const isAdmin =
    localStorage.getItem('maramadakki_admin_logged_in') === 'true';
  if (!isAdmin) {
    window.location.href = 'admin-login.html';
  }
};

const NEWS_KEY = 'maramadakki_news_items';
const GALLERY_KEY = 'maramadakki_gallery_items';
const VIDEO_KEY = 'maramadakki_video_url';

// utility to keep localStorage data in sync with the server API
async function syncWithServer(updateFn) {
  try {
    // fetch current remote state (if available)
    const resp = await fetch('/api/data');
    const serverData = resp.ok ? await resp.json() : {};
    // allow caller to make modifications to object
    updateFn(serverData);
    // send entire object back to server
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serverData),
    });
  } catch (e) {
    console.warn('Could not sync with server:', e);
  }
}

const loadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed || fallback;
  } catch {
    return fallback;
  }
};

const saveJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const renderNewsList = (items) => {
  const list = document.getElementById('newsList');
  if (!list) return;
  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML = '<p class="auth-note">No news items yet.</p>';
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'admin-list-item';

    const text = document.createElement('div');
    text.className = 'admin-list-text';
    const title = document.createElement('strong');
    title.textContent = item.title || '';
    const desc = document.createElement('span');
    desc.textContent = item.description || '';
    text.appendChild(title);
    text.appendChild(document.createElement('br'));
    text.appendChild(desc);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'admin-remove-btn';
    removeBtn.textContent = 'Delete';
    removeBtn.addEventListener('click', () => {
      const updated = items.filter((_, i) => i !== index);
      saveJson(NEWS_KEY, updated);
      renderNewsList(updated);
    });

    row.appendChild(text);
    row.appendChild(removeBtn);
    list.appendChild(row);
  });
};

const renderGalleryList = (items) => {
  const list = document.getElementById('galleryList');
  if (!list) return;
  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML = '<p class="auth-note">No gallery images yet.</p>';
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'admin-list-item';

    const text = document.createElement('div');
    text.className = 'admin-list-text';
    const label = document.createElement('span');
    label.textContent = item.alt || 'Image ' + (index + 1);
    text.appendChild(label);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'admin-remove-btn';
    removeBtn.textContent = 'Delete';
    removeBtn.addEventListener('click', () => {
      const updated = items.filter((_, i) => i !== index);
      saveJson(GALLERY_KEY, updated);
      renderGalleryList(updated);
    });

    row.appendChild(text);
    row.appendChild(removeBtn);
    list.appendChild(row);
  });
};

window.addEventListener('load', () => {
  ensureAdminAuthenticated();

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('maramadakki_admin_logged_in');
      window.location.href = 'admin-login.html';
    });
  }

  // Initial data: prefer server values if reachable
  let newsItems = loadJson(NEWS_KEY, []);
  let galleryItems = loadJson(GALLERY_KEY, []);

  // try to bootstrap from remote
  try {
    const resp = await fetch('/api/data');
    if (resp.ok) {
      const remote = await resp.json();
      if (Array.isArray(remote.newsItems)) newsItems = remote.newsItems;
      if (Array.isArray(remote.galleryItems)) galleryItems = remote.galleryItems;
      if (remote.videoUrl) localStorage.setItem(VIDEO_KEY, remote.videoUrl);
    }
  } catch (e) {
    // ignore network errors
  }

  renderNewsList(newsItems);
  renderGalleryList(galleryItems);

  const newsForm = document.getElementById('newsForm');
  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleEl = document.getElementById('newsTitle');
      const descEl = document.getElementById('newsDescription');
      const title = titleEl ? titleEl.value.trim() : '';
      const description = descEl ? descEl.value.trim() : '';
      if (!title || !description) return;

      newsItems = [...newsItems, { title, description }];
      saveJson(NEWS_KEY, newsItems);
      // also update remote data if possible
      syncWithServer((data) => {
        data.newsItems = newsItems;
      });
      renderNewsList(newsItems);

      if (titleEl) titleEl.value = '';
      if (descEl) descEl.value = '';
    });
  }

  const galleryForm = document.getElementById('galleryForm');
  if (galleryForm) {
    galleryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('galleryImageFile');
      const altEl = document.getElementById('galleryImageAlt');
      const alt = altEl ? altEl.value.trim() : '';
      const file = fileInput && fileInput.files ? fileInput.files[0] : null;
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const src = typeof reader.result === 'string' ? reader.result : '';
        if (!src) return;

        galleryItems = [...galleryItems, { src, alt }];
        saveJson(GALLERY_KEY, galleryItems);
        syncWithServer((data) => {
          data.galleryItems = galleryItems;
        });
        renderGalleryList(galleryItems);

        // Reset inputs
        if (fileInput) fileInput.value = '';
        if (altEl) altEl.value = '';
      };
      reader.readAsDataURL(file);
    });
  }

  const videoForm = document.getElementById('videoForm');
  if (videoForm) {
    videoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('videoFile');
      const file = fileInput && fileInput.files ? fileInput.files[0] : null;
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        if (!dataUrl) return;

        localStorage.setItem(VIDEO_KEY, dataUrl);
        // push to server as well
        syncWithServer((data) => {
          data.videoUrl = dataUrl;
        });
        if (fileInput) fileInput.value = '';
        alert('Video saved. Refresh the main site to see the change.');
      };
      reader.readAsDataURL(file);
    });
  }
});

