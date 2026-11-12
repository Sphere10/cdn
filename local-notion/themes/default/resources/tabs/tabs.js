/* Sphere10.VisualRenderer native tabs. MIT license. */
(() => {
    "use strict";
    if (window.sphere10Tabs) return;
    const controllers = new WeakMap();
    let nextId = 0;
    function uniqueId() {
        let id;
        do { id = "ln-tab-button-" + (++nextId); } while (document.getElementById(id));
        return id;
    }
    function initialize(group) {
        if (controllers.has(group)) return;
        const panels = Array.from(group.children).filter(child => child.hasAttribute("data-ln-tab"));
        if (!panels.length) return;
        const labels = panels.map(panel => panel.querySelector(":scope > [data-ln-tab-label]"));
        if (labels.some(label => !label)) return;
        const list = document.createElement("div");
        list.className = "ln-tab-list";
        list.setAttribute("role", "tablist");
        list.setAttribute("aria-label", group.getAttribute("aria-label") || "Content tabs");
        const buttons = panels.map((panel, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.id = uniqueId();
            button.setAttribute("role", "tab");
            button.setAttribute("aria-controls", panel.id);
            const label = labels[index].cloneNode(true);
            // Labels retain rich formatting, but a tab button cannot contain another control.
            label.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach(element => {
                element.replaceWith(...element.childNodes);
            });
            label.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
            button.append(...label.childNodes);
            if (!button.textContent.trim() && !button.querySelector("img[alt]"))
                button.setAttribute("aria-label", "Tab " + (index + 1));
            panel.setAttribute("role", "tabpanel");
            panel.setAttribute("aria-labelledby", button.id);
            panel.tabIndex = 0;
            button.addEventListener("click", () => activate(index));
            button.addEventListener("keydown", event => {
                let target;
                const rtl = getComputedStyle(list).direction === "rtl";
                if (event.key === "ArrowRight") target = index + (rtl ? -1 : 1);
                else if (event.key === "ArrowLeft") target = index + (rtl ? 1 : -1);
                else if (event.key === "Home") target = 0;
                else if (event.key === "End") target = panels.length - 1;
                else return;
                event.preventDefault();
                target = (target + panels.length) % panels.length;
                activate(target);
                buttons[target].focus();
            });
            list.append(button);
            return button;
        });
        function activate(index) {
            panels.forEach((panel, item) => {
                panel.hidden = item !== index;
                buttons[item].setAttribute("aria-selected", String(item === index));
                buttons[item].tabIndex = item === index ? 0 : -1;
            });
            // Existing image/diagram/layout consumers can remeasure a newly visible panel.
            window.dispatchEvent(new Event("resize"));
        }
        controllers.set(group, { panels, activate });
        group.prepend(list);
        group.classList.add("ln-tabs-enhanced");
        labels.forEach(label => { label.hidden = true; });
        activate(0);
    }
    function revealHash() {
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        const target = id && document.getElementById(id);
        if (!target) return;
        let panel = target.closest("[data-ln-tab]");
        let revealed = false;
        while (panel) {
            const group = panel.parentElement;
            const controller = controllers.get(group);
            if (controller) {
                controller.activate(controller.panels.indexOf(panel));
                revealed = true;
            }
            panel = group.closest("[data-ln-tab]");
        }
        if (revealed) requestAnimationFrame(() => target.scrollIntoView());
    }
    function initializeAll() {
        document.querySelectorAll("[data-ln-tabs]").forEach(initialize);
        revealHash();
    }
    window.sphere10Tabs = { initialize: initializeAll };
    window.addEventListener("hashchange", revealHash);
    // Clicking the current fragment again does not raise hashchange.
    document.addEventListener("click", event => {
        const link = event.target.closest && event.target.closest("a[href]");
        if (!link) return;
        const url = new URL(link.href, location.href);
        if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash === location.hash)
            requestAnimationFrame(revealHash);
    });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeAll, { once: true });
    else initializeAll();
})();
