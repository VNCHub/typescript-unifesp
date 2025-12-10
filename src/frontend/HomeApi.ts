const API_SUBJECTS = "/api/subjects";
const API_ENROLLMENT = "/api/enrollment";
const API_ME = "/api/me";
const API_CLASSNOTES = "/api/classnotes";

function getToken() {
  return localStorage.getItem("token");
}

export async function fetchCurrentUser() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(API_ME, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    localStorage.removeItem("token");
    return null;
  }

  return res.json();
}

export async function fetchEnrollments(userId: number) {
  const res = await fetch(`${API_ENROLLMENT}/user/${userId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  return res.ok ? res.json() : [];
}

export async function fetchSubjects() {
  const res = await fetch(API_SUBJECTS);
  return res.json();
}

export async function enrollRequest(alunoId: number, materiaId: number) {
  return fetch(API_ENROLLMENT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ alunoId, materiaId })
  });
}

export async function unenrollRequest(id: number) {
  return fetch(`${API_ENROLLMENT}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` }
  });
}

export async function getAllClassNotes() {
  const res = await fetch(API_CLASSNOTES, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.json();
}

export async function getClassNoteById(id: number) {
  const res = await fetch(`${API_CLASSNOTES}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.json();
}

export async function createClassNote(note: any) {
  return fetch(API_CLASSNOTES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(note)
  });
}

export async function updateClassNote(id: number, note: any) {
  return fetch(`${API_CLASSNOTES}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(note)
  });
}

export async function deleteClassNote(id: number) {
  return fetch(`${API_CLASSNOTES}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` }
  });
}
