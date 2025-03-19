export function changeTheme(theme, root) {
    switch(theme) {
        case "dark":
            root.style.setProperty("--bg-primary", "#2f3136");
            root.style.setProperty("--bg-secondary", "#36393f");
            root.style.setProperty("--text-primary", "#ffffff");
            root.style.setProperty("--text-secondary", "#b9bbbe");
            root.style.setProperty("--border-color", "#202225");
            root.style.setProperty("--bg-message-received", "rgba(64, 68, 75, 0.95)");
            root.style.setProperty("--bg-message-sent", "rgba(88, 101, 242, 0.95)");
            break;
        case "blue":
            root.style.setProperty("--bg-primary", "#e3f2fd");
            root.style.setProperty("--bg-secondary", "#bbdefb");
            root.style.setProperty("--text-primary", "#1976d2");
            root.style.setProperty("--text-secondary", "#2196f3");
            root.style.setProperty("--border-color", "#90caf9");
            root.style.setProperty("--bg-message-received", "rgba(255, 255, 255, 0.95)");
            root.style.setProperty("--bg-message-sent", "rgba(33, 150, 243, 0.95)");
            break;
        default:
            root.style.setProperty("--bg-primary", "#f0f2f5");
            root.style.setProperty("--bg-secondary", "#f8f9fa");
            root.style.setProperty("--text-primary", "#222");
            root.style.setProperty("--text-secondary", "#666");
            root.style.setProperty("--border-color", "#e0e0e0");
            root.style.setProperty("--bg-message-received", "rgba(255, 255, 255, 0.95)");
            root.style.setProperty("--bg-message-sent", "rgba(227, 242, 253, 0.95)");
    }
} 