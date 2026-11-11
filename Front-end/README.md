# List4U — Front-end

Interface responsiva em HTML, CSS e JavaScript (ES Modules), organizada por páginas e módulos, preparada para consumir uma API REST em C# com ASP.NET Core e persistência MySQL.

## Estrutura

```text
list4u-frontend/
├── index.html              # Login e cadastro
├── lists.html              # Listagem, criação e exclusão de listas
├── list.html               # Itens de uma lista e modal de compartilhamento
├── assets/
│   └── logo.svg
├── css/
│   └── styles.css
└── js/
    ├── config.js           # URL da API e modo demonstração
    ├── api.js              # Camada única de comunicação / dados de demonstração
    ├── ui.js               # Funções visuais reutilizáveis
    ├── auth-page.js        # Eventos da tela de autenticação
    ├── lists-page.js       # Eventos da tela de listagem
    └── list-page.js        # Eventos da tela de detalhes
```

## Como executar

Os arquivos usam módulos JavaScript. Não abra o HTML diretamente com `file://`.

1. Extraia o ZIP.
2. Abra a pasta no VS Code.
3. Execute com a extensão **Live Server** (por exemplo, botão direito em `index.html` > Open with Live Server).
4. A interface inicia em **modo demonstração** enquanto `API_BASE_URL` estiver vazio.
5. Listas e itens de demonstração ficam no `localStorage` do navegador. Não use dados reais ou senhas reais nesse modo.

## Conectar à API ASP.NET Core

Edite `js/config.js`:

```js
export const API_BASE_URL = "https://localhost:7001";
```

Quando a URL estiver preenchida, o módulo `api.js` passa a usar `fetch` e deixa de usar o armazenamento de demonstração.

### Contrato de endpoints esperado pelo front-end

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Usuário autenticado |
| GET | `/api/lists` | Listar listas do usuário |
| POST | `/api/lists` | Criar lista |
| GET | `/api/lists/{id}` | Consultar lista e itens |
| PATCH | `/api/lists/{id}` | Editar nome da lista |
| DELETE | `/api/lists/{id}` | Excluir lista |
| POST | `/api/lists/{id}/items` | Adicionar item |
| PATCH | `/api/lists/{id}/items/{itemId}` | Editar item / situação |
| DELETE | `/api/lists/{id}/items/{itemId}` | Remover item |

O front-end espera respostas JSON. Em erros, a API pode retornar `{ "message": "Descrição do erro" }`.

### Exemplo de payloads

Cadastro:
```json
{ "name": "Allana", "email": "allana@example.com", "password": "senha-fornecida-pelo-usuario" }
```

Login:
```json
{ "email": "allana@example.com", "password": "senha-fornecida-pelo-usuario" }
```

Criar lista:
```json
{ "name": "Compras da semana" }
```

Adicionar item:
```json
{ "name": "Leite", "quantity": 2, "unit": "un", "price": 5.5 }
```

A resposta de `GET /api/lists/{id}` deve conter, no mínimo:
```json
{
  "id": "identificador",
  "name": "Compras da semana",
  "items": [
    { "id": "item-id", "name": "Leite", "quantity": 2, "unit": "un", "price": 5.5, "purchased": false }
  ],
  "participants": [
    { "id": "user-id", "name": "Nome do usuário", "email": "email@example.com", "role": "Proprietário" }
  ]
}
```

## Atenção ao escopo documentado

A documentação atual do List4U define o MVP como uso individual e exclui compartilhamento familiar. Por isso, o modal de compartilhamento está incluído como **protótipo visual/demonstrativo**, mas os endpoints de participantes são futuros e não fazem parte do contrato obrigatório do MVP. Antes de implementar colaboração real, atualize RF, RN, casos de uso, diagrama de classes e regras de autorização.

A documentação também exige API em C# com ASP.NET Core Web API e banco MySQL. Este pacote contém somente o front-end; não cria a API nem o banco.

## Segurança e integração

- Em produção, prefira autenticação com cookie `HttpOnly`, `Secure` e `SameSite` adequado. O front-end envia `credentials: "include"`.
- Configure CORS no ASP.NET Core para permitir a origem do front-end e credenciais.
- Nunca armazene senha em `localStorage` ou em texto puro.
- O backend deve validar autorização em cada operação e confirmar que a lista pertence ao usuário autenticado.
- Valide novamente no backend nome, quantidade, preço e demais campos; validação no navegador não é barreira de segurança.
- Use HTTPS fora do ambiente local.
