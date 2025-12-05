import { User, Transaction } from '../types';

// STORAGE KEYS
const USERS_KEY = 'ech_users';
const TRANSACTIONS_KEY = 'ech_transactions';
const SESSION_KEY = 'ech_session';

// --- HELPERS ---
const getUsers = (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const saveUsers = (users: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const getTransactions = (): Transaction[] => JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
const saveTransactions = (txs: Transaction[]) => localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));

const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to check VIP validity
export const isUserVip = (user: User | null): boolean => {
    if (!user || !user.vipUntil) return false;
    const expireDate = new Date(user.vipUntil);
    return expireDate > new Date();
};

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
        balance: 0, 
        vipUntil: null, // Init as non-VIP
        createdAt: new Date().toISOString(),
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

// --- WALLET & PAYMENT SERVICES ---

export const apiTopUp = async (userId: string, amount: number, method: string): Promise<User> => {
    await mockDelay(1500); 
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) throw new Error("User not found");

    users[userIndex].balance += amount;
    saveUsers(users);

    const tx: Transaction = {
        id: 'tx_' + Date.now(),
        userId,
        type: 'DEPOSIT',
        amount,
        description: `Nạp tiền qua ${method}`,
        status: 'SUCCESS',
        createdAt: new Date().toISOString()
    };
    const txs = getTransactions();
    txs.unshift(tx); 
    saveTransactions(txs);

    localStorage.setItem(SESSION_KEY, JSON.stringify(users[userIndex]));
    return users[userIndex];
};

export const apiDeduct = async (userId: string, amount: number, toolName: string): Promise<User> => {
    await mockDelay(500);
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) throw new Error("User not found");
    
    if (users[userIndex].balance < amount) {
        throw new Error("Số dư không đủ. Vui lòng nạp thêm.");
    }

    users[userIndex].balance -= amount;
    saveUsers(users);

    const tx: Transaction = {
        id: 'tx_' + Date.now(),
        userId,
        type: 'SPEND',
        amount: -amount,
        description: `Sử dụng tool: ${toolName}`,
        status: 'SUCCESS',
        createdAt: new Date().toISOString()
    };
    const txs = getTransactions();
    txs.unshift(tx);
    saveTransactions(txs);

    localStorage.setItem(SESSION_KEY, JSON.stringify(users[userIndex]));
    return users[userIndex];
};

export const apiBuyVip = async (userId: string, days: number, price: number, planName: string): Promise<User> => {
    await mockDelay(1000);
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    const user = users[userIndex];

    if (user.balance < price) {
        throw new Error("Số dư không đủ để đăng ký VIP.");
    }

    // Deduct money
    user.balance -= price;

    // Calculate VIP expiration
    const currentExpiry = user.vipUntil ? new Date(user.vipUntil) : new Date();
    const now = new Date();
    // If current expiry is in the past, start from now. Otherwise add to existing.
    const startDate = currentExpiry > now ? currentExpiry : now;
    
    const newExpiry = new Date(startDate);
    newExpiry.setDate(newExpiry.getDate() + days);
    
    user.vipUntil = newExpiry.toISOString();

    saveUsers(users);

    // Log Transaction
    const tx: Transaction = {
        id: 'tx_vip_' + Date.now(),
        userId,
        type: 'VIP_PURCHASE',
        amount: -price,
        description: `Đăng ký gói VIP: ${planName}`,
        status: 'SUCCESS',
        createdAt: new Date().toISOString()
    };
    const txs = getTransactions();
    txs.unshift(tx);
    saveTransactions(txs);

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
}

export const apiGetTransactions = async (userId: string): Promise<Transaction[]> => {
    await mockDelay(300);
    const txs = getTransactions();
    return txs.filter(t => t.userId === userId);
};