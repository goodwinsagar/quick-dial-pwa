async function initDB() {
  return await idb.openDB('quick-dial-db', 1, {
    upgrade(db) {
      db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
    }
  });
}

document.addEventListener('DOMContentLoaded', async function () {

const button = document.getElementById('pick-contacts');
const db = await initDB();

button.addEventListener('click', async () => {
  console.log(':: Button clicked');
  if ('contacts' in navigator && 'ContactsManager' in window) {
    try {
      const props = ['name', 'email', 'tel'];
      const opts = { multiple: false };
      const contacts = await navigator.contacts.select(props, opts);
      console.log(contacts);

      const tx = db.transaction('contacts', 'readwrite');
      const store = tx.objectStore('contacts');

      contacts.forEach(contact => {
        store.add({
          name: contact.name?.[0] || '',
          email: contact.email?.[0] || '',
          tel: contact.tel?.[0] || ''
        });
      });

      const allContacts = await store.getAll();
      console.log(':: allContacts',allContacts);      
      await tx.done;
      renderContacts()

    } catch (err) {
      console.error('Error selecting contacts:', err);
    }
  } else {
    alert('Contact Picker API not supported in this browser.');
    console.log('Contact Picker API not supported.');
  }
})


renderContacts()

async function renderContacts(){
const tx = db.transaction('contacts', 'readonly');
const store = tx.objectStore('contacts');
const allContacts = await store.getAll();
console.log(':: allContacts', allContacts);

const list = document.getElementById('contact-list');
list.innerHTML = '';

allContacts.forEach(contact => {
  const li = document.createElement('li');

  const nameSpan = document.createElement('span');
  nameSpan.textContent = contact.name || 'Unknown';

  li.appendChild(nameSpan);
  li.appendChild(document.createTextNode(' - '));

  if (contact.email) {
    const emailSpan = document.createElement('span');
    emailSpan.textContent = contact.email;
    li.appendChild(emailSpan);
    li.appendChild(document.createTextNode(' - '));
  }

  if (contact.tel) {
    const telLink = document.createElement('a');
    telLink.href = `tel:${contact.tel}`;
    telLink.textContent = contact.tel;
    telLink.style.color = 'blue';
    li.appendChild(telLink);
  }

  list.appendChild(li);
  list.appendChild(document.createElement('br'));
});

await tx.done;
}

})

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}


