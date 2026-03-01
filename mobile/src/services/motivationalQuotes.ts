/**
 * Motivational Quotes Service
 * Category-based curated quotes for task reminder notifications.
 */

const STUDY_QUOTES = [
    'Small daily progress beats perfection. Keep studying! 📚',
    'The expert in anything was once a beginner. You got this! 🎓',
    'Study hard now, your future self will thank you. 💡',
    'Knowledge is power. Every page you read matters. 🧠',
    'Discipline is the bridge between goals and accomplishment. 📖',
    'Don\'t watch the clock; do what it does — keep going. ⏰',
    'Success is the sum of small efforts repeated daily. ✨',
    'The beautiful thing about learning is no one can take it away. 🌟',
];

const WORK_QUOTES = [
    'Productivity is never an accident. It\'s the result of commitment. 💼',
    'Focus on being productive instead of busy. 🎯',
    'The secret of getting ahead is getting started. 🚀',
    'Success usually comes to those who are too busy to be looking for it. 💪',
    'Don\'t count the days, make the days count. 📊',
    'Great things are done by a series of small things brought together. 🔥',
    'Your work is going to fill a large part of your life. Make it great. ⭐',
    'Hard work beats talent when talent doesn\'t work hard. 🏆',
];

const HEALTH_QUOTES = [
    'Take care of your body. It\'s the only place you have to live. 💪',
    'Health is not about the weight you lose, but the life you gain. 🌱',
    'A healthy outside starts from the inside. 🧘',
    'Your body hears everything your mind says. Stay positive! 🏃',
    'Discipline is choosing between what you want now and what you want most. 💚',
    'The only bad workout is the one that didn\'t happen. 🏋️',
    'Strive for progress, not perfection. 🌟',
    'You don\'t have to be extreme, just consistent. ✅',
];

const GENERAL_QUOTES = [
    'Believe you can and you\'re halfway there. 🌈',
    'Every accomplishment starts with the decision to try. ⭐',
    'You are capable of amazing things. Keep going! 💫',
    'The only limit to our realization of tomorrow is our doubts of today. 🔮',
    'Act as if what you do makes a difference. It does. 🎯',
    'Start where you are. Use what you have. Do what you can. 💪',
    'It always seems impossible until it\'s done. 🏆',
    'Your time is limited. Don\'t waste it living someone else\'s life. 🦋',
];

const QUOTES_MAP: Record<string, string[]> = {
    Study: STUDY_QUOTES,
    Work: WORK_QUOTES,
    Health: HEALTH_QUOTES,
    Personal: GENERAL_QUOTES,
    General: GENERAL_QUOTES,
    Shopping: GENERAL_QUOTES,
};

/**
 * Returns a random motivational quote for the given task category.
 */
export const getQuoteForCategory = (category: string): string => {
    const quotes = QUOTES_MAP[category] || GENERAL_QUOTES;
    const index = Math.floor(Math.random() * quotes.length);
    return quotes[index];
};
