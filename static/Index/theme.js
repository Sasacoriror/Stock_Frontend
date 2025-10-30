function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    const body = document.body;

    const savedTheme = getCookie("theme") || localStorage.getItem("theme");
    if (savedTheme === "dark") {
        body.classList.add("dark-theme");
        toggleBtn.textContent = "☀️";
    } else {
        body.classList.remove("dark-theme");
        toggleBtn.textContent = "🌙";
    }

    toggleBtn.addEventListener("click", () => {
        body.classList.toggle("dark-theme");

        if (body.classList.contains("dark-theme")) {
            toggleBtn.textContent = "☀️";
            setCookie("theme", "dark", 365);
            localStorage.setItem("theme", "dark");
        } else {
            toggleBtn.textContent = "🌙";
            setCookie("theme", "light", 365);
            localStorage.setItem("theme", "light");
        }
    });
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}



