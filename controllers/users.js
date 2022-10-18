import User from '../models/User.js';
import { encryptRC6, decryptRC6 } from '../helpers/rc6.js';
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const decryptPass = decryptRC6(existingUser.password).trim();

        const isPasswordCorrect = decryptPass === password;

        if (!isPasswordCorrect) {
            return res.status(404).json({ message: 'Password salah' });
        }

        res.status(200).json({ user: existingUser });
    } catch (error) {
        res.status(500).json({ message: 'Ada sesuatu yang salah' });
    }
};

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User sudah ada.' });
        }

        const passwordEncrypt = encryptRC6(password);

        const result = await User.create({
            name,
            email,
            password: passwordEncrypt,
        });

        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ message: 'Ada sesuatu yang salah' });
    }
};
