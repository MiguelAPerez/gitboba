(function() {
  var ICONS = {
    repo:         '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
    pr:           '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/>',
    issue:        '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="17"/>',
    notification: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    actions:      '<polygon points="5 3 19 12 5 21 5 3"/>',
    org:          '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user:         '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    search:       '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    release:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    star:         '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    webhook:      '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    admin:        '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
  };

  var STATUS_LABELS = {
    supported: 'Supported',
    partial: 'Partial',
    planned: 'Planned'
  };

  var CHANGELOG_SECTIONS = [
    { key: 'nowSupported', title: 'Now supported' },
    { key: 'addedSupported', title: 'New on this page' },
    { key: 'addedPlanned', title: 'New on this page (planned)' },
    { key: 'groupStatus', title: 'Group status', kind: 'groupStatus' },
    { key: 'removed', title: 'Removed' },
    { key: 'regressions', title: 'Regressions' }
  ];

  function icon(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.issue) + '</svg>';
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(isoDate) {
    var d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function statusPill(status) {
    var key = STATUS_LABELS[status] ? status : 'planned';
    return '<span class="status-pill status-pill--' + key + '">' + STATUS_LABELS[key] + '</span>';
  }

  function renderRow(group) {
    var chips = group.ops.map(function(op) {
      var cls = op.status === 'yes' ? 'chip--yes' : 'chip--planned';
      return '<span class="chip ' + cls + '">' + escapeHtml(op.label) + '</span>';
    }).join('');

    return [
      '<div class="category-row">',
        '<div class="category-left">',
          '<div class="category-icon">' + icon(group.icon) + '</div>',
          '<div>',
            '<div class="category-name">' + escapeHtml(group.name) + '</div>',
            '<div class="category-desc">' + escapeHtml(group.desc) + '</div>',
          '</div>',
        '</div>',
        '<div class="category-chips">' + chips + '</div>',
        '<div class="category-status">' + statusPill(group.status) + '</div>',
      '</div>'
    ].join('');
  }

  function renderOpItem(entry, chipClass) {
    var note = entry.note ? ' <span class="chip ' + chipClass + '">' + escapeHtml(entry.note) + '</span>' : '';
    return '<li><strong>' + escapeHtml(entry.group) + '</strong> / ' + escapeHtml(entry.op) + note + '</li>';
  }

  function renderChangelogEntry(entry) {
    var sections = entry.sections || {};
    var html = [
      '<article class="compat-changelog-entry">',
        '<div class="compat-changelog-entry-head">',
          '<div class="compat-changelog-date">' + escapeHtml(formatDate(entry.date)) + '</div>'
    ];

    if (entry.appVersion) {
      html.push('<span class="compat-changelog-version">GitBoba ' + escapeHtml(entry.appVersion) + '</span>');
    }

    html.push(
      '</div>',
      '<p class="compat-changelog-summary">' + escapeHtml(entry.summary) + '</p>'
    );

    CHANGELOG_SECTIONS.forEach(function(section) {
      var items = sections[section.key] || [];
      if (!items.length) return;

      html.push('<div class="compat-changelog-section">');
      html.push('<div class="compat-changelog-section-title">' + escapeHtml(section.title) + '</div>');
      html.push('<ul class="compat-changelog-list">');

      if (section.kind === 'groupStatus') {
        items.forEach(function(item) {
          html.push(
            '<li><strong>' + escapeHtml(item.group) + ':</strong> ' +
            escapeHtml(item.before) + ' → ' + escapeHtml(item.after) + '</li>'
          );
        });
      } else {
        var chipClass = section.key === 'regressions'
          ? 'chip--planned'
          : (section.key === 'addedPlanned' ? 'chip--planned' : 'chip--yes');
        items.forEach(function(item) {
          html.push(renderOpItem(item, chipClass));
        });
      }

      html.push('</ul></div>');
    });

    html.push('</article>');
    return html.join('');
  }

  function initChangelogModal(opts) {
    var prefix = opts && opts.prefix ? opts.prefix : '';
    var openBtn = document.getElementById(prefix + 'changelog-open');
    var closeBtn = document.getElementById(prefix + 'changelog-close');
    var backdrop = document.getElementById(prefix + 'changelog-backdrop');
    var body = document.getElementById(prefix + 'changelog-body');
    var loaded = false;
    var lastFocus = null;

    function openModal() {
      if (!backdrop || !body) return;
      lastFocus = document.activeElement;
      backdrop.hidden = false;
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      if (!backdrop) return;
      backdrop.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function renderChangelog(data) {
      if (!body) return;
      var entries = (data && data.entries) || [];
      if (!entries.length) {
        body.innerHTML = '<p class="compat-changelog-empty">No changelog entries yet.</p>';
        return;
      }
      body.innerHTML = entries.map(renderChangelogEntry).join('');
    }

    function loadChangelog() {
      if (loaded) return Promise.resolve();
      return fetch((opts && opts.changelogUrl) || './api-compatibility-changelog.json')
        .then(function(r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function(data) {
          renderChangelog(data);
          loaded = true;
        })
        .catch(function(err) {
          console.error('api-compatibility-changelog.json:', err);
          if (body) {
            body.innerHTML =
              '<p class="compat-changelog-empty">Could not load changelog. Try a hard refresh.</p>';
          }
        });
    }

    if (openBtn) {
      openBtn.addEventListener('click', function() {
        openModal();
        loadChangelog();
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) {
      backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) closeModal();
      });
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && backdrop && !backdrop.hidden) closeModal();
    });

    return { load: loadChangelog, open: openModal, close: closeModal };
  }

  window.initApiCompatibility = function(opts) {
    var prefix = opts && opts.prefix ? opts.prefix : '';
    var loaded = false;
    var changelog = initChangelogModal(opts);

    function render(data) {
      var d = new Date(data.generated + 'T00:00:00');
      var updated = document.getElementById(prefix + 'updated');
      if (updated) {
        updated.textContent = 'Last updated: ' + d.toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      }

      var opsYes = 0, opsPlanned = 0, areasComplete = 0;
      data.groups.forEach(function(g) {
        if (g.status === 'supported') areasComplete++;
        g.ops.forEach(function(op) {
          if (op.status === 'yes') opsYes++;
          else opsPlanned++;
        });
      });

      var countSupported = document.getElementById(prefix + 'count-supported');
      var countPlanned = document.getElementById(prefix + 'count-ops-planned');
      var countAreas = document.getElementById(prefix + 'count-areas-complete');
      var categoryList = document.getElementById(prefix + 'category-list');

      if (countSupported) countSupported.textContent = opsYes;
      if (countPlanned) countPlanned.textContent = opsPlanned;
      if (countAreas) countAreas.textContent = areasComplete + ' of ' + data.groups.length;
      if (categoryList) categoryList.innerHTML = data.groups.map(renderRow).join('');
      loaded = true;
    }

    function load() {
      if (loaded) return;
      fetch((opts && opts.dataUrl) || './api-compatibility-data.json')
        .then(function(r) { return r.json(); })
        .then(render)
        .catch(function(err) {
          var categoryList = document.getElementById(prefix + 'category-list');
          if (categoryList) {
            categoryList.innerHTML =
              '<div style="padding:2rem;color:var(--muted);font-size:0.875rem;">Failed to load compatibility data.</div>';
          }
          console.error('api-compatibility-data.json:', err);
        });
    }

    if (!opts || opts.autoLoad !== false) {
      load();
    }

    return { load: load, openChangelog: changelog.open };
  };
})();
