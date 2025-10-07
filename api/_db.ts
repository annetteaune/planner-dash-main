import { neon } from '@neondatabase/serverless';

// Check if we're in production or have a database URL configured
const databaseUrl = process.env.NEON_DATABASE_URL;
const isDevelopment = !databaseUrl || process.env.NODE_ENV === 'development';

// Export the SQL client (production) or a mock function (development)
export const sql: any = isDevelopment ? createMockSql() : neon(databaseUrl);

export const isUsingMockData = isDevelopment;

// Mock SQL function for local development
function createMockSql() {
  // In-memory storage for development
  const mockData = {
    users: [] as any[],
    todos: [] as any[],
    events: [] as any[],
    _userIdCounter: 1,
    _todoIdCounter: 1,
    _eventIdCounter: 1,
  };

  // Template tag function that mimics neon SQL behavior
  return function mockSql(strings: TemplateStringsArray, ...values: any[]) {
    const query = strings.reduce((acc, str, i) => {
      return acc + str + (values[i] !== undefined ? `$${i + 1}` : '');
    }, '');

    return executeMockQuery(query, values, mockData);
  };
}

function executeMockQuery(query: string, params: any[], mockData: any) {
  const lowerQuery = query.toLowerCase().trim();

  // USERS TABLE QUERIES
  if (lowerQuery.includes('select') && lowerQuery.includes('from users')) {
    if (lowerQuery.includes('where id =')) {
      const id = params[0];
      const user = mockData.users.find((u: any) => u.id === id);
      return user ? [user] : [];
    }
    if (lowerQuery.includes('where email =')) {
      const email = params[0];
      const user = mockData.users.find((u: any) => u.email === email);
      return user ? [user] : [];
    }
  }

  if (lowerQuery.includes('insert into users')) {
    const [name, email, password_hash] = params;
    // Check for duplicate email
    if (mockData.users.some((u: any) => u.email === email)) {
      const error: any = new Error('Unique constraint violation');
      error.code = '23505';
      throw error;
    }
    const newUser = {
      id: String(mockData._userIdCounter++),
      name,
      email,
      password_hash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockData.users.push(newUser);
    return [
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      },
    ];
  }

  if (lowerQuery.includes('update users')) {
    const id = params[params.length - 1];
    const userIndex = mockData.users.findIndex((u: any) => u.id === id);
    if (userIndex === -1) return [];

    const user = mockData.users[userIndex];
    // Update fields based on params (simplified, assumes specific order)
    if (params[0] !== null) user.name = params[0];
    if (params[1] !== null) user.email = params[1];
    if (params[2] !== null) user.password_hash = params[2];
    user.updated_at = new Date().toISOString();

    return [
      {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    ];
  }

  // TODOS TABLE QUERIES
  if (lowerQuery.includes('select') && lowerQuery.includes('from todos')) {
    const user_id = params[0];
    const todos = mockData.todos.filter((t: any) => t.user_id === user_id);
    return todos;
  }

  if (lowerQuery.includes('insert into todos')) {
    const [user_id, text, due_at, priority] = params;
    const newTodo = {
      id: String(mockData._todoIdCounter++),
      user_id,
      text,
      due_at,
      priority,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockData.todos.push(newTodo);
    return [{ id: newTodo.id }];
  }

  if (lowerQuery.includes('update todos')) {
    const completed = params[0];
    const id = params[1];
    const todoIndex = mockData.todos.findIndex((t: any) => t.id === id);
    if (todoIndex === -1) return [];

    mockData.todos[todoIndex].completed = completed;
    mockData.todos[todoIndex].updated_at = new Date().toISOString();
    return [mockData.todos[todoIndex]];
  }

  if (lowerQuery.includes('delete from todos')) {
    const user_id = params[0];
    const deletedTodos = mockData.todos.filter(
      (t: any) => t.user_id === user_id && t.completed
    );
    mockData.todos = mockData.todos.filter(
      (t: any) => !(t.user_id === user_id && t.completed)
    );
    return deletedTodos.map((t: any) => ({ id: t.id }));
  }

  // EVENTS TABLE QUERIES
  if (lowerQuery.includes('select') && lowerQuery.includes('from events')) {
    if (lowerQuery.includes('where id =')) {
      const id = params[0];
      const event = mockData.events.find((e: any) => e.id === id);
      return event ? [event] : [];
    }

    const user_id = params[0];
    let events = mockData.events.filter((e: any) => e.user_id === user_id);

    // Handle date range filtering
    if (params.length > 1 && params[1]) {
      const start_date = params[1];
      events = events.filter((e: any) => e.start_at >= start_date);
    }
    if (params.length > 2 && params[2]) {
      const end_date = params[2];
      events = events.filter((e: any) => e.start_at <= end_date);
    }

    return events;
  }

  if (lowerQuery.includes('insert into events')) {
    const [user_id, title, content, address, start_at, end_at, all_day] =
      params;
    const newEvent = {
      id: String(mockData._eventIdCounter++),
      user_id,
      title,
      content,
      address,
      start_at,
      end_at,
      all_day,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockData.events.push(newEvent);
    return [newEvent];
  }

  if (lowerQuery.includes('update events')) {
    const id = params[params.length - 1];
    const eventIndex = mockData.events.findIndex((e: any) => e.id === id);
    if (eventIndex === -1) return [];

    const event = mockData.events[eventIndex];
    // Update fields (simplified)
    if (params[0] !== null) event.title = params[0];
    if (params[1] !== null) event.content = params[1];
    if (params[2] !== null) event.address = params[2];
    if (params[3] !== null) event.start_at = params[3];
    if (params[4] !== null) event.end_at = params[4];
    if (params[5] !== null) event.all_day = params[5];
    event.updated_at = new Date().toISOString();

    return [event];
  }

  if (lowerQuery.includes('delete from events')) {
    const id = params[0];
    const deletedEvent = mockData.events.find((e: any) => e.id === id);
    if (!deletedEvent) return [];

    mockData.events = mockData.events.filter((e: any) => e.id !== id);
    return [{ id }];
  }

  console.warn('Unhandled mock query:', query);
  return [];
}
