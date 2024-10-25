document.addEventListener('DOMContentLoaded', function () {
    const playPauseButton = document.getElementById('playButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const audio = new Audio(); // Usar o Audio object
    const progressBar = document.querySelector('.duration-bar');
    const playlist = document.querySelectorAll('.library ul li');
    const albumImage = document.querySelector('.playingmusic img'); 
    let isPlaying = false;
    let currentSongIndex = 0;

    // Função para carregar música atual
    function loadSong(index) {
        const selectedSong = playlist[index];
        const songSrc = selectedSong.getAttribute('data-src');
        const songImg = selectedSong.querySelector('img').src; 
        const songTitle = selectedSong.querySelector('span').textContent;
        audio.src = songSrc;
        audio.load();

        // Atualizar a imagem e o título da música atual no rodapé
        albumImage.src = songImg;
        document.querySelector('.playingmusic span').textContent = songTitle;

        playPauseButton.innerHTML = '<i class="ri-play-fill"></i>';
        isPlaying = false;
    }

    // Iniciar com a primeira música
    loadSong(currentSongIndex);

    // Play/Pause
    playPauseButton.addEventListener('click', function () {
        if (isPlaying) {
            audio.pause();
            playPauseButton.innerHTML = '<i class="ri-play-fill"></i>';
        } else {
            audio.play();
            playPauseButton.innerHTML = '<i class="ri-pause-fill"></i>';
        }
        isPlaying = !isPlaying;
    });

    // Função para atualizar a barra de progresso
    audio.addEventListener('timeupdate', function () {
        const { duration, currentTime } = audio;
        const percent = (currentTime / duration) * 100;
        progressBar.value = percent || 0;
    });

    // Permitir que o usuário ajuste o progresso da música
    progressBar.addEventListener('input', function (event) {
        const { value } = event.target;
        audio.currentTime = (value / 100) * audio.duration;
    });

    // Botão de próximo
    nextButton.addEventListener('click', function () {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(currentSongIndex);
        audio.play();
    });

    // Botão de anterior
    prevButton.addEventListener('click', function () {
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        loadSong(currentSongIndex);
        audio.play();
    });

    // Função para tocar a playlist selecionada
    playlist.forEach((song, index) => {
        song.addEventListener('click', function () {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            audio.play();
        });
    });
});
