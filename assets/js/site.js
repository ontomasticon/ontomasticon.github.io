/* The Ontomasticon documentation site. Pages work without this script: it adds the menu button on narrow screens,
   the current page's sections in the menu, links to sections, tables that scroll sideways, buttons to copy code,
   and links to the previous and next pages and to edit the page on GitHub. */

(function () {
  "use strict";

  var root = document.documentElement;
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var content = document.querySelector(".content");
  var forEach = function (list, callback) {
    Array.prototype.forEach.call(list, callback);
  };

  // The menu button on narrow screens

  if (nav && toggle) {
    var backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    document.body.appendChild(backdrop);

    var setOpen = function (open) {
      root.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    toggle.addEventListener("click", function () {
      setOpen(!root.classList.contains("nav-open"));
    });
    backdrop.addEventListener("click", function () {
      setOpen(false);
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setOpen(false);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && root.classList.contains("nav-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 56.0625rem)").addEventListener("change", function (event) {
      if (event.matches) {
        setOpen(false);
      }
    });
  }

  if (!content) {
    return;
  }

  // Every heading has an id, so its section can be linked to

  var headings = content.querySelectorAll("h2, h3");
  forEach(headings, function (heading) {
    if (heading.id) {
      return;
    }
    var base = heading.textContent.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
    var id = base;
    for (var n = 2; document.getElementById(id); n++) {
      id = base + "-" + n;
    }
    heading.id = id;
  });

  // The current page's sections, listed under it in the menu, with the one being read highlighted

  var current = nav && nav.querySelector('a[aria-current="page"]');
  var sections = content.querySelectorAll("h2");

  if (current && sections.length > 1) {
    var list = document.createElement("ul");
    var tocLinks = [];
    list.className = "toc";
    forEach(sections, function (heading) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent;
      item.appendChild(link);
      list.appendChild(item);
      tocLinks.push(link);
    });
    current.parentNode.appendChild(list);

    var scheduled = false;
    var highlight = function () {
      scheduled = false;
      var line = parseFloat(getComputedStyle(root).scrollPaddingTop) + window.innerHeight * 0.2;
      var active = -1;
      for (var i = 0; i < sections.length && sections[i].getBoundingClientRect().top <= line; i++) {
        active = i;
      }
      if (window.innerHeight + window.scrollY >= root.scrollHeight - 2) {
        active = sections.length - 1;
      }
      tocLinks.forEach(function (link, index) {
        link.classList.toggle("is-active", index === active);
      });
    };
    window.addEventListener("scroll", function () {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(highlight);
      }
    }, { passive: true });
    highlight();
  }

  forEach(headings, function (heading) {
    var anchor = document.createElement("a");
    anchor.className = "heading-anchor";
    anchor.href = "#" + heading.id;
    anchor.textContent = "#";
    anchor.tabIndex = -1;
    anchor.setAttribute("aria-hidden", "true");
    heading.appendChild(anchor);
  });

  // Tables scroll sideways when they are wider than the screen

  forEach(content.querySelectorAll("table"), function (table) {
    var wrap = document.createElement("div");
    wrap.className = "table-wrap";
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // Buttons to copy code

  if (navigator.clipboard && window.isSecureContext) {
    forEach(content.querySelectorAll("pre"), function (pre) {
      var wrap = document.createElement("div");
      var button = document.createElement("button");
      var reset;
      wrap.className = "code-block";
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      button.type = "button";
      button.className = "copy-button";
      button.textContent = "Copy";
      button.setAttribute("aria-live", "polite");
      button.addEventListener("click", function () {
        navigator.clipboard.writeText(pre.textContent.replace(/^\n+|\s+$/g, "")).then(function () {
          button.textContent = "Copied";
        }, function () {
          button.textContent = "Couldn't copy";
        }).then(function () {
          button.classList.add("is-done");
          clearTimeout(reset);
          reset = setTimeout(function () {
            button.textContent = "Copy";
            button.classList.remove("is-done");
          }, 2000);
        });
      });
      wrap.appendChild(button);
    });
  }

  // Links to the previous and next pages in the menu, and to edit this page on GitHub

  if (!current) {
    return;
  }

  var pages = Array.prototype.filter.call(nav.querySelectorAll("a"), function (link) {
    return !link.closest(".toc");
  });
  var position = pages.indexOf(current);
  var pager = document.createElement("nav");
  pager.className = "page-nav";
  pager.setAttribute("aria-label", "Previous and next pages");

  [[pages[position - 1], "prev", "Previous"], [pages[position + 1], "next", "Next"]].forEach(function (neighbour) {
    if (!neighbour[0]) {
      return;
    }
    var link = document.createElement("a");
    var label = document.createElement("span");
    var title = document.createElement("span");
    link.className = "page-nav-" + neighbour[1];
    link.href = neighbour[0].getAttribute("href");
    link.rel = neighbour[1];
    label.className = "page-nav-label";
    label.textContent = neighbour[2];
    title.className = "page-nav-title";
    title.textContent = neighbour[0].textContent;
    link.appendChild(label);
    link.appendChild(title);
    pager.appendChild(link);
  });
  content.appendChild(pager);

  // The current page's link in the menu is its file name, even where GitHub Pages serves it without .html
  var file = current.getAttribute("href");
  var edit = document.createElement("p");
  var editLink = document.createElement("a");
  edit.className = "edit-page";
  editLink.href = "https://github.com/ontomasticon/ontomasticon.github.io/edit/main/" + file;
  editLink.textContent = "Edit this page on GitHub";
  edit.appendChild(editLink);
  content.appendChild(edit);
})();
