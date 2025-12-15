function switchTab(tabId) {
    // Hide all tab contents
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach(tab => tab.style.display = "none");

    // Remove 'active' from all tab menu items
    const menuItems = document.querySelectorAll(".dataMenu .tab-item");
    menuItems.forEach(item => item.classList.remove("active"));

    // Show the selected tab
    document.getElementById(tabId).style.display = "block";

    // Add active class to the clicked menu item
    const clickedItem = document.querySelector(`.tab-item[onclick="switchTab('${tabId}')"]`);
    if (clickedItem) clickedItem.classList.add("active");
}