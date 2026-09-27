(function() {
    function blockEvent(e) {
    // Platform check for Cmd on Mac / Ctrl on Windows
    const ctrlOrCmd = e.ctrlKey || e.metaKey;
    const key = e.key ? e.key.toLowerCase() : '';

    // Block View Source (Ctrl+U or Cmd+Opt+U)
    if (ctrlOrCmd && key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block DevTools Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Cmd+Option+I, etc.)
    if (
        e.key === 'F12' ||
        (ctrlOrCmd && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
        (ctrlOrCmd && e.altKey && (key === 'i' || key === 'j' || key === 'u'))
    ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    }

    window.addEventListener('keydown', blockEvent, true);
    window.addEventListener('contextmenu', (e) => e.preventDefault(), true);
})();