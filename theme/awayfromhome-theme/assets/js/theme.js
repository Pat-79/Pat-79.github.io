/**
 * Away From Home Theme - Interactive JavaScript
 * Handles: theme switching, navigation menu, scroll behavior, accessibility
 * 
 * @description Provides core interactivity for the jekyll static site theme including
 * dark/light theme toggling, responsive navigation drawer with focus management,
 * and header behavior tied to scroll position for progressive enhancement.
 */

(function () {
  // ========== DOM ELEMENT REFERENCES ==========
  // Root and body elements for class manipulation
  var root = document.documentElement;
  var body = document.body;
  
  // Navigation drawer and menu elements
  var menuButton = document.querySelector("[data-menu-button]");
  var closeTarget = document.querySelector("[data-menu-close]");
  var drawer = document.getElementById("site-drawer");
  var drawerLinks = document.querySelectorAll("[data-drawer-link]");
  var shareButtons = document.querySelectorAll("[data-share-button]");
  
  // Theme selector options (auto/light/dark)
  var themeOptions = document.querySelectorAll("[data-theme-option]");
  
  // Header and hero elements for scroll-based behavior
  var siteHeader = document.querySelector(".site-header");
  var heroMedia = document.querySelector(".post-hero__media");
  
  // ========== STATE VARIABLES ==========
  // Scroll position threshold for header resize (computed after DOM is ready)
  var scrollThreshold = 18;
  
  // Track which element had focus before menu opened (for focus restoration)
  var lastFocused = null;
  var shareToastTimer = null;

  /**
   * Get all focusable elements within a container
   * @param {Element} container - The DOM element to search within
   * @returns {Array} Array of visible, focusable elements
   * @description Used for managing keyboard focus within the navigation drawer.
   * Includes links, buttons, inputs, selects, textareas, and custom focusable elements.
   */
  function getFocusable(container) {
    if (!container) {
      return [];
    }

    return Array.prototype.slice.call(
      container.querySelectorAll(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )
    ).filter(function (element) {
      return !element.hasAttribute("hidden") && (element.offsetWidth > 0 || element.offsetHeight > 0);
    });
  }

  /**
   * Get the user's preferred color scheme per system settings
   * @returns {string} Either 'dark' or 'light' based on OS preference
   * @description Checks native prefers-color-scheme media query for system theme preference
   */
  function preferredTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  /**
   * Get currently stored explicit theme preference
   * @returns {string} 'auto', 'light', or 'dark'
   * @description Returns explicit local preference when present; otherwise auto mode.
   */
  function selectedTheme() {
    var stored = localStorage.getItem("afh-theme");
    return stored === "light" || stored === "dark" ? stored : "auto";
  }

  /**
   * Get currently effective visual theme
   * @returns {string} 'light' or 'dark'
   * @description Auto mode resolves to user's system preference.
   */
  function effectiveTheme() {
    var selected = selectedTheme();
    return selected === "auto" ? preferredTheme() : selected;
  }

  /**
   * Synchronize segmented control UI with current theme selection
   * @description Updates pressed state and active class for all theme options.
   */
  function syncThemeControls() {
    if (!themeOptions || themeOptions.length === 0) {
      return;
    }

    var selected = selectedTheme();
    var currentEffective = effectiveTheme();

    themeOptions.forEach(function (option) {
      var optionTheme = option.getAttribute("data-theme-option");
      var isSelected = optionTheme === selected;

      option.setAttribute("aria-pressed", isSelected ? "true" : "false");
      option.classList.toggle("is-active", isSelected);

      if (optionTheme === "auto") {
        option.setAttribute("aria-label", "Auto (currently " + currentEffective + ")");
      }
    });
  }

  /**
   * Set theme selection and persist explicit preference when needed
   * @param {string} theme - 'auto', 'light', or 'dark'
   * @description Auto mode removes explicit override and follows system preference.
   */
  function setTheme(theme) {
    if (theme === "auto") {
      delete root.dataset.theme;
      localStorage.removeItem("afh-theme");
    } else {
      root.dataset.theme = theme;
      localStorage.setItem("afh-theme", theme);
    }

    syncThemeControls();
  }

  /**
   * Toggle navigation drawer open/closed state
   * @param {boolean} open - If true, open drawer; if false, close drawer
   * @description Manages drawer visibility, focus management, and accessibility attributes.
   * When opening: stores previous focus and moves focus to first focusable element.
   * When closing: restores focus to menu button (for keyboard navigation).
   */
  function setMenuState(open) {
    body.classList.toggle("menu-open", open);

    if (menuButton) {
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      menuButton.setAttribute("aria-label", open ? "Close site menu" : "Open site menu");
    }

    if (drawer) {
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
    }

    if (open) {
      // Store current focus to restore later
      lastFocused = document.activeElement;
      
      // Move focus to first focusable element in drawer
      var focusableInDrawer = getFocusable(drawer);
      if (focusableInDrawer.length > 0) {
        focusableInDrawer[0].focus();
      }
    } else if (menuButton && lastFocused) {
      // Restore focus to menu button after closing
      menuButton.focus();
    }
  }

  /**
   * Calculate scroll threshold based on hero image height
   * @returns {number} Pixel offset at which header should resize
   * @description For article pages with hero images, this calculates the point where
   * the hero image fully exits the viewport. For non-article pages, defaults to 18px.
   */
  function computeScrollThreshold() {
    if (!heroMedia) {
      return 18;
    }

    var hero = heroMedia.closest(".post-hero");
    if (!hero) {
      return 18;
    }

    var heroHeight = hero.offsetHeight || 0;
    var headerHeight = siteHeader ? siteHeader.offsetHeight : 0;

    // Trigger just before the top image area leaves the viewport
    return Math.max(18, heroHeight - headerHeight - 40);
  }

  /**
   * Update header classes based on current scroll position
   * @description Called on scroll event. Manages two independent classes:
   * - is-header-solid: Applied when scrollY > 0 (immediately darken header)
   * - is-scrolled: Applied when scrollY > scrollThreshold (resize header when hero exits)
   * This allows header to darken immediately while delaying resize until hero is gone.
   */
  function syncScrollState() {
    var currentScrollY = window.scrollY || 0;
    body.classList.toggle("is-header-solid", currentScrollY > 0);
    body.classList.toggle("is-scrolled", currentScrollY > scrollThreshold);
  }

  /**
   * Recalculate scroll threshold and update scroll state
   * @description Called on window resize and load to account for layout changes
   */
  function syncScrollThreshold() {
    scrollThreshold = computeScrollThreshold();
    syncScrollState();
  }

  /**
   * Copy current page URL to clipboard.
   * @returns {Promise<boolean>} true when copied successfully, false otherwise
   */
  function copyPageUrl() {
    var pageUrl = window.location.href;

    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(pageUrl).then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    }

    // Fallback for browsers/environments without Clipboard API.
    var helper = document.createElement("textarea");
    helper.value = pageUrl;
    helper.setAttribute("readonly", "");
    helper.style.position = "absolute";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();

    try {
      var copied = document.execCommand("copy");
      document.body.removeChild(helper);
      return Promise.resolve(copied);
    } catch (error) {
      document.body.removeChild(helper);
      return Promise.resolve(false);
    }
  }

  function announceShareResult(button, copied) {
    var srLabel = button.querySelector(".sr-only");
    var defaultLabel = "Copy page link";
    var resultLabel = copied ? "Link copied" : "Could not copy link";

    button.setAttribute("aria-label", resultLabel);
    button.title = resultLabel;
    button.classList.add(copied ? "is-copied" : "is-copy-failed");

    if (srLabel) {
      srLabel.textContent = resultLabel;
    }

    window.setTimeout(function () {
      button.setAttribute("aria-label", defaultLabel);
      button.title = "Share";
      button.classList.remove("is-copied", "is-copy-failed");
      if (srLabel) {
        srLabel.textContent = defaultLabel;
      }
    }, 1600);

    showShareToast(copied ? "URL copied to clipboard" : "Could not copy URL");
  }

  function showShareToast(message) {
    var toast = document.getElementById("share-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "share-toast";
      toast.className = "share-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");

    if (shareToastTimer) {
      window.clearTimeout(shareToastTimer);
    }

    shareToastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 1600);
  }

  function syncTagPostsFilter() {
    var tagPostsPage = document.querySelector("[data-tag-posts-page]");

    if (!tagPostsPage) {
      return;
    }

    var filterLinks = document.querySelectorAll("[data-tag-filter-link]");
    var status = document.querySelector("[data-tag-status]");
    var notFound = tagPostsPage.querySelector("[data-tag-not-found]");
    var sections = Array.prototype.slice.call(
      tagPostsPage.querySelectorAll("[data-tag-section]")
    );
    var params = new URLSearchParams(window.location.search);
    var selectedTag = params.get("tag");
    var normalizedTag = selectedTag ? selectedTag.toLowerCase() : "all";
    var showAll = !selectedTag || normalizedTag === "all" || normalizedTag === "*";
    var foundSection = null;

    sections.forEach(function (section) {
      var matches = showAll || section.getAttribute("data-tag-value") === normalizedTag;

      section.hidden = !matches;

      if (matches && !foundSection) {
        foundSection = section;
      }
    });

    if (notFound) {
      notFound.hidden = showAll || !!foundSection;
    }

    filterLinks.forEach(function (link) {
      var value = (link.getAttribute("data-tag-value") || "all").toLowerCase();
      var isActive = showAll ? value === "all" : value === normalizedTag;
      link.classList.toggle("is-active", isActive);
      link.setAttribute("aria-current", isActive ? "page" : "false");
    });

    if (!status) {
      return;
    }

    if (showAll) {
      status.hidden = false;
      status.textContent = "Showing posts for all tags.";
      return;
    }

    if (foundSection) {
      status.hidden = false;
      status.textContent = 'Showing posts tagged "' + foundSection.getAttribute("data-tag-label") + '".';
      return;
    }

    status.hidden = false;
    status.textContent = "The requested tag does not exist.";
  }

  function initHomeLandingSnap() {
    var landing = document.querySelector("[data-home-landing]");
    var landingTarget = document.querySelector("[data-home-main]");
    var scrollHint = document.querySelector("[data-home-scroll]");
    var touchStartY = null;
    var isSnapping = false;

    if (!landing || !landingTarget) {
      return;
    }

    function isNearTop() {
      return (window.scrollY || 0) < 24 && !body.classList.contains("menu-open");
    }

    function snapToMain() {
      if (isSnapping) {
        return;
      }

      isSnapping = true;
      landingTarget.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(function () {
        isSnapping = false;
      }, 900);
    }

    if (scrollHint) {
      scrollHint.addEventListener("click", function (event) {
        event.preventDefault();
        snapToMain();
      });
    }

    window.addEventListener("wheel", function (event) {
      if (!isNearTop() || event.deltaY <= 8) {
        return;
      }

      event.preventDefault();
      snapToMain();
    }, { passive: false });

    window.addEventListener("touchstart", function (event) {
      if (!event.touches || event.touches.length === 0) {
        return;
      }

      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    window.addEventListener("touchmove", function (event) {
      if (!isNearTop() || touchStartY === null || !event.touches || event.touches.length === 0) {
        return;
      }

      var deltaY = touchStartY - event.touches[0].clientY;

      if (deltaY <= 18) {
        return;
      }

      event.preventDefault();
      touchStartY = null;
      snapToMain();
    }, { passive: false });

    window.addEventListener("keydown", function (event) {
      var activeTag = document.activeElement ? document.activeElement.tagName : "";
      var isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT" || (document.activeElement && document.activeElement.isContentEditable);
      var shouldSnap = event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ";

      if (!isNearTop() || isTyping || !shouldSnap) {
        return;
      }

      event.preventDefault();
      snapToMain();
    });
  }

  // ========== EVENT LISTENERS: MENU & DRAWER ==========
  
  if (menuButton) {
    menuButton.addEventListener("click", function () {
      setMenuState(!body.classList.contains("menu-open"));
    });
  }

  if (closeTarget) {
    closeTarget.addEventListener("click", function () {
      setMenuState(false);
    });
  }

  if (shareButtons && shareButtons.length > 0) {
    shareButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        copyPageUrl().then(function (copied) {
          announceShareResult(button, copied);
        });
      });
    });
  }

  // Close drawer when clicking links inside it
  drawerLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuState(false);
    });
  });

  syncTagPostsFilter();
  initHomeLandingSnap();

  // ========== EVENT LISTENERS: KEYBOARD ACCESSIBILITY ==========
  
  document.addEventListener("keydown", function (event) {
    // Tab focus trap when menu is open
    if (event.key === "Tab" && body.classList.contains("menu-open") && drawer) {
      var focusableInDrawer = getFocusable(drawer);

      if (focusableInDrawer.length === 0) {
        event.preventDefault();
        return;
      }

      var first = focusableInDrawer[0];
      var last = focusableInDrawer[focusableInDrawer.length - 1];

      // Wrap focus from last focusable to first when Shift+Tab on first element
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      // Wrap focus from first focusable to last when Tab on last element
      else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    // Close drawer on Escape key
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  // ========== EVENT LISTENERS: THEME SELECTOR ==========
  
  if (themeOptions && themeOptions.length > 0) {
    themeOptions.forEach(function (option) {
      option.addEventListener("click", function () {
        var mode = option.getAttribute("data-theme-option") || "auto";
        setTheme(mode);
      });
    });
  }

  // ========== EVENT LISTENERS: SCROLL & WINDOW ==========
  
  // Update header classes on scroll (passive for performance)
  window.addEventListener("scroll", syncScrollState, { passive: true });
  
  // Recalculate threshold when window resizes
  window.addEventListener("resize", syncScrollThreshold);
  
  // Initialize threshold after DOM and images are loaded
  window.addEventListener("load", syncScrollThreshold);
  
  // Sync theme controls when system preference changes in auto mode
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    if (selectedTheme() === "auto") {
      syncThemeControls();
    }
  });

  // ========== INITIALIZATION ==========
  
  syncThemeControls();    // Set initial theme selector UI
  syncScrollThreshold();  // Calculate and apply initial scroll threshold
  setMenuState(false);    // Ensure menu starts closed
}());
