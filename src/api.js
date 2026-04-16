export const API_BASE_URL = '/api';

export const registerOrUpdateUser = async (email, preferences) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      name: email.split('@')[0], 
      questionCountPerDay: preferences.questionsPerDay,
      revisionDurationDays: preferences.days,
      preferredDifficulties: preferences.difficulty === 'Random' ? null : [preferences.difficulty],
      preferredTopics: preferences.topics && preferences.topics.length > 0 ? preferences.topics : null,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to register user');
  }

  return response.json();
};

export const updatePreferences = async (email, preferences) => {
  const response = await fetch(`${API_BASE_URL}/users/${email}/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questionCountPerDay: preferences.questionsPerDay,
      revisionDurationDays: preferences.days,
      preferredDifficulties: preferences.difficulty === 'Random' ? null : [preferences.difficulty],
      preferredTopics: preferences.topics && preferences.topics.length > 0 ? preferences.topics : null,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update preferences');
  }

  return response.json();
};

export const getTodayQuestions = async (email) => {
  const response = await fetch(`${API_BASE_URL}/questions/today?email=${encodeURIComponent(email)}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch today\'s questions');
  }

  return response.json();
};

export const requestEmailOtp = async (email) => {
  const response = await fetch(`${API_BASE_URL}/users/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to send OTP');
  }
};

export const validateEmailOtp = async (email, otp) => {
  const response = await fetch(`${API_BASE_URL}/users/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify OTP');
  }

  const data = await response.json();
  return data.valid;
};

export const getPreviewQuestions = async (difficulty, limit = 3, topics = []) => {
  const topicsQuery = topics.length > 0 ? `&topics=${topics.map(t => encodeURIComponent(t)).join(',')}` : '';
  const response = await fetch(`${API_BASE_URL}/questions/preview?difficulty=${encodeURIComponent(difficulty)}&limit=${limit}${topicsQuery}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch preview questions');
  }

  return response.json();
};

export const getTopics = async () => {
  const response = await fetch(`${API_BASE_URL}/topics`);
  if (!response.ok) {
    throw new Error('Failed to fetch topics');
  }
  return response.json();
};

export const triggerNotificationEmail = async (email) => {
  const response = await fetch(`${API_BASE_URL}/notifications/trigger?email=${encodeURIComponent(email)}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to trigger email');
  return response.text();
};

export const getUserQuestionHistory = async (email, page = 0, size = 5) => {
  const response = await fetch(`${API_BASE_URL}/questions/history?email=${encodeURIComponent(email)}&page=${page}&size=${size}`);
  if (!response.ok) throw new Error('Failed to fetch user history');
  return response.json();
};

export const submitFeedback = async (email, type, description, imageFile) => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('type', type);
  formData.append('description', description);
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',
    body: formData, // the browser will automatically set 'multipart/form-data' + boundary
  });
  if (!response.ok) throw new Error('Failed to submit feedback');
  return response.text();
};

