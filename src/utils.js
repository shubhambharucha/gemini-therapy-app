export const getSessionId = () => {
  let sessionId = localStorage.getItem('anon_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('anon_id', sessionId);
  }
  return sessionId;
};






