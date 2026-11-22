(function (document) {
  var images = document.querySelectorAll("section img");
  for (var i = 0; i < images.length; i++) {
    var img = images[i];
    if (img.closest("a")) {
      continue;
    }
    var link = document.createElement("a");
    link.href = img.currentSrc || img.src;
    link.target = "_blank";
    link.rel = "noopener";
    img.parentNode.insertBefore(link, img);
    link.appendChild(img);
  }
})(document);
