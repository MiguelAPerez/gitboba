(function () {
  var path = location.pathname;
  var search = location.search;
  var hash = location.hash;
  var isProduction = location.hostname === 'gitboba.app';

  if (!isProduction) {
    return;
  }

  if (location.protocol === 'http:') {
    location.replace('https://' + location.host + path + search + hash);
    return;
  }

  if (/\.html$/i.test(path)) {
    var base = path.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
    var clean = base || '/';
    location.replace(clean + search + hash);
  }
})();
