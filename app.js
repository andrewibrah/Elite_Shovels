// Bookings stored in memory
let bookings = [];

// Typewriter effect for hero title
const heroTitle = document.getElementById('heroTitle');
const titleText = 'Keep Your Driveway Snow-Free';
let charIndex = 0;

function typeWriter() {
  if (charIndex < titleText.length) {
    heroTitle.textContent += titleText.charAt(charIndex);
    charIndex++;
    setTimeout(typeWriter, 80);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  typeWriter();
  initializeNavigation();
  animateCounters();
  initializeScrollAnimations();
  loadWeatherData();
  initializeBookingForm();
  setMinDate();
});

// Navigation functionality
function initializeNavigation() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      navMenu.classList.remove('active');
    });
  });
  
  // Sticky navbar
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 4px 16px rgba(26, 58, 82, 0.12)';
    } else {
      navbar.style.boxShadow = '0 2px 8px rgba(26, 58, 82, 0.08)';
    }
  });
}

// Animate counters
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const speed = 50;
  
  const animateCounter = (counter) => {
    const target = +counter.getAttribute('data-target');
    const increment = target / speed;
    let current = 0;
    
    const updateCounter = () => {
      if (current < target) {
        current += increment;
        counter.textContent = Math.ceil(current);
        setTimeout(updateCounter, 30);
      } else {
        counter.textContent = target;
      }
    };
    
    updateCounter();
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

// Scroll animations
function initializeScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animated');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  elements.forEach(element => observer.observe(element));
}

// Weather API integration
const WEATHER_API_KEY = '8ac5c4d57ba6a4b3dfcf622700447b1e';
const LAT = 40.5795;
const LON = -74.1502;

function getWeatherIcon(condition) {
  const icons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️'
  };
  return icons[condition] || '🌤️';
}

function kelvinToFahrenheit(kelvin) {
  return Math.round((kelvin - 273.15) * 9/5 + 32);
}

function metersToMiles(meters) {
  return (meters / 1609.34).toFixed(1);
}

