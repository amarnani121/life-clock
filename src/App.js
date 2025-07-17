import React, { useState, useEffect } from 'react';

export default function App() {
  const [birthdate, setBirthdate] = useState('');
  const [age, setAge] = useState(null);
  const [bgColor, setBgColor] = useState({ r: 255, g: 200, b: 200 });
  const [timeOfDay, setTimeOfDay] = useState('');
  const [isBirthday, setIsBirthday] = useState(false);
  const [birthdayCountdown, setBirthdayCountdown] = useState(null);
  const [lifeLeft, setLifeLeft] = useState(null);

  // Background color animation
  useEffect(() => {
    const startTime = Date.now();
    
    const animateColor = () => {
      const elapsed = Date.now() - startTime;
      const period = 20000; // 20 seconds for full cycle
      
      const r = Math.floor(128 + 128 * Math.sin(elapsed * 0.001));
      const g = Math.floor(128 + 128 * Math.sin(elapsed * 0.0011));
      const b = Math.floor(128 + 128 * Math.sin(elapsed * 0.0012));
      
      setBgColor({ r, g, b });
      requestAnimationFrame(animateColor);
    };
    
    const animationFrame = requestAnimationFrame(animateColor);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Calculate time of day greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 18) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

  // Calculate age and life metrics when birthdate changes
  useEffect(() => {
    if (!birthdate) return;
    
    const birth = new Date(birthdate);
    const now = new Date();
    
    if (birth > now) {
      setAge(null);
      setIsBirthday(false);
      setBirthdayCountdown(null);
      setLifeLeft(null);
      return;
    }
    
    // Birthday check
    const today = new Date();
    const birthMonth = birth.getMonth();
    const birthDate = birth.getDate();
    
    // Calculate next birthday
    const nextBirthday = new Date(today.getFullYear(), birthMonth, birthDate);
    if (today > nextBirthday) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    
    const diff = now - birth;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let remainingDays = now.getDate() - birth.getDate();
    
    if (remainingDays < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      remainingDays += prevMonth;
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // Life metrics
    const averageLifespan = 70; // Changed to 70 years
    const expectedYears = averageLifespan - years;
    const expectedDays = expectedYears * 365.25;
    
    setLifeLeft({
      years: expectedYears,
      days: Math.floor(expectedDays),
      percent: Math.min((years / averageLifespan) * 100, 100)
    });

    // Heartbeats, breaths, sleep calculations
    const heartbeats = Math.floor(seconds * 1.2); // 72 BPM
    const breaths = Math.floor(seconds * 0.267); // 16 breaths per minute
    const sleepTime = Math.floor(days * 0.33); // 1/3 of life asleep
    
    setAge({
      years,
      months,
      days,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
      total: {
        days,
        hours,
        minutes,
        seconds,
        heartbeats,
        breaths,
        sleepTime
      }
    });

    // Set birthday status
    const isTodayBirthday = 
      today.getMonth() === birthMonth && 
      today.getDate() === birthDate;
    setIsBirthday(isTodayBirthday);

    // Initialize birthday countdown
    const updateBirthdayCountdown = () => {
      const now = new Date();
      const timeDiff = nextBirthday - now;
      
      if (timeDiff <= 0) {
        // If birthday just passed, recalculate for next year
        const newNextBirthday = new Date(nextBirthday.getFullYear() + 1, birthMonth, birthDate);
        setBirthdayCountdown(calculateTimeDiff(newNextBirthday - now));
      } else {
        setBirthdayCountdown(calculateTimeDiff(timeDiff));
      }
    };

    updateBirthdayCountdown();
    
    // Update countdown every second
    const countdownInterval = setInterval(() => {
      updateBirthdayCountdown();
    }, 1000);

    return () => clearInterval(countdownInterval);
    
  }, [birthdate]);

  // Helper function to calculate time difference
  const calculateTimeDiff = (ms) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  };

  // Real-time update for time units
  useEffect(() => {
    if (!age) return;
    
    const interval = setInterval(() => {
      setAge(prev => ({
        ...prev,
        total: {
          ...prev.total,
          seconds: prev.total.seconds + 1,
          minutes: prev.total.seconds === 59 
            ? prev.total.minutes + 1 
            : prev.total.minutes,
          hours: prev.total.minutes === 59 && prev.total.seconds === 59
            ? prev.total.hours + 1
            : prev.total.hours,
          days: prev.total.hours === 23 && prev.total.minutes === 59 && prev.total.seconds === 59
            ? prev.total.days + 1
            : prev.total.days,
          heartbeats: prev.total.heartbeats + 1.2,
          breaths: prev.total.breaths + 0.267,
          sleepTime: Math.floor((prev.total.days * 0.33) + (prev.total.hours / 24 * 0.33))
        },
        seconds: (prev.seconds + 1) % 60,
        minutes: prev.seconds === 59 
          ? (prev.minutes + 1) % 60 
          : prev.minutes,
        hours: prev.minutes === 59 && prev.seconds === 59
          ? (prev.hours + 1) % 24
          : prev.hours
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [age]);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  const formatTime = (time) => {
    if (time >= 365) return `${Math.floor(time / 365)} years ${time % 365} days`;
    if (time >= 30) return `${Math.floor(time / 30)} months ${time % 30} days`;
    return `${time} days`;
  };

  return (
    <div className="min-h-screen transition-all duration-300" 
         style={{ backgroundColor: `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})` }}>
      
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {isBirthday && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-yellow-400 text-red-800 px-6 py-3 rounded-full font-bold shadow-lg flex items-center space-x-2">
              <span>🎉</span>
              <span>Happy Birthday!</span>
              <span>🎂</span>
            </div>
          </div>
        )}
        
        <div className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
          
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
            Life Clock
          </h1>
          
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Good {timeOfDay}! Track the moments that matter.
          </p>
          
          <div className="mb-8">
            <label htmlFor="birthdate" className="block text-gray-700 dark:text-gray-300 mb-2">
              Enter your birthdate:
            </label>
            <input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="space-y-4">
            {!birthdate ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Please select your birthdate to see your life journey
              </p>
            ) : !age ? (
              <p className="text-center text-red-500 dark:text-red-400 py-4">
                Please select a valid past date
              </p>
            ) : (
              <>
                {/* Birthday Countdown */}
                {birthdayCountdown && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    birthdayCountdown.days < 7 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' 
                      : 'bg-gradient-to-r from-blue-400 to-purple-500'
                  } text-white shadow-md`}>
                    <div className="flex items-center justify-center">
                      <span className="text-2xl mr-2">🎂</span>
                      <div className="text-center">
                        <p className="font-bold">
                          Next Birthday in {birthdayCountdown.days} days, {birthdayCountdown.hours} hours, {birthdayCountdown.minutes} minutes!
                        </p>
                      </div>
                      {birthdayCountdown.days < 7 && (
                        <span className={`ml-2 text-2xl animate-bounce ${birthdayCountdown.seconds % 2 === 0 ? 'opacity-70' : 'opacity-100'}`}>
                          🎁
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Age Display */}
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-800 dark:text-white">
                    You are <span className="text-blue-600 dark:text-blue-400">{age.years}</span> years, 
                    <span className="text-green-600 dark:text-green-400"> {age.months}</span> months, and 
                    <span className="text-purple-600 dark:text-purple-400"> {age.days}</span> days old
                  </p>
                </div>

                {/* Time Units */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white text-center shadow-md animate-fade-in-down">
                    <div className="text-2xl font-bold">{formatNumber(age.hours)}</div>
                    <div className="text-sm opacity-90">Hours</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white text-center shadow-md animate-fade-in-down animation-delay-100">
                    <div className="text-2xl font-bold">{formatNumber(age.minutes)}</div>
                    <div className="text-sm opacity-90">Minutes</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white text-center shadow-md animate-fade-in-down animation-delay-200">
                    <div className="text-2xl font-bold">{formatNumber(age.seconds)}</div>
                    <div className="text-sm opacity-90">Seconds</div>
                  </div>
                </div>

                {/* Life Metrics */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 text-center">Life Metrics</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-lg p-3 text-white text-center shadow-md">
                      <div className="text-xl font-bold">{Math.floor(age.total.heartbeats).toLocaleString()}</div>
                      <div className="text-sm opacity-90">Heartbeats</div>
                    </div>
                    <div className="bg-gradient-to-r from-teal-500 to-green-500 rounded-lg p-3 text-white text-center shadow-md">
                      <div className="text-xl font-bold">{Math.floor(age.total.breaths).toLocaleString()}</div>
                      <div className="text-sm opacity-90">Breaths</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-4 text-white shadow-md mb-4">
                    <div className="text-xl font-bold">{formatTime(age.total.sleepTime)}</div>
                    <div className="text-sm opacity-90">Time spent sleeping</div>
                  </div>

                  {/* Final Countdown */}
                  {lifeLeft && (
                    <>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 text-center">Final Countdown</h2>
                      
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-4 text-white shadow-md mb-4">
                        <div className="text-xl font-bold">{lifeLeft.days.toLocaleString()} days</div>
                        <div className="text-sm opacity-90">Remaining in your life (based on 70-year average)</div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-800 dark:text-white">Life Completed</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">
                            {lifeLeft.percent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                              lifeLeft.percent > 75 
                                ? 'bg-gradient-to-r from-red-600 to-pink-500' 
                                : 'bg-gradient-to-r from-red-500 to-purple-500'
                            }`}
                            style={{ width: `${lifeLeft.percent}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                          Based on 70-year average lifespan
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Made with ❤️ by <span className="font-bold">Amar</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}
