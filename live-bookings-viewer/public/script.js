
const socket = io();

const bookingsList = document.getElementById('bookings-list');
const totalBookingsEl = document.getElementById('total-bookings');
const onlineUsersEl = document.getElementById('online-users');
const notificationEl = document.getElementById('notification');
const venueChartEl = document.getElementById('venue-chart');


const venueStats = {};
let totalBookings = 0;
let onlineUsers = 1;

function showNotification(message) {
    notificationEl.textContent = message;
    notificationEl.classList.add('show');
    
    setTimeout(() => {
        notificationEl.classList.remove('show');
    }, 3000);
}


function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'booking-card';
    
    card.innerHTML = `
        <div class="booking-header">
            <span class="venue-name">${booking.venueName}</span>
            <span class="booking-time">${booking.time}</span>
        </div>
        <div class="party-size">
            <i class="fas fa-users"></i>
            <span>Party size: ${booking.partySize} people</span>
        </div>
    `;
    
    return card;
}


function updateVenueChart() {
    const venues = Object.keys(venueStats);
    const counts = Object.values(venueStats);
    
    venueChartEl.innerHTML = '';
    
    if (venues.length === 0) {
        venueChartEl.innerHTML = '<p>No booking data yet</p>';
        return;
    }
    
    const chartContent = document.createElement('div');
    chartContent.className = 'chart-content';
    
    venues.forEach((venue, index) => {
        const venueRow = document.createElement('div');
        venueRow.style.marginBottom = '0.5rem';
        
        const venueName = document.createElement('span');
        venueName.textContent = venue;
        venueName.style.display = 'inline-block';
        venueName.style.width = '120px';
        venueName.style.fontWeight = '500';
        
        const barContainer = document.createElement('div');
        barContainer.style.display = 'inline-block';
        barContainer.style.width = 'calc(100% - 130px)';
        barContainer.style.height = '20px';
        barContainer.style.backgroundColor = '#e9ecef';
        barContainer.style.borderRadius = '4px';
        barContainer.style.overflow = 'hidden';
        
        const bar = document.createElement('div');
        bar.style.height = '100%';
        bar.style.width = `${(counts[index] / Math.max(...counts)) * 100}%`;
        bar.style.backgroundColor = `hsl(${index * 70}, 70%, 50%)`;
        bar.style.transition = 'width 0.5s ease';
        
        const countLabel = document.createElement('span');
        countLabel.textContent = counts[index];
        countLabel.style.marginLeft = '0.5rem';
        countLabel.style.fontSize = '0.8rem';
        countLabel.style.color = '#6c757d';
        
        barContainer.appendChild(bar);
        venueRow.appendChild(venueName);
        venueRow.appendChild(barContainer);
        venueRow.appendChild(countLabel);
        chartContent.appendChild(venueRow);
    });
    
    venueChartEl.appendChild(chartContent);
}


socket.on('initial-bookings', (bookings) => {
    bookingsList.innerHTML = '';
    totalBookings = bookings.length;
    totalBookingsEl.textContent = totalBookings;
    
 
    Object.keys(venueStats).forEach(venue => delete venueStats[venue]);
    

    bookings.forEach(booking => {
        const bookingCard = createBookingCard(booking);
        bookingsList.appendChild(bookingCard);

        venueStats[booking.venueName] = (venueStats[booking.venueName] || 0) + 1;
    });
    
    updateVenueChart();
});


socket.on('new-booking', (booking) => {
    const bookingCard = createBookingCard(booking);
    

    if (bookingsList.firstChild) {
        bookingsList.insertBefore(bookingCard, bookingsList.firstChild);
    } else {
        bookingsList.appendChild(bookingCard);
    }
    

    totalBookings++;
    totalBookingsEl.textContent = totalBookings;

    venueStats[booking.venueName] = (venueStats[booking.venueName] || 0) + 1;
    updateVenueChart();
    

    showNotification(`New booking at ${booking.venueName} for ${booking.partySize} people`);
});
socket.on('users-count', (count) => {
    onlineUsers = count;
    onlineUsersEl.textContent = onlineUsers;
});


venueChartEl.innerHTML = '<p>Waiting for booking data...</p>';