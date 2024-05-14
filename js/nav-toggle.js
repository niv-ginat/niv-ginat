
$(document).ready(function () {
  $('.x-button').on('click', function () {

    $('.animated-icon').toggleClass('open');
  });
});
      

function myFunction() {
    var x = document.getElementById("mobile-menu");
    if (x.style.width === "100%") {
      x.style.width = "0%";
    } else {
      x.style.width = "100%";
    }
  }