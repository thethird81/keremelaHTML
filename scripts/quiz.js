var player;

// Function to get URL parameters
function getURLParameter(name) {
    var url = window.location.href;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Get videoId from URL parameters
var videoId = getURLParameter('videoId');

if (!videoId) {
    console.error("Video ID is missing in the URL.");
} else {
    // Initialize YouTube Player API
    function onYouTubeIframeAPIReady() {
        player = new YT.Player('youtube-player', {
            videoId: videoId,
            events: {
                onReady: onPlayerReady
            }
        });
    }

    function onPlayerReady(event) {
        event.target.playVideo();
    }

    (function () {var player;

        // Function to get URL parameters
        function getURLParameter(name) {
            var url = window.location.href;
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(url);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        // Get videoId from URL parameters
        var videoId = getURLParameter('videoId');

        if (!videoId) {
            console.error("Video ID is missing in the URL.");
        } else {
            // Dynamically load the YouTube IFrame API script
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // YouTube API callback
            window.onYouTubeIframeAPIReady = function () {
                player = new YT.Player('youtube-player', {
                    videoId: videoId,
                    events: {
                        onReady: onPlayerReady
                    }
                });
            };

            // Called when the YouTube player is ready
            function onPlayerReady(event) {
                console.log("Player is ready");
                event.target.playVideo();
            }

            (function () {
                var modal = document.getElementById('quizModal');
                var overlay = document.getElementById('overlay');
                var answers = document.getElementsByClassName('answer');
                var quizInterval;

                function showModal() {
                    modal.className = 'active';
                    overlay.className = 'active';
                    if (player && player.pauseVideo) {
                        console.log("Pausing video");
                        player.pauseVideo(); // Pause the video
                    }
                }

                function hideModal() {
                    modal.className = '';
                    overlay.className = '';
                    if (player && player.playVideo) {
                        console.log("Resuming video");
                        player.playVideo(); // Resume the video
                    }
                }

                function resetQuiz() {
                    for (var i = 0; i < answers.length; i++) {
                        answers[i].disabled = false;
                    }
                }

                function startQuizInterval() {
                    clearInterval(quizInterval); // Clear any existing interval
                    quizInterval = setTimeout(function () {
                        showModal();
                        quizInterval = setInterval(showModal, 3000);
                    }, 3000);
                }

                for (var i = 0; i < answers.length; i++) {
                    answers[i].addEventListener('click', function (e) {
                        var isCorrect = e.target.getAttribute('data-correct') === 'true';

                        if (isCorrect) {
                            hideModal();
                            resetQuiz();
                            startQuizInterval();
                        } else {
                            for (var j = 0; j < answers.length; j++) {
                                answers[j].disabled = true;
                            }
                            setTimeout(function () {
                                resetQuiz();
                            }, 5000);
                        }
                    });
                }

                // Start showing the modal after 3 seconds
                startQuizInterval();
            })();
        }

        var modal = document.getElementById('quizModal');
        var overlay = document.getElementById('overlay');
        var answers = document.getElementsByClassName('answer');
        var quizInterval;

        function showModal() {
            modal.className = 'active';
            overlay.className = 'active';
            if (player && player.pauseVideo) {
                player.pauseVideo(); // Pause the video
            }
        }

        function hideModal() {
            modal.className = '';
            overlay.className = '';
            if (player && player.playVideo) {
                player.playVideo(); // Resume the video
            }
        }

        function resetQuiz() {
            for (var i = 0; i < answers.length; i++) {
                answers[i].disabled = false;
            }
        }

        function startQuizInterval() {
            clearInterval(quizInterval); // Clear any existing interval
            quizInterval = setTimeout(function () {
                showModal();
                quizInterval = setInterval(showModal, 3000);
            }, 3000);
        }

        for (var i = 0; i < answers.length; i++) {
            answers[i].addEventListener('click', function (e) {
                var isCorrect = e.target.getAttribute('data-correct') === 'true';

                if (isCorrect) {
                    hideModal();
                    resetQuiz();
                    startQuizInterval();
                } else {
                    for (var j = 0; j < answers.length; j++) {
                        answers[j].disabled = true;
                    }
                    setTimeout(function () {
                        resetQuiz();
                    }, 5000);
                }
            });
        }

        // Start showing the modal after 3 seconds
        startQuizInterval();
    })();
}
