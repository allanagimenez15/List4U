import { API_BASE_URL, DEMO_MODE, STORAGE_KEYS } from "./config.js";

const demoListsSeed = [
  {
    id: "demo-1", name: "Compras da Semana", updatedAt: new Date().toISOString(),
    items: [
      { id: "i-1", name: "Arroz", quantity: 5, unit: "kg", price: 28.90, purchased: true },
      { id: "i-2", name: "Leite", quantity: 4, unit: "un", price: 17.60, purchased: true },
      { id: "i-3", name: "Pão de forma", quantity: 1, unit: "un", price: 8.90, purchased: false },
      { id: "i-4", name: "Queijo muçarela", quantity: 300, unit: "g", price: 14.50, purchased: false },
      { id: "i-5", name: "Tomate", quantity: 1, unit: "kg", price: 7.90, purchased: false }
    ],
    participants: [{ id: "owner", name: "Você", email: "usuario@list4u.com", role: "Proprietário" }]
  },
  { id: "demo-2", name: "Churrasco", updatedAt: new Date().toISOString(), items: [], participants: [{ id: "owner", name: "Você", email: "usuario@list4u.com", role: "Proprietário" }] },
  { id: "demo-3", name: "Limpeza da Casa", updatedAt: new Date().toISOString(), items: [], participants: [{ id: "owner", name: "Você", email: "usuario@list4u.com", role: "Proprietário" }] }
];

