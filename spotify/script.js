let db;
let editIndex = -1;

// Abrir conexão com IndexedDB
const request = indexedDB.open('musicDatabase', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('musicas')) {
        db.createObjectStore('musicas', { keyPath: 'id', autoIncrement: true });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    exibirMusicas();
};

document.getElementById('musicForm').addEventListener('submit', function(event) {
    event.preventDefault();
    cadastrarMusica();
});

function mostrarMensagem(mensagem, tipo) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = mensagem;
    messageDiv.className = `message ${tipo}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function cadastrarMusica() {
    const title = document.getElementById('title').value.trim();
    const artist = document.getElementById('artist').value.trim();
    const genre = document.getElementById('genre').value.trim();
    const duration = parseInt(document.getElementById('duration').value, 10);
    const audioFile = document.getElementById('audio').files[0];

    const reader = new FileReader();
    reader.onload = function(e) {
        const audioData = e.target.result;

        if (editIndex > -1) {
            editarMusica(title, artist, genre, duration, audioData);
        } else {
            adicionarMusica(title, artist, genre, duration, audioData);
        }

        document.getElementById('musicForm').reset();
    };
    reader.readAsDataURL(audioFile);
}

function adicionarMusica(title, artist, genre, duration, audioData) {
    const transaction = db.transaction(['musicas'], 'readwrite');
    const store = transaction.objectStore('musicas');

    const musica = { title, artist, genre, duration, audio: audioData };
    store.add(musica);

    transaction.oncomplete = function() {
        mostrarMensagem('Música cadastrada com sucesso!', 'success');
        exibirMusicas();
    };
}

function editarMusica(title, artist, genre, duration, audioData) {
    const transaction = db.transaction(['musicas'], 'readwrite');
    const store = transaction.objectStore('musicas');

    const musica = { id: editIndex, title, artist, genre, duration, audio: audioData };
    store.put(musica);

    transaction.oncomplete = function() {
        mostrarMensagem('Música editada com sucesso!', 'success');
        editIndex = -1; // Resetar índice de edição
        exibirMusicas();
    };
}

function exibirMusicas() {
    const transaction = db.transaction(['musicas'], 'readonly');
    const store = transaction.objectStore('musicas');

    const musicList = document.getElementById('musicList');
    musicList.innerHTML = '';

    store.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const musica = cursor.value;

            const li = document.createElement('li');
            li.innerHTML = `Título: ${musica.title}, Artista: ${musica.artist}, Gênero: ${musica.genre}, Duração: ${musica.duration} min`;

            const audioPlayer = document.createElement('audio');
            audioPlayer.className = 'audio-player';
            audioPlayer.controls = true;
            audioPlayer.src = musica.audio;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.className = 'delete-button';
            deleteButton.onclick = () => {
                if (confirm('Tem certeza que deseja excluir esta música?')) {
                    removerMusica(cursor.key);
                }
            };

            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'edit-button';
            editButton.onclick = () => prepararEdicao(cursor.key);

            li.appendChild(audioPlayer);
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            musicList.appendChild(li);

            cursor.continue();
        }
    };
}

function removerMusica(id) {
    const transaction = db.transaction(['musicas'], 'readwrite');
    const store = transaction.objectStore('musicas');
    store.delete(id);

    transaction.oncomplete = function() {
        mostrarMensagem('Música excluída com sucesso!', 'success');
        exibirMusicas();
    };
}

function prepararEdicao(id) {
    const transaction = db.transaction(['musicas'], 'readonly');
    const store = transaction.objectStore('musicas');
    const request = store.get(id);

    request.onsuccess = function() {
        const musica = request.result;
        document.getElementById('title').value = musica.title;
        document.getElementById('artist').value = musica.artist;
        document.getElementById('genre').value = musica.genre;
        document.getElementById('duration').value = musica.duration;
        editIndex = musica.id;
    };
}

function filtrarMusicas() {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const transaction = db.transaction(['musicas'], 'readonly');
    const store = transaction.objectStore('musicas');
    const musicList = document.getElementById('musicList');
    musicList.innerHTML = '';

    store.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const musica = cursor.value;
            if (musica.title.toLowerCase().includes(searchQuery) || musica.artist.toLowerCase().includes(searchQuery)) {
                const li = document.createElement('li');
                li.innerHTML = `Título: ${musica.title}, Artista: ${musica.artist}, Gênero: ${musica.genre}, Duração: ${musica.duration} min`;

                const audioPlayer = document.createElement('audio');
                audioPlayer.className = 'audio-player';
                audioPlayer.controls = true;
                audioPlayer.src = musica.audio;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
                deleteButton.className = 'delete-button';
                deleteButton.onclick = () => {
                    if (confirm('Tem certeza que deseja excluir esta música?')) {
                        removerMusica(cursor.key);
                    }
                };

                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.className = 'edit-button';
                editButton.onclick = () => prepararEdicao(cursor.key);

                li.appendChild(audioPlayer);
                li.appendChild(editButton);
                li.appendChild(deleteButton);
                musicList.appendChild(li);
            }
            cursor.continue();
        }
    };
}

// Carregar músicas ao iniciar a página
document.addEventListener('DOMContentLoaded', exibirMusicas);