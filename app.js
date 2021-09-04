
const { Client } = require('whatsapp-web.js');
const express = require('express');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one doesn't works in Windows
            '--disable-gpu'
        ],
    }
});

io.on('connection', function (socket) {
    socket.emit('message', 'Menghubungkan...');

    client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit('qr', url);
            socket.emit('message', 'Silakan lakukan scan!');

        });
    });

    client.on('ready', () => {
        socket.emit('ready', 'Whatsapp siap digunakan!');
        socket.emit('message', 'Whatsapp siap digunakan!');
    });

    client.on('authenticated', (session) => {
        socket.emit('authenticated', 'Whatsapp is authenticated!');
        socket.emit('message', 'Whatsapp is authenticated!');
    });

    client.on('auth_failure', function (session) {
        socket.emit('message', 'Auth gagal, menyalakan ulang...');
        socket.emit('auth_failure', 'Auth gagal, menyalakan ulang...');
    });

    client.on('disconnected', (reason) => {
        socket.emit('disconnected', 'Whatsapp terputus!...');
        socket.emit('message', 'Whatsapp terputus!');
        client.destroy();
        client.initialize();
    });

});

client.initialize();

server.listen(port, function () {
    console.log('App running on *: ' + port);
});