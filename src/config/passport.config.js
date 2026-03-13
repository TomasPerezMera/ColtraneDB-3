import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import jwt from 'passport-jwt';
import User from '../models/user.model.js';
import { createHash, isValidPassword } from '../utils/utils.js';

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;


// Extractor para cookies.
const cookieExtractor = req => {
    let token = null;
    if (req && req.signedCookies) {
    token = req.signedCookies['currentUser'];
    }
    return token;
};

// Inicializamos Passport y definimos las Estrategias de Login.
const initializePassport = () => {

  // Estrategia REGISTER:
    passport.use('register', new LocalStrategy(
    { passReqToCallback: true, usernameField: 'email' },
    async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return done(null, false, { message: 'El usuario ya existe!' });
            }
            const isAdmin = email === 'adminCoder@coder.com';
            if (isAdmin && password !== 'adminCod3r123') {
                return done(null, false, { message: 'Contraseña de Admin Inválida!' });
            }
            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                role: isAdmin ? 'admin' : 'user'
            };
            const result = await User.create(newUser);
            return done(null, result);
        } catch (error) {
        return done(error);
        }
    }
));
// Credenciales de usuario Admin:
// Email: adminCoder@coder.com
// Password: adminCod3r123


// Estrategia LOGIN:
passport.use('login', new LocalStrategy(
    { usernameField: 'email' },
    async (username, password, done) => {
        try {
        const user = await User.findOne({ email: username });
        if (!user) {
            return done(null, false, { message: 'User not found' });
        }
        const isValid = isValidPassword(user, password);
        if (!isValid) {
            return done(null, false, { message: 'Invalid password' });
        }
        return done(null, user);
        } catch (error) {
        return done(error);
        }
    }
    ));

// Estrategia GITHUB:
passport.use('github', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile._json.email || `${profile.username}@github.com`;
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
            const fullName = profile._json.name || profile.username;
            const nameParts = fullName.split(' ');
            const newUser = {
                first_name: nameParts[0],
                last_name: nameParts.slice(1).join(' ') || '',
                email,
                age: 0,
                password: '',
                githubId: profile.id,
                role: 'user'
            };
        const userDoc = new User(newUser);
        user = await userDoc.save();
        }
        return done(null, user);
    } catch (error) {
        console.error('GitHub auth error:', error);
        return done(error);
        }
    }
));


// Estrategia CURRENT (con JWT):
passport.use('current', new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_SECRET
    },
    async (jwt_payload, done) => {
        try {
        const user = await User.findOne({ id:jwt_payload.id }).lean();
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (error) {
    return done(error);
        }
    }
));

};

export default initializePassport;