import { User } from '../types';

// STORAGE KEYS
const USERS_KEY = 'ech_users';
const SESSION_KEY = 'ech_session';

// --- HELPERS ---
const getUsers = (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const saveUsers = (users: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// --- AUTH SERVICES ---

export const apiLogin = async (email: string, password: string): Promise<User> => {
    await mockDelay();
    const users = getUsers();
    // In real app: Compare hashed password
    const user = users.find(u => u.email === email && (u as any).password === password);
    
    if (!user) throw new Error("Email hoặc mật khẩu không đúng.");
    
    // Save session
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
};

export const apiRegister = async (email: string, password: string, name: string): Promise<User> => {
    await mockDelay();
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
        throw new Error("Email này đã được sử dụng.");
    }

    const newUser: User = {
        id: 'user_' + Date.now(),
        email,
        name,
        createdAt: new Date().toISOString(),
        balance: 0,
        // In real app: hash password here
        ...({ password } as any) 
    };

    users.push(newUser);
    saveUsers(users);
    
    // Auto login after register
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
};

export const apiLogout = async () => {
    localStorage.removeItem(SESSION_KEY);
};

export const apiGetProfile = async (): Promise<User | null> => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    
    const sessionUser = JSON.parse(stored);
    const users = getUsers();
    return users.find(u => u.id === sessionUser.id) || null;
};

export const apiTopUp = async (userId: string, amount: number, method: string): Promise<User> => {
    await mockDelay();
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) throw new Error("User not found");
    
    if (typeof users[userIndex].balance !== 'number') {
        users[userIndex].balance = 0;
    }

    users[userIndex].balance += amount;
    saveUsers(users);
    
    // Update session if it matches
    const sessionUser = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    if (sessionUser && sessionUser.id === userId) {
         localStorage.setItem(SESSION_KEY, JSON.stringify(users[userIndex]));
    }
    
    return users[userIndex];
};

export const apiBuyVip = async (userId: string, durationDays: number, price: number, planName: string): Promise<User> => {
    await mockDelay();
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) throw new Error("User not found");
    
    const user = users[userIndex];
    if ((user.balance || 0) < price) throw new Error("Số dư không đủ");

    user.balance = (user.balance || 0) - price;
    
    const now = new Date();
    const currentExpiry = user.vipExpiry ? new Date(user.vipExpiry) : now;
    // If expired, start from now. If active, add to expiry.
    const startTime = currentExpiry > now ? currentExpiry : now;
    startTime.setDate(startTime.getDate() + durationDays);
    
    user.vipExpiry = startTime.toISOString();
    
    saveUsers(users);
     // Update session
    const sessionUser = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    if (sessionUser && sessionUser.id === userId) {
         localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    
    return user;
};