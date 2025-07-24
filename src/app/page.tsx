"use client";
import { useRef, useState, useEffect } from "react";

function Home() {
  // Lista de vídeos disponíveis
  const videoList = [
    {
      id: 1,
      title: "Tears of Steel",
      duration: "10:34", // Esta é a duração descritiva
      thumbnail: "https://via.placeholder.com/150x100?text=Big+Buck+Bunny",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    },
    {
      id: 2,
      title: "Elephant Dream",
      duration: "10:53",
      thumbnail: "https://via.placeholder.com/150x100?text=Elephant+Dream",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    },
    {
      id: 3,
      title: "For Bigger Blazes",
      duration: "00:15",
      thumbnail: "https://via.placeholder.com/150x100?text=For+Bigger+Blazes",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      id: 4,
      title: "Sintel",
      duration: "14:48",
      thumbnail: "https://via.placeholder.com/150x100?text=Sintel",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    },
    {
      id: 5,
      title: "Big Buck Bunny",
      duration: "12:14",
      thumbnail: "https://via.placeholder.com/150x100?text=Tears+of+Steel",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
  ];

  const [currentVideo, setCurrentVideo] = useState(videoList[0]);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  // Inicializa duration com 0, ela será atualizada pelo onLoadedMetadata
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const videoRef = useRef(null);

  // useEffect para carregar e iniciar o primeiro vídeo ao montar o componente
  // Este useEffect agora foca em garantir que o vídeo esteja carregado e pronto.
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // Quando o componente monta ou currentVideo muda, recarrega o vídeo
      videoElement.load();

      // Tenta reproduzir se autoPlay estiver ativado
      if (autoPlay) {
        videoElement.play().catch(error => {
          // Captura e exibe erros de autoplay (ex: navegador bloqueia sem interação do usuário)
          console.warn("Erro ao tentar auto-play inicial:", error);
          setPlaying(false); // Se o autoplay falhar, defina playing como false
        });
      }
    }
  }, [currentVideo, autoPlay]); // Adicionado currentVideo como dependência para garantir recarregamento

  // Função para encontrar o próximo vídeo
  const getNextVideo = () => {
    const currentIndex = videoList.findIndex(
      (video) => video.id === currentVideo.id
    );
    const nextIndex = (currentIndex + 1) % videoList.length;
    return videoList[nextIndex];
  };

  // Função para encontrar o vídeo anterior
  const getPreviousVideo = () => {
    const currentIndex = videoList.findIndex(
      (video) => video.id === currentVideo.id
    );
    const previousIndex =
      (currentIndex - 1 + videoList.length) % videoList.length;
    return videoList[previousIndex];
  };

  // Função para tocar o próximo vídeo automaticamente
  const playNextVideo = () => {
    if (autoPlay) {
      const nextVideo = getNextVideo();
      selectVideo(nextVideo);
    }
  };

  // Função para tocar o vídeo anterior
  const playPreviousVideo = () => {
    const prevVideo = getPreviousVideo();
    selectVideo(prevVideo);
  };

  const selectVideo = (video) => {
    setCurrentVideo(video);
    setCurrentTime(0);
    setPlaying(false); // Define como false para o novo vídeo começar pausado (ou o autoplay irá iniciar)
    setDuration(0); // Reseta a duração para 0 enquanto o novo vídeo carrega seus metadados
    setShowPlaylist(false);

    // O useEffect acionará o load() e play() quando currentVideo mudar.
    // Remover o setTimeout e load() daqui para evitar duplicação ou race conditions.
  };

  const configCurrentTime = (time) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const playPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.warn("Erro ao tentar reproduzir:", error);
      });
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration); // Garante que a duração real seja definida
      console.log("Metadados do vídeo carregados. Duração:", video.duration, "segundos");

      // Se o autoPlay estiver ativado e o vídeo não estiver atualmente em reprodução,
      // tenta reproduzi-lo (útil para o carregamento inicial ou seleção manual).
      if (autoPlay && !playing) {
        video.play().then(() => {
          setPlaying(true);
        }).catch(error => {
          console.warn("Erro ao tentar auto-play em loadedmetadata:", error);
          setPlaying(false); // Se o autoplay falhar, defina playing como false
        });
      }
    }
  };

  // Função para detectar quando o vídeo terminou
  const handleVideoEnded = () => {
    setPlaying(false);
    playNextVideo();
  };

  const handleVolumeChange = (newVolume) => {
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);

      if (newVolume > 0 && muted) {
        setMuted(false);
        video.muted = false;
      }

      if (newVolume === 0 && !muted) {
        setMuted(true);
        video.muted = true;
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (muted) {
      video.muted = false;
      setMuted(false);
      const volumeToRestore = previousVolume > 0 ? previousVolume : 0.5;
      video.volume = volumeToRestore;
      setVolume(volumeToRestore);
    } else {
      video.muted = true;
      setMuted(true);
      setPreviousVolume(volume);
    }
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.min(video.duration || 0, video.currentTime + 10);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, video.currentTime - 10);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const increaseVolume = () => {
    const newVolume = Math.min(1, volume + 0.1);
    handleVolumeChange(newVolume);
  };

  const decreaseVolume = () => {
    const newVolume = Math.max(0, volume - 0.1);
    handleVolumeChange(newVolume);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(1, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="w-[100vw] h-[100vh] bg-[hsl(222,64%,34%)] flex justify-center items-center">
      <div className="flex gap-5 w-[60vw] h-[90vh]">
        {/* Player Principal */}
        <div className="w-[76%] h-full bg-[rgba(46,221,163,0.57)] p-4 rounded-lg">
          {/* Título do vídeo atual */}
          <div className="text-white text-xl font-bold mb-2 text-center">
            {currentVideo.title}
          </div>

          <div className="flex justify-center mb-4">
            <video
              ref={videoRef}
              className="w-full h-[60%] bg-black rounded-lg"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={handleVideoEnded}
              controls={false}
              key={currentVideo.id} // Importantíssimo para forçar a remontagem e o evento loadedmetadata ao mudar de vídeo
            >
              <source src={currentVideo.url} type="video/mp4" />
              Seu navegador não suporta vídeo HTML5.
            </video>
          </div>

          {/* Controles do player */}
          <div className="flex justify-center items-center space-x-3 mb-4">
            {/* Botão para vídeo anterior */}
            <button
              onClick={playPreviousVideo}
              className="text-white cursor-pointer text-xl bg-green-700 rounded-full p-2 hover:bg-green-400"
              title="Voltar ao vídeo anterior"
            >
              ⏮️
            </button>

            <button
              onClick={skipBackward}
              className="text-white cursor-pointer text-xl bg-red-700 rounded-full p-2 hover:bg-green-400"
              title="Voltar 10 segundos"
            >
              ⏪
            </button>

            <button
              onClick={() => {
                const video = videoRef.current;
                if (video && !playing) {
                  video.play().catch(error => console.warn("Erro ao tentar play:", error));
                  setPlaying(true);
                }
              }}
              className="text-white cursor-pointer text-xl bg-red-700 rounded-full p-2 hover:bg-green-400"
              disabled={playing}
            >
              ▶️
            </button>

            <button
              onClick={() => {
                const video = videoRef.current;
                if (video && playing) {
                  video.pause();
                  setPlaying(false);
                }
              }}
              className="text-white cursor-pointer text-xl bg-red-700 rounded-full p-2 hover:bg-green-400"
              disabled={!playing}
            >
              ⏸️
            </button>

            <button
              onClick={skipForward}
              className="text-white cursor-pointer text-xl bg-red-700 rounded-full p-2 hover:bg-green-400"
              title="Avançar 10 segundos"
            >
              ⏩
            </button>

            {/* Botão para próximo vídeo */}
            <button
              onClick={() => playNextVideo()}
              className="text-white cursor-pointer text-xl bg-green-700 rounded-full p-2 hover:bg-green-400"
              title="Próximo vídeo"
            >
              ⏭️
            </button>
          </div>

          {/* Slider de progresso - agora atualiza automaticamente */}
          <input
            className="w-full mb-4"
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => configCurrentTime(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, #ff4444 0%, #ff4444 ${(
                currentTime / duration
              ) * 100}%, #333 ${(currentTime / duration) * 100}%, #333 100%)`,
            }}
          />

          {/* Controle de Auto-play */}
          <div className="flex items-center justify-center mb-2">
            <label className="flex items-center text-white cursor-pointer">
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
                className="mr-2"
              />
              Auto-play próximo vídeo
            </label>
          </div>

          {/* Controle de volume */}
          <div className="flex items-center mb-2 space-x-2">
            <button
              onClick={toggleMute}
              className="text-white cursor-pointer text-xl bg-red-700 rounded-full p-2 hover:bg-green-400"
              title={muted ? "Desmutar vídeo" : "Mutar vídeo"}
            >
              {muted ? "🔇" : "🔊"}
            </button>

            <button
              onClick={decreaseVolume}
              className="text-white cursor-pointer text-sm hover:text-gray-300"
              title="Diminuir volume"
            >
              🔉
            </button>

            <input
              className="w-20"
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={muted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              title="Controle de volume"
            />

            <button
              onClick={increaseVolume}
              className="text-white cursor-pointer text-sm hover:text-gray-300"
              title="Aumentar volume"
            >
              🔊
            </button>

            <span className="text-white text-xs">
              {muted ? "0%" : Math.round(volume * 100) + "%"}
            </span>
          </div>

          {/* Indicadores de tempo */}
          <div className="flex justify-between text-sm text-white">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || 0)}</span>
          </div>
        </div>

        {/* Lista de Vídeos */}
        <div className="w-[45%] h-full bg-orange-800 p-5 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white text-lg font-bold">
              Lista de Vídeos - Lenilson
            </h1>
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="text-white bg-gray-700 rounded p-2 hover:bg-gray-600 md:hidden"
            >
              {showPlaylist ? "✕" : "☰"}
            </button>
          </div>

          <div
            className={`space-y-5 ${
              showPlaylist ? "block" : "hidden md:block"
            }`}
          >
            {videoList.map((video) => (
              <div
                key={video.id}
                onClick={() => selectVideo(video)}
                className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-green-700 ${
                  currentVideo.id === video.id ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-20 h-10 object-cover rounded mr-3"
                />
                <div className="flex-1">
                  <div className="text-white text-sm font-semibold">
                    {video.title}
                  </div>
                  <div className="text-gray-300 text-xs">
                    {video.duration}
                  </div>
                </div>
                {currentVideo.id === video.id && (
                  <div className="text-red-400 text-sm">▶</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;