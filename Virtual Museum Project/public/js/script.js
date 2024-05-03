// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAd9zcVU_cks7DeAgtDDz7lDdzL_iiELko",
    authDomain: "vmps-ram.firebaseapp.com",
    projectId: "vmps-ram",
    storageBucket: "vmps-ram.appspot.com",
    messagingSenderId: "786094840690",
    appId: "1:786094840690:web:7ca5600d3b558a6c295beb",
    measurementId: "G-YQTGBZ4MXC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

$(document).ready(function () {
    let totalGrade = 0;
    let slideshowInterval; // Variable to hold the interval ID

    let slides = $(".slide");
    let currentSlide = 0;
    let firstRoundCompleted = false;

    let rewardsData; // Rewards data loaded from JSON file
    let quizData; // Quiz data loaded from JSON file

    // Function to reveal text letter by letter with typing effect
    function revealTextWithTyping($element) {
        let text = $element.text();
        $element.empty(); // Clear the text content

        // Loop through each character in the text
        for (let i = 0; i < text.length; i++) {
            // Create a span element for each character
            let $char = $("<span>").text(text[i]);
            // Append the span element with a delay based on the index
            $char.appendTo($element).hide().delay(50 * i).fadeIn(300);
        }
    }

    // Function to apply typing effect to text in each slide
    function applyTypingEffectToSlides() {
        // Select all slides
        let $slides = $(".slide");

        // Iterate over each slide
        $slides.each(function () {
            let $paragraph = $(this).find("p"); // Get the paragraph element within the slide
            let slideId = $(this).index(); // Get the index of the slide

            // Check if the typing effect has already been applied to this slide
            if (!$(this).hasClass("typing-effect-applied")) {
                // Apply the typing effect to the paragraph element
                revealTextWithTyping($paragraph);
                // Add a class to indicate that the typing effect has been applied
                $(this).addClass("typing-effect-applied");
            }
        });
    }

    // Load rewards data from JSON file
    $.getJSON("../json/rewards.json", function (data) {
        rewardsData = data;
        console.log("Rewards data loaded:", rewardsData); // Log the loaded rewards data
        updateFeedbackAndRewards(); // Call the function to update feedback and rewards
    });

    // Load quiz data from JSON file
    $.getJSON("../json/quiz.json", function (data) {
        quizData = data;
        console.log("Quiz data loaded:", quizData); // Log the loaded quiz data
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error("Error loading quiz data:", textStatus, errorThrown);
    });

    // Function to show a slide
    function showSlide(n) {
        slides.eq(currentSlide).fadeOut("slow", function () {
            $(this).removeClass("active");
            currentSlide = (n + slides.length) % slides.length;
            slides.eq(currentSlide).fadeIn("slow").addClass("active");

            // Apply typing effect after slide transition
            applyTypingEffectToSlides();
        });

        // Check if the first round of slides is completed
        if (!firstRoundCompleted && currentSlide === slides.length - 1) {
            firstRoundCompleted = true;
            $(".quiz-button").fadeIn("slow");
        }
    }

    // Show the first slide initially
    showSlide(0);
    applyTypingEffectToSlides();

    // Function to navigate to the next slide
    function nextSlide() {
        showSlide(currentSlide + 1);
        setTimeout(applyTypingEffectToSlides, 500); // Apply typing effect after slide transition (adjust timing as needed)
    }

    // Set interval for automatic slideshow (10 seconds)
    slideshowInterval = setInterval(nextSlide, 10000);

    // Add click event listener to the quiz button
    $("#quiz-button").click(function () {
        startQuiz();
    });

    // Function to start the quiz
    function startQuiz() {
        console.log("Quiz started!");
        // Hide the slideshow
        clearInterval(slideshowInterval);
        slides.hide();
        $(".quiz-button").hide();
        $("main").addClass("quiz-active");
        // Stop the automatic slideshow timer
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
        <div class="grade">Points: ${questionData.points}</div>
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
                totalGrade += questionData.points; // Add points for correct answer
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
        let resultsHtml = `<div class="results">Your total points: ${totalGrade} out of 100</div>`;
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
            slideshowInterval = setInterval(nextSlide, 10000);
            updateFeedbackAndRewards();
        });
    }

    // Function to update feedback and rewards section
    function updateFeedbackAndRewards() {
        let rewardsHtml = "<h3>Feedback and Rewards System</h3>";
        rewardsHtml += "<p>Total Points Earned: " + totalGrade + "</p>";
        rewardsHtml += "<p>Rewards:</p>";
        rewardsHtml += "<ul>";

        // Iterate through rewards data to check earned rewards
        if (rewardsData) {
            rewardsData.rewards.forEach(reward => {
                if (totalGrade >= reward.points) {
                    rewardsHtml += `<li>${reward.emoji} ${reward.name} (${reward.description})</li>`;
                }
            });
        }
        rewardsHtml += "</ul>";
        $(".feedback-rewards").html(rewardsHtml);
    }

    setInterval(updateFeedbackAndRewards, 1000);
});