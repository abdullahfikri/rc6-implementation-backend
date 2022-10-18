// rotate right input x, by n bits
const ROR = function (x, n, bits = 32) {
    const mask = BigInt(BigInt(2) ** n - BigInt(1));

    const mask_bits = x & mask;
    let r = (x >> BigInt(n)) | (mask_bits << (BigInt(bits) - BigInt(n)));
    return r;
};

// rotate left input x, by n bits
const ROL = function (x, n, bits = BigInt(32)) {
    const temp = ROR(x, bits - n, BigInt(bits));
    // console.log(temp)
    return temp;
};

/**
 * #convert input sentence into blocks of binary#creates 4 blocks of binary each of 32 bits.
 */
const blockConverter = function (sentence) {
    const encoded = [];
    let res = '';
    for (let i = 0; i < sentence.length; i++) {
        if (i % 4 === 0 && i !== 0) {
            encoded.push(res);
            res = '';
        }
        const unicodeCharAt = sentence.charCodeAt(i);
        let temp = unicodeCharAt.toString(2);
        if (temp.length < 8) {
            temp = temp.padStart(8, '0');
        }
        res = res + temp;
    }
    encoded.push(res);
    return encoded;
};
// console.log(blockConverter('aasdas'));

/**
 * #converts 4 blocks array of long int into string
 */

const deBlocker = function (blocks) {
    let s = '';
    for (const element of blocks) {
        let temp = element.toString(2);
        if (temp.length < 32) {
            temp = temp.padStart(32, '0');
        }
        for (let i = 0; i < 4; i++) {
            s =
                s +
                String.fromCharCode(
                    Number.parseInt(temp.slice(i * 8, (i + 1) * 8), 2)
                );
        }
    }
    return s;
};

// #generate key s[0... 2r+3] from given input string userkey
const generateKey = function (userKey) {
    const r = 12;
    const w = 32;
    const b = userKey.length;
    const modulo = BigInt(Math.pow(2, 32));
    const s = new Array(2 * r + 4).fill(0);
    s[0] = BigInt(0xb7e15163);
    for (let i = 1; i < 2 * r + 4; i++) {
        s[i] = BigInt((s[i - 1] + BigInt(0x9e3779b9)) % BigInt(2 ** w));
    }

    const encoded = blockConverter(userKey);
    const encodeLenght = encoded.length;
    const l = new Array(encodeLenght).fill(0);

    for (let i = 1; i < encodeLenght + 1; i++) {
        l[encodeLenght - i] = BigInt(Number.parseInt(encoded[i - 1], 2));
    }
    const v = 3 * Math.max(encodeLenght, 2 * r + 4);
    let A, B, i, j;
    A = B = i = j = BigInt(0);
    // const tempArr = [...s];
    const tempL = [...l];

    for (let index = 0; index < v; index++) {
        A = s[i] = ROL((s[i] + A + B) % modulo, BigInt(3), BigInt(32));
        B = tempL[j] = ROL(
            (tempL[j] + A + B) % modulo,
            (A + B) % BigInt(32),
            BigInt(32)
        );
        i = (i + BigInt(1)) % BigInt(2 * r + 4);
        j = (j + BigInt(1)) % BigInt(encodeLenght);
    }
    // console.log(s);
    return s;
};

export const encrypt = function (sentence, s) {
    const encoded = blockConverter(sentence);
    // console.log(encoded);
    // const encodeLenght = encoded.length;
    let A = BigInt(Number.parseInt(encoded[0], 2));
    let B = BigInt(Number.parseInt(encoded[1], 2));
    let C = BigInt(Number.parseInt(encoded[2], 2));
    let D = BigInt(Number.parseInt(encoded[3], 2));

    const orgi = [];
    orgi.push(A);
    orgi.push(B);
    orgi.push(C);
    orgi.push(D);
    const r = BigInt(12);
    const w = BigInt(32);
    const modulo = BigInt(2 ** 32);
    const lgw = BigInt(5);
    B = (B + s[0]) % modulo;
    D = (D + s[1]) % modulo;

    for (let i = BigInt(1); i < r + BigInt(1); i++) {
        let t_temp = (B * (BigInt(2) * B + BigInt(1))) % modulo;
        let t = ROL(t_temp, lgw, BigInt(32));
        let u_temp = (D * (BigInt(2) * D + BigInt(1))) % modulo;
        let u = ROL(u_temp, lgw, BigInt(32));
        let tmod = t % BigInt(32);
        let umod = u % BigInt(32);
        A = (ROL(A ^ t, umod, BigInt(32)) + s[BigInt(2) * i]) % modulo;
        C =
            (ROL(C ^ u, tmod, BigInt(32)) + s[BigInt(2) * i + BigInt(1)]) %
            modulo;
        [A, B, C, D] = [B, C, D, A];
    }
    A = (A + s[BigInt(2) * r + BigInt(2)]) % modulo;
    C = (C + s[BigInt(2) * r + BigInt(3)]) % modulo;

    const cipher = [];
    cipher.push(A);
    cipher.push(B);
    cipher.push(C);
    cipher.push(D);
    return { orgi, cipher };
};

const decrypt = function (esentence, s) {
    const encoded = blockConverter(esentence);

    // console.log(encodeLenght);
    let A = BigInt(parseInt(encoded[0], 2));

    let B = BigInt(parseInt(encoded[1], 2));
    let C = BigInt(parseInt(encoded[2], 2));
    let D = BigInt(parseInt(encoded[3], 2));

    const cipher = [];
    cipher.push(A);
    cipher.push(B);
    cipher.push(C);
    cipher.push(D);

    const r = BigInt(12);
    const w = BigInt(32);
    const modulo = BigInt(2 ** 32);
    const lgw = BigInt(5);

    // Get modulo from minus number
    const mod = function (n, m) {
        return ((n % m) + m) % m;
    };

    C = mod(C - s[BigInt(2) * r + BigInt(3)], modulo);
    A = mod(A - s[BigInt(2) * r + BigInt(2)], modulo);
    // console.log(A);

    for (let j = BigInt(1); j < r + BigInt(1); j++) {
        let i = r + BigInt(1) - j;

        [A, B, C, D] = [D, A, B, C];
        let u_temp = mod(D * (BigInt(2) * D + BigInt(1)), modulo);

        let u = ROL(u_temp, lgw, BigInt(32));
        let t_temp = mod(B * (BigInt(2) * B + BigInt(1)), modulo);

        let t = ROL(t_temp, lgw, BigInt(32));
        let tmod = t % BigInt(32);
        let umod = u % BigInt(32);

        C =
            ROR(
                mod(C - s[BigInt(2) * i + BigInt(1)], modulo),
                tmod,
                BigInt(32)
            ) ^ u;
        A = ROR(mod(A - s[BigInt(2) * i], modulo), umod, BigInt(32)) ^ t;
    }
    D = mod(D - s[1], modulo);
    B = mod(B - s[0], modulo);

    const orgi = [];
    orgi.push(A);
    orgi.push(B);
    orgi.push(C);
    orgi.push(D);
    return { cipher, orgi };
};

let key = 'A WORD IS A WORD';
key = key.padEnd(16, ' ');
key = key.slice(0, 16);
const s = generateKey(key);

export const encryptRC6 = function (sentence) {
    sentence = sentence.padEnd(16, ' ');
    const { cipher } = encrypt(sentence, s);
    const esentence = deBlocker(cipher);
    return esentence;
};

export const decryptRC6 = function (esentence) {
    const { orgi } = decrypt(esentence, s);
    const sentence = deBlocker(orgi);
    return sentence;
};
