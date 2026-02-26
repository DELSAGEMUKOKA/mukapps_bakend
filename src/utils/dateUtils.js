export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export const addHours = (date, hours) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const addYears = (date, years) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  const formats = {
    'YYYY-MM-DD': `${year}-${month}-${day}`,
    'DD/MM/YYYY': `${day}/${month}/${year}`,
    'MM/DD/YYYY': `${month}/${day}/${year}`,
    'YYYY-MM-DD HH:mm:ss': `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
    'DD/MM/YYYY HH:mm': `${day}/${month}/${year} ${hours}:${minutes}`,
    'MMM DD, YYYY': `${getMonthName(d.getMonth())} ${day}, ${year}`,
    'full': d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  return formats[format] || formats['YYYY-MM-DD'];
};

const getMonthName = (monthIndex) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

export const formatDateTime = (date) => {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
};

export const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return '$0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatNumber = (number, decimals = 0) => {
  const num = typeof number === 'string' ? parseFloat(number) : number;

  if (isNaN(num)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const isExpired = (date) => {
  if (!date) return true;

  const expiryDate = new Date(date);
  const now = new Date();

  return expiryDate < now;
};

export const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();

  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

export const isFuture = (date) => {
  const d = new Date(date);
  const now = new Date();

  return d > now;
};

export const isPast = (date) => {
  const d = new Date(date);
  const now = new Date();

  return d < now;
};

export const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const getHoursDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diffTime = Math.abs(d2 - d1);
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

  return diffHours;
};

export const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getStartOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getStartOfYear = (date = new Date()) => {
  const d = new Date(date);
  d.setMonth(0);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfYear = (date = new Date()) => {
  const d = new Date(date);
  d.setMonth(11);
  d.setDate(31);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getDateRange = (period, customStart = null, customEnd = null) => {
  const now = new Date();

  switch (period) {
    case 'today':
      return {
        from: getStartOfDay(now),
        to: getEndOfDay(now)
      };

    case 'yesterday':
      const yesterday = addDays(now, -1);
      return {
        from: getStartOfDay(yesterday),
        to: getEndOfDay(yesterday)
      };

    case '7days':
      return {
        from: getStartOfDay(addDays(now, -7)),
        to: getEndOfDay(now)
      };

    case '30days':
      return {
        from: getStartOfDay(addDays(now, -30)),
        to: getEndOfDay(now)
      };

    case 'thisWeek':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return {
        from: getStartOfDay(startOfWeek),
        to: getEndOfDay(now)
      };

    case 'thisMonth':
      return {
        from: getStartOfMonth(now),
        to: getEndOfMonth(now)
      };

    case 'lastMonth':
      const lastMonth = addMonths(now, -1);
      return {
        from: getStartOfMonth(lastMonth),
        to: getEndOfMonth(lastMonth)
      };

    case 'thisYear':
      return {
        from: getStartOfYear(now),
        to: getEndOfYear(now)
      };

    case 'lastYear':
      const lastYear = addYears(now, -1);
      return {
        from: getStartOfYear(lastYear),
        to: getEndOfYear(lastYear)
      };

    case 'custom':
      return {
        from: customStart ? new Date(customStart) : getStartOfDay(now),
        to: customEnd ? new Date(customEnd) : getEndOfDay(now)
      };

    default:
      return {
        from: getStartOfDay(now),
        to: getEndOfDay(now)
      };
  }
};

export const getRelativeTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
};

export const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

export const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

export const getQuarter = (date) => {
  const d = new Date(date);
  const month = d.getMonth();
  return Math.floor(month / 3) + 1;
};

export const isWeekend = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6;
};

export const getBusinessDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;

  const current = new Date(start);
  while (current <= end) {
    if (!isWeekend(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

export const parseDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const isValidDate = (date) => {
  const d = new Date(date);
  return !isNaN(d.getTime());
};

export default {
  addDays,
  addMinutes,
  addHours,
  addMonths,
  addYears,
  formatDate,
  formatDateTime,
  formatTime,
  formatCurrency,
  formatNumber,
  isExpired,
  isToday,
  isFuture,
  isPast,
  getDaysDifference,
  getHoursDifference,
  getStartOfDay,
  getEndOfDay,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear,
  getDateRange,
  getRelativeTime,
  getDaysInMonth,
  isLeapYear,
  getWeekNumber,
  getQuarter,
  isWeekend,
  getBusinessDays,
  parseDate,
  isValidDate
};
