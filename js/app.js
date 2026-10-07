document.addEventListener('DOMContentLoaded', function() {
  const stationsList = [
    { name: 'LOFI 24/7', url: 'https://ec3.yesstreaming.net:3755/stream' },
    { name: 'RADIO OXÍGENO', url: 'https://mdstrm.com/audio/5fab0687bcd6c2389ee9480c/icecast.audio' },
    { name: 'RADIO MÁGICA', url: 'https://mdstrm.com/audio/6839e28eb3fdc597ac2e2e43/icecast.audio?property=aiir&_=224873' },
    { name: 'RADIO FIT', url: 'https://node-15.zeno.fm/fb9sp98vc5zuv' },
    { name: 'RADIO FELICIDAD', url: 'https://mdstrm.com/audio/5fad731fcf097a068af3c8f7/icecast.audio' },
    { name: 'RADIO RPP', url: 'https://mdstrm.com/audio/5fab3416b5f9ef165cfab6e9/icecast.audio' },
    { name: 'RADIO EXITOSA', url: 'https://stream.zeno.fm/csy4vzackf9uv' },
    { name: 'LA INOLVIDABLE', url: 'https://27263.live.streamtheworld.com/CRP_LI_SC?csegid=30008&dist=30008' },
    { name: 'PANAMERICANA', url: 'https://mdstrm.com/audio/6598b62dded1380470f4e539/icecast.audio' },
    { name: 'RITMO ROMÁNTICA', url: 'https://23113.live.streamtheworld.com/CRP_RIT_SC?csegid=30008&dist=30008' },
    { name: 'RADIO CORAZÓN', url: 'https://mdstrm.com/audio/5fada514fc16c006bd63370f/icecast.audio' },
    { name: 'Z ROCK & POP', url: 'https://radioz.egostreaming.pe/radio/3e4f6a1b2c3d4e567890abcd/' },
    { name: 'STUDIO 92', url: 'https://gcdn.2mdn.net/videoplayback/id/0751c120d4c7c8a1/itag/345/source/web_video_ads/xpc/EgVovf3BOg%3D%3D/ctier/L/acao/yes/ip/0.0.0.0/ipbits/0/expire/1752812287/sparams/ip,ipbits,expire,id,itag,source,xpc,ctier,acao/signature/36B65E93093AE4B3E88C9C65B223187B837A084D.3E4DFCA2EC3288AF4DF879EDD389CCBEBE88331C/key/ck2/file/file.mp4' },
    { name: 'RADIO DISNEY', url: 'https://26643.live.streamtheworld.com/DISNEY_PER_LM_SC?dist=web-radiodisney-disneylatino' },
    { name: 'RADIO OASIS', url: 'https://stream.zeno.fm/3bhmjhlsl0wvv' },
    { name: 'LAS QUENAS', url: 'https://radio.lnx.pe:7000/stream' },
    { name: 'SALKANTAY', url: 'http://167.114.118.119:7662/stream' },
    { name: 'MEGA STEREO', url: 'https://cast1.my-control-panel.com/proxy/megaestereo/stream' },
    { name: 'COCA RAYMI', url: 'https://stream.zeno.fm/di4yvkfirz0vv' },
    { name: 'ROCK EN ESPAÑOL', url: 'https://stream.zeno.fm/0vgy8qv3feruv' }
  ];

  // Elementos del DOM
  const stationSelect = document.getElementById('station-select');
  const stationsListDesktop = document.getElementById('stations-list-desktop');
  const audioPlayer = document.getElementById('audio-player');
  const audioSource = document.getElementById('audio-source');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const muteBtn = document.getElementById('mute-btn');
  const vinyl = document.getElementById('vinyl');
  const tonearm = document.getElementById('tonearm');
  const vinylText = document.getElementById('vinyl-text');
  const statusText = document.getElementById('status-text');
  const circularTextElement = document.querySelector('.station-circular-text textPath');
  
  // Elementos del modal
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const openInfoBtn = document.getElementById('open-info-btn');
  const footerLinks = document.querySelectorAll('.footer-link');
  const modalTabs = document.querySelectorAll('.modal-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  let isPlaying = false;
  let isMuted = false;
  let currentIndex = -1;
  let previousVolume = 1;

  // 1. Llenar el menú desplegable (Móvil) y la lista (Desktop)
  stationsList.forEach((station, index) => {
    // Opción para el dropdown móvil
    const option = document.createElement('option');
    option.value = station.url;
    option.textContent = station.name;
    option.dataset.index = index;
    stationSelect.appendChild(option);
    
    // Item para la lista desktop
    const stationItem = document.createElement('div');
    stationItem.className = 'station-item';
    stationItem.dataset.index = index;
    stationItem.innerHTML = `
      <i class="fas fa-radio"></i>
      <span>${station.name}</span>
    `;
    stationItem.addEventListener('click', () => {
      currentIndex = index;
      stationSelect.selectedIndex = index + 1;
      loadAndPlay(index);
    });
    stationsListDesktop.appendChild(stationItem);
  });

  // Función para resaltar la estación activa en la lista desktop
  function updateActiveStation(index) {
    document.querySelectorAll('.station-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }

  // 2. Selección de estación desde el dropdown (Móvil)
  stationSelect.addEventListener('change', function() {
    currentIndex = parseInt(this.options[this.selectedIndex].dataset.index);
    loadAndPlay(currentIndex);
  });

  // 3. Botón Anterior
  prevBtn.addEventListener('click', function() {
    if (currentIndex <= 0) {
      currentIndex = stationsList.length - 1;
    } else {
      currentIndex--;
    }
    stationSelect.selectedIndex = currentIndex + 1;
    loadAndPlay(currentIndex);
  });

  // 4. Botón Siguiente
  nextBtn.addEventListener('click', function() {
    if (currentIndex >= stationsList.length - 1) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    stationSelect.selectedIndex = currentIndex + 1;
    loadAndPlay(currentIndex);
  });

  // 5. Botón Play/Pause
  playPauseBtn.addEventListener('click', function() {
    if (currentIndex === -1) return;
    isPlaying ? pauseAudio() : playAudio();
  });

  // 6. Botón Mute
  muteBtn.addEventListener('click', function() {
    if (isMuted) {
      audioPlayer.volume = previousVolume;
      isMuted = false;
      muteBtn.classList.remove('muted');
      muteBtn.querySelector('i').className = 'fas fa-volume-up';
    } else {
      previousVolume = audioPlayer.volume;
      audioPlayer.volume = 0;
      isMuted = true;
      muteBtn.classList.add('muted');
      muteBtn.querySelector('i').className = 'fas fa-volume-mute';
    }
  });

  function loadAndPlay(index) {
    const station = stationsList[index];
    audioSource.src = station.url;
    audioPlayer.load();
    
    const displayName = station.name.length > 14 ? station.name.substring(0, 12) + '...' : station.name;
    vinylText.textContent = displayName;
    
    // Actualizar texto circular
    if (circularTextElement) {
      const circularText = station.name + ' • ' + station.name + ' • ';
      circularTextElement.textContent = circularText;
    }
    
    statusText.textContent = "CARGANDO...";
    statusText.classList.remove('active');
    playPauseBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    
    updateActiveStation(index);
    playAudio();
  }

  function playAudio() {
    audioPlayer.play().then(() => {
      isPlaying = true;
      updateUIState(true);
    }).catch(error => {
      console.error("Error:", error);
      statusText.textContent = "ERROR";
      statusText.classList.remove('active');
    });
  }

  function pauseAudio() {
    audioPlayer.pause();
    isPlaying = false;
    updateUIState(false);
  }

  function updateUIState(playing) {
    const icon = playPauseBtn.querySelector('i');
    if (playing) {
      icon.className = 'fas fa-pause';
      vinyl.classList.add('spinning');
      tonearm.classList.add('playing');
      statusText.textContent = "REPRODUCIENDO";
      statusText.classList.add('active');
    } else {
      icon.className = 'fas fa-play';
      vinyl.classList.remove('spinning');
      tonearm.classList.remove('playing');
      statusText.textContent = "EN PAUSA";
      statusText.classList.remove('active');
    }
  }

  // 7. Lógica del MODAL POPUP
  function openModal(tabName = 'about') {
    modalOverlay.classList.add('active');
    switchTab(tabName);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function switchTab(tabName) {
    modalTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    tabPanels.forEach(p => p.classList.toggle('active', p.id === `tab-${tabName}`));
  }

  openInfoBtn.addEventListener('click', () => openModal('about'));

  footerLinks.forEach(link => {
    link.addEventListener('click', () => {
      openModal(link.dataset.section);
    });
  });

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // 8. Tema
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'dark';
  
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
  });
});
