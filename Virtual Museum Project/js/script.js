$(document).ready(function () {
    let totalGrade = 0;
    let slideshowInterval; // Variable to hold the interval ID

    let slides = $(".slide");
    let currentSlide = 0;
    let firstRoundCompleted = false;

    // Function to show a slide
    function showSlide(n) {
        slides.eq(currentSlide).fadeOut("slow", function () {
            $(this).removeClass("active");
            currentSlide = (n + slides.length) % slides.length;
            slides.eq(currentSlide).fadeIn("slow").addClass("active");
        });

        // Check if the first round of slides is completed
        if (!firstRoundCompleted && currentSlide === slides.length - 1) {
            firstRoundCompleted = true;
            $(".quiz-button").fadeIn("slow");
        }
    }

    // Show the first slide initially
    showSlide(0);

    // Function to navigate to the next slide
    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    // Set interval for automatic slideshow (10 seconds)
    slideshowInterval = setInterval(nextSlide, 3000);

    let quizData; // Load quiz data from quiz.json

    // Add click event listener to the quiz button
    $("#quiz-button").click(function () {
        loadQuizData(startQuiz);
    });

    // Function to load quiz data from quiz.json
    function loadQuizData(callback) {
        $.getJSON("../json/quiz.json", function (data) {
            quizData = data;
            console.log("Quiz data loaded:", quizData); // Log the loaded quiz data
            if (callback) callback();
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error loading quiz data:", textStatus, errorThrown);
        });
    }

    // Function to start the quiz
    function startQuiz() {
        console.log("Quiz started!");
        // Hide the slideshow
        slides.hide();
        $(".quiz-button").hide();
        $("main").addClass("quiz-active");
        // Stop the automatic slideshow timer
        clearInterval(slideshowInterval);
        // Initialize total points earned
        totalGrade = 0;
        // Load the first question
        showQuestion(0);
    }

    // Function to show a question
    function showQuestion(index) {
        console.log("Showing question:", index);
        let questionData = quizData.questions[index];

        // Display question, grade, and options
        let questionHtml = `
        <div class="question">${questionData.question}</div>
        <div class="grade">Points: ${questionData.grade}</div>
        <ul class="options">
    `;
        questionData.options.forEach((option, i) => {
            questionHtml += `<li data-index="${i}">${option}</li>`;
        });
        questionHtml += `</ul>`;
        $("#quiz-container").html(questionHtml);

        // Add click event listener to options
        $(".options li").click(function () {
            let selectedOptionIndex = $(this).data("index");
            let correctOptionIndex = questionData.options.indexOf(questionData.correct_answer);
            let isCorrect = selectedOptionIndex === correctOptionIndex;

            // Provide feedback on user's choice
            $(".options li").removeClass("selected");
            $(this).addClass("selected");

            // Provide feedback on user's choice
            if (isCorrect) {
                $(this).addClass("correct");
                $(this).append("<span class='feedback'> &#8592; Correct!</span>");
                totalGrade += questionData.reward; // Add reward for correct answer
            } else {
                $(this).addClass("incorrect");
                $(".options li").eq(correctOptionIndex).addClass("correct");
                $(this).append("<span class='feedback'> &#8592; Incorrect!</span>");
            }

            // Load next question or show results
            if (index < quizData.questions.length - 1) {
                setTimeout(function () {
                    showQuestion(index + 1);
                }, 2000); // Transition delay
            } else {
                setTimeout(function () {
                    showResults();
                }, 2000); // Transition delay
            }
        });
    }

    // Function to show quiz results
    function showResults() {
        console.log("Showing results...");
        // Display the total points earned
        let resultsHtml = `<div class="results">Your total points: ${totalGrade}</div>`;
        resultsHtml += `<button class="go-back-button">Go Back</button>`;
        $("#quiz-container").html(resultsHtml);

        // Smoothly make "Go Back" button appear
        $(".go-back-button").fadeIn("slow");

        // Add click event listener to "Go Back" button
        $(".go-back-button").click(function () {
            // Hide quiz results
            $("#quiz-container").empty();

            // Show the slideshow again
            slides.show();
            $(".quiz-button").show();
            $("main").removeClass("quiz-active");
            // Restart the slideshow timer
            slideshowInterval = setInterval(nextSlide, 3000);
            updateFeedbackAndRewards();
        });
    }

    let rewardsData; // Rewards data loaded from JSON file

    // Load rewards data from JSON file
    $.getJSON("rewards.json", function (data) {
        rewardsData = data;
        console.log("Rewards data loaded:", rewardsData); // Log the loaded rewards data
        updateFeedbackAndRewards(); // Call the function to update feedback and rewards
    });

    // Function to update feedback and rewards section
    function updateFeedbackAndRewards() {
        let rewardsHtml = "<h3>Feedback and Rewards System</h3>";
        rewardsHtml += "<p>Total Points Earned: " + totalGrade + "</p>";
        rewardsHtml += "<p>Rewards:</p>";
        rewardsHtml += "<ul>";

        // Iterate through rewards data to check earned rewards
        if (rewardsData) {
            rewardsData.rewards.forEach(reward => {
                if (totalGrade >= reward.threshold) {
                    rewardsHtml += "<li>" + reward.description + "</li>";
                }
            });
        }

        rewardsHtml += "</ul>";
        $(".feedback-rewards").html(rewardsHtml);
    }

    setInterval(updateFeedbackAndRewards, 1000);
});