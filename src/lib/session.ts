// Session management for anonymous usage
export function getSessionId(): string {
  let sessionId = localStorage.getItem('mindaid_session_id');
  
  if (!sessionId) {
    // Use cryptographically secure random UUID for session IDs
    sessionId = crypto.randomUUID();
    localStorage.setItem('mindaid_session_id', sessionId);
  }
  
  return sessionId;
}

export function clearSession(): void {
  localStorage.removeItem('mindaid_session_id');
}
