const encoder = new TextEncoder();
const decoder = new TextDecoder();

let globalDerivedKey = { key: null, password: null, iv: null, salt: null };

function generateRandomString(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('').slice(0, length);
}

async function getDerivedKey(password, iv, salt) {
    if (globalDerivedKey.password === password && globalDerivedKey.key) {
        return globalDerivedKey;
    }

    const useSalt = salt || crypto.getRandomValues(new Uint8Array(16));
    const useIv = iv || crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: useSalt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-CBC', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    globalDerivedKey = {
        key: derivedKey,
        password: password,
        iv: useIv,
        salt: useSalt
    };

    return globalDerivedKey;
}

export async function getEncryptPassword(key = "encryptPass", password = "autoLogin") {
    let encryptPass = await decryptFromLocalStorage(key, password);
    if (!encryptPass) {
        encryptPass = generateRandomString(16);
        await encryptAndSaveToLocalStorage(key, encryptPass, password);
    }
    return encryptPass;
}

export async function encryptAndSaveToLocalStorage(key, data, password) {
    const derivedKey = await getDerivedKey(password);
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: derivedKey.iv },
        derivedKey.key,
        encoder.encode(dataString)
    );

    const result = new Uint8Array(derivedKey.salt.length + derivedKey.iv.length + encryptedData.byteLength);
    result.set(derivedKey.salt, 0);
    result.set(derivedKey.iv, derivedKey.salt.length);
    result.set(new Uint8Array(encryptedData), derivedKey.salt.length + derivedKey.iv.length);

    const base64Data = btoa(String.fromCharCode(...result));
    await chrome.storage.local.set({ [key]: base64Data });
}

export async function decryptFromLocalStorage(key, password) {
    try {
        const result = await chrome.storage.local.get(key);
        const encryptedBase64 = result[key];
        if (!encryptedBase64) return null;

        const binaryString = atob(encryptedBase64);
        const encryptedBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            encryptedBytes[i] = binaryString.charCodeAt(i);
        }

        const salt = encryptedBytes.slice(0, 16);
        const iv = encryptedBytes.slice(16, 32);
        const encryptedData = encryptedBytes.slice(32);

        const derivedKey = await getDerivedKey(password, iv, salt);
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-CBC', iv: iv },
            derivedKey.key,
            encryptedData
        );

        const dataString = decoder.decode(decryptedData);
        try {
            return JSON.parse(dataString);
        } catch {
            return dataString;
        }
    } catch (error) {
        console.error('解密失败:', error);
        return null;
    }
}

export async function getAccountInfoFromStorage(accountKey, passwordKey, password) {
    const account = await decryptFromLocalStorage(accountKey, password);
    const passwd = await decryptFromLocalStorage(passwordKey, password);
    return { account: account || null, password: passwd || null };
}

export async function setAccountInfoToStorage(accountKey, passwordKey, account, passwd, password) {
    await encryptAndSaveToLocalStorage(accountKey, account, password);
    await encryptAndSaveToLocalStorage(passwordKey, passwd, password);
}

export async function deleteAccountInfoFromStorage(accountKey, passwordKey) {
    await chrome.storage.local.remove([accountKey, passwordKey]);
}

export function clearKeyCache() {
    globalDerivedKey = { key: null, password: null, iv: null, salt: null };
}