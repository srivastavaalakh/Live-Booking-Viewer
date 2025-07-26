const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


app.use(express.static(path.join(__dirname, '../public')));


let bookings = [];


function generateRandomBooking() {
    const venues = ['Grand Ballroom', 'Ocean View', 'Mountain Lodge', 'City Lights', 'Garden Terrace'];
    const partySizes = [2, 4, 6, 8, 10, 12];
    
    return {
        venueName: venues[Math.floor(Math.random() * venues.length)],
        partySize: partySizes[Math.floor(Math.random() * partySizes.length)],
        time: new Date().toLocaleTimeString()
    };
}


function mockBookingGenerator() {
    const newBooking = generateRandomBooking();
    bookings.unshift(newBooking); 
    io.emit('new-booking', newBooking); 
}


io.on('connection', (socket) => {
    console.log('New client connected');
    

    socket.emit('initial-bookings', bookings);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


setInterval(mockBookingGenerator, 5000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

let connectedClients = 0;


io.on('connection', (socket) => {
    connectedClients++;
    io.emit('users-count', connectedClients);
    console.log(`New client connected (${connectedClients} total)`);
    
    
    socket.emit('initial-bookings', bookings);
    
    socket.on('disconnect', () => {
        connectedClients--;
        io.emit('users-count', connectedClients);
        console.log(`Client disconnected (${connectedClients} remaining)`);
    });
});