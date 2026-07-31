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
  }
})();
