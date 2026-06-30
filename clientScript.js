<script>
		const gameIp = "127.0.0.1"
		const gamePort = 9500
    	const proxyIpAdress = "127.0.0.1"
    	const proxyPort = 8100

		window.RufflePlayer = window.RufflePlayer || {};

		function startRuffle() {
			var ruffle = window.RufflePlayer.newest();
			if (!ruffle) {
				// Ruffle henüz yüklenmedi, 100ms sonra tekrar dene (max 30sn)
				if ((startRuffle._tries = (startRuffle._tries || 0) + 1) < 300) {
					setTimeout(startRuffle, 100);
				} else {
					console.error("Ruffle yüklenemedi, lütfen sayfayı yenileyin.");
				}
				return;
			}
			var player = ruffle.createPlayer();
			var container = document.getElementById("ruffle-container");
			if (!container) return;
			container.appendChild(player);
			player.style.width  = "1000px";
			player.style.height = "600px";
			player.load({
				url: "' . addslashes($swf_url) . '",
				background_color: "#000000",
				quality: "high",
				scale: "exactFit",
				allowScriptAccess: "always",
				splashScreen: false,
				parameters: { editby: "" },
				socketProxy: [
					{
						host: gameIp,
						port: gamePort,
						proxyUrl: "ws://${proxyIpAdress}:${proxyPort}"
					}
				]
			});

			// "Click to Play" butonunu otomatik tıkla
			function autoClickPlay() {
				var shadow = player.shadowRoot;
				if (shadow) {
					var playBtn = shadow.querySelector("#play-button");
					if (playBtn && playBtn.style.display !== "none") {
						playBtn.click();
						return;
					}
				}
				player.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
			}

			// Oyun yüklendikten sonra otomatik başlat
			player.addEventListener("loadeddata", function() {
				setTimeout(autoClickPlay, 200);
			});
			// Yedek: 3 saniye sonra yine dene
			setTimeout(autoClickPlay, 3000);
		}

		// DOM hazır olduğunda başlat
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", startRuffle);
		} else {
			startRuffle();
		}
	</script>';
	exit();
}
