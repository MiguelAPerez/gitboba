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

  window.initApiCompatibility = function(opts) {
    var prefix = opts && opts.prefix ? opts.prefix : '';
    var loaded = false;

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

    return { load: load };
  };
})();
