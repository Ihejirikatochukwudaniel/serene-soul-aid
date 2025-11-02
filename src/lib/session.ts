// Session management for anonymous usage
export function getSessionId(): string {
  let sessionId = localStorage.getItem('mindaid_session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('mindaid_session_id', sessionId);
  }
  
  return sessionId;
}

export function clearSession(): void {
  localStorage.removeItem('mindaid_session_id');
}
