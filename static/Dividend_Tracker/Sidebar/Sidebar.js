document.addEventListener("DOMContentLoaded", () => {

    let links = [];
    let selectedIndex = 0;
    let typed = "";
    let typeResetTimer = null;

    function activateSideBar(){
        links = document.querySelectorAll('.menu a');
        selectedIndex = 0;

        links.forEach(link => link.classList.remove('selected'));

        if (links.length > 0){
            links[0].classList.add("selected");
            links[0].scrollIntoView({behavior: "smooth", block: "nearest"});
        }
    }


    function toggleSidebar() {
        const sidenav = document.getElementById("sidenav");
        const isOpen = !sidenav.classList.contains("open");

        sidenav.classList.toggle("open");

        if (isOpen){
            activateSideBar();
        }
    }

    window.toggleSidebar = toggleSidebar;

    document.addEventListener("click", (e) => {
        const sidenav = document.getElementById("sidenav");
        const toggle_btn = document.querySelector(".toggle-btn");
        if (!sidenav.classList.contains("open")) return;
        if (sidenav.contains(e.target)) return;
        if (toggle_btn.contains(e.target)) return;
        sidenav.classList.remove("open");
    });

    
    document.addEventListener('keydown', (e) => {
        const sidenav = document.getElementById("sidenav");

        if (e.key === "Enter" && !sidenav.classList.contains("open")){
            toggleSidebar();
            return;
        }

        if (!sidenav.classList.contains("open")) return;

        //if (sidenav.contains(e.target)) return;

        //sidenav.classList.remove("open");

        //if (links.length === 0) return;

        if (e.key === "ArrowDown") {
            links[selectedIndex].classList.remove("selected");
            selectedIndex = (selectedIndex + 1) % links.length;
            links[selectedIndex].classList.add("selected");

            links[selectedIndex].scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
            return;
        } else if (e.key === "ArrowUp") {
            links[selectedIndex].classList.remove("selected");
            selectedIndex = (selectedIndex - 1 + links.length) % links.length;
            links[selectedIndex].classList.add("selected");

            links[selectedIndex].scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
            return;
        } else if (e.key === "Enter"){
            links[selectedIndex].click();
            return;
        } else if (e.key === "Escape"){
            sidenav.classList.remove("open");
            return;
        } else if (e.key.length === 1 && e.key.match(/[a-z0-9]/i)) {
            typed += e.key.toLowerCase();

            clearTimeout(typeResetTimer);
            typeResetTimer = setTimeout(() => typed = "", 600);

            for (let i = 0; i < links.length; i++){
                const text = links[i].innerText.trim().toLowerCase();
                if (text.startsWith(typed)) {
                    links[selectedIndex].classList.remove("selected");
                    selectedIndex = i;
                    links[selectedIndex].classList.add("selected");

                    links[selectedIndex].scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });
                    break;
                }
            }
        }
    });

});

