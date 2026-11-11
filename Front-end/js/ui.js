export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
}
export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
export function openDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog && !dialog.open) dialog.showModal();
}
export function closeDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog?.open) dialog.close();
}
export function showError(id, message = "") {
  const element = document.getElementById(id);
  if (element) element.textContent = message;
}
export function requireSession(user) {
  if (!user) {
    window.location.replace("index.html");
    return false;
  }
  return true;
}
document.addEventListener("click", event => {
  const closeButton = event.target.closest("[data-close]");
  if (closeButton) closeDialog(closeButton.dataset.close);
});
