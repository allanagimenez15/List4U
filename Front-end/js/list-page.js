import { api } from "./api.js";
import { escapeHtml, formatCurrency, openDialog, closeDialog, requireSession, showError } from "./ui.js";

const user = await api.getCurrentUser();
if (!requireSession(user)) throw new Error("Autenticação necessária.");

const listId = new URLSearchParams(window.location.search).get("id");
if (!listId) window.location.replace("lists.html");
let currentList = null;
let itemToDelete = null;

document.querySelector("#logout-button").addEventListener("click", async () => { await api.logout(); window.location.href = "index.html"; });
document.querySelector("#open-share").addEventListener("click", async () => { await renderParticipants(); openDialog("share-dialog"); });

async function loadList() {
  currentList = await api.getList(listId);
  if (!currentList) { window.location.replace("lists.html"); return; }
  document.title = `${currentList.name} | List4U`;
  document.querySelector("#list-title").textContent = currentList.name;
  document.querySelector("#participant-count").textContent = `${currentList.participants?.length || 1} ${currentList.participants?.length === 1 ? "participante" : "participantes"}`;
  renderItems();
}
function renderItems() {
  const items = currentList.items || [];
  const bought = items.filter(item => item.purchased);
  const pending = items.filter(item => !item.purchased);
  document.querySelector("#items-summary").textContent = `${items.length} ${items.length === 1 ? "item" : "itens"}`;
  document.querySelector("#total-items").textContent = `${items.length} ${items.length === 1 ? "item" : "itens"}`;
  document.querySelector("#purchased-items").textContent = `${bought.length} comprados`;
  document.querySelector("#estimated-total").textContent = formatCurrency(items.reduce((sum, item) => sum + (Number(item.price) || 0), 0));
  document.querySelector("#items-empty").classList.toggle("is-hidden", items.length > 0);
  document.querySelector("#items-container").innerHTML = items.map(item => `
    <article class="item-row">
      <input class="item-check" type="checkbox" data-toggle="${escapeHtml(item.id)}" ${item.purchased ? "checked" : ""} aria-label="Marcar ${escapeHtml(item.name)} como comprado">
      <span class="item-name ${item.purchased ? "is-purchased" : ""}">${escapeHtml(item.name)}</span>
      <span class="item-quantity">${escapeHtml(item.quantity)} ${escapeHtml(item.unit || "un")}</span>
      <span class="item-price">${formatCurrency(item.price)}</span>
      <span class="item-actions">
        <button class="item-action" type="button" data-edit="${escapeHtml(item.id)}" aria-label="Editar item">✎</button>
        <button class="item-action delete" type="button" data-remove="${escapeHtml(item.id)}" aria-label="Remover item">♜</button>
      </span>
    </article>`).join("");
}

document.querySelector("#add-item-form").addEventListener("submit", async event => {
  event.preventDefault();
  showError("item-error");

  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));

  const name = data.name.trim();
  const quantity = Number(data.quantity);
  const price = data.price === "" ? 0 : Number(data.price);

  if (!name || quantity <= 0 || price < 0) {
    return showError("item-error", "Confira o nome, a quantidade e o preço informado.");
  }

  try {
    await api.addItem(listId, { name, quantity, unit: "un", price });

    form.reset();
    form.elements.quantity.value = "1";

    await loadList();
  } catch (error) {
    showError("item-error", error.message);
  }
});

document.querySelector("#items-container").addEventListener("change", async event => {
  const checkbox = event.target.closest("[data-toggle]");
  if (!checkbox) return;
  try { await api.updateItem(listId, checkbox.dataset.toggle, { purchased: checkbox.checked }); await loadList(); }
  catch (error) { alert(error.message); }
});
document.querySelector("#items-container").addEventListener("click", async event => {
  const editButton = event.target.closest("[data-edit]");
  const removeButton = event.target.closest("[data-remove]");
  if (editButton) {
    const item = currentList.items.find(entry => entry.id === editButton.dataset.edit);
    const form = document.querySelector("#edit-item-form");
    form.elements.id.value = item.id; form.elements.name.value = item.name;
    form.elements.quantity.value = item.quantity; form.elements.price.value = item.price ?? "";
    openDialog("edit-item-dialog");
  }
  if (removeButton && confirm("Deseja remover este item da lista?")) {
    try { await api.deleteItem(listId, removeButton.dataset.remove); await loadList(); }
    catch (error) { alert(error.message); }
  }
});
document.querySelector("#edit-item-form").addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  try {
    await api.updateItem(listId, data.id, { name: data.name.trim(), quantity: Number(data.quantity), price: Number(data.price) || 0 });
    closeDialog("edit-item-dialog"); await loadList();
  } catch (error) { alert(error.message); }
});

async function renderParticipants() {
  const people = currentList.participants || [];
  document.querySelector("#share-count").textContent = `${people.length} ${people.length === 1 ? "pessoa" : "pessoas"}`;
  document.querySelector("#participants-list").innerHTML = people.map(person => `
    <li class="participant">
      <span class="avatar">${escapeHtml((person.name || person.email || "?").charAt(0).toUpperCase())}</span>
      <span class="participant-info"><span class="participant-name">${escapeHtml(person.name || person.email)}</span><br><span class="participant-role ${person.role === "Proprietário" ? "role-owner" : ""}">${escapeHtml(person.role || "Colaborador")}</span></span>
      ${person.role === "Proprietário" ? "" : `<button class="remove-participant" type="button" data-remove-person="${escapeHtml(person.id)}" aria-label="Remover participante">⋮</button>`}
    </li>`).join("");
}
document.querySelector("#share-form").addEventListener("submit", async event => {
  event.preventDefault(); showError("share-error");
  const email = new FormData(event.currentTarget).get("email").trim();
  if (!email) return showError("share-error", "Informe um e-mail válido.");
  try {
    await api.inviteParticipant(listId, email);
    event.currentTarget.reset(); await loadList(); await renderParticipants();
  } catch (error) { showError("share-error", error.message); }
});
document.querySelector("#participants-list").addEventListener("click", async event => {
  const button = event.target.closest("[data-remove-person]");
  if (!button || !confirm("Remover esta pessoa da lista?")) return;
  try { await api.removeParticipant(listId, button.dataset.removePerson); await loadList(); await renderParticipants(); }
  catch (error) { alert(error.message); }
});

await loadList();
