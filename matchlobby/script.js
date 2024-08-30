const userName = "Notth3dev"; // 실제 사용자 이름

const score =220000; // 점수(티어 계산용)
const playerLevel = 7;
//////// shaketoyale용
let playerCount = 88;
let remainingTime = 31; 

//게임 상태 추적
let isInQueue = false; 
let currentGameName = ''; 

function showContent(sectionId, event) {
    // Hide all content items
    let contentItems = document.querySelectorAll('.content-item');
    contentItems.forEach(item => {
        item.classList.remove('active');
        item.style.display = 'none'; // Hide all sections
    });

    // Remove 'selected' class from all tab items
    let tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
        item.classList.remove('selected');
    });

    // Show the selected content item
    let selectedContent = document.getElementById(sectionId);
    if (selectedContent) {
        selectedContent.style.display = 'block';
        setTimeout(() => {
            selectedContent.classList.add('active');
        }, 10);
    }

    // Highlight the selected tab item
    let selectedItem = event.target;
    selectedItem.classList.add('selected');
}

document.addEventListener('DOMContentLoaded', () => {
    // Example: Automatically select the first tab on page load
    const firstTab = document.querySelector('.tab-item');
    if (firstTab) {
        firstTab.click(); // Trigger click on the first tab to load the content and apply styles
    }
    let contentItems = document.querySelectorAll('.content-item');
    contentItems.forEach(item => {
        item.classList.remove('active');
        item.style.display = 'none'; 
    });

    let tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
        item.classList.remove('selected');
    });

    let selectedContent = document.getElementById(sectionId);
    selectedContent.style.display = 'block'; 
    setTimeout(() => {
        selectedContent.classList.add('active');
    }, 10);

    let selectedItem = document.querySelector(`[onclick="showContentByGameName('${gameName}')"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');

        // Scroll adjustment to bring the selected tab into view
        const tabContainer = document.querySelector('.tab-container');
        const itemOffsetLeft = selectedItem.offsetLeft;
        const itemWidth = selectedItem.offsetWidth;
        const containerWidth = tabContainer.offsetWidth;

        const scrollPosition = itemOffsetLeft - (containerWidth / 2) + (itemWidth / 2);

        tabContainer.scroll({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }
});

//지금 들어와있는 게임 표시

document.addEventListener('DOMContentLoaded', () => {
    // Add a click event listener to all buttons with the class 'startbtn'
    document.addEventListener('click', function(event) {
        // Check if the clicked element is inside a button with the class 'startbtn'
        if (event.target.closest('.startbtn')) {
            // Get the button element
            const button = event.target.closest('.startbtn');
            // Get the value of the data-game attribute
            const gameName = button.getAttribute('data-game');
            // Log the game name and a message to the console
            console.log(`Button clicked: ${gameName}`);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    let userStatus = '';  // Variable to store the user's status
    let gameStartTime = null;  // Variable to store the time when the game was selected
    let elapsedTimeInterval = null;  // Variable to store the interval ID
    let isInQueue = false;  // Variable to track if the user is in a queue
    let currentGame = '';  // Variable to track the current game name
    const overlay = document.getElementById('overlay');  // Overlay element

    const gameSectionMap = {
        'Shake Royale': 'snakeRoyale',
        'Speedrun': 'speedrun',
        'Ranked Match': 'rankedMatch',
        'Quick Play': 'quickPlay',
        'Casual Play': 'casualPlay',
        'Custom Match': 'customMatch'
    };

    document.addEventListener('click', function(event) {
        if (event.target.closest('.startbtn')) {
            const button = event.target.closest('.startbtn');
            const gameName = button.getAttribute('data-game');

            if (gameName) {
                if (!isInQueue) {
                    userStatus = `joined ${gameName}`;
                    currentGame = gameName;  // Set the current game
                    updateGameStatus(gameName);
                    sendStatusToBackend('join', gameName);
                    isInQueue = true;

                    // Change button text to "Leave Queue"
                    button.querySelector('.text-container').textContent = 'Leave Queue';

                    // Start tracking the time since the game was selected
                    gameStartTime = new Date();
                    if (elapsedTimeInterval) {
                        clearInterval(elapsedTimeInterval);  // Clear any existing interval
                    }
                    elapsedTimeInterval = setInterval(() => {
                        updateElapsedTime(gameStartTime);
                    }, 1000);

                    // Show the overlay to prevent interaction with other elements
                    overlay.style.display = 'block';
                } else {
                    // If already in a queue, leave the queue
                    leaveQueue(button);
                }
            }
        }
    });

    function updateGameStatus(gameName) {
        const gameStatusElement = document.getElementById('game-status');
        const gameNameElement = document.getElementById('game-name');

        if (gameStatusElement && gameNameElement) {
            gameStatusElement.textContent = 'joined';
            gameNameElement.textContent = `${gameName} (0s)`;
            gameStatusElement.parentElement.style.display = 'inline';  // Show the status
        }
    }

    function updateElapsedTime(startTime) {
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        const gameNameElement = document.getElementById('game-name');

        if (gameNameElement) {
            gameNameElement.textContent = gameNameElement.textContent.split(' (')[0] + ` (${elapsedSeconds}s)`;
        }
    }

    function leaveQueue(button) {
        clearInterval(elapsedTimeInterval);  // Stop updating the elapsed time
        isInQueue = false;
        userStatus = '';  // Reset user status
        currentGame = '';  // Reset current game

        // Hide the game status display
        const gameStatusElement = document.getElementById('game-status').parentElement;
        if (gameStatusElement) {
            gameStatusElement.style.display = 'none';
        }

        // Change button text back to "SHAKE IT!"
        if (button) {
            button.querySelector('.text-container').textContent = 'SHAKE IT!';
        }

        // Hide the overlay to allow interaction with other elements
        overlay.style.display = 'none';

        sendStatusToBackend('leave', '');  // Notify backend that the user has left the queue
    }

    function sendStatusToBackend(action, gameName) {
        fetch('ender dragon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                game: gameName,
                userStatus: userStatus
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(`Status ${action} sent to backend for ${gameName}:`, data);
        })
        .catch(error => {
            console.error('Error sending status to backend:', error);
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {
    

    // Select all elements with the class userlv
    const userlvElements = document.querySelectorAll('.userlv');

    console.log('Found elements:', userlvElements.length); // Debug: number of elements found

    if (userlvElements.length > 0) {
        // Format the level to always have two digits
        const formattedLevel = playerLevel < 10 ? `0${playerLevel}` : `${playerLevel}`;

        userlvElements.forEach((element, index) => {
            console.log(`Updating element ${index + 1}`); // Debug: which element is being updated
            element.textContent = formattedLevel;
        });
    } else {
        console.error('No userlv elements found.');
    }
});





document.addEventListener('DOMContentLoaded', () => {
    // Example usage - assuming these elements are updated somewhere before calling this function
    const currentLevelElement = document.getElementById('current-level');
    const levelMaxElement = document.getElementById('level-max');

    // Update the progress bar fill after DOM is fully loaded and elements are available
    setProgressBarWidth(currentLevelElement, levelMaxElement);
});

function setProgressBarWidth(currentLevelElement, levelMaxElement) {
    const progressBarFillElement = document.querySelector('.progress-bar-fill');

    // Ensure the elements exist and contain valid numbers
    if (progressBarFillElement && currentLevelElement && levelMaxElement) {
        const currentLevel = parseInt(currentLevelElement.textContent, 10);
        const levelMax = parseInt(levelMaxElement.textContent, 10);

        if (!isNaN(currentLevel) && !isNaN(levelMax) && levelMax > 0) {
            // Calculate the percentage
            const progressPercentage = (currentLevel / levelMax) * 100;

            // Set the width of the progress bar fill based on the percentage
            progressBarFillElement.style.width = `${progressPercentage}%`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.querySelector('.username');

    if (usernameElement) {
        usernameElement.textContent = userName; // 텍스트 내용을 사용자 이름으로 변경
    }
    
    // Elements
    const rankedTierElement = document.querySelector('.ranked-tier');
    const highlightTierElement = document.querySelector('.highlight-tier');
    const currentLevelElement = document.getElementById('current-level');
    const levelMaxElement = document.getElementById('level-max');
    const root = document.documentElement;

    let tierName = '';
    let tierAbbreviation = '';
    let tierLevel = '';
    let tierColor = '';
    let userCurrentExp = 0;
    let maxExpForLevel = 0;

    // Define tier thresholds and experience points for each level with full tier names
    const tierMap = {
        bronze: { threshold: 0, levels: [1000, 2000, 3000, 4000, 5000] },       // Total: 15000
        silver: { threshold: 15000, levels: [1500, 2500, 3500, 4500, 5500] },   // Total: 32500
        gold: { threshold: 32500, levels: [2000, 3000, 4000, 5000, 6000] },     // Total: 52500
        platinum: { threshold: 52500, levels: [2500, 3500, 4500, 5500, 6500] }, // Total: 77500
        diamond: { threshold: 77500, levels: [3000, 4000, 5000, 6000, 7000] },  // Total: 107500
        emerald: { threshold: 107500, levels: [3500, 4500, 5500, 6500, 7500] }, // Total: 147500
        conqueror: { threshold: 147500, levels: [4000, 5000, 6000, 7000, 8000] }, // Total: 192500
        lumen: { threshold: 192500, levels: [4500, 5500, 6500, 7500, 8500] },   // Total: 247500
    };

    // Determine the user's tier and level
    for (const [tier, data] of Object.entries(tierMap)) {
        if (score >= data.threshold) {
            tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
            tierAbbreviation = tierName.charAt(0).toUpperCase();

            // Calculate which level within this tier
            let tierScore = score - data.threshold;
            for (let i = 0; i < data.levels.length; i++) {
                if (tierScore < data.levels[i]) {
                    tierLevel = i + 1;
                    userCurrentExp = tierScore;
                    maxExpForLevel = data.levels[i];
                    break;
                }
                tierScore -= data.levels[i];
            }

            // Set the appropriate tier color
            switch (tier) {
                case 'bronze':
                    tierColor = 'var(--tier_bronze)';
                    break;
                case 'silver':
                    tierColor = 'var(--tier_silver)';
                    break;
                case 'gold':
                    tierColor = 'var(--tier_gold)';
                    break;
                case 'platinum':
                    tierColor = 'var(--tier_platinum)';
                    break;
                case 'diamond':
                    tierColor = 'var(--tier_diamond)';
                    break;
                case 'emerald':
                    tierColor = 'var(--tier_emerald)';
                    break;
                case 'conqueror':
                    tierColor = 'var(--tier_conqueror)';
                    break;
                case 'lumen':
                    tierColor = 'var(--tier_lumen)';
                    break;
            }
        }
    }

    // Convert level to Roman numeral
    switch (tierLevel) {
        case 1:
            tierLevel = 'I';
            break;
        case 2:
            tierLevel = 'II';
            break;
        case 3:
            tierLevel = 'III';
            break;
        case 4:
            tierLevel = 'IV';
            break;
        case 5:
            tierLevel = 'V';
            break;
        default:
            tierLevel = '';
            break;
    }

    // Update the ranked tier element text
    rankedTierElement.textContent = `${tierName} ${tierLevel}`;

    // Update the highlight-tier span with abbreviation and level
    highlightTierElement.textContent = `${tierAbbreviation}${tierLevel}`;

    // Update the current level and max level experience
    currentLevelElement.textContent = userCurrentExp;
    levelMaxElement.textContent = maxExpForLevel;


    root.style.setProperty('--user_tier', tierColor);

    const progressTitleElement = document.querySelector('.progress-title'); 
    const leagueThresholds = [
            0, 16500, 33000, 49500, 66000, 82500, 99000, 115500, 
            132000, 148500, 165000, 181500, 198000, 214500, 231000, 247500
        ];
    
        // Determine the user's League level
        for (let i = 0; i < leagueThresholds.length - 1; i++) {
            if (score >= leagueThresholds[i] && score < leagueThresholds[i + 1]) {
                leagueLevel = i + 1;
                break;
            }
        }
        progressTitleElement.textContent = `League ${leagueLevel}`;
    
});

document.addEventListener('DOMContentLoaded', () => {
    const qstartButton = document.querySelector('.qstartbtn');
    const usernameRoyale = document.querySelector('.username-royale');
    let isInQueue = false;

    qstartButton.addEventListener('click', () => {
        if (!isInQueue) {
            usernameRoyale.textContent = `[Ready] ${userName}`;
            usernameRoyale.style.color = 'green';
            qstartButton.querySelector('.text-container').textContent = "Quit Queue";
            isInQueue = true;
        } else {
            usernameRoyale.textContent = `[Not Ready] ${userName}`;
            usernameRoyale.style.color = 'red';
            qstartButton.querySelector('.text-container').textContent = "SHAKE IT!";
            isInQueue = false;
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Function to handle receiving a "match found" message
    function receiveMatchFoundFromBackend() {
        showMatchFoundOverlay();
    }

    // Show the match found overlay and start the countdown
    function showMatchFoundOverlay() {
        const overlay = document.getElementById('match-found-overlay');
        const countdownTimer = document.getElementById('countdown-timer');
        let countdown = 5;

        overlay.style.display = 'flex'; // Make the overlay visible
        countdownTimer.textContent = countdown; // Set the initial countdown value

        const countdownInterval = setInterval(() => {
            countdown -= 1;
            countdownTimer.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                hideMatchFoundOverlay();
            }
        }, 1000); // Decrease the countdown every second
    }

    // Hide the match found overlay
    function hideMatchFoundOverlay() {
        const overlay = document.getElementById('match-found-overlay');
        overlay.style.display = 'none'; // Hide the overlay
    }

    // Allow triggering the "match found" overlay from the console
    window.triggerMatchFound = function() {
        receiveMatchFoundFromBackend();
    };

    console.log("Type 'triggerMatchFound()' in the console to simulate a match found event.");
});

document.addEventListener('DOMContentLoaded', () => {
    const userName = "Notth3dev"; // Replace with the actual username

    // Select all elements with the class 'username'
    const usernameElements = document.querySelectorAll('.username');

    // Update the text content of each username element
    usernameElements.forEach(element => {
        element.textContent = userName;
    });

    // Automatically show the 'ran
});

// After updating current level and max level
document.addEventListener('DOMContentLoaded', () => {
    const currentLevelElement = document.getElementById('current-level');
    const levelMaxElement = document.getElementById('level-max');

    // Set the progress bar width
    setProgressBarWidth(currentLevelElement, levelMaxElement);
});
