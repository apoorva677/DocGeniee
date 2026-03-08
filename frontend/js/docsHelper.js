/**
 * Helper to save generated/formatted documents to the history
 */
document.addEventListener('DOMContentLoaded', async () => {
    const userData = JSON.parse(sessionStorage.getItem('docgenie_user'));
    if (!userData) return;

    // 1. Initialize Navbar Identity
    const name = userData.name || userData.user_metadata?.full_name || 'User';
    const email = userData.email || '';
    const initial = name.charAt(0).toUpperCase();

    // Update common navbar elements if they exist
    const navAvatar = document.getElementById('navAvatar');
    if (navAvatar) navAvatar.textContent = initial;

    const navDropName = document.getElementById('navDropName');
    if (navDropName) navDropName.textContent = name;

    const navDropEmail = document.getElementById('navDropEmail');
    if (navDropEmail) navDropEmail.textContent = email;

    const welcomeUser = document.getElementById('welcomeUser');
    if (welcomeUser) welcomeUser.textContent = `Welcome back, ${name}`;
    
    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = name;

    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    if (profileAvatarLarge) profileAvatarLarge.textContent = initial;

    // 2. Initialize Preferences from Supabase
    try {
        const res = await fetch('http://localhost:5000/api/profile', {
            headers: { 'x-user-id': userData.id }
        });
        const data = await res.json();
        if (data.success && data.profile) {
            // Apply Compact Mode
            if (data.profile.settings?.compact) {
                document.body.classList.add('compact-mode');
            }
            
            // Override with Supabase Name if different
            if (data.profile.full_name) {
                const sName = data.profile.full_name;
                const sInitial = sName.charAt(0).toUpperCase();
                if (navAvatar) navAvatar.textContent = sInitial;
                if (navDropName) navDropName.textContent = sName;
                
                // If we are on profile page, we might have specific elements there too
                const profileName = document.getElementById('profileName');
                if (profileName) profileName.textContent = sName;
                
                const profileAvatarLarge = document.getElementById('profileAvatarLarge');
                if (profileAvatarLarge) profileAvatarLarge.textContent = sInitial;
            }
        }
    } catch (err) {
        console.error('Error initializing preferences from Supabase:', err);
    }
});

async function saveDocument(content, title, type, source) {
    try {
        const userData = JSON.parse(sessionStorage.getItem('docgenie_user'));
        if (!userData || !userData.id) {
            console.error('Cannot save document: No user session found.');
            return;
        }

        const response = await fetch('http://localhost:5000/api/documents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': userData.id
            },
            body: JSON.stringify({
                userId: userData.id,
                content,
                title: title || 'Untitled Document',
                documentType: type || 'General',
                source: source || 'Generator'
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log('Document saved to history:', data.document.id);
            return data.document;
        } else {
            console.error('Failed to save document:', data.error);
        }
    } catch (err) {
        console.error('Error saving document to history:', err);
    }
}

// Attach to window for global access
window.saveDocument = saveDocument;