function readDemoLists() {
  const saved = localStorage.getItem(STORAGE_KEYS.lists);
  if (saved) {
    try { return JSON.parse(saved); } catch { localStorage.removeItem(STORAGE_KEYS.lists); }
  }
  localStorage.setItem(STORAGE_KEYS.lists, JSON.stringify(demoListsSeed));
  return structuredClone(demoListsSeed);
}
function writeDemoLists(lists) {
  localStorage.setItem(STORAGE_KEYS.lists, JSON.stringify(lists));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null"); }
  catch { return null; }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Erro ${response.status}: não foi possível concluir a operação.`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  isDemoMode: DEMO_MODE,

  async login(credentials) {
    if (DEMO_MODE) {
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({
        name: credentials.email.split("@")[0],
        email: credentials.email
      }));

      return getSession();
    }

    const user = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });

    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user));

    return user;
  },

  async register(user) {
    if (DEMO_MODE) {
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({
        name: user.name,
        email: user.email
      }));
      return getSession();
    }

    const newUser = await request("/api/users", {
      method: "POST",
      body: JSON.stringify(user)
    });

    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(newUser));

    return newUser;
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.session);
  },

  async getCurrentUser() {
    return getSession();
  },

  async getLists() {
    if (!DEMO_MODE) {
      const user = getSession();

      if (!user?.id) {
        throw new Error("Usuário não identificado.");
      }

      const lists = await request(`/api/lists?userId=${user.id}`);

      return lists.map(list => ({
        ...list,
        totalItems: 0,
        purchasedItems: 0,
        participantCount: 1
      }));
    }

    return readDemoLists().map(({ id, name, items, participants, updatedAt }) => ({
      id,
      name,
      totalItems: items.length,
      purchasedItems: items.filter(item => item.purchased).length,
      participantCount: participants.length,
      updatedAt
    }));
  },

  async getList(id) {
    if (!DEMO_MODE) {
      const user = getSession();

      if (!user?.id) {
        throw new Error("Usuário não identificado.");
      }

      const lists = await request(`/api/lists?userId=${user.id}`);
      const list = lists.find(item => String(item.id) === String(id));

      if (!list) return null;

      const items = await request(`/api/items?listId=${id}`);

      return {
        ...list,
        items: items.map(item => ({
          ...item,
          purchased: item.isCompleted,
          quantity: 1,
          unit: "un"
        })),
        participants: [{
          id: user.id,
          name: user.name,
          email: user.email,
          role: "Proprietário"
        }]
      };
    }

    return readDemoLists().find(list => list.id === id) || null;
  },

  async createList(name) {
    if (!DEMO_MODE) {
      const user = getSession();

      if (!user?.id) {
        throw new Error("Usuário não identificado.");
      }

      return request("/api/lists", {
        method: "POST",
        body: JSON.stringify({
          name,
          userId: user.id
        })
      });
    }

    const lists = readDemoLists();
    const session = getSession();

    const list = {
      id: crypto.randomUUID(),
      name,
      updatedAt: new Date().toISOString(),
      items: [],
      participants: [{
        id: "owner",
        name: session?.name || "Você",
        email: session?.email || "",
        role: "Proprietário"
      }]
    };

    lists.unshift(list);
    writeDemoLists(lists);

    return list;
  },

  async updateList(id, data) {
    if (!DEMO_MODE) return request(`/api/lists/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) });
    const lists = readDemoLists(); const list = lists.find(item => item.id === id);
    if (!list) throw new Error("Lista não encontrada.");
    Object.assign(list, data, { updatedAt: new Date().toISOString() }); writeDemoLists(lists); return list;
  },

  async deleteList(id) {
    if (!DEMO_MODE) return request(`/api/lists/${encodeURIComponent(id)}`, { method: "DELETE" });
    writeDemoLists(readDemoLists().filter(list => list.id !== id));
  },

  async addItem(listId, itemData) {
    if (!DEMO_MODE) {
      return request("/api/items", {
        method: "POST",
        body: JSON.stringify({
          name: itemData.name,
          price: itemData.price,
          listId: Number(listId)
        })
      });
    }

    const lists = readDemoLists();
    const list = lists.find(item => item.id === listId);

    if (!list) throw new Error("Lista não encontrada.");

    const item = {
      id: crypto.randomUUID(),
      purchased: false,
      ...itemData
    };

    list.items.push(item);
    writeDemoLists(lists);

    return item;
  },

  async updateItem(listId, itemId, changes) {
    if (!DEMO_MODE) {
      if (Object.keys(changes).length === 1 && "purchased" in changes) {
        return request(`/api/items/${encodeURIComponent(itemId)}/completion`, {
          method: "PUT",
          body: JSON.stringify(changes.purchased)
        });
      }

      if ("name" in changes && "price" in changes) {
        return request(`/api/items/${encodeURIComponent(itemId)}`, {
          method: "PUT",
          body: JSON.stringify({
            name: changes.name,
            price: changes.price
          })
        });
      }

      throw new Error("Dados de edição inválidos.");
    }

    const lists = readDemoLists();
    const list = lists.find(item => item.id === listId);
    const item = list?.items.find(entry => entry.id === itemId);

    if (!item) {
      throw new Error("Item não encontrado.");
    }

    Object.assign(item, changes);
    writeDemoLists(lists);

    return item;
  },

  async deleteItem(listId, itemId) {
    if (!DEMO_MODE) return request(`/api/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`, { method: "DELETE" });
    const lists = readDemoLists(); const list = lists.find(item => item.id === listId);
    if (list) list.items = list.items.filter(item => item.id !== itemId);
    writeDemoLists(lists);
  },

  async inviteParticipant(listId, email) {
    if (!DEMO_MODE) {
      // Endpoint futuro: não consta no MVP atual da documentação.
      return request(`/api/lists/${encodeURIComponent(listId)}/participants`, { method: "POST", body: JSON.stringify({ email }) });
    }
    const lists = readDemoLists(); const list = lists.find(item => item.id === listId);
    if (!list) throw new Error("Lista não encontrada.");
    if (list.participants.some(person => person.email.toLowerCase() === email.toLowerCase())) throw new Error("Essa pessoa já está na lista.");
    const participant = { id: crypto.randomUUID(), name: email.split("@")[0], email, role: "Colaborador" };
    list.participants.push(participant); writeDemoLists(lists); return participant;
  },

  async removeParticipant(listId, participantId) {
    if (!DEMO_MODE) {
      return request(`/api/lists/${encodeURIComponent(listId)}/participants/${encodeURIComponent(participantId)}`, { method: "DELETE" });
    }
    const lists = readDemoLists(); const list = lists.find(item => item.id === listId);
    if (list) list.participants = list.participants.filter(person => person.id !== participantId);
    writeDemoLists(lists);
  }
};
