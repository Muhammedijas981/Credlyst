/**
 * Client-Side Router for Credlyst
 * Supports HTML5 History API, dynamic parameters, query strings, and programmatic navigation.
 */
export class Router {
  constructor(options = {}) {
    this.routes = [];
    this.currentPath = null;
    this.currentRoute = null;
    this.currentParams = {};
    this.currentQuery = {};
    this.beforeEachHook = null;
    this.afterEachHook = null;
    this.base = options.base || "";
    this.isHandlingPopstate = false;

    this.handlePopState = this.handlePopState.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
  }

  /**
   * Register a route with a pattern and handler
   * @param {string} path Pattern string e.g. '/', '/favorites', '/category/:name'
   * @param {Function} handler Callback function (params, query) => void
   * @param {Object} options Route options (e.g. meta, name)
   */
  addRoute(path, handler, options = {}) {
    const { regex, paramNames } = this.compilePath(path);
    this.routes.push({
      path,
      regex,
      paramNames,
      handler,
      meta: options.meta || {},
      name: options.name,
    });
    return this;
  }

  /**
   * Register global before-navigation hook
   * @param {Function} hook (toPath, fromPath, next) => void
   */
  beforeEach(hook) {
    this.beforeEachHook = hook;
    return this;
  }

  /**
   * Register global after-navigation hook
   * @param {Function} hook (toRoute, fromRoute) => void
   */
  afterEach(hook) {
    this.afterEachHook = hook;
    return this;
  }

  /**
   * Convert route path into regex and extract parameter names
   */
  compilePath(path) {
    const paramNames = [];
    const normalized = path.replace(/\/+$/, "") || "/";

    // Escape regex special chars except colon
    const regexStr =
      "^" +
      normalized
        .replace(/([.+*?=^!:${}()|[\]/\\])/g, (match) => {
          if (match === ":") return ":";
          if (match === "/") return "\\/";
          return "\\" + match;
        })
        .replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
          paramNames.push(paramName);
          return "([^\\/]+)";
        }) +
      "(?:\\/)?$";

    return {
      regex: new RegExp(regexStr),
      paramNames,
    };
  }

  /**
   * Parse query parameters from URL search string
   */
  parseQuery(search) {
    const query = {};
    if (!search) return query;
    const searchParams = new URLSearchParams(search);
    for (const [key, value] of searchParams.entries()) {
      query[key] = value;
    }
    return query;
  }

  /**
   * Match a path to registered routes
   */
  matchRoute(path) {
    const cleanPath = path.split("?")[0].replace(/\/+$/, "") || "/";

    for (const route of this.routes) {
      const match = cleanPath.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = decodeURIComponent(match[index + 1]);
        });
        return {
          route,
          params,
          path: cleanPath,
        };
      }
    }
    return null;
  }

  /**
   * Navigate to a new path
   * @param {string} path Target path
   * @param {Object} options { replace?: boolean, state?: any, silent?: boolean }
   */
  async navigate(path, options = {}) {
    const [pathname, search] = path.split("?");
    const fullPath = pathname + (search ? `?${search}` : "");
    const cleanPath = pathname.replace(/\/+$/, "") || "/";
    const fromPath = this.currentPath;

    // Run beforeEach hook if registered
    if (this.beforeEachHook) {
      let proceed = true;
      let redirectPath = null;

      await this.beforeEachHook(fullPath, fromPath, (result) => {
        if (result === false) {
          proceed = false;
        } else if (typeof result === "string") {
          redirectPath = result;
          proceed = false;
        }
      });

      if (!proceed) {
        if (redirectPath && redirectPath !== fullPath) {
          return this.navigate(redirectPath, options);
        }
        return false;
      }
    }

    const matched = this.matchRoute(cleanPath);

    if (matched) {
      const query = this.parseQuery(search || (window.location.search ? window.location.search.slice(1) : ""));

      if (!options.silent) {
        if (options.replace) {
          window.history.replaceState(options.state || {}, "", fullPath);
        } else if (window.location.pathname + window.location.search !== fullPath) {
          window.history.pushState(options.state || {}, "", fullPath);
        }
      }

      this.currentPath = fullPath;
      this.currentRoute = matched.route;
      this.currentParams = matched.params;
      this.currentQuery = query;

      try {
        await matched.route.handler(matched.params, query);
      } catch (err) {
        console.error("Route handler error:", err);
      }

      if (this.afterEachHook) {
        this.afterEachHook(matched.route, fromPath);
      }

      return true;
    } else {
      console.warn(`[Router] No route matched for path: ${cleanPath}`);
      return false;
    }
  }

  /**
   * Replace current history state with target path
   */
  replace(path, state = {}) {
    return this.navigate(path, { replace: true, state });
  }

  /**
   * Handle popstate event (Back/Forward browser buttons)
   */
  handlePopState() {
    const fullPath = window.location.pathname + window.location.search;
    this.isHandlingPopstate = true;
    this.navigate(fullPath, { silent: true }).finally(() => {
      this.isHandlingPopstate = false;
    });
  }

  /**
   * Intercept clicks on internal links
   */
  handleLinkClick(e) {
    // Only handle primary button clicks without modifier keys
    if (e.button !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) {
      return;
    }

    const target = e.target.closest("a, [data-nav-link]");
    if (!target) return;

    // Check if element has target="_blank" or download or external link
    if (target.hasAttribute("download") || target.getAttribute("target") === "_blank") {
      return;
    }

    const href = target.getAttribute("href") || target.dataset.navLink;
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    // Check if external link
    if (href.startsWith("http://") || href.startsWith("https://")) {
      try {
        const url = new URL(href);
        if (url.origin !== window.location.origin) {
          return;
        }
      } catch {
        return;
      }
    }

    e.preventDefault();
    this.navigate(href);
  }

  /**
   * Start the router
   */
  init() {
    window.addEventListener("popstate", this.handlePopState);
    document.addEventListener("click", this.handleLinkClick);

    const initialPath = window.location.pathname + window.location.search;
    return this.navigate(initialPath || "/");
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    window.removeEventListener("popstate", this.handlePopState);
    document.removeEventListener("click", this.handleLinkClick);
  }
}

export default Router;
