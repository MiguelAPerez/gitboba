(function () {
  var path = location.pathname;
  var search = location.search;
  var hash = location.hash;

  if (location.protocol === 'http:') {
    location.replace('https://' + location.host + path + search + hash);
    return;
  }

  if (/\.html$/i.test(path)) {
    var clean = path.replace(/\.html$/i, '') || '/';
    location.replace(clean + search + hash);
  }
})();
