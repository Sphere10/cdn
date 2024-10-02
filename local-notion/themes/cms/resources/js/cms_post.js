﻿function SetActiveNavbarItems() {
    // Define the classes to add/remove
    const activeClasses = ['active', 'text-bg-primary'];

    // Get current URL path, query string, and hash
    const currentUrl = window.location.pathname + window.location.search + window.location.hash;

    // Get all nav-links within the navbar, including dropdown items
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .dropdown-item');

    // Iterate over navLinks
    for (let i = 0; i < navLinks.length; i++) {
        const link = navLinks[i];
        const href = link.getAttribute('href');

        // Ignore links with href="#" or empty href
        if (!href || href === '#' || href === '') {
            continue;
        }

        const linkUrl = new URL(link.href, window.location.origin);

        // Remove the active classes from all links
        link.classList.remove(...activeClasses);

        // Rule A: Exact URL match or homepage link when on the root
        if (
            (linkUrl.pathname === window.location.pathname) ||
            (linkUrl.pathname === '/' && window.location.pathname === '/')
        ) {
            link.classList.add(...activeClasses);
        }

        // Rule B: Current URL is a sub-folder of the link URL, but not the root
        else if (window.location.pathname.startsWith(linkUrl.pathname) && linkUrl.pathname !== '/') {
            link.classList.add(...activeClasses);
        }
    }
}

function InitializeNestedDropdowns() {
    const nestedDropdowns = document.querySelectorAll('.dropdown-menu .dropdown');

    for (let i = 0; i < nestedDropdowns.length; i++) {
        const submenu = nestedDropdowns[i];
        const parentLink = submenu.querySelector('.dropdown-toggle');

        parentLink.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation(); // Prevent Bootstrap's logic from interfering with nested dropdowns
        });
    }
}

function ColorSectionShapeSeparators() {
    function GetEffectiveBackgroundColor(element) {
        let color = window.getComputedStyle(element).backgroundColor;

        // Loop through parent elements to find the first non-transparent, non-translucent color
        while (IsTranslucent(color) && element.parentElement) {
            element = element.parentElement;
            color = window.getComputedStyle(element).backgroundColor;
        }

        return color;
    }

    function IsTranslucent(color) {
        const rgbaMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)$/);
        if (rgbaMatch && rgbaMatch[4] !== undefined) {
            const alpha = parseFloat(rgbaMatch[4]);
            return alpha < 1 && alpha >= 0; // Include fully opaque and translucent colors
        }
        return false;
    }

    document.querySelectorAll('.shape').forEach(function (shape) {
        const parentDiv = shape.closest('.position-relative'); // Get the parent container
        if (!parentDiv)
            return; // some other shape (not a page separating shape)
        let nextLogicalSibling = parentDiv.nextElementSibling; // Get the next sibling

        // If no next sibling exists, get the parent's next sibling
        if (!nextLogicalSibling) {
            nextLogicalSibling = parentDiv.parentElement.nextElementSibling;
        } else if (nextLogicalSibling.tagName.toLowerCase() === 'main') {
            // If the nextLogicalSibling is a <main>, get its first child
            nextLogicalSibling = nextLogicalSibling.firstElementChild;
        }

        if (nextLogicalSibling) {
            const sectionColor = GetEffectiveBackgroundColor(nextLogicalSibling); // Get effective background color
            const svgPath = shape.querySelector('svg path'); // Find the path inside the SVG
            if (svgPath) {
                // Apply the computed background color as fill, including any alpha
                svgPath.setAttribute('fill', sectionColor); // Set the fill attribute to the background color
            }
        }
    });
}

function InitializeTypedText() {
    const toggles = document.querySelectorAll('[data-typed]');
    toggles.forEach((toggle) => {
        const elementOptions = toggle.dataset.typed ? JSON.parse(toggle.dataset.typed) : {};

        const defaultOptions = {
            typeSpeed: 40,
            backSpeed: 40,
            backDelay: 1000,
            loop: true,
        };

        const options = {
            ...defaultOptions,
            ...elementOptions,
        };

        new Typed(toggle, options);
    });

}

function InitializeAnimateOnScroll() {
    const options = {
        duration: 700,
        easing: 'ease-out-quad',
        once: true,
        delay: 10,
        startEvent: 'load',
    };
    AOS.init(options);
    window.AOS = AOS; // Make available globally
}

function InitializeGalleries() {
    const toggles = document.querySelectorAll('[data-isotope]');
    const filters = document.querySelectorAll('[data-filter]');

    toggles.forEach(function (toggle) {
        imagesLoaded(toggle, function () {
            const options = JSON.parse(toggle.dataset.isotope);

            new Isotope(toggle, options);
        });
    });

    filters.forEach(function (filter) {
        filter.addEventListener('click', function (e) {
            e.preventDefault();

            const cat = filter.dataset.filter;
            const target = filter.dataset.bsTarget;
            const instance = Isotope.data(target);

            instance.arrange({
                filter: cat,
            });
        });
    });

    // Make available globally
    window.Isotope = Isotope;
    window.imagesLoaded = imagesLoaded;
}

/************************************************ MAIN **********************************************************************/

SetActiveNavbarItems();
InitializeNestedDropdowns();
ColorSectionShapeSeparators();
InitializeTypedText();
InitializeAnimateOnScroll();
InitializeGalleries();
