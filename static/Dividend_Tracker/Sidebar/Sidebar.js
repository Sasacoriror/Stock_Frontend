document.addEventListener("DOMContentLoaded", () => {

    let links = [];
    let selectedIndex = 0;

    function activateSideBar(){
        links = document.querySelectorAll('.menu a');
        selectedIndex = 0;

        if (links.length > 0){
            links.forEach(link => link.classList.remove('selected'));
            links[0].classList.add("selected");
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

    
    document.addEventListener('keydown', (e) => {
        const sidenav = document.getElementById("sidenav");

        if (!sidenav.classList.contains("open")) return;

        if (links.length === 0) return;

        if (e.key === "ArrowDown") {
            links[selectedIndex].classList.remove("selected");
            selectedIndex = (selectedIndex + 1) % links.length;
            links[selectedIndex].classList.add("selected");
        } else if (e.key === "ArrowUp") {
            links[selectedIndex].classList.remove("selected");
            selectedIndex = (selectedIndex - 1 + links.length) % links.length;
            links[selectedIndex].classList.add("selected");
        } else if (e.key === "Enter"){
            links[selectedIndex].click();
        }
    });

});

