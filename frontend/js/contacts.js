// frontend/js/contacts.js

/**
 * Sets up the real-time search filter for the contact list.
 */
function setupContactSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        const contactItems = document.querySelectorAll('.contact-item');

        contactItems.forEach(item => {
            // Get the contact's name from the h4 tag inside the item
            const contactName = item.querySelector('.contact-name').textContent.toLowerCase();
            
            // If the contact's name includes the search term, show it. Otherwise, hide it.
            if (contactName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}


/**
 * Fetches the list of users from the backend and renders them in the sidebar.
 */
export async function fetchAndRenderContacts() {
    const user = JSON.parse(localStorage.getItem('whatsapp_clone_user'));
    if (!user || !user.token) return;

    try {
        const response = await fetch('https://gemchat-backend.onrender.com/api/contacts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });

        if (!response.ok) {
            throw new Error('Could not fetch contacts.');
        }

        const contacts = await response.json();
        const contactListElement = document.getElementById('contact-list');
        
        contactListElement.innerHTML = ''; 

        contacts.forEach(contact => {
            const contactItem = document.createElement('div');
            contactItem.className = 'contact-item';
            contactItem.dataset.contactInfo = JSON.stringify(contact); 

            contactItem.innerHTML = `
                <img src="../assets/images/user-avatar.png" alt="${contact.name}" class="profile-avatar">
                <div class="contact-info">
                    <h4 class="contact-name">${contact.name}</h4>
                    <p class="contact-last-message">Click to start chatting...</p>
                </div>
            `;
            
            contactItem.addEventListener('click', () => {
                // The switchToChat function is defined globally in chat.js
                window.switchToChat(contact);
            });

            contactListElement.appendChild(contactItem);
        });

        // After rendering all contacts, set up the search functionality.
        setupContactSearch();

    } catch (error) {
        console.error('Error rendering contacts:', error);
    }
}