function handleLogin(event) {
  event.preventDefault();

  const email = login-email.value;
  const pass = login-password.value;

  if (email === "admin@itsm.com" && pass === "123456") {
    sessionStorage.setItem("auth", "true");
    showApp();
  }
}

function logout() {
  sessionStorage.removeItem("auth");
  location.reload();
}