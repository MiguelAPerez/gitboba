/**
 * Chooses the TestFlight link on /beta/ for the visitor's region.
 *
 * The country comes from Cloudflare's /cdn-cgi/trace (same origin, `loc=XX`).
 * That only picks the default: the page always offers the other link too, and
 * any failure falls back to the non-EU link.
 */
(function (root) {
  // EU member states, as ISO 3166-1 alpha-2 codes (Cloudflare uses GR for Greece).
  var EU_COUNTRIES = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
    'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];

  var TRACE_TIMEOUT_MS = 1500;

  function countryFromTrace(text) {
    var match = /^loc=([A-Z]{2})\s*$/m.exec(typeof text === 'string' ? text : '');
    return match ? match[1] : null;
  }

  function isEU(country) {
    return EU_COUNTRIES.indexOf(country) !== -1;
  }

  /**
   * Returns { join, alternate } for a country (null if unknown).
   * join:      { url, region } for the main button, or null if no link is set.
   * alternate: { url, region } for the "other region" line, or null.
   */
  function pickLinks(country, urls) {
    var main = urls.main || '';
    var eu = urls.eu || '';
    if (!eu || eu === main) {
      return { join: main ? { url: main, region: 'main' } : null, alternate: null };
    }
    var inEU = isEU(country);
    var mine = inEU ? { url: eu, region: 'eu' } : (main ? { url: main, region: 'main' } : null);
    var other = inEU ? (main ? { url: main, region: 'main' } : null) : { url: eu, region: 'eu' };
    return { join: mine, alternate: other };
  }

  function fetchCountry(fetchFn) {
    if (typeof fetchFn !== 'function') return Promise.resolve(null);
    var timer;
    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve(null); }, TRACE_TIMEOUT_MS);
    });
    var lookup = Promise.resolve()
      .then(function () { return fetchFn('/cdn-cgi/trace', { cache: 'no-store' }); })
      .then(function (res) { return res.ok ? res.text() : ''; })
      .then(countryFromTrace)
      .catch(function () { return null; });
    return Promise.race([lookup, timeout]).then(function (country) {
      clearTimeout(timer);
      return country;
    });
  }

  function render(doc, links) {
    var join = doc.getElementById('beta-join');
    var note = doc.getElementById('beta-join-note');
    var alt = doc.getElementById('beta-join-alt');
    var altLabel = doc.getElementById('beta-join-alt-label');
    var altLink = doc.getElementById('beta-join-alt-link');

    if (links.join) {
      join.href = links.join.url;
      join.textContent = 'Join the beta';
      note.hidden = true;
    }
    if (links.alternate) {
      altLink.href = links.alternate.url;
      altLabel.textContent = links.alternate.region === 'eu' ? 'In the EU?' : 'Outside the EU?';
      altLink.textContent = links.alternate.region === 'eu' ? 'Use the EU beta link' : 'Use the main beta link';
      alt.hidden = false;
    } else {
      alt.hidden = true;
    }
  }

  function init(doc, fetchFn, urls) {
    // Render right away with no country (the non-EU default) so the button works
    // even if the lookup is slow or blocked, then refine once the country is known.
    render(doc, pickLinks(null, urls));
    if (!urls.eu || urls.eu === urls.main) return Promise.resolve();
    return fetchCountry(fetchFn).then(function (country) {
      if (country) render(doc, pickLinks(country, urls));
    });
  }

  var api = {
    EU_COUNTRIES: EU_COUNTRIES,
    countryFromTrace: countryFromTrace,
    isEU: isEU,
    pickLinks: pickLinks,
    fetchCountry: fetchCountry,
    init: init
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.GitBobaBetaLink = api;
  }
})(this);
