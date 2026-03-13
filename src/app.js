import 'dotenv/config';
import express from 'express';
import __dirname from './utils/utils.js';
import path from 'path';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import { initializeSocket } from './sockets/socket.handler.js';
import mongoose from 'mongoose';
import userRouter from './routes/user.router.js';
import productRouter from './routes/product.router.js';
import cartRouter from './routes/cart.router.js';
import viewsRouter from './routes/views.router.js';
import usersViewRouter from './routes/users.views.router.js';
import sessionsRouter from './routes/sessions.router.js';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import cookieParser from 'cookie-parser';


const app = express();
const viewsPath = path.join(__dirname, '..', 'views');

// 1. Configuración del motor de plantillas Handlebars.
app.engine('handlebars', handlebars.engine());
app.set('views', viewsPath);
app.set('view engine', 'handlebars');


// 2. Configuración de middlewares.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
app.use(cookieParser(process.env.COOKIE_SECRET));


// 3. Inicializamos Passport.
initializePassport();
app.use(passport.initialize());


// 4. Configuración de rutas.
app.use('/', viewsRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', usersViewRouter);
app.use('/api/sessions', sessionsRouter);


// 5. Conexión a MongoDB.
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conexión con éxito a MongoDB!');
    } catch (error) {
        console.error('Error al conectar a MongoDB: ', error);
        process.exit(1);
    }
};
connectMongoDB();


// 6. Configuración del servidor HTTP.
const httpServer = app.listen(process.env.PORT, () => console.log('Escuchando en Puerto: ' + process.env.PORT));


// 7. Configuración de Socket.io.
const io = new Server(httpServer);
initializeSocket(io);
app.set('io', io);