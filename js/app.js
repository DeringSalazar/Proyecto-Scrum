window.onload = () => {
  if (sessionStorage.getItem("auth")) {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
  }
};