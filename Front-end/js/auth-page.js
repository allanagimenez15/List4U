import { api } from "./api.js";
import { showError } from "./ui.js";

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const toggleButton = document.querySelector("#toggle-auth");
const title = document.querySelector("#auth-title");
const subtitle = document.querySelector("#auth-subtitle");
const forgotButton = document.querySelector("#forgot-button");

if (await api.getCurrentUser()) window.location.replace("lists.html");
document.querySelector("#demo-note").classList.toggle("is-hidden", !api.isDemoMode);

let isRegistering = false;
toggleButton.addEventListener("click", () => {
  isRegistering = !isRegistering;
  loginForm.classList.toggle("is-hidden", isRegistering);
  registerForm.classList.toggle("is-hidden", !isRegistering);
  forgotButton.classList.toggle("is-hidden", isRegistering);
  title.textContent = isRegistering ? "Crie sua conta" : "Entrar na sua conta";
  subtitle.textContent = isRegistering ? "Cadastre-se para começar a organizar suas compras." : "Acesse suas listas e organize suas compras.";
  toggleButton.innerHTML = isRegistering ? "Já tenho uma conta" : "<span aria-hidden=\"true\">＋</span> Cadastrar nova conta";
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault(); showError("login-error");
  const data = Object.fromEntries(new FormData(loginForm));
  try { await api.login({ email: data.email, password: data.password }); window.location.href = "lists.html"; }
  catch (error) { showError("login-error", error.message); }
});

registerForm.addEventListener("submit", async event => {
  event.preventDefault(); showError("register-error");
  const data = Object.fromEntries(new FormData(registerForm));
  try {
    await api.register({ name: data.name, email: data.email, password: data.password });
    window.location.href = "lists.html";
  } catch (error) { showError("register-error", error.message); }
});

forgotButton.addEventListener("click", () => {
  alert("A recuperação de senha será conectada quando o endpoint correspondente estiver disponível na API.");
});
