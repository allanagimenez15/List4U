import { api } from "./api.js";
import { escapeHtml, formatCurrency, openDialog, closeDialog, requireSession, showError } from "./ui.js";

const user = await api.getCurrentUser();
if (!requireSession(user)) throw new Error("Autenticação necessária.");

const container = document.querySelector("#lists-container");
const emptyState = document.querySelector("#empty-state");
const dialog = document.querySelector("#new-list-dialog");
const form = document.querySelector("#new-list-form");
let lists = [];
let listToDelete = null;

document.querySelector("#logout-button").addEventListener("click", async () => { await api.logout(); window.location.href = "index.html"; });
["#new-list-button", "#sidebar-new-list", "#empty-new-list"].forEach(selector => {
  document.querySelector(selector).addEventListener("click", () => { form.reset(); showError("new-list-error"); openDialog("new-list-dialog"); });
});

async function loadLists() {
  try {
    lists = await api.getLists();
    renderLists();
  } catch (error) { container.innerHTML = `<p class="form-error">${escapeHtml(error.message)}</p>`; }
}

function renderLists() {
  const query = document.querySelector("#list-search").value.trim().toLowerCase();
  const visible = lists.filter(list => list.name.toLowerCase().includes(query));
  document.querySelector("#list-count").textContent = `${visible.length} ${visible.length === 1 ? "lista" : "listas"}`;
  emptyState.classList.toggle("is-hidden", lists.length > 0);
  container.classList.toggle("is-hidden", lists.length === 0);
  container.innerHTML = visible.map(list => {
    const total = Number(list.totalItems || 0);
    const bought = Number(list.purchasedItems || 0);
    const progress = total ? Math.round((bought / total) * 100) : 0;
    return `<article class="list-card">
      <div class="cart-bubble" aria-hidden="true">🛒</div>
      <a class="list-card-main" href="list.html?id=${encodeURIComponent(list.id)}">
        <h2>${escapeHtml(list.name)}</h2>
        <div class="list-meta">♧ ${Number(list.participantCount || 1)} ${Number(list.participantCount || 1) === 1 ? "participante" : "participantes"}</div>
      </a>
      <div class="progress-area">
        <div class="progress-label"><strong>${total} itens</strong><span>${progress}%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="list-meta">${bought} comprados</div>
      </div>
      <button class="icon-button card-menu" type="button" data-delete="${escapeHtml(list.id)}" aria-label="Excluir ${escapeHtml(list.name)}">⋮</button>
    </article>`;
  }).join("");
  if (visible.length === 0 && lists.length > 0) container.innerHTML = `<p class="muted">Nenhuma lista encontrada.</p>`;
}

document.querySelector("#list-search").addEventListener("input", renderLists);

form.addEventListener("submit", async event => {
  event.preventDefault(); showError("new-list-error");
  const name = new FormData(form).get("name").trim();
  if (!name) return showError("new-list-error", "Informe o nome da lista.");
  try {
    const created = await api.createList(name);
    closeDialog("new-list-dialog");
    window.location.href = `list.html?id=${encodeURIComponent(created.id)}`;
  } catch (error) { showError("new-list-error", error.message); }
});

container.addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  listToDelete = button.dataset.delete;
  const selected = lists.find(list => list.id === listToDelete);
  document.querySelector("#confirm-message").textContent = `A lista "${selected?.name || ""}" e seus itens serão excluídos.`;
  openDialog("confirm-dialog");
});

document.querySelector("#confirm-delete").addEventListener("click", async event => {
  event.preventDefault();
  if (!listToDelete) return;
  try { await api.deleteList(listToDelete); closeDialog("confirm-dialog"); listToDelete = null; await loadLists(); }
  catch (error) { alert(error.message); }
});

await loadLists();