async function loadWeatherData() {
  const loadingEl = document.getElementById('weatherLoading');
  const errorEl = document.getElementById('weatherError');
  const contentEl = document.getElementById('weatherContent');
  
  try {
    // Fetch current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${WEATHER_API_KEY}`
    );
    
    if (!currentResponse.ok) throw new Error('Weather data unavailable');
    
    const currentData = await currentResponse.json();
    
    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${WEATHER_API_KEY}`
    );
    
    if (!forecastResponse.ok) throw new Error('Forecast data unavailable');
    
    const forecastData = await forecastResponse.json();
    
    // Display current weather
    displayCurrentWeather(currentData);
    
    // Display forecast
    displayForecast(forecastData);
    
    // Show content, hide loading
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
    
  } catch (error) {
    console.error('Weather error:', error);
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
  }
}

function displayCurrentWeather(data) {
  const temp = kelvinToFahrenheit(data.main.temp);
  const feelsLike = kelvinToFahrenheit(data.main.feels_like);
  const windSpeed = Math.round(data.wind.speed * 2.237); // m/s to mph
  const visibility = metersToMiles(data.visibility);
  const condition = data.weather[0].main;
  const description = data.weather[0].description;
  
  document.getElementById('currentIcon').textContent = getWeatherIcon(condition);
  document.getElementById('currentTemp').textContent = `${temp}°F`;
  document.getElementById('currentDesc').textContent = description;
  document.getElementById('feelsLike').textContent = `${feelsLike}°F`;
  document.getElementById('windSpeed').textContent = `${windSpeed} mph`;
  document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  document.getElementById('visibility').textContent = `${visibility} mi`;
  
  // Show snow alert if snowing
  if (condition === 'Snow') {
    const alertEl = document.getElementById('snowAlert');
    const messageEl = document.getElementById('alertMessage');
    alertEl.style.display = 'flex';
    messageEl.textContent = `Snow is currently falling in Staten Island! Book your snow removal service now.`;
  }
}

function displayForecast(data) {
  const forecastGrid = document.getElementById('forecastGrid');
  const bestDaysGrid = document.getElementById('bestDaysGrid');
  
  // Get daily forecasts (every 8th item for daily at noon)
  const dailyForecasts = [];
  for (let i = 0; i < data.list.length; i += 8) {
    dailyForecasts.push(data.list[i]);
  }
  
  // Limit to 5 days
  const fiveDays = dailyForecasts.slice(0, 5);
  
  forecastGrid.innerHTML = '';
  bestDaysGrid.innerHTML = '';
  
  fiveDays.forEach((day, index) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const temp = kelvinToFahrenheit(day.main.temp);
    const condition = day.weather[0].main;
    const description = day.weather[0].description;
    const icon = getWeatherIcon(condition);
    
    // Forecast card
    const forecastCard = document.createElement('div');
    forecastCard.className = 'forecast-card';
    forecastCard.innerHTML = `
      <div class="forecast-date">${dayName}</div>
      <div class="forecast-icon">${icon}</div>
      <div class="forecast-temp">${temp}°F</div>
      <div class="forecast-desc">${description}</div>
    `;
    forecastGrid.appendChild(forecastCard);
    
    // Best days recommendation
    let recommendation = '';
    let statusClass = '';
    let statusIcon = '';
    
    if (condition === 'Snow') {
      recommendation = '❄️ Snow Day - Book Now!';
      statusClass = 'bad';
      statusIcon = '⛄';
    } else if (condition === 'Rain' || condition === 'Drizzle') {
      recommendation = '🌧️ Wet Conditions';
      statusClass = 'okay';
      statusIcon = '☔';
    } else if (condition === 'Clear') {
      recommendation = '✅ Perfect Weather';
      statusClass = 'good';
      statusIcon = '☀️';
    } else if (condition === 'Clouds') {
      recommendation = '☁️ Good Day';
      statusClass = 'good';
      statusIcon = '⛅';
    } else {
      recommendation = '⚠️ Check Conditions';
      statusClass = 'okay';
      statusIcon = '🌤️';
    }
    
    const dayCard = document.createElement('div');
    dayCard.className = `day-card ${statusClass}`;
    dayCard.innerHTML = `
      <div class="day-status">${statusIcon}</div>
      <div class="day-name">${dayName}</div>
      <div class="day-recommendation">${recommendation}</div>
    `;
    bestDaysGrid.appendChild(dayCard);
  });
  
  // Check for upcoming snow
  const hasSnow = fiveDays.some(day => day.weather[0].main === 'Snow');
  if (hasSnow) {
    const alertEl = document.getElementById('snowAlert');
    const messageEl = document.getElementById('alertMessage');
    alertEl.style.display = 'flex';
    messageEl.textContent = `Snow is expected in the coming days! Book your service now to secure your spot.`;
  }
}

// Booking form
function setMinDate() {
  const dateInput = document.getElementById('serviceDate');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  dateInput.setAttribute('min', minDate);
}

function initializeBookingForm() {
  const form = document.getElementById('bookingForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      serviceDate: document.getElementById('serviceDate').value,
      duration: document.querySelector('input[name="duration"]:checked').value,
      address: document.getElementById('address').value,
      paymentMethod: document.getElementById('paymentMethod').value,
      specialInstructions: document.getElementById('instructions').value,
      confirmationNumber: generateConfirmationNumber(),
      bookingDate: new Date().toISOString()
    };

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    submitBtn.disabled = true;

    try {
      // Send email confirmation
      const supabaseUrl = 'https://0ec90b57d6e95fcbda198a32f.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-booking-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(formData),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send confirmation email');
      }

      // Store booking in memory
      bookings.push(formData);

      // Log to console
      simulateNotifications(formData);

      // Show confirmation modal
      showConfirmation(formData);

      // Reset form
      form.reset();
    } catch (error) {
      console.error('Booking error:', error);
      alert('There was an issue processing your booking. Please try again or contact us directly.');
    } finally {
      btnText.style.display = 'flex';
      btnLoader.style.display = 'none';
      submitBtn.disabled = false;
    }
  });
}

function generateConfirmationNumber() {
  const prefix = 'SS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

function simulateNotifications(booking) {
  const price = booking.duration === '1' ? '$150' : '$250';
  const emailContent = `
    Booking Confirmation #${booking.confirmationNumber}
    
    Customer: ${booking.name}
    Phone: ${booking.phone}
    Email: ${booking.email}
    
    Service Date: ${booking.serviceDate}
    Duration: ${booking.duration} hour(s)
    Price: ${price}
    
    Address: ${booking.address}
    Payment Method: ${booking.paymentMethod}
    
    Special Instructions: ${booking.instructions || 'None'}
  `;
  
  console.log('📧 Email sent to andrew.ibrahem04@icloud.com:');
  console.log(emailContent);
  
  const smsContent = `Snow Shovel Pro: New booking #${booking.confirmationNumber} - ${booking.name}, ${booking.serviceDate}, ${booking.duration}hr, ${price}. Address: ${booking.address}`;
  
  console.log('📱 SMS sent to 3478548775:');
  console.log(smsContent);
}

function showConfirmation(booking) {
  const modal = document.getElementById('confirmationModal');
  const detailsEl = document.getElementById('confirmationDetails');
  
  const price = booking.duration === '1' ? '$150' : '$250';
  const formattedDate = new Date(booking.serviceDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  detailsEl.innerHTML = `
    <div class="detail-row">
      <strong>Confirmation #:</strong>
      <span>${booking.confirmationNumber}</span>
    </div>
    <div class="detail-row">
      <strong>Name:</strong>
      <span>${booking.name}</span>
    </div>
    <div class="detail-row">
      <strong>Service Date:</strong>
      <span>${formattedDate}</span>
    </div>
    <div class="detail-row">
      <strong>Duration:</strong>
      <span>${booking.duration} Hour(s)</span>
    </div>
    <div class="detail-row">
      <strong>Total Price:</strong>
      <span>${price}</span>
    </div>
    <div class="detail-row">
      <strong>Address:</strong>
      <span>${booking.address}</span>
    </div>
    <div class="detail-row">
      <strong>Payment:</strong>
      <span>${booking.paymentMethod}</span>
    </div>
  `;
  
  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('confirmationModal');
  modal.classList.remove('active');
}

function bookAnother() {
  closeModal();
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
}

// Make functions globally available
window.closeModal = closeModal;
window.bookAnother = bookAnother;