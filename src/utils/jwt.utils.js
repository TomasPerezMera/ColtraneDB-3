import jwt from 'jsonwebtoken';

// Generamos Token JWT.
export const generateToken = (user) => {
    const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Verificamos Token JWT.
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};